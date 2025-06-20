function getRefundAmount2(description) {
  Logger.log("Description to parse: " + description);
  var match = description.match(/Deposit\s*Refund:\s*CHF\s*(\d+(\.\d+)?)/i);
  if (match && match[1]) {
    Logger.log("Parsed refund amount: " + match[1]);
    return parseFloat(match[1]);
  } else {
    Logger.log("No valid refund amount found.");
    return 0;
  }
}

function refundPayment2(paymentId, amount) {
  var stripeAmount = Math.round(amount * 100); // Convert CHF to cents
  Logger.log("Issuing refund for payment: " + paymentId + ", amount: CHF " + amount + " (" + stripeAmount + " cents)");
  var url = "https://api.stripe.com/v1/refunds";
  var apiKey = "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"; // Your Stripe secret key
  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "payload": {
      "charge": paymentId,
      "amount": stripeAmount.toString() // Amount in cents as a string
    },
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log("Refund response for paymentId " + paymentId + ": " + response.getContentText());
}

function getStripePayment(referenceNumber) {
  Logger.log("Retrieving Stripe payment for reference number: " + referenceNumber);
  var url = "https://api.stripe.com/v1/charges?limit=100"; // Retrieve the latest charges
  var apiKey = "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"; // Your Stripe secret key
  var options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  var responseText = response.getContentText();
  Logger.log("Stripe response: " + responseText);
  var payments = JSON.parse(responseText);

  if (payments && payments.data && payments.data.length > 0) {
    for (var i = 0; i < payments.data.length; i++) {
      if (payments.data[i].metadata && payments.data[i].metadata.booking_id == referenceNumber) {
        Logger.log("Stripe payment found: " + payments.data[i].id);
        return payments.data[i];
      }
    }
  }

  Logger.log("No Stripe payment found for reference number: " + referenceNumber);
  return null;
}

function getCalendarEvents2(calendarId) {
  Logger.log("Retrieving events from calendar: " + calendarId);
  var calendar = CalendarApp.getCalendarById(calendarId);

  // Calculate the date 6 days prior to today
  var today = new Date();
  var sixDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago

  // Set the start and end time for that day
  var startTime = new Date(sixDaysAgo.getFullYear(), sixDaysAgo.getMonth(), sixDaysAgo.getDate(), 0, 0, 0, 0); // 6 days ago at 00:00:00
  var endTime = new Date(sixDaysAgo.getFullYear(), sixDaysAgo.getMonth(), sixDaysAgo.getDate(), 23, 59, 59, 999); // 6 days ago at 23:59:59

  var events = calendar.getEvents(startTime, endTime);
  var eventsData = [];

  events.forEach(function(event) {
    var title = event.getTitle();

    // Skip events that have already been processed
    if (title.startsWith('+')) {
      Logger.log("Event: " + title + " has already been processed, skipping.");
      return;
    }

    var description = event.getDescription();
    var matchRef = description.match(/Numero di riferimento:\s*(\d+)/);
    var matchFirstName = description.match(/First Name:\s*(.*)/i);
    var matchLastName = description.match(/Last Name:\s*(.*)/i);

    // If First Name and Last Name are not in the description, extract from the title
    var bookerName = extractBookerName(title);
    var nameParts = bookerName.split(' ');
    var firstName = matchFirstName ? matchFirstName[1].trim() : (nameParts[0] || '');
    var lastName = matchLastName ? matchLastName[1].trim() : (nameParts[1] || '');

    if (matchRef && event.getEndTime() <= endTime) {
      var refundAmount = getRefundAmount2(description);
      Logger.log("Event description: " + description);
      eventsData.push({
        event: event,
        referenceNumber: matchRef[1],
        firstName: firstName,
        lastName: lastName,
        refundAmount: refundAmount
      });
    }
  });

  Logger.log("Events retrieved: " + eventsData.length);
  return eventsData;
}

