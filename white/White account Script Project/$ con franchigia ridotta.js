// Calendar IDs as provided
var n01CalendarId = 'noleggiosemplice23@gmail.com'; // Vivaro Google Calendar ID
var n03CalendarId = 'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com'; // Boxer Google Calendar ID
var n04CalendarId = 'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com'; // Ducato Calendar ID
var n05CalendarId = '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com'; // Citroen Jumper H2L2 Calendar ID
var n07CalendarId = 'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com'; // Renault Trafic Calendar ID
var n08CalendarId = '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com'; // Renault Trafic Calendar ID
var n09CalendarId = '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com'; // Renault Trafic Calendar ID
var n10CalendarId = 'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com'; // Renault Trafic Calendar ID
var n11CalendarId = '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'; // Renault Trafic Calendar ID


function calculateTotalFranchigiaSiAmount() {
  var calendars = [
    {id: n01CalendarId, name: "N01 - Opel Vivaro (Losone)"},
    {id: n03CalendarId, name: "N03 - Peugeot Boxer (Quartino)"},
    {id: n04CalendarId, name: "N04 - Fiat Ducato (Locarno)"},
    {id: n05CalendarId, name: "N06 - Citroen Jumper (Minusio)"},
    {id: n07CalendarId, name: "N07 - Renault Trafic (Lugano)"},
    {id: n08CalendarId, name: "N08 - Renault Trafic (Lugano)"},
    {id: n09CalendarId, name: "N09 - Renault Trafic (Bellinzona)"},
      {id: n10CalendarId, name: "N10 - Citroen Jumper (Losone)"},
        {id: n11CalendarId, name: "N11 - Citroen Jumper L1H1 (Losone)"}
       
  ];

  var totalSum = 0;

  // Adjust the date range as needed
  var startDate = new Date('2024/01/01');
  var endDate = new Date('2025/03/31');

  for (var i = 0; i < calendars.length; i++) {
    var calendar = CalendarApp.getCalendarById(calendars[i].id);
    var events = calendar.getEvents(startDate, endDate);

    Logger.log("Processing calendar: " + calendars[i].name + " with " + events.length + " events.");

    for (var j = 0; j < events.length; j++) {
      var event = events[j];
      var description = event.getDescription();

      // Skip if description is empty
      if (!description) {
        Logger.log("Event: " + event.getTitle() + " has empty description, skipping.");
        continue;
      }

      // Check if "Franchigia: Si"
      var franchigiaMatch = description.match(/Franchigia:\s*(.*)/i);
      if (!(franchigiaMatch && franchigiaMatch[1].trim().toLowerCase() === "si")) {
        Logger.log("Event: " + event.getTitle() + " does not have Franchigia: Si, skipping.");
        continue;
      }

      // Extract "Prezzo: CHF 123.45"
      var prezzoMatch = description.match(/Prezzo:\s*CHF\s*([\d.,]+)/i);
      // Extract "Deposit Refund: CHF 50.00"
      var depositMatch = description.match(/Deposit Refund:\s*CHF\s*([\d.,]+)/i);

      if (!prezzoMatch || !depositMatch) {
        Logger.log("Could not find Prezzo or Deposit Refund in event: " + event.getTitle() + ". Skipping calculation.");
        continue;
      }

      var prezzoValue = parsePrice(prezzoMatch[1]);
      var depositValue = parsePrice(depositMatch[1]);

      if (isNaN(prezzoValue) || isNaN(depositValue)) {
        Logger.log("Invalid Prezzo/Deposit value in event: " + event.getTitle() +
                   ", Prezzo: " + prezzoMatch[1] + ", Deposit: " + depositMatch[1] +
                   ". Skipping calculation.");
        continue;
      }

      // Franchigia portion = (Prezzo + Deposit) / 11
      var franchigiaPortion = (prezzoValue + depositValue) / 11;
      totalSum += franchigiaPortion;

      Logger.log(
        "Event: " + event.getTitle() +
        ", Prezzo: CHF " + prezzoMatch[1] +
        ", Deposit Refund: CHF " + depositMatch[1] +
        ", Franchigia portion: CHF " + franchigiaPortion.toFixed(2) +
        ", Running total: CHF " + totalSum.toFixed(2)
      );
    }
  }

  Logger.log("Total Franchigia sum ((Prezzo + Deposit) / 11) for 'Franchigia: Si' events is: CHF " + totalSum.toFixed(2));
}


// Helper function to parse price values (handles commas/dots)
function parsePrice(priceStr) {
  // Remove any non-digit, non-comma, non-dot characters
  var prezzoCleaned = priceStr.replace(/[^\d.,]/g, '');

  // Determine if comma is used as decimal separator
  var decimalSeparator = prezzoCleaned.lastIndexOf(',');
  var thousandSeparator = prezzoCleaned.lastIndexOf('.');

  if (decimalSeparator > thousandSeparator) {
    // Comma is decimal separator
    prezzoCleaned = prezzoCleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Dot is decimal separator, remove commas
    prezzoCleaned = prezzoCleaned.replace(/,/g, '');
  }

  return parseFloat(prezzoCleaned);
}
