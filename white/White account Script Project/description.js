function correctCalendarEvents() {
  var startOfPeriod = new Date(2024, 1, 16); // Start from February 1, 2024
  var endOfPeriod = new Date(2024, 2, 31); // End on March 31, 2024, adjust the end month index and day as needed
  
  var calendarIds = [
    'noleggiosemplice23@gmail.com',
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com'
  ];

  calendarIds.forEach(function(calendarId) {
    var calendar = CalendarApp.getCalendarById(calendarId);
    var events = calendar.getEvents(startOfPeriod, endOfPeriod);
    
    events.forEach(function(event) {
      var description = event.getDescription();
      var updatedDescription = updateDescription(description);
      
      if (description !== updatedDescription) {
        event.setDescription(updatedDescription);
        Logger.log('Updated event: ' + event.getTitle());
      }
    });
  });
}

function updateDescription(description) {
    // Initialize the cleaned description with the original description
    let cleanedDescription = description;

    // Define patterns for the parts to be updated or checked
    const refPattern = /Numero di riferimento:\s*\d+/;
    // Updated pattern to match "Pagamento:" followed by any whitespace (including new lines) then "Stripe"
    const paymentPattern = /\n?Pagamento:\s*[\s\S]*Stripe/;
    const paymentDatePattern = /\n?Data di Pagamento:\s*\d{2}\/\d{2}\/\d{4}/;

    // Attempt to find "Numero di riferimento" in the description
    const refMatch = description.match(refPattern);

    if (refMatch) {
        // Remove existing "Pagamento: Stripe" and "Data di Pagamento:" lines
        cleanedDescription = description.replace(paymentPattern, '').replace(paymentDatePattern, '').trim();

        // Find the end of the "Numero di riferimento" section
        const indexOfRefEnd = cleanedDescription.indexOf(refMatch[0]) + refMatch[0].length;
        const beforeRef = cleanedDescription.substring(0, indexOfRefEnd);
        const afterRef = cleanedDescription.substring(indexOfRefEnd);

        // Construct new payment details to insert
        const newPaymentDetails = "\nPagamento: Stripe\nData di Pagamento: 14/03/2024"; // Example date, adjust as necessary

        // Reassemble the description with the new payment details in the correct position
        cleanedDescription = [beforeRef, newPaymentDetails, afterRef].join("\n").trim();
    }

    // Return the updated description
    return cleanedDescription.replace(/\n{2,}/g, '\n\n'); // Replace multiple newlines with a double newline for cleanliness
}

