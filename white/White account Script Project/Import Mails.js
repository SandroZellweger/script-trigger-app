// Global variables
var newEmailsFound = false;
var vehicleConfigs = {};
var consolidatedSheetId = '1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o'; // Replace with your consolidated sheet ID

function loadVehicleConfigs() {
  var configSheetId = '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E'; // Replace with your actual configuration sheet ID
  var sheet = SpreadsheetApp.openById(configSheetId).getActiveSheet();
  var data = sheet.getDataRange().getValues();

  vehicleConfigs = {}; // Reset vehicleConfigs

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var vehicleType = row[0];
    if (!vehicleType || vehicleType.trim().toLowerCase() === 'vehicle type') {
      continue; // Skip header or empty rows
    }
    vehicleType = vehicleType.trim(); // Remove extra whitespace

    vehicleConfigs[vehicleType] = {
      vehicleType: vehicleType,
      sheetId: row[1],
      calendarId: row[2],
      calendarName: row[3],
      vehicleNumber: row[4],
      vehicleAddress: row[5],
      igloPinFunctionName: row[6],
      licencePlate: row[7],
      gpsId: row[8],
      actualKm: row[9],
      lastUpdate: row[10],
      logifleetId: row[11]
    };
  }

  Logger.log('Loaded vehicleConfigs: ' + JSON.stringify(vehicleConfigs, null, 2));
}


// Function to get all existing dates and times from the consolidated spreadsheet
function getAllExistingDates() {
  var sheet = SpreadsheetApp.openById(consolidatedSheetId).getActiveSheet(); // Use the consolidated sheet ID
  var range = sheet.getDataRange();
  var values = range.getValues();
  var existingDateTime = [];

  for (var i = 1; i < values.length; i++) {
    if (values[i][0] && values[i][1]) { // Assuming columns A and B contain the date and time info you're checking
      var dateTimeStr = Utilities.formatDate(new Date(values[i][0]), "GMT", "yyyy-MM-dd HH:mm:ss");
      existingDateTime.push(dateTimeStr);
    }
  }
  return existingDateTime;
}


/**
 * Sends a booking confirmation WhatsApp message via Zoko using the "conferma_riservazione" template
 *
 * @param {string} phoneNumber     The phone number in E.164 format (e.g. "+41760000000")
 * @param {string} vehicleType     Vehicle type from column S (e.g. "N06 - Citroen Jumper (Minusio)")
 * @param {string} dateTime        Date and time info (formatted from columns F,G,H,I)
 * @param {string} referenceNumber Reference number from column O
 * @param {string} paymentLink     Payment link from column M
 */
function sendBookingConfirmationMessage(phoneNumber, vehicleType, dateTime, referenceNumber, paymentLink) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  
  // Must match your template name & language in Zoko
  const templateId = "conferma_riservazione_new";
  const templateLang = "it";
  
  // Template args map to the placeholders in the conferma_riservazione template
  // {{1}} = Vehicle type (Column S)
  // {{2}} = Date/time formatted from columns F,G,H,I
  // {{3}} = Reference number (Column O)
  // {{4}} = Payment link (Column M)
  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber, // Formatted with "+" prefix
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [
      vehicleType,      // {{1}} - Vehicle type from column S
      dateTime,         // {{2}} - Date/time info (combined from F,G,H,I)
      referenceNumber,  // {{3}} - Reference number from column O
      paymentLink       // {{4}} - Payment link from column M
    ]
  };
  
  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "apikey": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());
    
    if (responseCode === 200) {
      Logger.log("Zoko Booking Confirmation Success: " + JSON.stringify(responseData));
      return true;
    } else {
      Logger.log("Zoko Booking Confirmation Error - HTTP " + responseCode + ": " + JSON.stringify(responseData));
      return false;
    }
  } catch (e) {
    Logger.log("Zoko Booking Confirmation Exception: " + e.toString());
    return false;
  }
}

