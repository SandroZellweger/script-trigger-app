/*************************************************************
 * FIXED GOOGLE APPS SCRIPT FOR SCRIPT TRIGGER AND EXPENSE TRACKING
 * Handles script triggers, expense logging, viewing, and editing
 *************************************************************/

// Configuration
const STRIPE_SECRET_KEY = "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"; // Your Stripe secret key
const AUTH_TOKEN = "myAppToken2025"; // Matches frontend
const PARENT_FOLDER_ID = "1Nq3Fd_sDgpd2pKyDGsu9QNlcCoey5vsd"; // Google Drive parent folder ID
const EXPENSE_SHEET_ID = "1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M"; // Google Sheet ID

// Validate authentication token
function validateAuthToken(token) {
  return token === AUTH_TOKEN;
}

// Helper function to create proper JSON response (FIXED!)
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Main doGet handler for script triggers and fetching expenses
function doGet(e) {
  try {
    // Validate authentication
    const authToken = e.parameter.authToken;
    if (!validateAuthToken(authToken)) {
      return createJsonResponse({ error: "Unauthorized: Invalid auth token" });
    }

    const functionName = e.parameter.function;
    if (!functionName) {
      return createJsonResponse({ error: "No function specified" });
    }

    let result;
    switch (functionName) {
      case "triggerDailyReport":
        result = triggerDailyReport();
        break;
      case "triggerCustomDateReport":
        result = triggerCustomDateReport(e.parameter.customDateString);
        break;
      case "triggerHardcodedReport":
        result = triggerHardcodedReport();
        break;
      case "triggerStripePayment":
        result = triggerStripePayment(e.parameter.amount, e.parameter.description);
        break;
      case "sendHowToBookMessageApp":
        result = sendHowToBookMessageApp(e.parameter.phoneNumber);
        break;
      case "ping":
        result = { result: "Ping successful" };
        break;
      case "getCalendarEventsApp":
        result = getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate);
        break;
      case "getExpenses":
        result = getExpenses();
        break;
      case "logExpense":
        result = logExpenseGet(e);
        break;
      case "editExpense":
        result = editExpenseGet(e);
        break;
      case "deleteExpense":
        result = deleteExpense(e);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }

    // Return JSON response (Google handles CORS automatically)
    const response = typeof result === "string" ? { result } : result;
    return createJsonResponse(response);
      
  } catch (error) {
    const errorResponse = { error: error.toString() };
    return createJsonResponse(errorResponse);
  }
}

// Rest of your functions stay the same...
// (I'm only showing the fixed doGet function and helper)

// Your calendar function (fixed to return proper format)
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

// Add the rest of your functions here (triggerStripePayment, etc.)
// Just make sure they all return { result: ... } or { error: ... } format
