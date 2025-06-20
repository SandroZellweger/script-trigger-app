/*************************************************************
 * Main function: generateDailyKmReportAndSendEmail_newFile
 *************************************************************/
function generateDailyKmReportAndSendEmail_newFile(customRunTime) {
  try {
    Logger.log("=== Start: generateDailyKmReportAndSendEmail_newFile ===");

    var runTime = (arguments.length > 0 && arguments[0] instanceof Date) ? arguments[0] : new Date();

    
    // 1) Load vehicle configs (replace with your real code)
    Logger.log("Loading vehicle configs...");
    loadVehicleConfigs(); 
    Logger.log("Vehicle configs loaded.");
    
    // 2) Open the dedicated "reports" spreadsheet
    var reportsFileId = "1lbqyJcslH2-ynAnQjhTj3SR1bYyuYK7CyIS6vaoUfsM";
    Logger.log("Opening reports spreadsheet with ID: " + reportsFileId);
    var ss = SpreadsheetApp.openById(reportsFileId);
    
    // 3) Create a new sheet named "Daily Report - YYYY-MM-DD"
    var todayStr = Utilities.formatDate(runTime, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var baseSheetName = "Daily Report - " + todayStr;
    var finalSheetName = findUniqueSheetName(ss, baseSheetName);
    
    var reportSheet = ss.insertSheet(finalSheetName);
    Logger.log("Created new sheet: " + finalSheetName);
    reportSheet.clearContents();
    reportSheet.clearFormats();
    
   
    // 5) Set up the header row (9 columns) for the overall daily report:
    // A: Vehicle Type, B: Date/Time Range, C: Customer Name, D: Reference #, 
    // E: Prezzo (CHF), F: Distance (km), G: CHF/km, H: Event Over?, I: Notes
    reportSheet.getRange("A1")
               .setValue(finalSheetName)
               .setFontWeight("bold")
               .setFontSize(14);
    var headers = [
      "Vehicle Type",
      "Date/Time Range",
      "Customer Name",
      "Reference #",
      "Prezzo (CHF)",
      "Distance (km)",
      "CHF/km",
      "Event Over?",
      "Notes"
    ];
    reportSheet.getRange(3, 1, 1, headers.length)
               .setValues([headers])
               .setFontWeight("bold");
    var currentRow = 4;
    reportSheet.setColumnWidth(1, 250);
    reportSheet.setColumnWidth(2, 220);
    
    // 6) Initialize totals and boundaries for the daily report.
    var totalPrezzo = 0;
    var totalDistance = 0;
    var totalDeposit = 0;
    var totalDepositEvents = 0;
    var startOfDay = new Date(runTime);
    startOfDay.setHours(0, 0, 0, 0);
    var endOfDay = new Date(runTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    // For daily rows of multi-day events, effective end is runTime ("now").
    var globalEarliestEventStart = null;
    
    // Object to store multi-day event summary info (keyed by event id)
    var multiDaySummary = {};
    
    // Array to store per-vehicle summary data for the Month To Date Report.
    var vehicleLogEntries = [];
    
    // 7) Loop over vehicles, fetch events, and build daily rows.
    for (var vehicleName in vehicleConfigs) {
      if (!vehicleConfigs.hasOwnProperty(vehicleName)) continue;
      var cfg = vehicleConfigs[vehicleName];
      if (!cfg.calendarId || !cfg.logifleetId) {
        Logger.log("Skipping '%s' -> missing calendarId or logifleetId", vehicleName);
        continue;
      }
      var calendarId = cfg.calendarId;
      var logifleetId = cfg.logifleetId;
      var calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) {
        Logger.log("Could not find calendar: %s", calendarId);
        continue;
      }
      var events = calendar.getEvents(startOfDay, endOfDay);
      Logger.log("Vehicle '%s': found %d events.", vehicleName, events.length);
      
      var vehicleLastLongDistance = null;
      
      events.forEach(function(ev) {
        var parsed = parseEventData(ev);
        var isEventOver = (runTime >= ev.getEndTime());
        var eventStart = ev.getStartTime();
        var eventEnd = ev.getEndTime();
        
        if (!globalEarliestEventStart || eventStart.getTime() < globalEarliestEventStart.getTime()) {
          globalEarliestEventStart = eventStart;
        }
        
        // Display range format for event start and end.
        var displayFormat = "dd.MM HH:mm";
        var displayRange = Utilities.formatDate(eventStart, Session.getScriptTimeZone(), displayFormat) +
                           " - " +
                           Utilities.formatDate(eventEnd, Session.getScriptTimeZone(), displayFormat);
        
        // Determine if event spans multiple days.
        var eventStartDay = new Date(eventStart);
        eventStartDay.setHours(0, 0, 0, 0);
        var eventEndDay = new Date(eventEnd);
        eventEndDay.setHours(0, 0, 0, 0);
        var isMultiDay = (eventStartDay.getTime() !== eventEndDay.getTime());
        
        var effectiveStart, effectiveEnd;
        var distanceKm = 0;
        var chfPerKm = 0;
        
        if (isMultiDay) {
          if (startOfDay.getTime() === eventStartDay.getTime()) {
            effectiveStart = new Date(eventStart.getTime() - 60 * 60 * 1000);
          } else {
            effectiveStart = new Date(startOfDay);
            effectiveStart.setMinutes(1); // set to 00:01 instead of 00:00.
          }
          effectiveEnd = runTime;
          var distanceStr = getVehicleDistance(logifleetId, effectiveStart.toISOString(), effectiveEnd.toISOString());
          var distMatch = (typeof distanceStr === 'string') ? distanceStr.match(/\d+/) : null;
          distanceKm = distMatch ? parseInt(distMatch[0], 10) : 0;
          
          // For multi-day summary, if not already stored, request summary data.
          var eventId = ev.getId();
          if (!multiDaySummary[eventId]) {
            var summaryStart = new Date(eventStart);
            summaryStart.setHours(0, 0, 0, 0);
            var summaryEnd = new Date(eventEnd);
            summaryEnd.setHours(23, 59, 59, 999);
            var summaryDistanceKm = getVehicleDistanceSummary(logifleetId, summaryStart.toISOString(), summaryEnd.toISOString());
            var summaryCHFkm = 0;
            if (summaryDistanceKm > 0 && parsed.prezzo > 0) {
              summaryCHFkm = parseFloat((parsed.prezzo / summaryDistanceKm).toFixed(2));
            }
            multiDaySummary[eventId] = {
              title: ev.getTitle(),
              prezzo: parsed.prezzo,
              summaryDistance: summaryDistanceKm,
              summaryCHFkm: summaryCHFkm,
              displayRange: displayRange
            };
          }
        } else {
          effectiveStart = new Date(eventStart.getTime() - 60 * 60 * 1000);
          effectiveEnd = new Date(eventEnd.getTime() + 60 * 60 * 1000);
          var distanceStr = getVehicleDistance(logifleetId, effectiveStart.toISOString(), effectiveEnd.toISOString());
          var distMatch = (typeof distanceStr === 'string') ? distanceStr.match(/\d+/) : null;
          distanceKm = distMatch ? parseInt(distMatch[0], 10) : 0;
        }
        
        if (distanceKm > 0 && parsed.prezzo > 0) {
          chfPerKm = parseFloat((parsed.prezzo / distanceKm).toFixed(2));
        }
        totalPrezzo += parsed.prezzo;
        totalDistance += distanceKm;
        
        var note = "";
        if (isMultiDay) {
          note = "Spans " + Utilities.formatDate(eventStart, Session.getScriptTimeZone(), "yyyy-MM-dd") +
                 " to " + Utilities.formatDate(eventEnd, Session.getScriptTimeZone(), "yyyy-MM-dd");
        }
        if (!isEventOver && note === "") {
          note = "Event not over";
        }
        
        // Check for trasferta info in event description.
        var trasfertaMatch = ev.getDescription().match(/Trasferta:\s*(.*)/i);
        if (trasfertaMatch) {
          var destination = trasfertaMatch[1].trim();
          if (!isShortDistance(destination)) {
            if (!vehicleLastLongDistance || eventStart.getTime() > vehicleLastLongDistance.date.getTime()) {
              vehicleLastLongDistance = { destination: destination, date: eventStart };
            }
          }
        }
        
        // Build and write the daily row.
        var rowValues = [
          vehicleName,
          displayRange,
          parsed.name,
          parsed.referenceNumber,
          parsed.prezzo,
          distanceKm,
          chfPerKm,
          (isEventOver ? "Yes" : "No"),
          note
        ];
        reportSheet.getRange(currentRow, 1, 1, rowValues.length).setValues([rowValues]);
        reportSheet.getRange(currentRow, 1, 1, rowValues.length)
                   .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
        if (!isEventOver) {
          reportSheet.getRange(currentRow, 9).setFontColor("red");
        }
        currentRow++;
      });
      
      // Store per-vehicle summary data for MTD Report.
      vehicleLogEntries.push({
        name: vehicleName,
        calendarId: calendarId,
        total: totalPrezzo,
        km: totalDistance,
        lastLongDistance: vehicleLastLongDistance
      });
    }
    
    // 8) Update the report title if any event spans multiple days.
    if (globalEarliestEventStart) {
      var earliestStr = Utilities.formatDate(globalEarliestEventStart, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var newTitle = "Daily Report - " + earliestStr + " / " + todayStr;
      reportSheet.getRange("A1").setValue(newTitle);
    }
    
    // 9) Append a TOTAL row for all events.
    var overallChfPerKm = 0;
    if (totalDistance > 0 && totalPrezzo > 0) {
      overallChfPerKm = parseFloat((totalPrezzo / totalDistance).toFixed(2));
    }
    var totalRowValues = [
      "TOTAL", "", "", "", totalPrezzo, totalDistance, overallChfPerKm, "", ""
    ];
    reportSheet.getRange(currentRow, 1, 1, totalRowValues.length)
               .setValues([totalRowValues])
               .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
    // 10) Append Multi-day events summary section (if any).
    if (Object.keys(multiDaySummary).length > 0) {
      var summaryHeaderRange = reportSheet.getRange(currentRow, 1, 1, 9);
      summaryHeaderRange.merge();
      summaryHeaderRange.setValue("Multiple Days Event");
      summaryHeaderRange.setFontWeight("bold");
      summaryHeaderRange.setBackground("#cccccc");
      currentRow++;
      
      for (var eventId in multiDaySummary) {
        if (multiDaySummary.hasOwnProperty(eventId)) {
          var summary = multiDaySummary[eventId];
          var summaryRow = [
            summary.title,
            summary.displayRange,
            "", "",  // leaving columns C and D blank
            summary.prezzo,
            summary.summaryDistance,
            summary.summaryCHFkm,
            "",
            "Multiple Days Summary"
          ];
          reportSheet.getRange(currentRow, 1, 1, summaryRow.length)
                     .setValues([summaryRow])
                     .setFontStyle("italic");
          currentRow++;
        }
      }
    }
    
    // 11) Append a Month To Date (MTD) Report section.
    // Define MTD period: from the beginning of the month until runTime.
    var monthStart = new Date(runTime.getFullYear(), runTime.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    var monthStartStr = Utilities.formatDate(monthStart, Session.getScriptTimeZone(), "dd.MM");
    var runTimeDisplay = Utilities.formatDate(runTime, Session.getScriptTimeZone(), "dd.MM HH:mm");
    var mtdDisplay = monthStartStr + " - " + runTimeDisplay;
    
    // Insert a merged header row for the MTD Report.
    var mtdMergedHeader = reportSheet.getRange(currentRow, 1, 1, 9);
    mtdMergedHeader.merge();
    mtdMergedHeader.setValue("Month To Date Report");
    mtdMergedHeader.setFontWeight("bold");
    mtdMergedHeader.setBackground("#dddddd");
    currentRow++;
    
    // Insert a header row for the MTD section with 8 columns:
    // A: Vehicle Type, B: Period, C: Last Long-Distance, D: (empty), E: Prezzo (CHF),
    // F: Distance (km), G: CHF/km, H: Km Next Service.
    var mtdHeaders = ["Vehicle Type", "Period", "Last Long-Distance", "", "Prezzo (CHF)", "Distance (km)", "CHF/km", "Km Next Service"];
    var mtdHeaderRange = reportSheet.getRange(currentRow, 1, 1, mtdHeaders.length);
    mtdHeaderRange.setValues([mtdHeaders]);
    mtdHeaderRange.setFontWeight("bold");
    mtdHeaderRange.setBackground("#eeeeee");
    reportSheet.setColumnWidth(2, 150); // Make Column B a bit smaller.
    currentRow++;
    
    // Initialize MTD totals.
    var mtdTotalPrezzo = 0;
    var mtdTotalDistance = 0;
    
    // Loop over each vehicle in vehicleConfigs to compute MTD totals (from monthStart to runTime).
    // For the "Last Long-Distance" field, use the last 90 days.
    var last90Start = new Date(runTime.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    for (var veh in vehicleConfigs) {
      if (!vehicleConfigs.hasOwnProperty(veh)) continue;
      var cfg = vehicleConfigs[veh];
      if (!cfg.calendarId || !cfg.logifleetId) continue;
      var calendar = CalendarApp.getCalendarById(cfg.calendarId);
      if (!calendar) continue;
      
      // Get events for this vehicle from monthStart to runTime.
      var mtdEvents = calendar.getEvents(monthStart, runTime);
      var vehiclePriceSum = 0;
      for (var i = 0; i < mtdEvents.length; i++) {
        var ev = mtdEvents[i];
        var parsed = parseEventData(ev);
        var evStart = ev.getStartTime();
        var evEnd = ev.getEndTime();
        
        // Determine overlap between event and MTD period.
        var overlapStart = new Date(Math.max(evStart.getTime(), monthStart.getTime()));
        var overlapEnd = new Date(Math.min(evEnd.getTime(), runTime.getTime()));
        if (overlapStart < overlapEnd) {
          var overlapFraction = (overlapEnd - overlapStart) / (evEnd - evStart);
          vehiclePriceSum += parsed.prezzo * overlapFraction;
        }
      }
      
      // Get km for the vehicle from monthStart to runTime via API.
      var vehicleDistance = getVehicleDistanceSummary(cfg.logifleetId, monthStart.toISOString(), runTime.toISOString());
      var vehicleCHFPerKm = 0;
      if (vehicleDistance > 0 && vehiclePriceSum > 0) {
        vehicleCHFPerKm = parseFloat((vehiclePriceSum / vehicleDistance).toFixed(2));
      }
      
      // Lookup "Km Next Service" based on the vehicle name.
      var kmNextService = getKmNextService(cfg.vehicleType);
      
      // Get last long-distance trasferta for this vehicle's calendar in the last 90 days.
      var lastLong = getLastLongDistanceForCalendar(cfg.calendarId, last90Start, runTime);
      var longDistanceText = "None";
      if (lastLong) {
        longDistanceText = lastLong.destination + " (" + Utilities.formatDate(lastLong.date, Session.getScriptTimeZone(), "dd.MM.yyyy") + ")";
      }
      
      // Build the MTD row.
      // Columns: A: Vehicle Type, B: Period, C: Last Long-Distance, D: (empty),
      // E: Prezzo (CHF), F: Distance (km), G: CHF/km, H: Km Next Service.
      var mtdRow = [
        cfg.vehicleType,
        mtdDisplay,
        longDistanceText,
        "",
        parseFloat(vehiclePriceSum.toFixed(2)),
        vehicleDistance,
        vehicleDistance > 0 ? (vehiclePriceSum / vehicleDistance).toFixed(2) : "0.00",
        kmNextService ? kmNextService.toString() : "None"
      ];
      var mtdRange = reportSheet.getRange(currentRow, 1, 1, mtdRow.length);
      mtdRange.setValues([mtdRow]);
      mtdRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
      currentRow++;
      
      mtdTotalPrezzo += vehiclePriceSum;
      mtdTotalDistance += vehicleDistance;
    }
    
    // Add an MTD summary row (summing prezzo and distance, and average CHF/km).
    var mtdOverallCHFkm = 0;
    if (mtdTotalDistance > 0) {
      mtdOverallCHFkm = parseFloat((mtdTotalPrezzo / mtdTotalDistance).toFixed(2));
    }
    // Shift the summary row one column to the right by inserting an empty element at the beginning.
    var mtdSummaryRow = ["", "MTD TOTAL", "", "", parseFloat(mtdTotalPrezzo.toFixed(2)), mtdTotalDistance, mtdOverallCHFkm, ""];
    var mtdSummaryRange = reportSheet.getRange(currentRow, 1, 1, mtdSummaryRow.length);
    mtdSummaryRange.setValues([mtdSummaryRow]);
    mtdSummaryRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
    // 12) Append a Monthly Revenue Total section.
    // For the full month, use the period from the 1st to the last day of the current month.
    var fullMonthStart = new Date(runTime.getFullYear(), runTime.getMonth(), 1);
    fullMonthStart.setHours(0, 0, 0, 0);
    var fullMonthEnd = new Date(runTime.getFullYear(), runTime.getMonth() + 1, 0);
    fullMonthEnd.setHours(23, 59, 59, 999);
    var monthlyData = getMonthlyTotals(fullMonthStart, fullMonthEnd);
    
    var monthlyHeader = reportSheet.getRange(currentRow, 1, 1, 9);
    monthlyHeader.merge();
    monthlyHeader.setValue("Monthly Revenue Total");
    monthlyHeader.setFontWeight("bold");
    monthlyHeader.setBackground("#cccccc");
    currentRow++;
    
    var monthlyRevenueRow = [
      "", "", "", "",
      parseFloat(monthlyData.totalSum.toFixed(2)),
      "", "", "",
      ""
    ];
    var monthlyRevenueRange = reportSheet.getRange(currentRow, 1, 1, monthlyRevenueRow.length);
    monthlyRevenueRange.setValues([monthlyRevenueRow]);
    monthlyRevenueRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
// — 13) Recupera e calcola Stripe balances —
var stripe = getStripeBalance();
var availableAmount = 0, pendingAmount = 0;
if (Array.isArray(stripe.available)) stripe.available.forEach(b => availableAmount += Number(b.amount));
if (Array.isArray(stripe.pending))  stripe.pending.forEach(b => pendingAmount  += Number(b.amount));
availableAmount /= 100;
pendingAmount   /= 100;
var totalStripe = availableAmount + pendingAmount;

// — 14) Append a Stripe Balance section —
reportSheet.getRange(currentRow, 1, 1, 9)
  .merge()
  .setValue("Balance Stripe")
  .setFontWeight("bold")
  .setBackground("#dddddd");
currentRow++;

reportSheet.getRange(currentRow, 1, 1, 9)
  .setValues([["Available", "", "", "", availableAmount.toFixed(2), "", "", "", ""]])
  .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
currentRow++;

reportSheet.getRange(currentRow, 1, 1, 9)
  .setValues([["Available Soon", "", "", "", pendingAmount.toFixed(2), "", "", "", ""]])
  .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
currentRow++;

reportSheet.getRange(currentRow, 1, 1, 9)
  .setValues([["Total", "", "", "", totalStripe.toFixed(2), "", "", "", ""]])
  .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
currentRow++;

// — 15) Calcola Deposito Refund per eventi selezionati —
var pastStart = new Date(runTime.getTime() - 10 * 24*60*60*1000);
var futureEnd = new Date(runTime);
futureEnd.setMonth(futureEnd.getMonth() + 3);

for (var vehicleName in vehicleConfigs) {
  if (!vehicleConfigs.hasOwnProperty(vehicleName)) continue;
  var cfg = vehicleConfigs[vehicleName];
  if (!cfg.calendarId) continue;
  var calendar = CalendarApp.getCalendarById(cfg.calendarId);
  if (!calendar) continue;

  // Passati (–10gg) senza “+”
  var pastEvents = calendar.getEvents(pastStart, runTime);
  pastEvents.forEach(function(ev) {
    if (ev.getTitle().indexOf('+') === -1) {
      var desc = ev.getDescription() || "";
      var m = desc.match(/Deposit Refund:\s*CHF\s*([\d.,]+)/i);
      if (m) {
        totalDeposit += parseFloat(m[1].replace(",", "."));
        totalDepositEvents++;
      }
    }
  });

  // Futuri (+3 mesi) con “$”
  var futureEvents = calendar.getEvents(runTime, futureEnd);
  futureEvents.forEach(function(ev) {
    if (ev.getTitle().indexOf('$') !== -1) {
      var desc = ev.getDescription() || "";
      var m = desc.match(/Deposit Refund:\s*CHF\s*([\d.,]+)/i);
      if (m) {
        totalDeposit += parseFloat(m[1].replace(",", "."));
        totalDepositEvents++;
      }
    }
  });
}

// — 16) Append “Deposito da ritornare” —
reportSheet.getRange(currentRow, 1, 1, 9)
  .merge()
  .setValue("Deposito da ritornare")
  .setFontWeight("bold")
  .setBackground("#dddddd");
currentRow++;

reportSheet.getRange(currentRow, 1, 1, 9)
  .setValues([["", "", "", "", totalDeposit.toFixed(2), "", "", "", ""]])
  .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
currentRow++;

// — 17) Append “Total deposit events” —
reportSheet.getRange(currentRow, 1, 1, 9)
  .merge()
  .setValue("Total deposit events")
  .setFontWeight("bold");
currentRow++;

reportSheet.getRange(currentRow, 1, 1, 9)
  .setValues([["", "", "", "", totalDepositEvents, "", "", "", ""]])
  .setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
currentRow++;



     // 17) Export columns A–I (to include logo) as PDF and send via email.
    var lastRow = reportSheet.getLastRow();
    var lastCol = Math.max(reportSheet.getLastColumn(), 9);
    var rangeA1 = "'" + reportSheet.getName() + "'!A1:" + columnNumberToLetter(lastCol) + lastRow;
    Logger.log("Exporting range: " + rangeA1);
    
    var emailRecipient = "someone@example.com"; // Set your recipient here
    var subject = reportSheet.getRange("A1").getValue();
    var body = "Ciao,\n\nHere is your daily report for " + todayStr + ".\n\nSaluti,\nTeam";
    sendSheetAsPDF_range(ss, reportSheet, rangeA1, emailRecipient, subject, body, finalSheetName);
    Logger.log("PDF sent to " + emailRecipient);
    Logger.log("=== End: generateDailyKmReportAndSendEmail_newFile ===");
    
  } catch (err) {
    Logger.log("Error in generateDailyKmReportAndSendEmail_newFile: " + err);
  }
}

/*************************************************************
 * getMonthlyTotals - helper for full-month revenue
 *************************************************************/
function getMonthlyTotals(monthStart, monthEnd) {
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
  
  var totalSum = 0;
  var totalRentals = 0;
  var totalHours = 0;
  
  for (var i = 0; i < calendarIds.length; i++) {
    var calId = calendarIds[i];
    var cal = CalendarApp.getCalendarById(calId);
    if (!cal) continue;
    var events = cal.getEvents(monthStart, monthEnd);
    var sum = 0;
    var count = 0;
    var rentalHours = 0;
    
    for (var j = 0; j < events.length; j++) {
      var ev = events[j];
      var description = ev.getDescription() || "";
      var matches = description.match(/Prezzo:\s*CHF\s*(\d+(?:\.\d+)?)/);
      if (matches) {
        var eventPrice = parseFloat(matches[1]);
        var evStart = ev.getStartTime();
        var evEnd = ev.getEndTime();
        var overlapStart = new Date(Math.max(evStart.getTime(), monthStart.getTime()));
        var overlapEnd = new Date(Math.min(evEnd.getTime(), monthEnd.getTime()));
        if (overlapStart < overlapEnd) {
          var eventDurationMs = evEnd - evStart;
          var overlapDurationMs = overlapEnd - overlapStart;
          var overlapFraction = overlapDurationMs / eventDurationMs;
          var adjustedPrice = eventPrice * overlapFraction;
          sum += adjustedPrice;
          var hours = overlapDurationMs / (1000 * 60 * 60);
          rentalHours += hours;
          count++;
        }
      }
    }
    totalSum += sum;
    totalRentals += count;
    totalHours += rentalHours;
  }
  
  return {
    totalSum: totalSum,
    totalRentals: totalRentals,
    totalHours: totalHours
  };
}

/*************************************************************
 * getVehicleDistanceSummary - helper for distance API
 *************************************************************/
function getVehicleDistanceSummary(vehicleId, startISO, endISO) {
  var token = authenticateAndGetToken();
  if (!token) {
    Logger.log("No token available for summary request.");
    return 0;
  }
  
  var url = "https://logifleet360.ch/lfr3/eg-services/api/v2/reports/distance";
  var payload = {
    vehiclesIds: [vehicleId],
    startDate: startISO,
    endDate: endISO
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    }
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    Logger.log("Summary response: " + responseText);
    var json = JSON.parse(responseText);
    var sum = 0;
    if (Array.isArray(json)) {
      for (var i = 0; i < json.length; i++) {
        if (json[i].tripDistanceOnDistanceUnit) {
          sum += Number(json[i].tripDistanceOnDistanceUnit);
        }
      }
    }
    return sum;
  } catch (e) {
    Logger.log("Error in getVehicleDistanceSummary: " + e);
    return 0;
  }
}

/*************************************************************
 * getKmNextService - lookup based on vehicle name
 *************************************************************/
function getKmNextService(vehicleName) {
  try {
    var fileId = "1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E";
    var ss = SpreadsheetApp.openById(fileId);
    var sheet = ss.getSheets()[0]; // assume first sheet
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString().toLowerCase() === vehicleName.toLowerCase()) {
        return data[i][12];
      }
    }
    return "";
  } catch (e) {
    Logger.log("Error in getKmNextService: " + e);
    return "";
  }
}

/*************************************************************
 * insertLogo - inserts image in cell D1
 *************************************************************/
function insertLogo(sheet) {
  var fileId = "1fVr7cR1Z9KD__A-ax0io9kWy4NWK0KkP"; 
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  var image = sheet.insertImage(blob, 7, 1);
  image.setWidth(300);
  image.setHeight(112);
}

/*************************************************************
 * findUniqueSheetName - returns a unique sheet name
 *************************************************************/
function findUniqueSheetName(ss, baseSheetName) {
  var candidateName = baseSheetName;
  var suffix = 1;
  while (ss.getSheetByName(candidateName)) {
    suffix++;
    candidateName = baseSheetName + "/" + suffix;
  }
  return candidateName;
}

/*************************************************************
 * parseEventData - extracts price and reference number
 *************************************************************/
function parseEventData(event) {
  if (!event) {
    return { name: "", prezzo: 0, referenceNumber: "" };
  }
  var title = event.getTitle() || "";
  var desc  = event.getDescription() || "";
  var titleParts = title.split("-");
  var name = (titleParts.length >= 3) ? titleParts[1].trim() : "";
  var prezzo = 0;
  var prezzoRegex = /Prezzo:\s*CHF\s*([\d.,]+)/i;
  var prezzoMatch = desc.match(prezzoRegex);
  if (prezzoMatch) {
    prezzo = parseFloat(prezzoMatch[1].replace(",", ".")) || 0;
  }
  var referenceNumber = "";
  var rifRegex = /Numero di riferimento:\s*(\d+)/i;
  var rifMatch = desc.match(rifRegex);
  if (rifMatch) {
    referenceNumber = rifMatch[1].trim();
  }
  return { name: name, prezzo: prezzo, referenceNumber: referenceNumber };
}

/*************************************************************
 * columnNumberToLetter - converts column number to letter
 *************************************************************/
function columnNumberToLetter(col) {
  var temp, letter = "";
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

/*************************************************************
 * sendSheetAsPDF_range - exports sheet as PDF and emails it
 *************************************************************/
function sendSheetAsPDF_range(ss, sheet, rangeA1, email, subject, body, pdfFileName) {
  var ssId = ss.getId();
  var gid  = sheet.getSheetId();

  var url = "https://docs.google.com/spreadsheets/d/" + ssId +
            "/export?exportFormat=pdf&format=pdf" +
            "&gid=" + gid +
            "&range=" + encodeURIComponent(rangeA1) +
            "&size=A3" +
            "&portrait=false" +       // landscape
            "&fitw=true" +            // fit to width
            "&scale=4" +           // scale factor
            "&sheetnames=false" +
            "&printtitle=false" +
            "&pagenum=UNDEFINED" +
            "&gridlines=false" +
            "&fzr=false";

  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  var pdfBlob = response.getBlob().setName(pdfFileName + ".pdf");
  MailApp.sendEmail({
    to: 'noleggiosemplice23@gmail.com',
    subject: subject,
    body: body,
    attachments: [pdfBlob]
  });
}

/*************************************************************
 * getStripeBalance - retrieves Stripe balance
 *************************************************************/
function getStripeBalance() {
  var url = "https://api.stripe.com/v1/balance";
  var apiKey = "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";
  var options = {
    "method": "get",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "muteHttpExceptions": true
  };
  var response = UrlFetchApp.fetch(url, options);
  var jsonResponse = JSON.parse(response.getContentText());
  Logger.log("Available balance: " + JSON.stringify(jsonResponse.available, null, 2));
  Logger.log("Pending balance: " + JSON.stringify(jsonResponse.pending, null, 2));
  return jsonResponse;
}

/*************************************************************
 * getLastLongDistanceForCalendar - gets last long-distance trasferta
 *************************************************************/
function getLastLongDistanceForCalendar(calendarId, startDate, endDate) {
  var calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) return null;
  var events = calendar.getEvents(startDate, endDate);
  var lastTrasferta = null;
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var description = ev.getDescription() || "";
    var match = description.match(/Trasferta:\s*(.*)/i);
    if (match) {
      var destination = match[1].trim();
      if (!isShortDistance(destination)) {
        var evStart = ev.getStartTime();
        if (!lastTrasferta || evStart.getTime() > lastTrasferta.date.getTime()) {
          lastTrasferta = { destination: destination, date: evStart };
        }
      }
    }
  }
  return lastTrasferta;
}

/*************************************************************
 * isShortDistance - returns true if destination is considered short-distance.
 *************************************************************/
function isShortDistance(destination) {
  var lowerDest = destination.toLowerCase();
  if (lowerDest.indexOf("como") !== -1 ||
      lowerDest.indexOf("milano") !== -1 ||
      lowerDest.indexOf("varese") !== -1 ||
      lowerDest.indexOf("verbania") !== -1 ||
      lowerDest.indexOf("ticino") !== -1) {
    return true;
  }
  return false;
}





function runReportForDateHardcoded() {
  // Set the specific missed date/time here
  var customDate = new Date('2025-05-25T20:30:00'); 
  generateDailyKmReportAndSendEmail_newFile(customDate);
}
