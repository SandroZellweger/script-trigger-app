// Authenticate and get the JWT token
function authenticateAndGetToken() {
  const apiUrl = "https://logifleet360.ch/lfr3/eg-services/authenticate";
  const payload = {
    username: "admin@noleggio-semplice.com", // Replace with your username
    password: "Tothemoon2023!"              // Replace with your password
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    });

    const data = JSON.parse(response.getContentText());
    const jwt = data.jwt; // Extract the JWT token

    if (!jwt) {
      throw new Error("Authentication failed. No token received.");
    }

    Logger.log(`JWT Token: ${jwt}`);
    return jwt;
  } catch (error) {
    Logger.log(`Error during authentication: ${error.message}`);
    return null;
  }
}

// Fetch vehicle distance for a specific timeframe
function getVehicleDistance(vehicleId, startDate, endDate) {
  const apiBaseUrl = "https://logifleet360.ch/lfr3/eg-services/api/v2/reports/distance";
  const token = authenticateAndGetToken();

  if (!token) {
    Logger.log("Authentication failed. Cannot fetch kilometers.");
    return "Authentication failed.";
  }

  try {
    const payload = {
      vehiclesIds: [vehicleId],
      startDate: startDate,
      endDate: endDate
    };

    const response = UrlFetchApp.fetch(apiBaseUrl, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    });

    const data = JSON.parse(response.getContentText());
    Logger.log(data); // Log the full response for debugging

    const vehicleData = data.find(item => item.vehicleId === vehicleId);
    if (vehicleData) {
      const distance = vehicleData.tripDistanceOnDistanceUnit || 0;
      Logger.log(`Vehicle ID: ${vehicleId}, Distance: ${distance} km`);
      return `${distance} km`;
    } else {
      Logger.log(`No data found for Vehicle ID: ${vehicleId}`);
      return "No data found.";
    }
  } catch (error) {
    Logger.log(`Error fetching distance for Vehicle ID ${vehicleId}: ${error.message}`);
    return `Failed to fetch distance: ${error.message}`;
  }
}

