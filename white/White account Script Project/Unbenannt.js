function revertEventTitleUpdates() {
  var calendar = CalendarApp.getCalendarById('noleggiosemplice23@gmail.com'); // Replace with your calendar ID
  var startDate = new Date('2023-01-01'); // Start date for the search
  var endDate = new Date('2024-12-31'); // Current date
  var events = calendar.getEvents(startDate, endDate);

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle();

    // Remove the count from the title, format like " / 5" or " / 5.00"
    var newTitle = title.replace(/ \/ \d+(\.\d+)?$/, '');

    // If the title has been changed, update it
    if (title !== newTitle) {
      event.setTitle(newTitle);
    }
  }
}