function processRefunds2() {
  var calendarIds = [
    'noleggiosemplice23@gmail.com',
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com',
    '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com',
    '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com',
    'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com',
    '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com',
    '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com',
    'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com',
    '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'
  ];

  var refundSummary = [];

  // Report Header
  var reportDate = new Date();
  var reportHeader = '==========================================\n';
  reportHeader += 'Report generated on: ' + reportDate.toDateString() + '\n';
  reportHeader += 'Date checked: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '\n';
  reportHeader += '==========================================\n';
  Logger.log(reportHeader);

  calendarIds.forEach(function(calendarId) {
    var events = getCalendarEvents2(calendarId);

    events.forEach(function(eventData) {
      var payment = getStripePayment(eventData.referenceNumber);

      if (payment && eventData.refundAmount > 0) {
        Logger.log("Issuing refund for payment: " + payment.id + ", amount: CHF " + eventData.refundAmount);
        refundPayment2(payment.id, eventData.refundAmount);
        Logger.log("Refund issued for event: " + eventData.referenceNumber + ", amount: CHF " + eventData.refundAmount);
        refundSummary.push({
          bookingId: eventData.referenceNumber,
          firstName: eventData.firstName,
          lastName: eventData.lastName,
          refundAmount: eventData.refundAmount,
          refundStatus: 'Refund Made'
        });

        // Mark the event as processed by adding '+' to the title
        var event = eventData.event;
        var newTitle = '+' + event.getTitle();
        event.setTitle(newTitle);
        Logger.log("Event title updated to: " + newTitle);
      } else {
        var errorMsg = "No valid refund amount found or payment not found for event: " + eventData.referenceNumber;
        Logger.log(errorMsg);
        refundSummary.push({
          bookingId: eventData.referenceNumber,
          firstName: eventData.firstName,
          lastName: eventData.lastName,
          refundAmount: eventData.refundAmount,
          refundStatus: 'Refund Not Made',
          error: errorMsg
        });
      }
    });
  });

  sendRefundSummaryEmail(refundSummary, reportHeader);
}

function sendRefundSummaryEmail(refundSummary, reportHeader) {
  var emailAddress = 'noleggiosemplice23@gmail.com';
  var subject = 'Refund - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Build the HTML content
  var htmlContent = '<html><body>';
  htmlContent += '<h1>Refund Summary</h1>';
  htmlContent += '<p>' + reportHeader.replace(/\n/g, '<br>') + '</p>';
  htmlContent += '<table border="1" cellpadding="5" cellspacing="0">';
  htmlContent += '<tr><th>Booking ID</th><th>First Name</th><th>Last Name</th><th>Refund Amount</th><th>Status</th><th>Error</th></tr>';

  refundSummary.forEach(function(item) {
    htmlContent += '<tr>';
    htmlContent += '<td>' + item.bookingId + '</td>';
    htmlContent += '<td>' + item.firstName + '</td>';
    htmlContent += '<td>' + item.lastName + '</td>';
    htmlContent += '<td>' + item.refundAmount + '</td>';
    htmlContent += '<td>' + item.refundStatus + '</td>';
    htmlContent += '<td>' + (item.error ? item.error : '') + '</td>';
    htmlContent += '</tr>';
  });

  htmlContent += '</table>';
  htmlContent += '</body></html>';

  // Convert HTML to PDF blob
  var blob = Utilities.newBlob(htmlContent, 'text/html', 'RefundSummary.html').getAs('application/pdf');
  blob.setName('RefundSummary.pdf');

  // Send email with PDF attachment
  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    htmlBody: 'Please find attached the refund summary.',
    attachments: [blob]
  });
}

// Helper function to extract booker name from event title
function extractBookerName(eventTitle) {
  // Remove leading numbers and symbols
  var cleanedTitle = eventTitle.replace(/^[^a-zA-Z]+/, '');
  // Split at the '-' symbol
  var namePart = cleanedTitle.split('-')[0];
  // Remove any numbers and symbols within the name
  namePart = namePart.replace(/[^a-zA-Z\s]/g, '');
  // Trim whitespace
  namePart = namePart.trim();
  return namePart;
}


function exportUnprocessedRefundEvents() {
  const calendarIds = [
    'noleggiosemplice23@gmail.com',
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com',
    '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com',
    '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com',
    'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com',
    '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com',
    '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com',
    'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com',
    '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'
  ];

  const spreadsheetId = '1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o';
  const sheetName = 'Refund';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  sheet.clearContents();
  sheet.appendRow(['Title', 'Start Date', 'End Date', 'Refund Amount (CHF)', 'Reference Number']);

  const today = new Date();
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  calendarIds.forEach(function(calendarId) {
    const calendar = CalendarApp.getCalendarById(calendarId);
    const events = calendar.getEvents(sixtyDaysAgo, today);

    events.forEach(function(event) {
      const title = event.getTitle();
      if (title.startsWith('+')) return;

      const description = event.getDescription();
      const refundMatch = description.match(/Refund:\s*CHF\s*(\d+(\.\d+)?)/i);
      const refMatch = description.match(/Numero di riferimento:\s*(\d+)/i);

      const refundAmount = refundMatch ? refundMatch[1] : '';
      const referenceNumber = refMatch ? refMatch[1] : '';

      sheet.appendRow([
        title,
        Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        Utilities.formatDate(event.getEndTime(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        refundAmount,
        referenceNumber
      ]);
    });
  });

  Logger.log('Finished exporting unprocessed events.');
}

