function updateUnpaidReservations() {
  const reservationSheetId = '1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o';
  const configSheetId = '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E';

  const reservationSheet = SpreadsheetApp.openById(reservationSheetId).getSheets()[0];
  const configSheet = SpreadsheetApp.openById(configSheetId).getSheets()[0];

  const reservationData = reservationSheet.getDataRange().getValues();
  const configData = configSheet.getDataRange().getValues();

  const now = new Date();
  const searchStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  console.log("Script started at: " + now.toISOString());

  // Create a map to track reference numbers and their payment status
  const refNumberMap = new Map();

  // First pass: Collect all reference numbers and their statuses
  for (let i = 1; i < reservationData.length; i++) {
    const refNumber = reservationData[i][14]; // Ref Number
    const paymentStatus = (reservationData[i][22] || "").trim().toLowerCase();
    
    if (refNumber) {
      if (!refNumberMap.has(refNumber)) {
        refNumberMap.set(refNumber, []);
      }
      refNumberMap.get(refNumber).push({
        row: i,
        status: paymentStatus,
        timestamp: new Date(reservationData[i][0]),
        vehicleType: reservationData[i][18]
      });
    }
  }

  // Second pass: Process all rows
  for (let i = 1; i < reservationData.length; i++) {
    const timestamp = new Date(reservationData[i][0]);
    let paymentStatus = (reservationData[i][22] || "").trim().toLowerCase();
    const vehicleType = reservationData[i][18];
    const refNumber = reservationData[i][14];

    console.log(
      `Processing row ${i + 1}: ` +
      `Timestamp: ${timestamp}, Payment Status: ${paymentStatus}, ` +
      `Vehicle Type: ${vehicleType}, Ref Number: ${refNumber}`
    );

    // Check for duplicate ref numbers
    const refEntries = refNumberMap.get(refNumber);
    if (refEntries && refEntries.length > 1) {
      // Find if any duplicate has "paid" status
      const hasPaidDuplicate = refEntries.some(entry => entry.status === "paid");
      
      if (hasPaidDuplicate && paymentStatus !== "paid") {
        // Copy "Paid" status to this row
        paymentStatus = "paid";
        reservationSheet.getRange(i + 1, 23).setValue("Paid");
        console.log(`Row ${i + 1}: Copied "Paid" status from duplicate ref number`);
      }
    }

    const hoursSinceTimestamp = (now - timestamp) / (1000 * 60 * 60);
    if (hoursSinceTimestamp > 13 && paymentStatus !== "paid") {
      console.log(`Row ${i + 1}: 13+ hours have passed and payment is empty or unpaid.`);

      const vehicleConfig = configData.find(row => row[0] === vehicleType);
      if (!vehicleConfig) {
        console.warn(`Row ${i + 1}: No config found for vehicle type: ${vehicleType}`);
        continue;
      }

      const calendarId = vehicleConfig[2];
      const calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) {
        console.error(`Row ${i + 1}: Calendar not found for ID: ${calendarId}`);
        continue;
      }
      console.log(`Row ${i + 1}: Found calendar ID: ${calendarId}`);

      const events = calendar.getEvents(
        searchStartDate,
        new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      );
      if (events.length === 0) {
        console.warn(`Row ${i + 1}: No events in given date range for this calendar.`);
        continue;
      }

      let eventUpdated = false;
      events.forEach(event => {
        const description = event.getDescription();
        if (description.includes(`Numero di riferimento: ${refNumber}`)) {
          console.log(`Row ${i + 1}: Matching event found. Updating title/color.`);

          let currentTitle = event.getTitle();

          if (currentTitle.includes('$')) {
            const eventDate = event.getStartTime();
            const dateStr = eventDate.toLocaleString('en-CH', { timeZone: 'Europe/Zurich' });

            const subject = `CHECK PAYMENT: ${currentTitle}, ${refNumber}, ${dateStr}`;
            const body = 
              'We found a "$" sign in the title, yet we are about to mark this event as NOT Paid.\n' + 
              'Please verify the payment status manually.\n\n' +
              `Event Title: ${currentTitle}\n` +
              `Reference: ${refNumber}\n` +
              `Event Date: ${dateStr}`;

            MailApp.sendEmail('noleggiosemplice23@gmail.com', subject, body);
          }

          let cleanedTitle = currentTitle.replace(/^\d+\s*[-–]?\s*/, '');
          if (!cleanedTitle.startsWith('NOT Paid - ')) {
            cleanedTitle = 'NOT Paid - ' + cleanedTitle;
          }

          event.setTitle(cleanedTitle);
          event.setColor(CalendarApp.EventColor.GRAY);
          eventUpdated = true;
        }
      });

      if (!eventUpdated) {
        console.warn(`Row ${i + 1}: No event matched ref number: ${refNumber}`);
      } else {
        reservationSheet.getRange(i + 1, 23).setValue('Not Paid');
        reservationSheet.getRange(i + 1, 24).setValue('Checked');
        console.log(`Row ${i + 1}: Marked as "Not Paid" + "Checked" in sheet.`);
      }
    } else if (paymentStatus === "paid") {
      // Handle paid status with $ sign
      const vehicleConfig = configData.find(row => row[0] === vehicleType);
      if (vehicleConfig) {
        const calendarId = vehicleConfig[2];
        const calendar = CalendarApp.getCalendarById(calendarId);
        if (calendar) {
          const events = calendar.getEvents(
            searchStartDate,
            new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          );
          
          events.forEach(event => {
            const description = event.getDescription();
            if (description.includes(`Numero di riferimento: ${refNumber}`)) {
              let currentTitle = event.getTitle();
              let cleanedTitle = currentTitle.replace(/^\d+\s*[-–]?\s*/, '');
              
              // Only add $ if not already present anywhere in the title
              if (!cleanedTitle.includes('$')) {
                cleanedTitle = '$ ' + cleanedTitle;
                event.setTitle(cleanedTitle);
                console.log(`Row ${i + 1}: Added $ to paid event title`);
              }
            }
          });
        }
      }
      console.log(`Row ${i + 1}: Payment completed - processed with $ sign`);
    } else {
      console.log(`Row ${i + 1}: Less than 13 hours passed`);
    }
  }

  console.log("Script completed at: " + new Date().toISOString());
}
