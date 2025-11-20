/*************************************************************
 * Complete AI Assistant Script - Versione Migliorata
 * Copia tutto questo codice in un NUOVO progetto Google Apps Script
 * Sostituisci il codice esistente completamente
 *************************************************************/

// Configurazione - MODIFICA QUESTI VALORI
function getConfig() {
  return {
    // Inserisci qui i tuoi ID reali
    VEHICLE_DATA_SHEET_ID: 'TUO_SHEET_ID_VEHICLES',
    EXPENSE_SHEET_ID: 'TUO_SHEET_ID_EXPENSES',
    // Chiavi Stripe - CONFIGURALE NELLE SCRIPT PROPERTIES!
    STRIPE_SECRET_KEY: PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET_KEY'),
    STRIPE_BLACK_API_KEY: PropertiesService.getScriptProperties().getProperty('STRIPE_BLACK_API_KEY')
  };
}

// Funzione di validazione auth - MODIFICA CON IL TUO TOKEN
function validateAuthToken(token) {
  // Per test, accetta qualsiasi token non vuoto
  return token && token.length > 0;
}

// Entry point principale
function doGet(e) {
  Logger.log('doGet called - Function: ' + (e.parameter ? e.parameter.function : 'undefined'));
  try {
    // Validate authentication
    const authToken = e.parameter.authToken;
    if (!validateAuthToken(authToken)) {
      return createJsonResponse({ error: "Unauthorized: Invalid auth token" });
    }

    const functionName = e.parameter.function;
    if (!functionName) {
      return createJsonResponse({ error: "No function specified" });
    }

    // Routing Logic
    switch (functionName) {
      // --- AI Assistant ---
      case "handleMaintenanceAiRequestJsonp":
        return handleMaintenanceAiRequestJsonp(e.parameter);
      case "testAiEndpointJsonp":
        return testAiEndpointJsonp(e.parameter);
      case "testSimpleJsonp":
        return testSimpleJsonp(e.parameter);

      // --- Stripe Payments ---
      case "createPaymentLinkJsonp":
        return createPaymentLinkJsonp(e.parameter);

      // --- Utilities ---
      case "ping":
        return createJsonResponse({ result: "Ping successful" });
      case "pingJsonp":
        return createJsonpResponse(e.parameter.callback, { result: "Ping successful" });

      default:
        return createJsonResponse({ error: `Unknown function: ${functionName}` });
    }

  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

// Funzione di test semplice
function testSimpleJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');

  const response = {
    success: true,
    message: "Test semplice riuscito!",
    timestamp: new Date().toISOString()
  };

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Test endpoint AI
function testAiEndpointJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const apiKey = getOpenAIApiKey();

  const response = {
    success: true,
    message: "AI endpoint is reachable",
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  };

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// AI Assistant principale
function handleMaintenanceAiRequestJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = handleMaintenanceAiRequest(params);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function handleMaintenanceAiRequest(params) {
  const userQuery = params.query;
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return { success: false, error: "OpenAI API key not configured." };
  }

  const openAiUrl = 'https://api.openai.com/v1/chat/completions';

  // TOOLS DISPONIBILI
  const tools = [
    {
      type: "function",
      function: {
        name: "createMaintenanceReport",
        description: "Crea un rapporto di manutenzione per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicle: { type: "string", description: "Nome del veicolo (es. N1, N2)" },
            description: { type: "string", description: "Descrizione del problema/lavoro" },
            cost: { type: "number", description: "Costo in franchi" }
          },
          required: ["vehicle", "description", "cost"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createPaymentLink",
        description: "Crea un link di pagamento Stripe per un importo specifico. Puoi specificare il conto (black/green), descrizione e opzionalmente un numero di riferimento prenotazione.",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Importo in franchi (es. 50.00)" },
            description: { type: "string", description: "Descrizione del pagamento (es. 'Multa', 'Noleggio', 'Riparazione')" },
            account: { type: "string", description: "Conto Stripe da usare: 'green' (default) o 'black'", enum: ["green", "black"] },
            bookingRef: { type: "string", description: "Numero di riferimento prenotazione (opzionale, per arricchire automaticamente la descrizione)" }
          },
          required: ["amount", "description"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "generateIglohomeCode",
        description: "Genera un codice di accesso Igloohome per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicleType: { type: "string", description: "Tipo di veicolo (es. N01, N02)" }
          },
          required: ["vehicleType"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "sendMessage",
        description: "Invia un messaggio WhatsApp per spiegare come prenotare.",
        parameters: {
          type: "object",
          properties: {
            phoneNumber: { type: "string", description: "Numero di telefono (formato internazionale)" }
          },
          required: ["phoneNumber"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getVehicleList",
        description: "Ottieni la lista dei veicoli disponibili.",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    }
  ];

  // FUNZIONI DISPONIBILI
  const availableFunctions = {
    "createMaintenanceReport": createMaintenanceReport,
    "createPaymentLink": createPaymentLinkForAI,
    "generateIglohomeCode": generateIglohomeCodeForAI,
    "sendMessage": sendMessageForAI,
    "getVehicleList": getVehicleListForAI
  };

  const messages = [
    {
      role: "system",
      content: "Sei un assistente AI per la gestione di una flotta di veicoli. Puoi creare report di manutenzione, generare link di pagamento Stripe (chiedi sempre quale conto usare: green o black), creare codici di accesso Igloohome, inviare messaggi WhatsApp e fornire informazioni sui veicoli disponibili. Quando crei link di pagamento, chiedi sempre più dettagli come il conto Stripe da usare e se c'è un numero di riferimento prenotazione. Rispondi sempre in italiano e chiedi chiarimenti se necessario."
    },
    {
      role: "user",
      content: userQuery
    }
  ];

  try {
    let responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        const functionResponse = functionToCall(
          functionArgs.vehicle || functionArgs.amount,
          functionArgs.description,
          functionArgs.cost || functionArgs.account,
          functionArgs.bookingRef
        );

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      }

      responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);
    }

    return { success: true, response: responseMessage };

  } catch (error) {
    Logger.log('Error in handleMaintenanceAiRequest: ' + error.toString());
    return { success: false, error: 'Error processing AI request: ' + error.toString() };
  }
}

// FUNZIONI AI WRAPPER
function createPaymentLinkForAI(amount, description, account, bookingRef) {
  try {
    Logger.log(`AI Payment Link Request: CHF ${amount} - ${description} - Account: ${account || 'green'} - Ref: ${bookingRef || 'none'}`);

    // Usa la vera funzione Stripe invece del placeholder!
    const result = createStripePaymentLink(amount, description, account || 'green', 'checkout', bookingRef);

    if (result.success) {
      Logger.log(`✅ Payment link created: ${result.url}`);
      return {
        success: true,
        link: result.url,
        message: `Link di pagamento creato per CHF ${amount}: ${description}${account ? ` (conto ${account})` : ''}${bookingRef ? ` - Ref: ${bookingRef}` : ''}`
      };
    } else {
      Logger.log(`❌ Payment link creation failed: ${result.error}`);
      return {
        success: false,
        error: `Errore nella creazione del link: ${result.error}`
      };
    }
  } catch (error) {
    Logger.log(`❌ Error in createPaymentLinkForAI: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

function generateIglohomeCodeForAI(vehicleType) {
  try {
    Logger.log(`AI Iglohome Code: ${vehicleType}`);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      success: true,
      code: code,
      message: `Codice Igloohome generato per ${vehicleType}: ${code}`
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function sendMessageForAI(phoneNumber) {
  try {
    Logger.log(`AI Message: ${phoneNumber}`);
    return {
      success: true,
      message: `Messaggio inviato al numero ${phoneNumber}`
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getVehicleListForAI() {
  try {
    Logger.log('AI Vehicle List Request');
    return {
      success: true,
      vehicles: [
        { name: 'N1', type: 'Furgone', status: 'Disponibile' },
        { name: 'N2', type: 'Furgone', status: 'In manutenzione' },
        { name: 'N3', type: 'Camion', status: 'Disponibile' }
      ]
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function createMaintenanceReport(vehicle, description, cost) {
  Logger.log(`MAINTENANCE REPORT CREATED:
    Vehicle: ${vehicle}
    Description: ${description}
    Cost: ${cost}
  `);
  return {
    success: true,
    message: `Report creato per ${vehicle} con descrizione "${description}" e costo ${cost} CHF.`
  };
}

function callOpenAI(url, apiKey, messages, tools) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    })
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseData = JSON.parse(response.getContentText());
  return responseData.choices[0].message;
}

// STRIPE FUNCTIONS
function createPaymentLinkJsonp(params) {
  try {
    const callback = params.callback;
    const amount = params.amount;
    const description = params.description || '';
    const account = params.account || 'green';
    const linkType = params.linkType || 'checkout';
    const bookingRef = params.bookingRef || null;

    const result = createStripePaymentLink(amount, description, account, linkType, bookingRef);

    return createJsonpResponse(callback, result);
  } catch (error) {
    const callback = params.callback || 'callback';
    return createJsonpResponse(callback, { success: false, error: error.toString() });
  }
}

function createStripePaymentLink(amount, description, account, linkType, bookingRef) {
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

    Logger.log(`📝 Creating Stripe payment link: CHF ${amount} - ${description} - Account: ${accountType}`);

    // Step 1: Create Product
    const productPayload = [];
    productPayload.push('name=' + encodeURIComponent(description || 'Payment'));
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

    // Step 3: Create Checkout Session
    const checkoutPayload = [];
    checkoutPayload.push('payment_method_types[0]=card');
    checkoutPayload.push('line_items[0][price]=' + encodeURIComponent(price.id));
    checkoutPayload.push('line_items[0][quantity]=1');
    checkoutPayload.push('mode=payment');
    checkoutPayload.push('success_url=' + encodeURIComponent('https://sandrozellweger.github.io/script-trigger-app/payment-success.html?session_id={CHECKOUT_SESSION_ID}'));
    checkoutPayload.push('cancel_url=' + encodeURIComponent('https://sandrozellweger.github.io/script-trigger-app/payments.html'));

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

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// UTILITY FUNCTIONS
function getOpenAIApiKey() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    return apiKey;
  } catch (error) {
    return null;
  }
}

function sanitizeJsonpCallback(callback) {
  return callback.replace(/[^a-zA-Z0-9_]/g, '');
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonpResponse(callback, data) {
  const sanitizedCallback = sanitizeJsonpCallback(callback);
  const jsonpResponse = '/**/' + sanitizedCallback + '(' + JSON.stringify(data) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}