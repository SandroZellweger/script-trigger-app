function saveContactsFromMultipleCalendars() {
  var calendarIds = [
    'noleggiosemplice23@gmail.com', // Vivaro
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com', // Renault
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com', // Boxer
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com', // Ducato
    // Add more calendar IDs as needed
  ];
  var groupName = 'Noleggio Semplice';

  // Check if the group exists, if not, create it
  var groups = ContactsApp.getContactGroups();
  var group = groups.find(g => g.getName() === groupName);
  if (!group) {
    group = ContactsApp.createContactGroup(groupName);
  }

  var startDate = new Date(2024, 0, 1); // January 1, 2024
  var endDate = new Date(2024, 11, 31); // December 31, 2024

  calendarIds.forEach(function(calendarId) {
    var events = CalendarApp.getCalendarById(calendarId).getEvents(startDate, endDate);
    events.forEach(function(event) {
      var description = event.getDescription();
      var emailMatch = description.match(/Email:\s*([^\s]+)/);
      var phoneMatch = description.match(/Numero di cellulare:\s*([\d\s]+)/); // Match numbers with spaces
      var nameParts = event.getTitle().split('-');
      var name = nameParts.length > 1 ? nameParts[1].trim() : "Unknown"; // Check if the part exists

      if (emailMatch && phoneMatch && name !== "Unknown") {
        var email = emailMatch[1];
        var phone = phoneMatch[1].replace(/\s+/g, ''); // Normalize phone number by removing spaces

        // Check if contact with this normalized phone number already exists
        if (!contactExists(phone)) {
          var contact = ContactsApp.createContact(name, '', email);
          contact.addPhone(ContactsApp.Field.MOBILE_PHONE, phone);
          contact.addToGroup(group);

          Logger.log('Contact created and added to group for: ' + name);
        } else {
          Logger.log('Contact with phone ' + phone + ' already exists. No new contact created.');
        }
      } else {
        Logger.log('Data missing for contact creation from event: ' + event.getTitle() + '. Missing Name/Email/Phone. Read data: Name - ' + name + ', Email - ' + (emailMatch ? emailMatch[1] : 'N/A') + ', Phone - ' + (phoneMatch ? phoneMatch[0] : 'N/A'));
      }
    });
  });
}

function contactExists(phoneNumber) {
  // Normalize the input phone number to ensure accurate search
  var normalizedPhoneNumber = phoneNumber.replace(/\s+/g, '');
  var contacts = ContactsApp.getContactsByPhone(normalizedPhoneNumber, ContactsApp.Field.MOBILE_PHONE);
  return contacts

}

function updateContactNamesWithAppointments(startDateStr, endDateStr) {
  var calendarIds = [
    'noleggiosemplice23@gmail.com',  // Vivaro
    'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com', // Renault
    'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com', // Boxer
    'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com' // Ducato
  ];

  var startDate = parseDateString(startDateStr);
  var endDate = parseDateString(endDateStr);

  if (!startDate || !endDate) {
    Logger.log('Invalid start date or end date. Please check your date formats.');
    return;
  }

  calendarIds.forEach(function(calendarId) {
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
      Logger.log('Calendar not found for ID: ' + calendarId);
      return;
    }

    var events = calendar.getEvents(new Date(startDate), new Date(endDate));
    events.forEach(function(event) {
      var title = event.getTitle();
      var nameParts = title.split('-');
      if (nameParts.length >= 3) {
        var contactName = nameParts[1].trim();  // Assume the contact's name is between the first and second dashes
        var contacts = ContactsApp.getContactsByName(contactName, ContactsApp.Field.GIVEN_NAME);
        
        // Adding a delay to prevent hitting the rate limit
        Utilities.sleep(1000);

        if (contacts.length > 0) {
          var contact = contacts[0];
          var newBookingDetail = formatBookingDetail(event, calendar.getName());
          var currentDescription = contact.getNotes();
          var updatedDescription = currentDescription + "\n" + newBookingDetail;
          contact.setNotes(updatedDescription);

          Logger.log('Updated contact for: ' + contactName);
        } else {
          Logger.log('No contact found for name: ' + contactName);
        }
      } else {
        Logger.log('Event title format incorrect or does not contain at least two dashes: ' + title);
      }
    });
  });
}

function formatBookingDetail(event, calendarName) {
  var description = event.getDescription();
  var priceMatch = description.match(/Prezzo:\s*CHF\s*(\d+\.?\d*)/);
  var eventDate = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), "dd/MM/yy");
  return `${eventDate} - ${calendarName} - CHF ${priceMatch ? priceMatch[1] : "N/A"}`;
}

function parseDateString(dateStr) {
  var parts = dateStr.split('-');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function main2() {
    updateContactNamesWithAppointments('01-01-2024', '31-12-2024');  // From January 1, 2023, to December 31, 2023
}