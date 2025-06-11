/**
 * Get calendar events from multiple Google Calendars
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @return {Object} Object with result array or error
 */
function getCalendarEventsApp(startDate, endDate) {
  try {
    Logger.log('📅 Fetching calendar events from ' + startDate + ' to ' + endDate);
    
    const calendarIds = [
      'noleggiosemplice23@gmail.com',
      'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com', 
      'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
      'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com'
    ];
    
    const allEvents = [];
    
    // Parse start and end dates
    const timeMin = new Date(startDate + 'T00:00:00Z');
    const timeMax = new Date(endDate + 'T23:59:59Z');
    
    Logger.log('📅 Date range: ' + timeMin + ' to ' + timeMax);
    
    for (let index = 0; index < calendarIds.length; index++) {
      const calendarId = calendarIds[index];
      try {
        Logger.log('📋 Fetching from calendar ' + (index + 1) + ': ' + calendarId);
        
        const calendar = CalendarApp.getCalendarById(calendarId);
        if (!calendar) {
          Logger.log('⚠️ Calendar not found: ' + calendarId);
          continue;
        }
        
        // Get events for the date range
        const events = calendar.getEvents(timeMin, timeMax);
        
        Logger.log('📊 Found ' + events.length + ' events in calendar ' + (index + 1));
        
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          allEvents.push({
            id: event.getId(),
            summary: event.getTitle(),
            description: event.getDescription() || '',
            location: event.getLocation() || '',
            start: {
              dateTime: event.getStartTime().toISOString(),
              date: event.isAllDayEvent() ? event.getStartTime().toISOString().split('T')[0] : null
            },
            end: {
              dateTime: event.getEndTime().toISOString(), 
              date: event.isAllDayEvent() ? event.getEndTime().toISOString().split('T')[0] : null
            },
            calendarIndex: index,
            calendarId: calendarId
          });
        }
        
      } catch (calendarError) {
        Logger.log('❌ Error fetching calendar ' + calendarId + ': ' + calendarError.toString());
        // Continue with other calendars even if one fails
      }
    }
    
    Logger.log('✅ Total events fetched: ' + allEvents.length);
    
    // Return in the expected format
    return { result: allEvents };
    
  } catch (error) {
    Logger.log('❌ Error in getCalendarEventsApp: ' + error.toString());
    return { error: error.toString() };
  }
}
