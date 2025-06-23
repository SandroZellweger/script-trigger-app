/*************************************************************
 * MINIMAL WORKING GOOGLE APPS SCRIPT - COPY THIS EXACTLY
 * This is the essential code that must be in Google Apps Script
 *************************************************************/

// Configuration
const AUTH_TOKEN = "myAppToken2025"; // Matches frontend

// Validate authentication token
function validateAuthToken(token) {
  return token === AUTH_TOKEN;
}

// Helper function to create proper JSON response (Google Apps Script handles CORS automatically)
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle OPTIONS requests for CORS preflight (Google Apps Script handles CORS automatically)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Main doGet handler
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
      case "ping":
        result = { result: "Ping successful" };
        break;
      case "getCalendarNames":
        result = getCalendarNamesApp();
        break;
      case "getCalendarNamesJsonp":
        return getCalendarNamesAppJsonp(e.parameter);
        break;
      case "getCalendarNamesAppJsonp":
        return getCalendarNamesAppJsonp(e.parameter);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }

    // Return JSON response
    const response = typeof result === "string" ? { result } : result;
    return createJsonResponse(response);
      
  } catch (error) {
    const errorResponse = { error: error.toString() };
    return createJsonResponse(errorResponse);
  }
}

// Get calendar names and data
function getCalendarNamesApp() {
  try {
    const calendarIds = [
      'noleggiosemplice23@gmail.com',
      'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',
      'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
      'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com',
      '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com',
      'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com',
      '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com',
      '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com',
      'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com',
      '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'
    ];
    
    const calendarData = [];
    
    // Default color palette that matches Google Calendar common colors
    const defaultColors = [
      '#667eea', // Blue
      '#FF6B6B', // Red  
      '#4ECDC4', // Teal
      '#45B7D1', // Light Blue
      '#96CEB4', // Green
      '#FECA57', // Yellow
      '#FF9FF3', // Pink
      '#54A0FF', // Blue
      '#5F27CD', // Purple
      '#00D2D3'  // Cyan
    ];
    
    for (let i = 0; i < calendarIds.length; i++) {
      try {
        const calendar = CalendarApp.getCalendarById(calendarIds[i]);
        if (calendar) {
          const calendarName = calendar.getName();
          const color = calendar.getColor() || defaultColors[i % defaultColors.length];
          
          calendarData.push({
            name: calendarName,
            color: color,
            id: calendarIds[i]
          });
          
          Logger.log(`Calendar ${i}: ${calendarName} - Color: ${color}`);
        } else {
          calendarData.push({
            name: `Calendar ${i + 1}`,
            color: defaultColors[i % defaultColors.length],
            id: calendarIds[i]
          });
        }
      } catch (error) {
        Logger.log(`Error getting details for calendar ${calendarIds[i]}: ${error}`);
        calendarData.push({
          name: `Calendar ${i + 1}`,
          color: defaultColors[i % defaultColors.length],
          id: calendarIds[i]
        });
      }
    }
    
    // Return both old format for compatibility and new detailed format
    return { 
      result: calendarData.map(cal => cal.name), // Old format for compatibility
      calendars: calendarData,  // New detailed format
      success: true
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// JSONP version for cross-domain requests
function getCalendarNamesAppJsonp(params) {
  const result = getCalendarNamesApp();
  const callback = params.callback || 'callback';
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