// Modified importEmails function to include sending confirmation message
function importEmails() {
  var threads = GmailApp.search('is:unread -label:Booking newer_than:7d from:booking@noleggio-semplice.com subject:"La tua riservazione è stata confermata"');
  var bookingLabel = GmailApp.getUserLabelByName("Booking");

  if (!bookingLabel) {
    bookingLabel = GmailApp.createLabel("Booking");
  }

  if (threads.length > 0) {
    newEmailsFound = true;
  }

  var existingDateTime = getAllExistingDates(); // Get existing dates from consolidated sheet

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();

    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var messageDate = new Date(message.getDate());
      var messageDateTimeStr = Utilities.formatDate(messageDate, "GMT", "yyyy-MM-dd HH:mm:ss");

      var body = message.getPlainBody();

      var vehicleTypeMatched = false;
      var matchedVehicleType = '';

      // Iterate over vehicle types to find a match
      for (var vehicleType in vehicleConfigs) {
        var vehicleTypeRegex = new RegExp(vehicleType.replace(/[\(\)]/g, '\\$&'), 'i'); // Escape parentheses
        if (vehicleTypeRegex.test(body)) {
          vehicleTypeMatched = true;
          matchedVehicleType = vehicleType;
          break;
        }
      }

      if (!vehicleTypeMatched) {
        Logger.log("No matching vehicle type found in email body.");
        continue; // Skip this email
      }

      var config = vehicleConfigs[matchedVehicleType];

      // Skip processing if the date-time already exists
      if (existingDateTime.includes(messageDateTimeStr)) {
        continue;
      }
      message.markRead();
      Logger.log("Processing email body:\n" + body);

      // ... inside the inner loop in importEmails(), after extracting fields
      var refNumberMatch = body.match(/\*Numero di riferimento\*: (.*)/i);
      var paylinkMatch = body.match(/\*Link per completare il Pagamento\*:\s*(https?:\/\/[^\s]+)/i);
      var firstNameMatch = body.match(/\*First Name\*: (.*)/i);
      var lastNameMatch = body.match(/\*Last Name\*: (.*)/i);
      var indirizzoMatch = body.match(/\*Indirizzo\*: (.*)/i);
      // Updated regex for "Richieste" to capture multiple lines if needed:
      var richiesteMatch = body.match(/\*Richieste\*: ([\s\S]*?)(?=\n\*)/i);
      var trasfertaMatch = body.match(/\*Trasferta\*: (.*)/i);
      // Updated regex for prezzoTotaleMatch
      var prezzoTotaleMatch = body.match(/\*Prezzo Totale\*:\s*(?:CHF\s*)?(\d+(?:\s\d{3})*(?:\.\d{2})?)/i);
      var emailMatch = body.match(/\*Email\*: ([\w\.-]+@[\w\.-]+)/i);
      var mobileTelephoneMatch = body.match(/\*Mobile Telephone\*: (.*)/i);
      var riduzioneFranchigiaMatch = body.match(/\*Riduzione Franchigia\*: (Si|No)/i);
      var depositoMatch = body.match(/\*Deposito\*:\s*(?:CHF\s*)?([\d.,]+)/i);

      // Log each match result
      Logger.log("refNumberMatch: " + refNumberMatch);
      Logger.log("paylinkMatch: " + paylinkMatch);
      Logger.log("firstNameMatch: " + firstNameMatch);
      Logger.log("lastNameMatch: " + lastNameMatch);
      Logger.log("indirizzoMatch: " + indirizzoMatch);
      Logger.log("richiesteMatch: " + richiesteMatch);
      Logger.log("trasfertaMatch: " + trasfertaMatch);
      Logger.log("prezzoTotaleMatch: " + prezzoTotaleMatch);
      Logger.log("emailMatch: " + emailMatch);
      Logger.log("mobileTelephoneMatch: " + mobileTelephoneMatch);
      Logger.log("riduzioneFranchigiaMatch: " + riduzioneFranchigiaMatch);
      Logger.log("depositoMatch: " + depositoMatch);

      // Check that all matches succeeded
      if (
          !refNumberMatch || !paylinkMatch || !firstNameMatch || !lastNameMatch || 
          !indirizzoMatch || !richiesteMatch || !trasfertaMatch || !prezzoTotaleMatch || 
          !emailMatch || !mobileTelephoneMatch || !riduzioneFranchigiaMatch || !depositoMatch
        ) {
        Logger.log("Failed to extract all booking details from email with subject: " + message.getSubject());
        continue; // Skip this email
      }

      var refNumber = refNumberMatch[1];
      var paylink = paylinkMatch[1];
      var firstName = firstNameMatch[1];
      var lastName = lastNameMatch[1];
      var indirizzo = indirizzoMatch[1];
      var richieste = richiesteMatch[1];
      var trasferta = trasfertaMatch[1];
      var prezzoTotale = prezzoTotaleMatch[1].replace(/\s/g, '');
      var email = emailMatch[1];
      var mobileTelephone = mobileTelephoneMatch[1];
      var riduzioneFranchigia = riduzioneFranchigiaMatch[1];
      var deposito = depositoMatch[1].replace(/\s/g, '').replace(',', '.'); // "600.00"

          // ——— New date/time parsing ———

    // 1) Extract one or two dates from the "La tua riservazione … per:" line
    // 1) Extract one or two dates from the “per:” clause
// in your importEmails (around line 234), use:
   // ——— New date/time parsing ———
// ——— New date/time parsing ———
var reservationInfoMatch = body.match(
  /per:\s*([0-3]\d\/[0-1]\d\/\d{4})(?:\s+\d{1,2}:\d{2})?(?:\s*[-–]\s*([0-3]\d\/[0-1]\d\/\d{4})(?:\s+\d{1,2}:\d{2})?)?/i
);
if (!reservationInfoMatch) {
  Logger.log("❌ Couldn't find reservation dates; subject=" + message.getSubject());
  continue;
}
var date1 = reservationInfoMatch[1];
var date2 = reservationInfoMatch[2] || date1;

// ——— Timeslot parsing ———
var timeslotMatch = body.match(/\*Timeslots\*:\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i);
if (!timeslotMatch) {
  Logger.log("❌ Couldn't find Timeslots; subject=" + message.getSubject());
  continue;
}
var time1 = timeslotMatch[1];
var time2 = timeslotMatch[2];

// ⏰ Fix 00:00 confusion – if time2 is "00:00", change to "23:59"
var correctedTime2 = (time2 === "00:00") ? "23:59" : time2;

// ——— Build template string ———
var dateTimeForTemplate;
if (date1 === date2) {
  dateTimeForTemplate = date1 + " " + time1 + "-" + time2;
} else {
  dateTimeForTemplate = date1 + " " + time1 + " - " + date2 + " " + time2;
}
Logger.log("Parsed dateTimeForTemplate:", dateTimeForTemplate);

// …then call sendBookingConfirmationMessage(…, dateTimeForTemplate, …);


    // ——— end new parsing ———

      // NEW CODE: Send an email notification if "richieste" has content
      if (richieste && richieste.trim() !== "") {
        var notificationSubject = "Nuova Richiesta - " + firstName + " " + lastName + " - " + date1 + " " + time1 + " - " + date2 + " " + time2;
        var notificationBody = "Richiesta:\n" + richieste;
        MailApp.sendEmail("noleggiosemplice23@gmail.com", notificationSubject, notificationBody);
        Logger.log("Notification email sent for booking: " + notificationSubject);
      }

      // Continue with appending the row data...
      var sheet = SpreadsheetApp.openById(consolidatedSheetId).getActiveSheet();

      var newRow = [
        message.getDate(),           // A - message date
        firstName + " " + lastName,  // B
        indirizzo,                   // C
        "'" + mobileTelephone,       // D
        email,                       // E
        date1,                       // F
        time1,                       // G
        date2,                       // H
        correctedTime2,              // I
        prezzoTotale,                // J
        riduzioneFranchigia,         // K
        '',                          // L
        paylink,                     // M
        '',                          // N
        refNumber,                   // O
        '',                          // P
        trasferta,                   // Q
        richieste,                   // R
        config.vehicleType,          // S (Column 19)
        config.vehicleAddress,       // T (Column 20) - now storing vehicleAddress
        deposito                     // U (Column 21, deposit)
      ];

      threads[i].addLabel(bookingLabel);
      sheet.appendRow(newRow);
      
      // NEW CODE: Send Booking Confirmation WhatsApp message via Zoko
      // Format the phone number for WhatsApp (add "+" prefix)
      var whatsappNumber = "+" + formatWhatsAppNumber(mobileTelephone.replace(/\D/g, ''));
      
      // Format date/time string for template
      var dateTimeForTemplate;
      if (date1 === date2) {
        // Same day rental
        dateTimeForTemplate = date1 + " " + time1 + "-" + time2;
      } else {
        // Multi-day rental
        dateTimeForTemplate = date1 + " " + time1 + " - " + date2 + " " + time2;
      }
      
      // Send WhatsApp confirmation
      var messageSent = sendBookingConfirmationMessage(
        whatsappNumber,
        config.vehicleType,
        dateTimeForTemplate,
        refNumber,
        paylink
      );
      
      if (messageSent) {
        Logger.log("WhatsApp booking confirmation sent to: " + whatsappNumber);
      } else {
        Logger.log("Failed to send WhatsApp booking confirmation to: " + whatsappNumber);
      }
    }
  }
}

