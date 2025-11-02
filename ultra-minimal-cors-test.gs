// Ultra-minimal CORS test script - ALTERNATIVE APPROACH
function doGet(e) {
  var response = ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "CORS test successful - Alternative method",
      timestamp: new Date().toISOString(),
      authToken: e.parameter.authToken || 'none'
    }))
    .setMimeType(ContentService.MimeType.JSON);

  // Try alternative CORS header setting
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });

  return response;
}

function doPost(e) {
  var response = ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "POST CORS test successful - Alternative method",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);

  // Try alternative CORS header setting
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });

  return response;
}

// Handle OPTIONS preflight requests
function doOptions(e) {
  var response = ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);

  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });

  return response;
}