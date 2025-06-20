function checkEmailAndUpdateCalendarContratto() {
  const labelName = 'contratti';
  const emailFrom = 'noleggiosemplice23@gmail.com'; // Use your actual email address
  const calendars = [
    'noleggiosemplice23@gmail.com', 
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com',
'25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com', //ducato Calendar ID
'8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com', //ducato Calendar ID
'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com', //renault trafic Calendar ID
'6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com', //renaultraficlosone
'9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com',
'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com',
'0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'
  ];
  const searchQuery = `from:${emailFrom} -label:${labelName} subject:"Rif.:"`;

  Logger.log("Starting script execution.");

  const threads = GmailApp.search(searchQuery, 0, 5);
  Logger.log(`Found ${threads.length} threads matching the query.`);

  const contrattiLabel = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      if (!message.isRead) {
        const subject = message.getSubject();
        Logger.log(`Processing message with subject: ${subject}`);
        
        const refMatch = subject.match(/Rif\.: (\d+)/);
        const dateMatch = subject.match(/(\d{2}\/\d{2}\/\d{4})/);

        if (refMatch && dateMatch) {
          const refNumber = refMatch[1];
          Logger.log(`Reference number found: ${refNumber}`);
          const dateString = dateMatch[0];
          Logger.log(`Date found: ${dateString}`);

          const parts = dateString.split('/');
          const startDate = new Date(parts[2], parts[1] - 1, parts[0]);
          const endDate = new Date(startDate.getTime());
          endDate.setDate(startDate.getDate() + 1);
          
          calendars.forEach(calendarId => {
            const calendar = CalendarApp.getCalendarById(calendarId);
            const events = calendar.getEvents(startDate, endDate);
            Logger.log(`Searching in calendar ${calendarId} for events on ${startDate.toDateString()}. Found ${events.length} events.`);
            
            events.forEach(event => {
  Logger.log(`Event title before update: ${event.getTitle()}`);
  const description = event.getDescription().toLowerCase(); // Convert description to lower case
  const searchStr = `numero di riferimento: ${refNumber}`.toLowerCase(); // Convert search string to lower case
  if (description.includes(searchStr)) {
    Logger.log(`Matching event found for reference number: ${refNumber}`);
    const newTitle = '^' + event.getTitle();
    event.setTitle(newTitle); // This line updates the event title
    Logger.log(`Event title updated to: ${newTitle}`);
  } else {
    Logger.log(`No matching reference number found in event description. Description: ${event.getDescription()}`);
  }
});
          });
        } else {
          Logger.log("No reference number or date found in the subject.");
        }
        message.markRead();
        thread.addLabel(contrattiLabel);
        Logger.log("Email marked as read and labeled.");
      }
    });
  });
  Logger.log("Script execution completed.");
}