// Function to format WhatsApp number
function formatWhatsAppNumber(phoneNumber) {
  phoneNumber = phoneNumber.replace(/\s/g, ''); // Remove any spaces
  if (phoneNumber.startsWith("078") || phoneNumber.startsWith("077") || 
      phoneNumber.startsWith("076") || phoneNumber.startsWith("079")) {
    return "41" + phoneNumber.substring(1); // Remove the first character (0) and prepend 41
  }
  return phoneNumber; // Return the original number if it doesn't match the criteria
}

// Function to parse date and time into a Date object
function parseDateTime(dateStr, timeStr) {
  var day, month, year, hours, minutes;

  // Handle dateStr
  if (dateStr instanceof Date) {
    day = dateStr.getDate();
    month = dateStr.getMonth(); // Months are 0-based
    year = dateStr.getFullYear();
  } else if (typeof dateStr === 'string') {
    var dateParts = dateStr.split('/');
    if (dateParts.length !== 3) {
      throw new Error('Invalid dateStr: ' + dateStr);
    }
    day = parseInt(dateParts[0], 10);
    month = parseInt(dateParts[1], 10) - 1; // Months are 0-based
    year = parseInt(dateParts[2], 10);
  } else {
    throw new Error('Invalid dateStr: ' + dateStr);
  }

  // Handle timeStr
  if (timeStr instanceof Date) {
    hours = timeStr.getHours();
    minutes = timeStr.getMinutes();
  } else if (typeof timeStr === 'string') {
    var timeParts = timeStr.split(':');
    if (timeParts.length !== 2) {
      throw new Error('Invalid timeStr: ' + timeStr);
    }
    hours = parseInt(timeParts[0], 10);
    minutes = parseInt(timeParts[1], 10);
  } else if (typeof timeStr === 'number') {
    // If timeStr is a number, treat it as hours
    hours = timeStr;
    minutes = 0;
  } else {
    throw new Error('Invalid timeStr: ' + timeStr);
  }

  return new Date(year, month, day, hours, minutes);
}

