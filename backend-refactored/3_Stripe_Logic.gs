/*************************************************************
 * 3_Stripe_Logic.gs
 * Stripe Payments and Checkout Sessions
 *************************************************************/

// Trigger Stripe Payment (Legacy or Direct)
function triggerStripePayment(amount, description, account) {
  return createStripePaymentLink(amount, description, account, 'checkout', null);
}

// JSONP wrapper for triggerStripePayment
function triggerStripePaymentJsonp(params) {
  try {
    const callback = params.callback;
    const amount = params.amount;
    const description = params.description;
    const account = params.account;

    const result = triggerStripePayment(amount, description, account);

    return createJsonpResponse(callback, result);
  } catch (error) {
    const callback = params.callback || 'callback';
    return createJsonpResponse(callback, { success: false, error: error.toString() });
  }
}

// JSONP wrapper for createPaymentLink
function createPaymentLinkJsonp(params) {
  try {
    const callback = params.callback;
    const amount = params.amount;
    const description = params.description || '';
    const account = params.account || 'green';
    const linkType = params.linkType || 'checkout';
    const bookingRef = params.bookingRef || null;
    const customerEmail = params.customerEmail || '';
    const vehicleId = params.vehicleId || '';

    // DEBUG: Log booking reference if provided
    if (bookingRef) {
      Logger.log('🔍 DEBUG - Looking for booking reference: ' + bookingRef);
      const debugResult = getBookingDetailsByReference(bookingRef);
      Logger.log('🔍 DEBUG - Search result: ' + JSON.stringify(debugResult));
    }

    const result = createStripePaymentLink(amount, description, account, linkType, bookingRef, customerEmail, vehicleId);

    return createJsonpResponse(callback, result);
  } catch (error) {
    const callback = params.callback || 'callback';
    return createJsonpResponse(callback, { success: false, error: error.toString() });
  }
}

