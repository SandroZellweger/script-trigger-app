// Send Instructions Pickup Zoko.gs

// Function to send vehicle instructions template message via Zoko
function sendVehicleInstructionsMessage(phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  const templateId = "istruzioni_ritiro_veicolo_new";
  const templateLang = "it";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [vehicleName, dateTime, mapsLink, parkingNumber, code]
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

    if (responseCode === 200 || responseCode === 202) {
      Logger.log(`Zoko Vehicle Instructions Success for ${phoneNumber}: ${JSON.stringify(responseData)}`);
      return true;
    } else {
      Logger.log(`Zoko Vehicle Instructions Error - HTTP ${responseCode} for ${phoneNumber}: ${JSON.stringify(responseData)}`);
      return false;
    }
  } catch (e) {
    Logger.log(`Zoko Vehicle Instructions Exception for ${phoneNumber}: ${e.toString()}`);
    return false;
  }
}

function sendAccessoFartMessage(phoneNumber) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  const templateId = "accesso_fart";
  const templateLang = "it";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: []
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

    if (responseCode === 200 || responseCode === 202) {
      Logger.log(`Zoko Accesso Fart message sent to ${phoneNumber}`);
      return true;
    } else {
      Logger.log(`Accesso Fart error ${responseCode} for ${phoneNumber}: ${JSON.stringify(responseData)}`);
      return false;
    }
  } catch (e) {
    Logger.log(`Accesso Fart exception for ${phoneNumber}: ${e.toString()}`);
    return false;
  }
}






// Function to parse Messaggio Codice and extract required details
function parseMessaggioCodice2(description) {
  if (!description) {
    Logger.log("Description is empty or null");
    return null;
  }

  const messaggioCodiceMatch = description.match(/Messaggio Codice: (https:\/\/wa\.me\/([^?]+)\?text=.*)/);
  if (!messaggioCodiceMatch) {
    Logger.log("No Messaggio Codice found in description: " + description);
    return null;
  }

  let phoneNumber = messaggioCodiceMatch[2];
  if (!phoneNumber) {
    Logger.log("Phone number could not be extracted from Messaggio Codice");
    return null;
  }
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = "+" + phoneNumber;
  }

  const encodedText = messaggioCodiceMatch[1].split("?text=")[1];
  const decodedText = decodeURIComponent(encodedText).replace(/\+/g, " ");

  const lines = decodedText.split("\n");
  let vehicleName = "";
  let dateTime = "";
  let mapsLink = "Non fornito";
  let parkingNumber = ",";
  let code = "";

  if (lines[0]) vehicleName = lines[0].replace(/\*/g, "").trim();
  if (lines[1]) dateTime = lines[1].replace(/\*/g, "").trim();

  const mapsLinkMatch = decodedText.match(/Locazione Furgone:[^\n]*https:\/\/maps\.app\.goo\.gl\/[^\n\s]+/);
  if (mapsLinkMatch) mapsLink = mapsLinkMatch[0].split("Locazione Furgone:")[1].trim();

  const parkingMatch = decodedText.match(/No°\s*(\d+)/);
  if (parkingMatch) parkingNumber = `No° ${parkingMatch[1]}`;

  const codeMatch = decodedText.match(/Codice per il box chiave \(Portellone Posteriore\): \*(\d+)\*/);
  if (codeMatch) code = codeMatch[1];

  return { phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code };
}

// Function to get calendar IDs from the specified sheet
function getCalendarIdsFromSheet() {
  const sheetId = "1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E";
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Tabellenblatt1");
  if (!sheet) {
    Logger.log("Error: Tabellenblatt1 sheet not found in ID 1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E");
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const calendarIds = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][2]) {
      calendarIds.push(data[i][2].toString().trim());
    }
  }
  Logger.log(`Fetched ${calendarIds.length} calendar IDs`);
  return calendarIds;
}

// Function to send failure email
function sendFailureEmail(phoneNumber, title, vehicleName, dateTime, mapsLink, parkingNumber, code, errorMessage) {
  const recipient = "noleggiosemplice23@gmail.com";
  const subject = "Invio messaggio codice non riuscito";
  const body = `
    È stato riscontrato un problema durante l'invio del messaggio codice per l'evento seguente:
    
    Titolo evento: ${title}
    Numero di telefono: ${phoneNumber}
    Veicolo: ${vehicleName}
    Data e ora: ${dateTime}
    Link Google Maps: ${mapsLink}
    Numero parcheggio: ${parkingNumber}
    Codice: ${code}
    
    Problema riscontrato: ${errorMessage}
    
    Verifica i dettagli e riprova se necessario.
  `;

  MailApp.sendEmail(recipient, subject, body);
  Logger.log(`Failure email sent to ${recipient} for ${phoneNumber}`);
}

