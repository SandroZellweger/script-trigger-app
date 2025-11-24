/*************************************************************
 * 1_Config.gs
 * Configuration and Global Variables
 *************************************************************/

// Configuration - THESE SHOULD BE SET IN GOOGLE APPS SCRIPT PROPERTIES
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();

  return {
    STRIPE_SECRET_KEY: scriptProperties.getProperty('STRIPE_SECRET_KEY') || '',
    STRIPE_BLACK_API_KEY: scriptProperties.getProperty('STRIPE_BLACK_API_KEY') || '',
    AUTH_TOKEN: scriptProperties.getProperty('AUTH_TOKEN') || 'mySecureVanApp_2025',
    PARENT_FOLDER_ID: scriptProperties.getProperty('PARENT_FOLDER_ID') || '',
    EXPENSE_SHEET_ID: scriptProperties.getProperty('EXPENSE_SHEET_ID') || '',
    VEHICLE_DATA_SHEET_ID: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E',
    GARAGES_SHEET_ID: '1e4jz3L_hV5nAic6QwxW2D9BZZYggvAPeLH9tcGpHAYA',
    MAINTENANCE_SHEET_ID: scriptProperties.getProperty('MAINTENANCE_SHEET_ID') || ''
  };
}

// Validate authentication token
function validateAuthToken(token) {
  const config = getConfig();
  return token === config.AUTH_TOKEN;
}

// Google Credentials function (JSONP)
function getGoogleCredentialsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('GOOGLE_API_KEY');
    const clientId = scriptProperties.getProperty('GOOGLE_CLIENT_ID');
    // Usa l'auth token dalle properties come appId per Google Picker
    const appId = scriptProperties.getProperty('AUTH_TOKEN') || 'mySecureVanApp_2025';

    const response = {
      success: true,
      apiKey: apiKey,
      clientId: clientId,
      appId: appId,
      timestamp: new Date().toISOString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}