// Create Stripe Payment Link (permanent or checkout)
function createStripePaymentLink(amount, description, account, linkType, bookingRef, customerEmailParam, vehicleIdParam) {
  try {
    const config = getConfig();
    
    // Determine which Stripe key to use
    const accountType = account || 'green';
    let stripeKey;
    
    if (accountType.toLowerCase() === 'black') {
      stripeKey = config.STRIPE_BLACK_API_KEY;
      if (!stripeKey) {
        return { success: false, error: "Stripe Black API key not configured" };
      }
    } else {
      stripeKey = config.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return { success: false, error: "Stripe Green secret key not configured" };
      }
    }

    // If bookingRef provided, extract booking details for description
    let finalDescription = decodeURIComponent(description || 'Payment');
    let customerEmail = customerEmailParam || '';
    let vehicleId = vehicleIdParam || '';
    
    Logger.log('🔍 createStripePaymentLink - bookingRef received: ' + bookingRef);
    
    if (bookingRef) {
      try {
        Logger.log('🔍 Calling getBookingDetailsByReference for: ' + bookingRef);
        const bookingDetails = getBookingDetailsByReference(bookingRef);
        Logger.log('🔍 Booking details result: ' + JSON.stringify(bookingDetails));
        
        if (bookingDetails.success && bookingDetails.event) {
          const event = bookingDetails.event;
          const eventDescription = event.getDescription() || '';
          const startDate = Utilities.formatDate(event.getStartTime(), 'Europe/Zurich', 'dd/MM/yyyy');
          const endDate = Utilities.formatDate(event.getEndTime(), 'Europe/Zurich', 'dd/MM/yyyy');
          
          // Extract customer info from event title and description
          const title = event.getTitle();
          const titleMatch = title.match(/[-–]\s*(?:🖤|🟢)?\s*([^-–]+?)\s*[-–]\s*CHF/i);
          
          // Extract from description (no emojis in description)
          const emailMatch = eventDescription.match(/Email:\s*([^\n]+)/i);
          const phoneMatch = eventDescription.match(/Numero di cellulare:\s*([^\n]+)/i);
          const vehicleMatch = eventDescription.match(/Veicolo:\s*([^\n]+)/i);
          
          const customerName = titleMatch ? titleMatch[1].trim() : 'Cliente';
          if (!customerEmail) customerEmail = emailMatch ? emailMatch[1].trim() : '';
          const phoneNumber = phoneMatch ? phoneMatch[1].trim() : '';
          const vehicleName = vehicleMatch ? vehicleMatch[1].trim() : (bookingDetails.vehicleId || '');
          if (!vehicleId) vehicleId = bookingDetails.vehicleId || '';
          
          // Build enhanced description
          // Keep original description in UPPERCASE at the beginning, then add booking details
          let descriptionParts = [];
          
          // Add original description in uppercase if not empty and not "Payment"
          if (finalDescription && finalDescription.toLowerCase() !== 'payment') {
            descriptionParts.push(finalDescription.toUpperCase());
          }
          
          // Add booking details
          descriptionParts.push(`Noleggio ${vehicleName}`);
          descriptionParts.push(`Cliente: ${customerName}`);
          descriptionParts.push(`Ref: ${bookingRef}`);
          descriptionParts.push(`Periodo: ${startDate} - ${endDate}`);
          
          if (phoneNumber) {
            descriptionParts.push(`Tel: ${phoneNumber}`);
          }
          
          finalDescription = descriptionParts.join(' | ');
          Logger.log('✅ Enhanced description created: ' + finalDescription);
        } else {
          Logger.log('⚠️ Booking details not found or event is null');
        }
      } catch (error) {
        Logger.log('❌ Error extracting booking details: ' + error.toString());
      }
    }
    
    Logger.log('📝 Final description for Stripe: ' + finalDescription);

    // Step 1: Create Product
    const productPayload = [];
    productPayload.push('name=' + encodeURIComponent(finalDescription));
    productPayload.push('active=true');

    const productResponse = UrlFetchApp.fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: productPayload.join('&'),
      muteHttpExceptions: true
    });

    const product = JSON.parse(productResponse.getContentText());
    if (!product.id) {
      return { success: false, error: 'Failed to create product: ' + (product.error?.message || 'Unknown error') };
    }

    // Step 2: Create Price
    const pricePayload = [];
    pricePayload.push('product=' + encodeURIComponent(product.id));
    pricePayload.push('currency=chf');
    pricePayload.push('unit_amount=' + Math.round(parseFloat(amount) * 100));

    const priceResponse = UrlFetchApp.fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: pricePayload.join('&'),
      muteHttpExceptions: true
    });

    const price = JSON.parse(priceResponse.getContentText());
    if (!price.id) {
      return { success: false, error: 'Failed to create price: ' + (price.error?.message || 'Unknown error') };
    }

    // Step 3: Create Payment Link or Checkout Session
    if (linkType === 'checkout') {
      // For checkout, use Checkout Sessions
      const checkoutPayload = [];
      checkoutPayload.push('payment_method_types[0]=card');
      checkoutPayload.push('line_items[0][price]=' + encodeURIComponent(price.id));
      checkoutPayload.push('line_items[0][quantity]=1');
      checkoutPayload.push('mode=payment');
      checkoutPayload.push('success_url=' + encodeURIComponent('https://sandrozellweger.github.io/script-trigger-app/payment-success.html?session_id={CHECKOUT_SESSION_ID}'));
      checkoutPayload.push('cancel_url=' + encodeURIComponent('https://sandrozellweger.github.io/script-trigger-app/payments.html'));
      
      // Add customer email if available
      if (customerEmail && customerEmail.includes('@')) {
        checkoutPayload.push('customer_email=' + encodeURIComponent(customerEmail));
      }
      
      // Add metadata
      if (vehicleId) {
        checkoutPayload.push('metadata[vehicle_id]=' + encodeURIComponent(vehicleId));
      }
      if (bookingRef) {
        checkoutPayload.push('metadata[booking_reference]=' + encodeURIComponent(bookingRef));
      }

      const checkoutResponse = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + stripeKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        payload: checkoutPayload.join('&'),
        muteHttpExceptions: true
      });

      const checkout = JSON.parse(checkoutResponse.getContentText());
      if (!checkout.url) {
        return { success: false, error: 'Failed to create checkout session: ' + (checkout.error?.message || 'Unknown error') };
      }

      return {
        success: true,
        url: checkout.url,
        id: checkout.id,
        type: 'checkout',
        account: accountType
      };
    } else {
      // For permanent links, use Payment Links API
      const linkPayload = [];
      linkPayload.push('line_items[0][price]=' + encodeURIComponent(price.id));
      linkPayload.push('line_items[0][quantity]=1');
      linkPayload.push('after_completion[type]=hosted_confirmation');
      linkPayload.push('after_completion[hosted_confirmation][custom_message]=' + encodeURIComponent('Grazie per il pagamento!'));
      
      // Add metadata if possible (Payment Links API has limited metadata support compared to Checkout)
      if (bookingRef) {
        linkPayload.push('metadata[booking_reference]=' + encodeURIComponent(bookingRef));
      }

      const linkResponse = UrlFetchApp.fetch('https://api.stripe.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + stripeKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        payload: linkPayload.join('&'),
        muteHttpExceptions: true
      });

      const paymentLink = JSON.parse(linkResponse.getContentText());
      if (!paymentLink.url) {
        return { success: false, error: 'Failed to create payment link: ' + (paymentLink.error?.message || 'Unknown error') };
      }

      return {
        success: true,
        url: paymentLink.url,
        id: paymentLink.id,
        type: 'permanent',
        account: accountType
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}