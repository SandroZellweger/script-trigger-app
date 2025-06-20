// Send Document Request Zoko.gs

/**
 * Invia un messaggio di richiesta documenti tramite Zoko
 * per gli eventi nei prossimi 48 h che non hanno ancora il simbolo % nel titolo.
 */
function sendDocumentRequestMessage(phoneNumber, vehicleName, dateTime, reference) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  const templateId = "richiesta_patente";  // aggiorna con l'ID reale
  const templateLang = "it";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [vehicleName, dateTime, reference]
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
    const code = response.getResponseCode();
    const data = JSON.parse(response.getContentText());

    if (code === 200 || code === 202) {
      Logger.log(`Documento richiesto con successo a ${phoneNumber}: ${JSON.stringify(data)}`);
      return true;
    } else {
      Logger.log(`Errore richiesta documenti HTTP ${code} per ${phoneNumber}: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (e) {
    Logger.log(`Eccezione invio richiesta documenti a ${phoneNumber}: ${e}`);
    return false;
  }
}

/**
 * Estrae phoneNumber, vehicleName, reference,
 * mapsLink, parkingNumber e code dalla description grezza.
 */
function parseMessaggioCodice(description) {
  if (!description) return null;

  // PHONE NUMBER
  const codeMatch = description.match(/Messaggio Codice:\s*(https:\/\/wa\.me\/([^?\s]+)\?text=[^\s]+)/);
  if (!codeMatch) return null;
  let phoneNumber = codeMatch[2];
  if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;

  // VEICOLO
  const vehicleMatch = description.match(/Veicolo:\s*(.+)/i);
  const vehicleName = vehicleMatch ? vehicleMatch[1].trim() : '';

  // RIFERIMENTO
  const refMatch = description.match(/Numero di riferimento:\s*(\d+)/i);
  const reference = refMatch ? refMatch[1] : '';

  // (restanti, se ti servono)
  const mapsLinkMatch = description.match(/https:\/\/maps\.app\.goo\.gl\/[^\s]+/);
  const mapsLink = mapsLinkMatch ? mapsLinkMatch[0] : '';

  const parkingMatch = description.match(/No°\s*(\d+)/i);
  const parkingNumber = parkingMatch ? `No° ${parkingMatch[1]}` : '';

  const keyCodeMatch = description.match(/Codice per il box chiave[^:]*:\s*\*?(\d+)\*?/i);
  const code = keyCodeMatch ? keyCodeMatch[1] : '';

  return { phoneNumber, vehicleName, reference, mapsLink, parkingNumber, code };
}

/**
 * Controlla gli eventi nelle prossime 48 h e invia
 * richiesta documenti solo se il titolo NON contiene "!"
 * e NON contiene "%" (per non reinviare).
 * Dopo invio, antepone "%" al titolo.
 */
function checkAndRequestDocuments() {
  const calendarIds = getCalendarIdsFromSheet();
  const now = new Date();
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const futureEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  calendarIds.forEach(id => {
    const cal = CalendarApp.getCalendarById(id);
    if (!cal) return;

    // … your existing “next 48h” logic …

    // 2) All future events → whenever *, ! and $ appear anywhere → strip them all out and replace with 🟢
    cal.getEvents(now, futureEnd).forEach(event => {
      const title = event.getTitle();
      // check for at least one of each marker anywhere
      if (title.includes('*') && title.includes('!') && title.includes('$')) {
        // remove ALL *, !, $ characters from the title
        const cleaned = title.replace(/[*!$]/g, '');
        // prefix a single 🟢
        const newTitle = '🟢' + cleaned;
        if (newTitle !== title) {
          event.setTitle(newTitle);
          Logger.log(`Titolo aggiornato per evento ${event.getId()}: "${title}" → "${newTitle}"`);
        }
      }
    });

  });
}