function checkAndUpdateEventDistances() {
  const calendarId = "6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com"; // Replace with your Calendar ID
  const vehicleId = "5f6e8d94-7c3b-4dff-bfbe-d42a500eb77f"; // Replace with your vehicle ID
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  const now = new Date();

  try {
    // Fetch events for today using CalendarApp
    const calendar = CalendarApp.getCalendarById(calendarId);
    const events = calendar.getEvents(new Date(startOfDay), new Date(endOfDay));

    events.forEach(event => {
      const description = event.getDescription();
      if (description && description.includes("Trasferta") && !description.includes("Km trascorsi")) {
        const startTime = event.getStartTime();
        const endTime = event.getEndTime();
        const triggerTime = new Date(endTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour after the event ends

        if (now >= triggerTime) {
          // Adjust start and end times for 1 hour before and after the event
          const adjustedStartTime = new Date(startTime.getTime() - 1 * 60 * 60 * 1000).toISOString();
          const adjustedEndTime = new Date(endTime.getTime() + 1 * 60 * 60 * 1000).toISOString();

          // Fetch distance for the event
          const distanceResult = getVehicleDistance(vehicleId, adjustedStartTime, adjustedEndTime);

          // Update the event description
          let updatedDescription = description;
          const distanceMatch = distanceResult.match(/\d+/g); // Extract distance in km from the result

          if (distanceMatch) {
            updatedDescription = updatedDescription.replace(
              /(Trasferta:.*?)(\n|$)/,
              `$1\nKm trascorsi: ${distanceMatch[0]} km\n`
            );
          }

          // Update the event description
          event.setDescription(updatedDescription);

          Logger.log(`Updated event "${event.getTitle()}" with distance: ${distanceResult}`);
        }
      } else if (description && description.includes("Km trascorsi")) {
        Logger.log(`Event "${event.getTitle()}" already has distance logged.`);
      }
    });
  } catch (error) {
    Logger.log(`Error updating events: ${error.message}`);
  }
}

function checkAndUpdateEventDistancesForSpecificDate() {
  const calendarId = "6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com"; // Replace with your Calendar ID
  const vehicleId = "5f6e8d94-7c3b-4dff-bfbe-d42a500eb77f"; // Replace with your vehicle ID
  const specificDate = new Date("2025-01-11"); // Set to 26th December 2024
  const startOfDay = new Date(specificDate.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(specificDate.setHours(23, 59, 59, 999)).toISOString();
  const now = new Date();

  try {
    // Fetch events for the specific date using CalendarApp
    const calendar = CalendarApp.getCalendarById(calendarId);
    const events = calendar.getEvents(new Date(startOfDay), new Date(endOfDay));

    events.forEach(event => {
      const description = event.getDescription();
      if (description && description.includes("Trasferta") && !description.includes("Km trascorsi")) {
        const startTime = event.getStartTime();
        const endTime = event.getEndTime();
        const triggerTime = new Date(endTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour after the event ends

        if (now >= triggerTime) {
          // Adjust start and end times for 1 hour before and after the event
          const adjustedStartTime = new Date(startTime.getTime() - 1 * 60 * 60 * 1000).toISOString();
          const adjustedEndTime = new Date(endTime.getTime() + 1 * 60 * 60 * 1000).toISOString();

          // Fetch distance for the event
          const distanceResult = getVehicleDistance(vehicleId, adjustedStartTime, adjustedEndTime);

          // Update the event description
          let updatedDescription = description;
          const distanceMatch = distanceResult.match(/\d+/g); // Extract distance in km from the result

          if (distanceMatch) {
            updatedDescription = updatedDescription.replace(
              /(Trasferta:.*?)(\n|$)/,
              `$1\nKm trascorsi: ${distanceMatch[0]} km\n`
            );
          }

          // Update the event description
          event.setDescription(updatedDescription);

          Logger.log(`Updated event "${event.getTitle()}" with distance: ${distanceResult}`);
        }
      } else if (description && description.includes("Km trascorsi")) {
        Logger.log(`Event "${event.getTitle()}" already has distance logged.`);
      }
    });
  } catch (error) {
    Logger.log(`Error updating events for 26.12.2024: ${error.message}`);
  }
}

function checkAndUpdateEventDistancesForDateRangeVerbose() {
  const calendarId = "noleggiosemplice23@gmail.com"; // Replace with your Calendar ID
  const vehicleId = "96a2e844-f977-4c68-9afe-71acbdfa9595"; // Replace with your Vehicle ID
  
  // Set the date range (example: all of January 2025)
  const startRange = new Date("2025-01-01T00:00:00Z");
  const endRange   = new Date("2025-01-31T23:59:59Z");
  
  // Current time (used to check if event has ended long enough for distance data to be complete)
  const now = new Date();
  
  // Log the initial setup
  Logger.log("=== checkAndUpdateEventDistancesForDateRangeVerbose: Start ===");
  Logger.log(`Using Calendar ID: ${calendarId}`);
  Logger.log(`Vehicle ID: ${vehicleId}`);
  Logger.log(`Start of Range: ${startRange}`);
  Logger.log(`End of Range:   ${endRange}`);
  Logger.log(`Current Time:   ${now}`);
  
  try {
    // Retrieve the calendar and fetch events in the specified range
    const calendar = CalendarApp.getCalendarById(calendarId);
    Logger.log("Fetching events from calendar...");
    const events = calendar.getEvents(startRange, endRange);
    Logger.log(`Total events found in range: ${events.length}`);
    
    // Loop through each event
    events.forEach((event, index) => {
      Logger.log(`\n--- Processing event #${index + 1} ---`);
      
      const title = event.getTitle();
      const description = event.getDescription() || "";
      const startTime = event.getStartTime();
      const endTime = event.getEndTime();
      
      Logger.log(`Event Title:       ${title}`);
      Logger.log(`Event Start Time:  ${startTime}`);
      Logger.log(`Event End Time:    ${endTime}`);
      Logger.log(`Event Description: ${description}`);
      
      // Check if description has 'Trasferta' but no 'Km trascorsi'
      if (description.includes("Trasferta") && !description.includes("Km trascorsi")) {
        Logger.log("-> This event requires distance update (Trasferta found, Km trascorsi missing).");
        
        // Calculate the trigger time (1 hour after the event ends)
        const triggerTime = new Date(endTime.getTime() + 1 * 60 * 60 * 1000);
        Logger.log(`Trigger Time (1hr after event end): ${triggerTime}`);
        
        if (now >= triggerTime) {
          Logger.log("-> Current time is past trigger time, ready to fetch distance.");
          
          // Adjust the start & end times by +/- 1 hour
          const adjustedStartTime = new Date(startTime.getTime() - 1 * 60 * 60 * 1000).toISOString();
          const adjustedEndTime   = new Date(endTime.getTime()   + 1 * 60 * 60 * 1000).toISOString();
          
          Logger.log(`Adjusted Start (1hr before): ${adjustedStartTime}`);
          Logger.log(`Adjusted End   (1hr after):  ${adjustedEndTime}`);
          
          // Fetch distance for the timeframe
          Logger.log("Calling getVehicleDistance...");
          const distanceResult = getVehicleDistance(vehicleId, adjustedStartTime, adjustedEndTime);
          Logger.log(`Distance result returned: ${distanceResult}`);
          
          // If we got a numeric distance, embed it into the event description
          const distanceMatch = distanceResult.match(/\d+/g);
          if (distanceMatch) {
            const distanceValue = distanceMatch[0];
            Logger.log(`Extracted numeric distance: ${distanceValue} km`);
            
            // Insert "Km trascorsi" line into the event description
            let updatedDescription = description.replace(
              /(Trasferta:.*?)(\n|$)/,
              `$1\nKm trascorsi: ${distanceValue} km\n`
            );
            
            Logger.log(`Updated Description:\n${updatedDescription}`);
            
            // Update the event description in the Calendar
            event.setDescription(updatedDescription);
            Logger.log(`-> Event "${title}" updated with distance.`);
          } else {
            Logger.log("-> No numeric distance found in the result. Skipping update.");
          }
          
        } else {
          Logger.log("-> Current time is NOT past trigger time. Distance calculation skipped.");
        }
        
      } else if (description.includes("Km trascorsi")) {
        Logger.log("-> This event already has 'Km trascorsi'. Skipping.");
      } else {
        Logger.log("-> This event is not a 'Trasferta' or doesn't match update criteria. Skipping.");
      }
    });
    
  } catch (error) {
    Logger.log(`Error updating events in range: ${error.message}`);
  }
  
  Logger.log("=== checkAndUpdateEventDistancesForDateRangeVerbose: End ===");
}

// This function leverages the existing authentication method
// (authenticateAndGetToken) to get the JWT token and then performs a
// GET request on the live-tracking endpoint.
// It logs how many assets are found and their respective distances.

function updateLiveTrackingDistancesInSheet() {
  Logger.log("=== Start: updateLiveTrackingDistancesInSheet ===");

  // 1) Authenticate to get JWT Token
  const token = authenticateAndGetToken();
  if (!token) {
    Logger.log("-> Could not obtain JWT token. Aborting.");
    return;
  }

  // 2) Fetch live-tracking data
  const apiUrl = "https://logifleet360.ch/lfr3/eg-services/api/v2/live-tracking";
  let data;
  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    data = JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log("-> Error fetching/parsing live tracking data: " + error);
    return;
  }

  if (!Array.isArray(data)) {
    Logger.log("-> Unexpected response format. Expected an array.");
    Logger.log("Response data:\n" + JSON.stringify(data, null, 2));
    return;
  }

  // 3) Open the target spreadsheet by ID
  const ssId = "1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E"; // Provided spreadsheet ID
  const ss = SpreadsheetApp.openById(ssId);
  // If you have a specific sheet name, use getSheetByName("...").
  // Otherwise, we'll assume the first sheet:
  const sheet = ss.getSheets()[0];

  // 4) Identify the columns for LicencePlate, ActualKm, and LastUpdate.
  //    We assume row 1 has these header names: 'LicencePlate', 'ActualKm', 'LastUpdate'
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  const headerValues = headerRange.getValues()[0];

  const licencePlateColIndex = headerValues.indexOf("LicencePlate") + 1;
  const actualKmColIndex     = headerValues.indexOf("ActualKm") + 1;
  const lastUpdateColIndex   = headerValues.indexOf("LastUpdate") + 1;

  if (licencePlateColIndex < 1 || actualKmColIndex < 1 || lastUpdateColIndex < 1) {
    Logger.log("-> One or more required columns not found (LicencePlate, ActualKm, LastUpdate). Aborting.");
    return;
  }

  // 5) Get all data from the sheet to quickly lookup each row's licencePlate
  //    We'll then update the matching row.
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("-> No data rows to update.");
    return;
  }

  // Read all rows from 2..lastRow
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const sheetValues = dataRange.getValues();

  // We'll map each row's licencePlate -> rowIndex
  // (to avoid scanning every row for each vehicle)
  const licencePlateRowMap = {};
  for (let i = 0; i < sheetValues.length; i++) {
    // 'i' is offset from row 2 in the sheet, so actual row is i + 2
    const rowLicencePlate = sheetValues[i][licencePlateColIndex - 1];
    if (rowLicencePlate) {
      licencePlateRowMap[rowLicencePlate] = i + 2; // store 1-based row index
    }
  }

  // 6) Loop through the live-tracking array and update matching rows.
  let updateCount = 0;
  const now = new Date();

  data.forEach((assetObj) => {
    // E.g. assetObj.asset.licencePlate => 'TI 148877'
    //      assetObj.distance => 178561
    if (!assetObj.asset || !assetObj.asset.licencePlate) {
      return; // no licencePlate to match
    }

    const licencePlate = assetObj.asset.licencePlate;
    const distance = (typeof assetObj.distance === 'number') ? assetObj.distance : 0;

    // Find the row using our map
    const rowIndex = licencePlateRowMap[licencePlate];
    if (rowIndex) {
      // We have a matching row
      sheet.getRange(rowIndex, actualKmColIndex).setValue(distance);
      sheet.getRange(rowIndex, lastUpdateColIndex).setValue(now);
      updateCount++;
      Logger.log(`-> Updated row ${rowIndex} for licencePlate '${licencePlate}' with distance=${distance} and lastUpdate=${now}`);
    } else {
      Logger.log(`-> No matching row found for licencePlate '${licencePlate}'`);
    }
  });

  Logger.log(`-> Completed updating sheet. Rows updated: ${updateCount}`);
  Logger.log("=== End: updateLiveTrackingDistancesInSheet ===");
}


function debugGetMultiDayDistanceWithAuth() {
  // First, authenticate and get the token.
  var token = authenticateAndGetToken();
  if (!token) {
    Logger.log("No token received. Aborting debug call.");
    return;
  }
  
  // Test values – adjust these as needed.
  var testVehicleId = "30cf7787-fedd-4a99-9ec2-f00f9be4665f";
  var testStart = "2025-01-31T00:00:00+02:00";
  var testEnd = "2025-02-09T23:59:59.999+02:00";
  
  Logger.log("=== Debug: Multi-Day Distance Request With Auth ===");
  Logger.log("Vehicle ID: " + testVehicleId);
  Logger.log("Start Date: " + testStart);
  Logger.log("End Date: " + testEnd);
  
  var url = "https://logifleet360.ch/lfr3/eg-services/api/v2/reports/distance";
  var payload = {
    vehiclesIds: [testVehicleId],
    startDate: testStart,
    endDate: testEnd
  };
  
  Logger.log("Request Payload: " + JSON.stringify(payload));
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      "accept": "application/json",
      "Authorization": "Bearer " + token
    }
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log("Response Code: " + responseCode);
    Logger.log("Response Text: " + responseText);
    
    var jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
      Logger.log("Parsed JSON: " + JSON.stringify(jsonResponse));
    } catch (parseError) {
      Logger.log("Error parsing JSON: " + parseError);
      jsonResponse = null;
    }
    
    if (Array.isArray(jsonResponse)) {
      var totalDistance = 0;
      for (var i = 0; i < jsonResponse.length; i++) {
        var trip = jsonResponse[i];
        if (trip.tripDistanceOnDistanceUnit) {
          totalDistance += Number(trip.tripDistanceOnDistanceUnit);
        }
      }
      Logger.log("Total Distance (km): " + totalDistance);
    }
    
  } catch (e) {
    Logger.log("Exception during API call: " + e);
  }
  
  Logger.log("=== End Debug ===");
}