// New function to check events from today until next 48 hours and send instructions
function checkEventsTodayTo48HoursAndSend() {
  const calendarIds = getCalendarIdsFromSheet();
  if (calendarIds.length === 0) {
    Logger.log("No calendar IDs found to check");
    return;
  }

  let eventsProcessed = 0;

  calendarIds.forEach(calendarId => {
    const calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      Logger.log(`Invalid calendar ID: ${calendarId}`);
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const fortyEightHoursLater = new Date();
    fortyEightHoursLater.setHours(23, 59, 59, 999); // End of day, 48 hours from now
    fortyEightHoursLater.setDate(todayStart.getDate() + 2); // Ensure 48+ hours

    Logger.log(`Checking events from ${todayStart} to ${fortyEightHoursLater}`);

    const events = calendar.getEvents(todayStart, fortyEightHoursLater);

    Logger.log(`Found ${events.length} events in calendar ${calendarId}`);

    events.forEach(event => {
      const title = event.getTitle();
      const startTime = event.getStartTime();
      const endTime = event.getEndTime();
      Logger.log(`Event: ${title}, Start: ${startTime}, End: ${endTime}`);

      if (title.includes("!") && title.includes("$") && !title.includes("*")) {
        eventsProcessed++;
        const description = event.getDescription();
        const parsedData = parseMessaggioCodice2(description);

        if (parsedData && typeof parsedData.phoneNumber === "string" && parsedData.phoneNumber.length > 0) {
          const { phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code } = parsedData;
          Logger.log(`Found eligible event: ${title} for ${phoneNumber}`);
          Logger.log(`Details: Phone: ${phoneNumber}, Vehicle: ${vehicleName}, DateTime: ${dateTime}, MapsLink: ${mapsLink}, Parking: ${parkingNumber}, Code: ${code}`);

          if (!vehicleName || !dateTime || !mapsLink || !parkingNumber || !code) {
            Logger.log(`Skipping send for ${phoneNumber} - Missing fields: Vehicle: ${vehicleName}, DateTime: ${dateTime}, MapsLink: ${mapsLink}, Parking: ${parkingNumber}, Code: ${code}`);
            return;
          }

const success = sendVehicleInstructionsMessage(phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code);

if (success) {
  const newTitle = "*" + title;
  event.setTitle(newTitle);
  Logger.log(`Vehicle instructions sent and title updated to ${newTitle} for ${phoneNumber}`);

  // Accesso Fart logic here
  if (calendarId === "d4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com") {
    const accessoSent = sendAccessoFartMessage(phoneNumber);
    if (accessoSent) {
      Logger.log(`Accesso Fart message sent for ${phoneNumber}`);
    } else {
      Logger.log(`Failed to send Accesso Fart message for ${phoneNumber}`);
    }
  }

} else {
  const errorMessage = `Zoko API returned an error or exception. Check logs for details.`;
  sendFailureEmail(phoneNumber, title, vehicleName, dateTime, mapsLink, parkingNumber, code, errorMessage);
  Logger.log(`Failed to send vehicle instructions for ${phoneNumber}`);
}

        } else {
          Logger.log(`Invalid or missing phone number in parsed data for event: ${title}`);
        }
      }
    });
  });

  if (eventsProcessed === 0) {
    Logger.log("No eligible events found with ! and $ in title within the time range");
  }
}

// Test function to search for reference number 1530 and send instructions
function testSearchReferenceNumber1530AndSend() {
  const calendarIds = getCalendarIdsFromSheet();
  if (calendarIds.length === 0) {
    Logger.log("No calendar IDs found to check");
    return;
  }

  let found = false;
  calendarIds.forEach(calendarId => {
    const calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      Logger.log(`Invalid calendar ID: ${calendarId}`);
      return;
    }

    const startTime = new Date(0);
    const endTime = new Date(2030, 0);
    const events = calendar.getEvents(startTime, endTime);

    events.forEach(event => {
      const description = event.getDescription();
      if (description && description.includes("Numero di riferimento: 1530")) {
        Logger.log(`Found reference number 1530 in event: ${event.getTitle()} on ${event.getStartTime()}`);
        found = true;
        const parsedData = parseMessaggioCodice2(description);
        if (parsedData && parsedData.phoneNumber) {
          const { phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code } = parsedData;
          Logger.log(`Details: Phone: ${phoneNumber}, Vehicle: ${vehicleName}, DateTime: ${dateTime}, MapsLink: ${mapsLink}, Parking: ${parkingNumber}, Code: ${code}`);
          const success = sendVehicleInstructionsMessage(phoneNumber, vehicleName, dateTime, mapsLink, parkingNumber, code);
          if (success) {
            Logger.log(`Vehicle instructions sent for reference number 1530 to ${phoneNumber}`);
          } else {
            Logger.log(`Failed to send vehicle instructions for reference number 1530 to ${phoneNumber}`);
          }
        } else {
          Logger.log(`Missing data in event description for ${event.getTitle()}`);
        }
      }
    });
  });

  if (!found) {
    Logger.log("Reference number 1530 not found in any calendar event");
  }
}