// Function to create events in Google Calendar based on imported emails
function createEvents() {
  var sheet = SpreadsheetApp.openById(consolidatedSheetId).getActiveSheet();
  // Include column U as well
  var rows = sheet.getRange("A2:U" + sheet.getLastRow()).getValues();

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var rowIndex = i + 2; // Adjust for header row

    // If there's no date in column A or we've already created an event (column L), skip
    if (row[0] === "" || row[11] === "Event Created") {
      continue;
    }

    var vehicleType = row[18]; // S
    var config = vehicleConfigs[vehicleType];
    if (!config) {
      continue;
    }

    var calendar = CalendarApp.getCalendarById(config.calendarId);
    if (!calendar) {
      continue;
    }

    // Use vehicleNumber from config for event title
    var vehicleNumber = config.vehicleNumber;
    Logger.log('Vehicle Number: ' + vehicleNumber);
    Logger.log('Vehicle Type: ' + vehicleType + ', Calendar ID: ' + config.calendarId);

    // Read needed columns
    var email        = row[4];   // E
    var prezzo       = row[9];   // J (Prezzo Totale)
    var franchigia   = row[10];  // K (Riduzione Franchigia)
    var trasferta    = row[16];  // Q
    var richieste    = row[17];  // R
    var deposit      = row[20];  // U (the deposit)

    // If you want to deduct the deposit instead of a fixed 50:
    //   var adjustedPrezzo = parseFloat(prezzo) - parseFloat(deposit);
    // Otherwise, keep your original logic if you want a fixed 50 deducted:
    var adjustedPrezzo = parseFloat(prezzo) - parseFloat(deposit);


    var adjustedPrezzoFormatted = adjustedPrezzo.toFixed(2); // 2 decimal places

    var eventTitle = vehicleNumber + " - " + row[1] + " - CHF " + adjustedPrezzoFormatted;
    var timestamp  = row[0];
    var formattedDate = Utilities.formatDate(new Date(timestamp), "GMT", "yyyy-MM-dd");
    var refNumber  = row[14]; // O

    // Read dates and times
    var date1 = row[5]; // F
    var time1 = row[6]; // G
    var date2 = row[7]; // H
    var time2 = row[8]; // I

    // Parse them into Date objects
    var ritiroDateTime   = parseDateTime(date1, time1);
    var consegnaDateTime = parseDateTime(date2, time2);

    // Adjust the end date if it's 00:00
    if (consegnaDateTime.getHours() === 0 && consegnaDateTime.getMinutes() === 0) {
      Logger.log("Consegna hour is 00:00, adding one day to the consegnaDate.");
      consegnaDateTime.setDate(consegnaDateTime.getDate() + 1);
    }

    Logger.log("Adjusted Ritiro Date and Time: " + ritiroDateTime.toString());
    Logger.log("Adjusted Consegna Date and Time: " + consegnaDateTime.toString());

    // Build description
    var description = 
      "Veicolo: " + vehicleType + "\n" +
      "Indirizzo: " + row[2] + "\n" +
      "Numero di cellulare: " + row[3] + "\n" +
      "Whatsapp: https://wa.me/" + formatWhatsAppNumber(row[3].replace(/\D/g, '')) + "\n" +
      "Email: " + email + "\n" +
      "Prezzo: CHF " + adjustedPrezzoFormatted + "\n" +
      "Trasferta: " + trasferta + "\n" +
      "Franchigia: " + franchigia + "\n" +
      "Deposit Refund: CHF " + deposit + "\n" +
      "Richieste: " + richieste + "\n" +
      "Data di contratto: " + formattedDate + "\n" +
      "Numero di riferimento: " + refNumber + "\n" +
      "Pagamento:\n" +
      "Data di Pagamento:";

// Check for existing events (same timeframe, same title)
var existingEvents = calendar.getEvents(ritiroDateTime, consegnaDateTime, { search: eventTitle });
var eventAlreadyExists = false; // Default assumption

// Check if any existing event has the same "numero di riferimento"
for (var k = 0; k < existingEvents.length; k++) {
  var existingEvent = existingEvents[k];
  var existingDescription = existingEvent.getDescription();

  if (existingDescription.includes("Numero di riferimento: " + refNumber)) {
    eventAlreadyExists = true; // If the reference number matches, event exists
    Logger.log("Event already exists with matching Numero di riferimento: " + refNumber);
    break;
  }
}

// If no matching event, create a new one
if (!eventAlreadyExists) {
  try {
    // Create the event
    var newEvent = calendar.createEvent(eventTitle, ritiroDateTime, consegnaDateTime, { description: description });

    // Optional color-coding logic
    var ritiroHours = ritiroDateTime.getHours();
    var consegnaHours = consegnaDateTime.getHours();

    if (ritiroHours === 7 && consegnaHours === 19) {
      newEvent.setColor("11"); // Red
    } else if (
      (ritiroHours === 7 && consegnaHours === 12) ||
      (ritiroHours === 1 && consegnaHours === 12)
    ) {
      newEvent.setColor("10"); // Green
    } else if (
      (ritiroHours === 13 && consegnaHours === 19) ||
      (ritiroHours === 13 && consegnaHours === 0) ||
      (ritiroHours === 20 && consegnaHours === 0)
    ) {
      newEvent.setColor("5"); // Orange
    }

    // Mark row as "Event Created"
    sheet.getRange(rowIndex, 12).setValue("Event Created"); // Column L

    // If there's an igloPin function, call it
    var igloPinFunctionName = config.igloPinFunctionName;
    if (igloPinFunctionName && typeof this[igloPinFunctionName] === 'function') {
      try {
        this[igloPinFunctionName](row, rowIndex, sheet);
      } catch (e) {
        Logger.log("Error calling igloPin function " + igloPinFunctionName + ": " + e.toString());
      }
    } else {
      Logger.log("IgloPin function " + igloPinFunctionName + " not found for vehicleType: " + vehicleType);
    }
  } catch (e) {
    Logger.log("Error creating calendar event: " + e.toString());
  }
}
  }
}


 // for example, if you want to re-run the process for row 5