/**
 * Main function: 
 *  1) Loads vehicle configs (from your existing config function),
 *  2) Creates a fresh sheet in the "reports" file (ID = 1lbqyJcslH2-ynAnQjhTj3SR1bYyuYK7CyIS6vaoUfsM),
 *  3) Writes the daily events (with distances, prezzo, etc.) to it,
 *  4) Exports that sheet to PDF and emails it out.
 */

/**
 * Main function to generate a daily KM report in a new sheet,
 * insert a Drive-stored logo in the top-right (D1), resize it,
 * write data rows with black borders, add a TOTAL row,
 * export to PDF, and send via email.
 */
function generateDailyKmReportAndSendEmail_newFile() {
  try {
    Logger.log("=== Start: generateDailyKmReportAndSendEmail_newFile ===");
    
    // 1) Load vehicle configs (replace with your real code)
    loadVehicleConfigs(); 

    // 2) Open the dedicated "reports" spreadsheet
    var reportsFileId = "1lbqyJcslH2-ynAnQjhTj3SR1bYyuYK7CyIS6vaoUfsM";
    var ss = SpreadsheetApp.openById(reportsFileId);
    
    // 3) Create a new sheet named "Daily Report - YYYY-MM-DD"
    var runTime = new Date();  // current time when function is triggered
    var todayStr = Utilities.formatDate(runTime, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var baseSheetName = "Daily Report - " + todayStr;
    var finalSheetName = findUniqueSheetName(ss, baseSheetName);
    
    var reportSheet = ss.insertSheet(finalSheetName);
    Logger.log("Created new sheet: %s", finalSheetName);
    reportSheet.clearContents();
    reportSheet.clearFormats();
    
    // 4) Insert the logo in cell D1
    insertLogo(reportSheet);
    reportSheet.setRowHeight(1, 100);
    
    // 5) Set up the header row (9 columns) for the overall report:
    // A: Vehicle Type, B: Date/Time Range, C: Customer Name, D: Reference #, 
    // E: Prezzo (CHF), F: Distance (km), G: CHF/km, H: Event Over?, I: Notes
    reportSheet.getRange("A1").setValue(finalSheetName)
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
    var startOfDay = new Date(runTime);
    startOfDay.setHours(0, 0, 0, 0);
    var endOfDay = new Date(runTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    // For daily rows of multi-day events, effective end is runTime ("now").
    var globalEarliestEventStart = null;
    
    // Object to store multi-day event summary info (keyed by event id)
    var multiDaySummary = {};
    
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
      
      events.forEach(function(ev) {
        var parsed = parseEventData(ev);
        var isEventOver = (runTime >= ev.getEndTime());
        var eventStart = ev.getStartTime();
        var eventEnd = ev.getEndTime();
        
        if (!globalEarliestEventStart || eventStart.getTime() < globalEarliestEventStart.getTime()) {
          globalEarliestEventStart = eventStart;
        }
        
        // Determine if event spans multiple days.
        var eventStartDay = new Date(eventStart);
        eventStartDay.setHours(0, 0, 0, 0);
        var eventEndDay = new Date(eventEnd);
        eventEndDay.setHours(0, 0, 0, 0);
        var isMultiDay = (eventStartDay.getTime() !== eventEndDay.getTime());
        
        // For display, use the event's actual start and end times.
        var displayFormat = "dd.MM HH:mm";
        var displayRange = Utilities.formatDate(eventStart, Session.getScriptTimeZone(), displayFormat) +
                           " - " +
                           Utilities.formatDate(eventEnd, Session.getScriptTimeZone(), displayFormat);
        
        // Compute distance for the daily row:
        // • Single-day event: from (eventStart - 1h) to (eventEnd + 1h).
        // • Multi-day event:
        //   – If today is the first day (startOfDay equals eventStartDay):
        //         effectiveStart = eventStart - 1h, effectiveEnd = runTime.
        //   – Otherwise, effectiveStart = 00:01 of today, effectiveEnd = runTime.
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
          
          // For multi-day summary, run separate request if not already done.
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
        
        // Prepare note.
        var note = "";
        if (isMultiDay) {
          note = "Spans " + Utilities.formatDate(eventStart, Session.getScriptTimeZone(), "yyyy-MM-dd") +
                 " to " + Utilities.formatDate(eventEnd, Session.getScriptTimeZone(), "yyyy-MM-dd");
        }
        if (!isEventOver && note === "") {
          note = "Event not over";
        }
        
        // Build the daily row.
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
        var rowRange = reportSheet.getRange(currentRow, 1, 1, rowValues.length);
        rowRange.setValues([rowValues]);
        rowRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
        if (!isEventOver) {
          reportSheet.getRange(currentRow, 9).setFontColor("red");
        }
        currentRow++;
      });
    }
    
    // 8) Update the report title if any event spans multiple days.
    if (globalEarliestEventStart) {
      var earliestStr = Utilities.formatDate(globalEarliestEventStart, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var newTitle = "Daily Report - " + earliestStr + " / " + todayStr;
      reportSheet.getRange("A1").setValue(newTitle);
    }
    
    // 9) Insert a TOTAL row for all events.
    var overallChfPerKm = 0;
    if (totalDistance > 0 && totalPrezzo > 0) {
      overallChfPerKm = parseFloat((totalPrezzo / totalDistance).toFixed(2));
    }
    var totalRowValues = [
      "TOTAL", "", "", "", totalPrezzo, totalDistance, overallChfPerKm, "", ""
    ];
    var totalRowRange = reportSheet.getRange(currentRow, 1, 1, totalRowValues.length);
    totalRowRange.setValues([totalRowValues]);
    totalRowRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
    // 10) If any multi-day events exist, add a multi-day summary section.
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
            "", "",
            summary.prezzo,
            summary.summaryDistance,
            summary.summaryCHFkm,
            "",
            "Multiple Days Summary"
          ];
          var summaryRange = reportSheet.getRange(currentRow, 1, 1, summaryRow.length);
          summaryRange.setValues([summaryRow]);
          summaryRange.setFontStyle("italic");
          currentRow++;
        }
      }
    }
    
    // 11) Append a Month To Date Report section.
    // Define MTD period: from the beginning of the month until runTime.
    var monthStart = new Date(runTime.getFullYear(), runTime.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    var monthStartStr = Utilities.formatDate(monthStart, Session.getScriptTimeZone(), "dd.MM");
    var runTimeDisplay = Utilities.formatDate(runTime, Session.getScriptTimeZone(), "dd.MM HH:mm");
    var mtdDisplay = monthStartStr + " - " + runTimeDisplay;
    
    // Insert a merged header row for the Month To Date Report.
    var mtdMergedHeader = reportSheet.getRange(currentRow, 1, 1, 9);
    mtdMergedHeader.merge();
    mtdMergedHeader.setValue("Month To Date Report");
    mtdMergedHeader.setFontWeight("bold");
    mtdMergedHeader.setBackground("#dddddd");
    currentRow++;
    
    // Insert a header row for the MTD section with specific column titles.
    // Columns: A: Vehicle Type, B: Period, C & D: blank, E: Prezzo (CHF), F: Distance (km), G: CHF/km, H: blank, I: Km Next Service.
    var mtdHeaders = ["Vehicle Type", "Period", "", "", "Prezzo (CHF)", "Distance (km)", "CHF/km", "", "Km Next Service"];
    var mtdHeaderRange = reportSheet.getRange(currentRow, 1, 1, mtdHeaders.length);
    mtdHeaderRange.setValues([mtdHeaders]);
    mtdHeaderRange.setFontWeight("bold");
    mtdHeaderRange.setBackground("#eeeeee");
    currentRow++;
    
    // Initialize MTD totals.
    var mtdTotalPrezzo = 0;
    var mtdTotalDistance = 0;
    
    // Loop over each vehicle in vehicleConfigs to compute MTD totals (from monthStart to runTime).
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
      
      // Build the MTD row.
      // Columns: A: Vehicle Type, B: Period, C & D: blank, E: Prezzo (CHF), F: Distance (km), G: CHF/km, H: blank, I: Km Next Service.
      var mtdRow = [
        cfg.vehicleType,
        mtdDisplay,
        "",
        "",
        parseFloat(vehiclePriceSum.toFixed(2)),
        vehicleDistance,
        vehicleCHFPerKm,
        "",
        kmNextService
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
    var mtdSummaryRow = [
      "MTD TOTAL", "", "", "",
      parseFloat(mtdTotalPrezzo.toFixed(2)),
      mtdTotalDistance,
      mtdOverallCHFkm,
      "",
      ""
    ];
    var mtdSummaryRange = reportSheet.getRange(currentRow, 1, 1, mtdSummaryRow.length);
    mtdSummaryRange.setValues([mtdSummaryRow]);
    mtdSummaryRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
    // 12) Append a Monthly Revenue Total section.
    // For the full month, we use the period from the beginning to the end of the current month.
    var fullMonthStart = new Date(runTime.getFullYear(), runTime.getMonth(), 1);
    fullMonthStart.setHours(0, 0, 0, 0);
    var fullMonthEnd = new Date(runTime.getFullYear(), runTime.getMonth() + 1, 0);
    fullMonthEnd.setHours(23, 59, 59, 999);
    // Compute full-month totals using the helper.
    var monthlyData = getMonthlyTotals(fullMonthStart, fullMonthEnd);
    
    // Insert a merged header row for the Monthly Revenue Total section.
    var monthlyHeader = reportSheet.getRange(currentRow, 1, 1, 9);
    monthlyHeader.merge();
    monthlyHeader.setValue("Monthly Revenue Total");
    monthlyHeader.setFontWeight("bold");
    monthlyHeader.setBackground("#cccccc");
    currentRow++;
    
    // Insert a row with the total revenue in Column E (all other columns blank).
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
    
    // 13) Append a Stripe Balance section.
    // Retrieve the Stripe balance.
    var stripe = getStripeBalance();
    // Sum available and pending amounts (assumed to be in cents) and convert to dollars.
    var availableAmount = 0;
    if (stripe.available && Array.isArray(stripe.available)) {
      for (var i = 0; i < stripe.available.length; i++) {
        availableAmount += Number(stripe.available[i].amount);
      }
    }
    var pendingAmount = 0;
    if (stripe.pending && Array.isArray(stripe.pending)) {
      for (var i = 0; i < stripe.pending.length; i++) {
        pendingAmount += Number(stripe.pending[i].amount);
      }
    }
    // Convert amounts from cents to dollars.
    availableAmount = availableAmount / 100;
    pendingAmount = pendingAmount / 100;
    var totalStripe = availableAmount + pendingAmount;
    
    // Insert a merged header row for the Stripe Balance section.
    var stripeHeader = reportSheet.getRange(currentRow, 1, 1, 9);
    stripeHeader.merge();
    stripeHeader.setValue("Balance Stripe");
    stripeHeader.setFontWeight("bold");
    stripeHeader.setBackground("#dddddd");
    currentRow++;
    
    // Insert a row for "Available" (with value in Column E).
    var stripeAvailableRow = ["", "", "", "", availableAmount.toFixed(2), "", "", "", ""];
    var stripeAvailableRange = reportSheet.getRange(currentRow, 1, 1, stripeAvailableRow.length);
    stripeAvailableRange.setValues([stripeAvailableRow]);
    stripeAvailableRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
    currentRow++;
    
    // Insert a row for "Pending" (with value in Column E).
    var stripePendingRow = ["", "", "", "", pendingAmount.toFixed(2), "", "", "", ""];
    var stripePendingRange = reportSheet.getRange(currentRow, 1, 1, stripePendingRow.length);
    stripePendingRange.setValues([stripePendingRow]);
    stripePendingRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THIN);
    currentRow++;
    
    // Insert a row for "Total Account" (with value in Column E).
    var stripeTotalRow = ["", "", "", "", totalStripe.toFixed(2), "", "", "", ""];
    var stripeTotalRange = reportSheet.getRange(currentRow, 1, 1, stripeTotalRow.length);
    stripeTotalRange.setValues([stripeTotalRow]);
    stripeTotalRange.setBorder(true, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    currentRow++;
    
    // 14) Export columns A–I so the logo is included.
    var lastRow = reportSheet.getLastRow();
    var lastCol = Math.max(reportSheet.getLastColumn(), 9);
    var rangeA1 = "'" + reportSheet.getName() + "'!A1:" + columnNumberToLetter(lastCol) + lastRow;
    
    var emailRecipient = "someone@example.com"; // set your recipient
    var subject = reportSheet.getRange("A1").getValue();
    var body = "Ciao,\n\nHere is your daily report for " + todayStr + ".\n\nSaluti,\nTeam";
    sendSheetAsPDF_range(ss, reportSheet, rangeA1, emailRecipient, subject, body, finalSheetName);
    
    Logger.log("PDF sent to %s", emailRecipient);
    Logger.log("=== End: generateDailyKmReportAndSendEmail_newFile ===");
    
  } catch (err) {
    Logger.log("Error in generateDailyKmReportAndSendEmail_newFile: " + err);
  }
}

