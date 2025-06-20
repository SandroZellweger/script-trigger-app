function createOrUpdateContactsFromCalendarEvents(startDate, endDate) {
  var start = new Date(startDate);
  var end = new Date(endDate);
  var calendarId = 'noleggiosemplice23@gmail.com';
  var events = CalendarApp.getCalendarById(calendarId).getEvents(start, end);

  // Updated regex to include plain 9-digit numbers
  var phoneRegex = /(\+41|0041|078|079|076|077|\+39|0039)?\s?(\d{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})|\b\d{9}\b/;

  events.forEach(function(event) {
    var title = event.getTitle();
    var description = event.getDescription();

    var cleanTitle = title.replace(/^[^a-zA-Z]+/, '');
    var titleParts = cleanTitle.split(' -');
    var names = titleParts[0].split(' ', 2);
    var name = names.join(" ");

    var price = titleParts.length > 1 ? titleParts[1].match(/\d+/) : 'N/A';

    var eventStartDate = event.getStartTime();
    var formattedDate = Utilities.formatDate(eventStartDate, Session.getScriptTimeZone(), "dd/MM/yy");
    var carModel = "Vivaro";
    var newNoteContent = `${formattedDate} - ${carModel} - ${price}`;

    var phoneMatch = description.match(phoneRegex);
    if (phoneMatch) {
      var fullPhoneNumber = phoneMatch[0].replace(/\s+/g, ''); // Normalize by removing spaces
      var phoneNumberToMatch = fullPhoneNumber.slice(-9); // Extract the last 9 digits

      var matchedContact = findContactByPhoneNumber(phoneNumberToMatch);

      if (matchedContact) {
        updateExistingContact(matchedContact, name, formattedDate, carModel, price, newNoteContent);
      } else {
        createNewContact(name, formattedDate, carModel, price, fullPhoneNumber, newNoteContent);
      }
    } else {
      Logger.log('No phone number found for event: ' + title + ' on ' + formattedDate);
    }
  });
}

function findContactByPhoneNumber(phoneNumberToMatch) {
  var allContacts = ContactsApp.getContacts();
  var matchedContact = null;

  // Iterate over all contacts
  for (var i = 0; i < allContacts.length; i++) {
    var contact = allContacts[i];
    try {
      var phones = contact.getPhones();
      // Iterate over all phone numbers of the contact
      for (var j = 0; j < phones.length; j++) {
        // Sanitize the phone number by removing all non-digits
        var phone = phones[j].getPhoneNumber().replace(/\D/g, '');
        // If the phone number ends with the last 9 digits we are looking for, return the contact
        if (phone.slice(-6) === phoneNumberToMatch) {
          matchedContact = contact;
          break; // Exit the inner loop if a match is found
        }
      }
      if (matchedContact) break; // Exit the outer loop if a match is found
    } catch (e) {
      // Log and skip this contact if an error occurs
      Logger.log('Error with contact: ' + contact.getFullName() + ', Error: ' + e.toString());
    }
  }

  return matchedContact;
}



function updateExistingContact(contact, name, formattedDate, carModel, price, newNoteContent) {
  // Ensure contact is a valid object before trying to call getNotes on it
  if (contact && typeof contact.getNotes === 'function') {
    var existingNotes = contact.getNotes();
    if (!existingNotes.includes(newNoteContent)) {
      var dates = (existingNotes.match(/\d{2}\/\d{2}\/\d{2}/g) || []).concat(formattedDate);
      var lastDate = dates.length > 1 ? dates[dates.length - 2] : dates[0];
      var newLastName = lastDate + " - " + formattedDate + " - " + carModel + " (" + dates.length + ")";
      contact.setFamilyName(newLastName);
      contact.setNotes(existingNotes + "\n" + newNoteContent);
      Logger.log('Updated existing contact: ' + name);
    }
  } else {
    Logger.log('No contact object passed to updateExistingContact function.');
  }
}



function createNewContact(name, formattedDate, carModel, price, fullPhoneNumber, newNoteContent) {
  // Add delay to avoid rate limit issues
  Utilities.sleep(1000);
  
  var contact = ContactsApp.createContact(name, '', '');
  contact.addPhone(ContactsApp.Field.MOBILE_PHONE, fullPhoneNumber);
  contact.setNotes(newNoteContent);
  
  // Update the last name with formattedDate and carModel, assuming it's the first contact for this user
  contact.setFamilyName(formattedDate + " - " + carModel + " (1)");

  // Try to find the 'Noleggio Semplice' group and add the contact to it
  try {
    var groups = ContactsApp.getContactGroups();
    var group = groups.find(function(g) { return g.getName() === 'Noleggio Semplice'; });
    if (!group) {
      group = ContactsApp.createContactGroup('Noleggio Semplice');
    }
    group.addContact(contact);
    Logger.log('Created new contact: ' + name);
  } catch (e) {
    Logger.log('Error adding contact to group: ' + e.toString());
  }
}


function myFunction() {
  try {
    createOrUpdateContactsFromCalendarEvents('2024-04-01', '2024-05-01');
  } catch (e) {
    // If a rate limit exception is thrown, log it, sleep for a while, and then try again
    if (e.toString().indexOf("Service invoked too many times") !== -1) {
      Logger.log("Rate limit exceeded. Pausing for a while...");
      Utilities.sleep(10000); // Sleep for 10 seconds
      myFunction(); // Retry the function
    } else {
      // If it's a different exception, log it and throw it
      Logger.log(e.toString());
      throw e;
    }
  }
}


