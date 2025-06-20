function sumPricesInEvents() {
  var calendarId1 = 'noleggiosemplice23@gmail.com';
  var calendarId2 = 'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com';
  var calendarId3 = 'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com';
  var calendarId4 = 'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com';
  var calendarId5 = '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com'; // Citroen Boxer
  var calendarId6 = '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com'; // Citroen Jumper
  var calendarId7 = 'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com'; // Renault Trafic
  var calendarId8 = '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com'; // Renault Trafic2
  var calendarId9 = '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com'; // Renault Trafic2
  var calendarId10 = 'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com'; // Renault Trafic2
 var calendarId11 = '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'

  var calendarIds = [calendarId1, calendarId2, calendarId3, calendarId4, calendarId5, calendarId6, calendarId7, calendarId8, calendarId9, calendarId10, calendarId11];
  var calendarNames = ['N01 - Opel Vivaro', 'N03 - Peugeot Boxer', 'Renault Master', 'N04 - Fiat Ducato', 'N05 - Citroen Boxer', 'N06 - Citroen Jumper', 'N07 - Renault Trafic', 'N08 - Renault Trafic2', 'N09 - Renault Trafic3', 'N10 - Citroen Jumper2', 'N11 - Citroen Jumper3' ];

  // Set the date range here using strings in DD/MM/YYYY format
  var startDateStr = '1/05/2025'; // Start date in DD/MM/YYYY format
  var endDateStr   = '31/05/2025'; // End date in DD/MM/YYYY format

  // Helper to convert the date strings to Date objects
  function parseDate(dateStr) {
    var parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]); // (year, monthIndex, day)
  }

  var startDate = parseDate(startDateStr);
  var endDate   = parseDate(endDateStr);

  // Adjust endDate to include the entire end day
  endDate.setDate(endDate.getDate() + 1);

  var totalSum     = 0;
  var totalRentals = 0;
  var totalHours   = 0;
  var individualSums = [];

  calendarIds.forEach(function(calendarId, index) {
    var sum         = 0;
    var count       = 0;
    var rentalHours = 0;

    // Track earliest and latest event date for each calendar
    var earliestEventDate = null;
    var latestEventDate   = null;

    var events = CalendarApp
      .getCalendarById(calendarId)
      .getEvents(startDate, endDate);

    Logger.log("Calendar: " + calendarNames[index] + ", Events found: " + events.length);

    for (var i = 0; i < events.length; i++) {
      var description = events[i].getDescription() || "";
      var matches = description.match(/Prezzo:\s*CHF\s*(\d+(?:\.\d+)?)/);

      if (matches) {
        var eventPrice = parseFloat(matches[1]);

        // Get event start and end times
        var eventStart = events[i].getStartTime();
        var eventEnd   = events[i].getEndTime();

        // Calculate overlap between the event and the specified date range
        var overlapStart = new Date(Math.max(eventStart.getTime(), startDate.getTime()));
        var overlapEnd   = new Date(Math.min(eventEnd.getTime(),   endDate.getTime()));

        // If there is an overlap
        if (overlapStart < overlapEnd) {
          // Total event duration in milliseconds
          var eventDurationMs   = eventEnd - eventStart;
          // Overlapping duration in milliseconds
          var overlapDurationMs = overlapEnd - overlapStart;
          // Fraction of event that overlaps our date range
          var overlapFraction   = overlapDurationMs / eventDurationMs;

          // Adjust price based on the overlapping fraction
          var adjustedPrice = eventPrice * overlapFraction;
          sum += adjustedPrice;

          // Calculate rental duration in hours for the overlapping period
          var durationHours = overlapDurationMs / (1000 * 60 * 60); // convert ms to hours
          rentalHours += durationHours;

          // Update earliest and latest event date
          // (Use the actual event start/end, or overlapStart/overlapEnd as you prefer.)
          if (!earliestEventDate || eventStart < earliestEventDate) {
            earliestEventDate = eventStart;
          }
          if (!latestEventDate || eventEnd > latestEventDate) {
            latestEventDate = eventEnd;
          }

          // Count the event if any part overlaps
          count++;
        }
      } else {
        Logger.log("Event description does not match the expected pattern: " + description);
      }
    }

    // Store all info for this calendar
    individualSums.push({
      name: calendarNames[index],
      sum: sum,
      count: count,
      hours: rentalHours,
      earliestEventDate: earliestEventDate,
      latestEventDate:   latestEventDate
    });

    totalSum     += sum;
    totalRentals += count;
    totalHours   += rentalHours;
  });

  // Output individual totals and rental counts
  individualSums.forEach(function(entry) {
    Logger.log(
      entry.name +
      " total CHF collected: " + entry.sum.toFixed(2) +
      ", rented " + entry.count + " times, total hours rented: " + entry.hours.toFixed(2) +
      ", earliest event date: " + (entry.earliestEventDate ? entry.earliestEventDate.toLocaleString() : "N/A") +
      ", latest event date: "   + (entry.latestEventDate   ? entry.latestEventDate.toLocaleString()   : "N/A")
    );
  });

  // Output the total sum and total rentals of all calendars
  Logger.log("Total CHF collected from all calendars: " + totalSum.toFixed(2));
  Logger.log("Total rentals from all calendars: " + totalRentals);
  Logger.log("Total hours rented from all calendars: " + totalHours.toFixed(2));
}
