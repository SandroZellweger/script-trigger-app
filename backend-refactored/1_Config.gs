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
    VEHICLE_DATA_SHEET_ID: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E'
  };
}

// Validate authentication token
function validateAuthToken(token) {
  const config = getConfig();
  return token === config.AUTH_TOKEN;
}