// Main function
function main() {
  newEmailsFound = false;
  loadVehicleConfigs();
  importEmails();

  if (newEmailsFound) {
    createEvents();
    updateNext90Days();  // ← only runs when newEmailsFound === true
  }

  processPaymentStatus();  
}




/**
 * Sends a WhatsApp message via Zoko using a template that has only 2 placeholders:
 *   {{1}} = referenceNumber
 *   {{2}} = total (price + deposit)
 *
 * @param {string} phoneNumber     Recipient's phone number in +41... format
 * @param {string} referenceNumber The booking/payment reference
 * @param {string} total           The sum of price + deposit, e.g. "104.50"
 * @return {boolean}               True if sent successfully, false otherwise
 */
function sendPaymentConfirmationMessage(phoneNumber, referenceNumber, total) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3"; // Use your real Zoko API key

  // Must match your template name & language in Zoko
  // For example, if your new template is named "grazie_pagamento_250315" in Italian:
  const templateId   = "grazie_pagamento_250315_new_new"; 
  const templateLang = "it";

  // The order of templateArgs must match the placeholders in your new Zoko template:
  //   {{1}} => referenceNumber
  //   {{2}} => total
  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber, // e.g. "+41787240722"
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [
      referenceNumber, // {{1}}
      total            // {{2}}
    ]
  };

  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "apikey": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());

    if (responseCode === 200) {
      Logger.log("Zoko Payment Confirmation Success: " + JSON.stringify(responseData));
      return true;
    } else {
      Logger.log("Zoko Payment Confirmation Error - HTTP " + responseCode + ": " + JSON.stringify(responseData));
      return false;
    }
  } catch (e) {
    Logger.log("Zoko Payment Confirmation Exception: " + e.toString());
    return false;
  }
}


