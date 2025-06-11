/**
 * MINIMAL GOOGLE APPS SCRIPT FOR DEBUGGING
 * This is a simplified version to test CORS and basic functionality
 */

const AUTH_TOKEN = "myAppToken2025";

function validateAuthToken(token) {
  return token === AUTH_TOKEN;
}

function doGet(e) {
  try {
    // Log the incoming request
    Logger.log('🔍 Incoming request: ' + JSON.stringify(e.parameter));
    
    // Validate authentication
    const authToken = e.parameter.authToken;
    if (!validateAuthToken(authToken)) {
      Logger.log('❌ Auth failed for token: ' + authToken);
      return createResponse({ error: "Unauthorized: Invalid auth token" });
    }

    const functionName = e.parameter.function;
    Logger.log('🎯 Function requested: ' + functionName);
    
    if (!functionName) {
      return createResponse({ error: "No function specified" });
    }    let result;
    switch (functionName) {
      case "ping":
        result = { result: "Ping successful - script is working!" };
        break;
      case "testSimple":
        result = { result: "Simple test successful" };
        break;
      case "debug":
        result = debugInfo();
        break;
      case "getCalendarEventsApp":
        result = testCalendarFunction(e.parameter.startDate, e.parameter.endDate);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }Logger.log('✅ Result: ' + JSON.stringify(result));
    return createResponse(result);
      
  } catch (error) {
    Logger.log('❌ Error in doGet: ' + error.toString());
    const errorResponse = { error: error.toString() };
    return createResponse(errorResponse);
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function testCalendarFunction(startDate, endDate) {
  try {
    Logger.log('📅 Testing calendar access for dates: ' + startDate + ' to ' + endDate);
    
    // Test access to your main calendar first
    const mainCalendar = CalendarApp.getCalendarById('noleggiosemplice23@gmail.com');
    if (!mainCalendar) {
      return { error: 'Cannot access main calendar' };
    }
    
    Logger.log('✅ Main calendar found: ' + mainCalendar.getName());
    
    // Get a simple date range
    const timeMin = new Date(startDate + 'T00:00:00Z');
    const timeMax = new Date(endDate + 'T23:59:59Z');
    
    const events = mainCalendar.getEvents(timeMin, timeMax);
    Logger.log('📊 Found ' + events.length + ' events in main calendar');
    
    // Return simple result
    return { 
      result: {
        calendarName: mainCalendar.getName(),
        eventCount: events.length,
        dateRange: startDate + ' to ' + endDate
      }
    };
    
  } catch (error) {
    Logger.log('❌ Calendar error: ' + error.toString());
    return { error: 'Calendar error: ' + error.toString() };
  }
}

// Test function for manual execution
function manualTest() {
  Logger.log('🧪 Running manual test...');
  const result = testCalendarFunction('2025-06-01', '2025-06-30');
  Logger.log('📋 Manual test result: ' + JSON.stringify(result));
  return result;
}

// Debug function that returns detailed information
function debugInfo() {
  const info = {
    timestamp: new Date().toISOString(),
    scriptTimeZone: Session.getScriptTimeZone(),
    userEmail: Session.getActiveUser().getEmail(),
    calendarTest: null,
    permissions: null
  };
  
  try {
    // Test calendar access
    const mainCalendar = CalendarApp.getCalendarById('noleggiosemplice23@gmail.com');
    if (mainCalendar) {
      info.calendarTest = {
        success: true,
        name: mainCalendar.getName(),
        id: mainCalendar.getId()
      };
    } else {
      info.calendarTest = {
        success: false,
        error: 'Calendar not found'
      };
    }
  } catch (error) {
    info.calendarTest = {
      success: false,
      error: error.toString()
    };
  }
  
  return { result: info };
}
