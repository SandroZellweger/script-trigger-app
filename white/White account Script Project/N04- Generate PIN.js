function generateDurationAlgoPinDucato(rowData, rowIndex, sheet) {
  // Check if a PIN is already present in column P (16th column, index 15)
  if (rowData[15]) {
    Logger.log("PIN already exists for row " + rowIndex);
    return;
  }

  var now = new Date(); // Get the current time

  // Parse ritiro (pickup) and consegna (drop-off) dates and times
  var ritiroDateTime = parseDateTime(rowData[5], rowData[6]); // Columns F and G (indices 5 and 6)
  var consegnaDateTime = parseDateTime(rowData[7], rowData[8]); // Columns H and I (indices 7 and 8)

  // Adjust startDate to 2 hours before ritiroDateTime
  var startDate = new Date(ritiroDateTime.getTime());
  startDate.setHours(startDate.getHours() - 2);

  // If startDate is in the past, adjust it to now
  if (startDate < now) {
    startDate = now;
  }

  // Adjust endDate to 2 hours after consegnaDateTime
  var endDate = new Date(consegnaDateTime.getTime());
  endDate.setHours(endDate.getHours() + 2);

  // Ensure endDate is after startDate
  if (endDate <= startDate) {
    Logger.log("Adjusted end date to ensure it's after the start date.");
    endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
  }

  var clientId = '36j00aig9dco7nms0a1lfcf9t9';
  var clientSecret = '1f6scc262em56gfvppr5m43a3k5gj5hhcc8ln7eg2a1g8sals629';
  var deviceId = 'IGK322314358'; // Ducato device ID
  var tokenUrl = 'https://auth.igloohome.co/oauth2/token';
  var apiUrl = `https://api.igloodeveloper.co/igloohome/devices/${deviceId}/algopin/hourly`;

  // Format startDate and endDate for API request
  var formattedStartDate = Utilities.formatDate(startDate, "GMT+08:00", "yyyy-MM-dd'T'HH:00:00XXX");
  var formattedEndDate = Utilities.formatDate(endDate, "GMT+08:00", "yyyy-MM-dd'T'HH:00:00XXX");

  var tokenPayload = {
    'client_id': clientId,
    'client_secret': clientSecret,
    'grant_type': 'client_credentials',
    'scope': 'igloohomeapi/algopin-hourly'
  };

  var tokenOptions = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': tokenPayload
  };

  var tokenResponse = UrlFetchApp.fetch(tokenUrl, tokenOptions);
  var token = JSON.parse(tokenResponse.getContentText()).access_token;

  var apiPayload = JSON.stringify({
    'variance': 1,
    'startDate': formattedStartDate,
    'endDate': formattedEndDate,
    'accessName': 'Duration Access'
  });

  var apiOptions = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'payload': apiPayload
  };

  var response = UrlFetchApp.fetch(apiUrl, apiOptions);
  var pinData = JSON.parse(response.getContentText());
  Logger.log(pinData);

  // Place the generated PIN in the sheet in column P (16th column)
  sheet.getRange(rowIndex, 16).setValue(pinData.pin);

  // Call the updateEventWithPIN function after generating the PIN
  updateEventWithPinDucato(rowData, pinData.pin);
}

