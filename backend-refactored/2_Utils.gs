/*************************************************************
 * 2_Utils.gs
 * Helper Functions, Logging, and Response Handling
 *************************************************************/

// Helper function to create proper JSON response (without CORS for JSONP compatibility)
function createJsonResponse(data) {
  var response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Set CORS headers for JSON responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

// Helper function to create JSON response WITH CORS headers (for POST requests only)
function createJsonResponseWithCors(data) {
  var response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Set CORS headers for POST responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  var response = ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.setHeader('Access-Control-Max-Age', '86400');

  return response;
}

// JSONP Helper
function createJsonpResponse(callback, data) {
  const jsonpBody = `/**/${callback}(${JSON.stringify(data)});`;
  return ContentService
    .createTextOutput(jsonpBody)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Generic JSONP wrapper for any function result
function handleJsonpRequest(e, dataFunction) {
  try {
    const result = dataFunction(e.parameter);
    
    if (e.parameter.callback) {
      return createJsonpResponse(e.parameter.callback, result);
    }
    return createJsonResponse(result);
  } catch (error) {
    const errorResult = { success: false, error: error.toString() };
    if (e.parameter.callback) {
      return createJsonpResponse(e.parameter.callback, errorResult);
    }
    return createJsonResponse(errorResult);
  }
}

// Sanitize JSONP callback function name
function sanitizeJsonpCallback(name) {
  var fallback = 'callback';
  if (!name) {
    return fallback;
  }
  var cleaned = String(name).replace(/[^\w$]/g, '');
  return cleaned || fallback;
}