/**
 * Helper for monthly summary.
 * Loops over a set of predefined calendar IDs and computes the total revenue,
 * total rentals, and total hours for the full month.
 */
function getMonthlyTotals(monthStart, monthEnd) {
  var calendarIds = [
    'noleggiosemplice23@gmail.com',
    'nijfu8d94@group.calendar.google.com',
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
  
  var calendarNames = ['Opel Vivaro', 'Peugeot Boxer', 'Renault Master', 'Fiat Ducato', 'Citroen Boxer', 'Citroen Jumper', 'Renault Trafic', 'Renault Trafic2', 'Renault Trafic3', 'Citroen Jumper2', 'Citroen Jumper3'];
  
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
        // Determine overlap between the event and the full month period.
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

/**
 * Helper for multi-day summary:
 * Makes a POST request to the distance API using the full event period.
 */
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

/**
 * Helper to look up Km Next Service based on vehicle name.
 * Opens spreadsheet with ID "1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E",
 * searches for vehicle name in column A, and returns value from column M.
 */
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

/**
 * Inserts a Drive-stored image into the given sheet in cell D1.
 */
function insertLogo(sheet) {
  var fileId = "1fVr7cR1Z9KD__A-ax0io9kWy4NWK0KkP"; 
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  var image = sheet.insertImage(blob, 7, 1);
  image.setWidth(300);
  image.setHeight(112);
}

/****************************************************
 * findUniqueSheetName
 ****************************************************/
function findUniqueSheetName(ss, baseSheetName) {
  var candidateName = baseSheetName;
  var suffix = 1;
  while (ss.getSheetByName(candidateName)) {
    suffix++;
    candidateName = baseSheetName + "/" + suffix;
  }
  return candidateName;
}

/****************************************************
 * parseEventData
 ****************************************************/
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

/****************************************************
 * columnNumberToLetter
 ****************************************************/
function columnNumberToLetter(col) {
  var temp, letter = "";
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

/****************************************************
 * sendSheetAsPDF_range
 ****************************************************/
function sendSheetAsPDF_range(ss, sheet, rangeA1, email, subject, body, pdfFileName) {
  var ssId = ss.getId();
  var gid  = sheet.getSheetId();
  var url = "https://docs.google.com/spreadsheets/d/" + ssId +
            "/export?exportFormat=pdf&format=pdf" +
            "&gid=" + gid +
            "&range=" + encodeURIComponent(rangeA1) +
            "&size=A4" +
            "&portrait=true" +
            "&fitw=true" +
            "&sheetnames=false" +
            "&printtitle=false" +
            "&pagenum=UNDEFINED" +
            "&gridlines=false" +
            "&fzr=false";
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {headers: { 'Authorization': 'Bearer ' + token }});
  var pdfBlob = response.getBlob().setName(pdfFileName + ".pdf");
  MailApp.sendEmail({
    to: 'noleggiosemplice23@gmail.com',
    subject: subject,
    body: body,
    attachments: [pdfBlob]
  });
}

/**
 * Retrieves Stripe balance.
 */
function getStripeBalance() {
  var url = "https://api.stripe.com/v1/balance";
  var apiKey = "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"; // Your Stripe secret key

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