function updateEventWithPinDucato(rowData, pin) {
  var vehicleType = 'N04 - Fiat Ducato (Locarno)';
  var calendarId = vehicleConfigs[vehicleType].calendarId;
  var calendar = CalendarApp.getCalendarById(calendarId);

  var vehicleNumber = vehicleConfigs[vehicleType].vehicleNumber;
  var adjustedPrezzo = parseFloat(rowData[9]) - 50; // Column J (index 9)
  var adjustedPrezzoFormatted = adjustedPrezzo.toFixed(2);

  var ritiroDateTime = parseDateTime(rowData[5], rowData[6]); // Columns F and G

  // Get the "Numero di riferimento" from column O (index 14)
  var numeroDiRiferimento = rowData[14];

  // Retrieve all events on the pickup day
  var events = calendar.getEventsForDay(ritiroDateTime);

  var matchingEvent = null;

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var description = event.getDescription();

    // Check if the description contains the "Numero di riferimento"
    if (description && description.includes(numeroDiRiferimento)) {
      matchingEvent = event;
      break;
    }
  }

  if (matchingEvent) {
    var whatsappNumber = rowData[3]; // WhatsApp number from column D (index 3)

    // Use the message as in the original function, without changing the text
    var startTime = ritiroDateTime;
    var endTime = parseDateTime(rowData[7], rowData[8]); // Columns H and I

    var rentalDetails = `*N04 Fiat Ducato (Locarno) TI 255700*\n*${Utilities.formatDate(startTime, 'GMT+02:00', 'dd.MM.yy')} / ${Utilities.formatDate(startTime, 'GMT+02:00', 'HH:mm')}-${Utilities.formatDate(endTime, 'GMT+02:00', 'HH:mm')}*\n\n`;

    var locationDetails = "\uD83D\uDCCD *Locazione Furgone:* https://maps.app.goo.gl/zKCZTsvfL3wTCkoVA\n\n";

    var newMessage = rentalDetails + locationDetails +

      "*Istruzioni per il Noleggio del Veicolo*\n\n" +
      "\uD83D\uDD17 Clicca qui per le istruzioni dettagliate: https://shorturl.at/Cl1CV\n\n" +
      "*Al Ritiro:*\n" +
      "- \uD83D\uDCF8 Foto dei 4 lati del veicolo e mandare, prima della partenza\n" +
      "- \uD83C\uDD7F\uFE0F Puoi posteggiare il tuo veicolo al posto del furgone\n\n" +
      "*Alla Riconsegna:*\n" +
      "- \u26FD Fare il pieno (DIESEL) e conservare lo scontrino\n" +
      "- \uD83C\uDD7F\uFE0F Parcheggiare nel posteggio, rispettando le linee\n" +
      "- \uD83D\uDCF8 Foto dei 4 lati del veicolo\n" +
      "- \uD83D\uDCF8 Foto del quadrante con livello carburante visibile\n" +
      "- \uD83D\uDCF8 Foto dello scontrino del carburante\n" +
      "- \uD83D\uDCF8 Foto della cabina conducente\n" +
      "- \uD83D\uDCF8 Foto della zona di carico\n\n" +
      "\uD83D\uDD14 *Importante:*\n" +
      "- Inviare tutte le foto come richiesto.\n" +
      "- Non seguire queste istruzioni comporta una penale di CHF 50.-\n\n" +

      "*Accesso al parcheggio*\n\n" +
      "Se arrivi con la tua auto, ritira il biglietto del parcheggio, entra lascia la tua auto e prendi il furgone, usa il biglietto che hai preso con la tua auto per uscire con il furgone, quando torni fai la stessa cosa\n\n" +
      "Se non hai l'auto, ritira il furgone e usa per uscire ed entrare nel parcheggio la tessera magnetica che trovi sotto il parasole lato conducente\n" +
      "\u26A0\uFE0F metti sempre la tessera sotto il parasole \u26A0\uFE0F\n\n" +

      "\uD83D\uDD11 Codice per il box chiave (Portellone Posteriore): *" + pin + "* e \uD83D\uDD13 \n\n" +
      " *Ricorda:* La precisione in queste azioni è cruciale per evitare costi aggiuntivi!";

    var encodedMessage = encodeURIComponent(newMessage);
    var whatsappLink = "https://wa.me/" + formatWhatsAppNumber(whatsappNumber.replace(/\D/g, '')) + "?text=" + encodedMessage;

    var description = matchingEvent.getDescription();
    var newDescription;

    // Check if "Messaggio Codice:" is already present in the description
    if (description.includes("Messaggio Codice:")) {
      // Replace the existing "Messaggio Codice:" line with the new message
      newDescription = description.replace(/Messaggio Codice:.*$/, "Messaggio Codice: " + whatsappLink);
    } else {
      // Append the new message if not found
      newDescription = description + "\nMessaggio Codice: " + whatsappLink;
    }

    // Update the event description
    matchingEvent.setDescription(newDescription);

    Logger.log("Event updated for reference number: " + numeroDiRiferimento);

  } else {
    Logger.log("Event not found for reference number: " + numeroDiRiferimento);
  }
}
