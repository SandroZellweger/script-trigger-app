/*************************************************************
 * 1) MATCHES THE "REF NUMBER" FROM EVENT DESCRIPTION & STRIPE
 *************************************************************/
function matchesCriteria(event, stripePayment) {
  var eventDescription = event.getDescription();
  var eventRefPattern = /Numero di riferimento:\s*(\d+)/;
  var eventMatch = eventDescription.match(eventRefPattern);

  var stripeRefPattern = /Booking #(\d+)/;
  var stripeMatch = stripePayment.description && stripePayment.description.match(stripeRefPattern);

  if (eventMatch && stripeMatch) {
    return eventMatch[1] === stripeMatch[1];
  }
  return false;
}

/*************************************************************
 * 2) GATHER CALENDAR EVENTS (FROM ALL LISTED CALENDARS)
 *************************************************************/
function getCalendarEvents() {
  const configSheetId = '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E';
  const configSheet = SpreadsheetApp.openById(configSheetId).getSheets()[0];
  const configData = configSheet.getDataRange().getValues();

  var today = new Date();
  var start = new Date(today.getFullYear(), today.getMonth(), 1);
  var end = new Date(today.getFullYear(), today.getMonth() + 4, 0);

  let allEvents = [];
  for (let i = 1; i < configData.length; i++) {
    const calendarId = configData[i][2];
    if (calendarId) {
      const calendar = CalendarApp.getCalendarById(calendarId);
      if (calendar) {
        allEvents = allEvents.concat(calendar.getEvents(start, end));
      }
    }
  }
  return allEvents;
}

/*************************************************************
 * 3) INSERT INTO PAYMENT SHEET IMMEDIATELY (NO YES FLAG)
 *************************************************************/
function insertIntoPaymentSheet(refNumber, paymentTimestamp, paymentMethod = "stripe") {
  const ss = SpreadsheetApp.openById('1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o');
  const reservationSheet = ss.getSheetByName("Sheet1");
  const paymentSheet = ss.getSheetByName("Payment");

  const reservationData = reservationSheet.getDataRange().getValues();
  let matchRow;
  let matchIndex;

  for (let i = 1; i < reservationData.length; i++) {
    if (String(reservationData[i][14]).trim() === String(refNumber)) {
      matchRow = reservationData[i];
      matchIndex = i;
      break;
    }
  }
  if (!matchRow) return;

  const email = matchRow[4];
  const dateRitiro = matchRow[5];
  const timeRitiro = matchRow[6];
  const dateConsegna = matchRow[7];
  const timeConsegna = matchRow[8];
  const prezzo = matchRow[9];
  const mobile = matchRow[3];

  const formattedDate = Utilities.formatDate(new Date(paymentTimestamp * 1000), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  paymentSheet.appendRow([
    formattedDate,
    email,
    dateRitiro,
    timeRitiro,
    dateConsegna,
    timeConsegna,
    prezzo,
    paymentMethod,
    refNumber,
    "" // Leave 'Checked' empty, will be updated later
  ]);

  // Update calendar event
  const stripePayment = {
    description: "Booking #" + refNumber,
    created: paymentTimestamp,
    paid: true
  };
  const events = getCalendarEvents().filter(ev => matchesCriteria(ev, stripePayment));
  events.forEach(event => updateCalendarEvent(event, stripePayment, []));
}

/*************************************************************
 * 4) IMMEDIATE STRIPE WEBHOOK HANDLER (NO DELAY)
 *************************************************************/
function doPost(e) {
  Logger.log("Received Stripe webhook");
  const payload = e.postData.contents;
  let logs = [];

  try {
    const json = JSON.parse(payload);
    if (json.type === "payment_intent.succeeded") {
      const pi = json.data.object;
      const description = pi.description;
      const created = pi.created;

      if (description && /Booking #(\d+)/.test(description)) {
        const refNumber = description.match(/Booking #(\d+)/)[1];
        insertIntoPaymentSheet(refNumber, created, "stripe");
        logs.push("✅ Payment logged for ref #" + refNumber);
      }
    }
  } catch (err) {
    logs.push("❌ Error processing Stripe webhook: " + err);
  }

  sendExecutionLogEmail(logs);
  return HtmlService.createHtmlOutput(JSON.stringify({ status: "processed" }));
}

/*************************************************************
 * 5) UPDATE CALENDAR EVENT WITH PAYMENT DETAILS
 *************************************************************/
function updateCalendarEvent(event, stripePayment, logs) {
  logs.push("Updating event for: " + event.getTitle());
  var title = event.getTitle();
  if (!title.includes("$")) {
    event.setTitle("$" + title);
  }

  var description = event.getDescription();
  var paymentDate = new Date(stripePayment.created * 1000);
  var formattedPaymentDate = Utilities.formatDate(paymentDate, Session.getScriptTimeZone(), "dd/MM/yyyy");

  if (!/Pagamento:\s*Stripe/.test(description)) {
    if (description.includes("Pagamento:")) {
      description = description.replace(/(Pagamento:).*/, "$1 Stripe");
    } else {
      description += "\nPagamento: Stripe";
    }
  }

  if (description.includes("Data di Pagamento:")) {
    description = description.replace(/(Data di Pagamento:).*/, "Data di Pagamento: " + formattedPaymentDate);
  } else {
    description += "\nData di Pagamento: " + formattedPaymentDate;
  }

  event.setDescription(description);
  logs.push("Updated event description: " + description);
}

/*************************************************************
 * 6) SEND LOGS VIA EMAIL (OPTIONAL)
 *************************************************************/
function sendExecutionLogEmail(logs) {
  const recipient = "noleggiosemplice23@gmail.com";
  const subject = "Stripe Payment Execution Log";
  const body = `Execution Log:\n\n${logs.join("\n")}`;
  GmailApp.sendEmail(recipient, subject, body);
}