function processPaymentStatus() {
  const ss = SpreadsheetApp.openById('1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o');
  const paymentSheet = ss.getSheetByName("Payment");
  const reservationSheet = ss.getSheetByName("Sheet1");

  const paymentData = paymentSheet.getDataRange().getValues();
  const reservationData = reservationSheet.getDataRange().getValues();

  for (let i = 1; i < paymentData.length; i++) {
    let checkedValue = String(paymentData[i][9]).toLowerCase();
    if (checkedValue !== "yes") {
      let refNumber = String(paymentData[i][8]).trim();
      if (!refNumber) continue;

      let reservationRowIndex = -1;
      for (let j = 1; j < reservationData.length; j++) {
        if (String(reservationData[j][14]).trim() === refNumber) {
          reservationRowIndex = j;
          break;
        }
      }
      if (reservationRowIndex < 0) continue;

      reservationSheet.getRange(reservationRowIndex + 1, 23).setValue("paid");
      sendContractForRow(reservationRowIndex + 1);
      paymentSheet.getRange(i + 1, 10).setValue("yes");

      let total = String(paymentData[i][6]).trim();
      let rawPhone = String(reservationData[reservationRowIndex][3]).trim();
      let formatted = formatWhatsAppNumber(rawPhone);
      let whatsappNumber = formatted.startsWith("+") ? formatted : "+" + formatted;

      sendPaymentConfirmationMessage(whatsappNumber, refNumber, total);
    }
  }
}

function reAuthorize() {
  UrlFetchApp.fetch('https://www.google.com'); // Just triggers external request
}
