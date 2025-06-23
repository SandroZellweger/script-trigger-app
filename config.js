/**
 * CENTRALIZED CONFIGURATION FOR SCRIPT TRIGGER APP
 * Update the Google Apps Script URL here and all HTML files will use the new URL
 */

window.APP_CONFIG = {    // Google Apps Script Configuration
    scriptUrl: 'https://script.google.com/macros/s/AKfycbyrXtwb_ZZla_9HtOEjyCsTgS9HgIqmzcUNC6lQqIxWAZlZe2bDC44o8d0y7mhXMYPI/exec',
    authToken: 'myAppToken2025',
    
    // Application Settings
    environment: 'production',
    version: '1.2.0',
    
    // Feature Flags
    enableAnalytics: true,
    enableDiagnostics: true,
    corsMode: 'jsonp-primary',
    
    // Network Settings
    retryAttempts: 3,
    timeout: 15000,
    
    // Google Sheets Configuration
    expenseSheetId: '1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M',
    maintenanceSheetId: '1ZhsCurWBPQ7oYCZL7NXCF6E8VoXLlSg8YLw6BdxCjx4',
    
    // Calendar Configuration
    enableCalendarIntegration: true,
    defaultCalendarView: 'month',
    
    // PWA Settings
    enableServiceWorker: true,
    cacheVersion: 'v1.2.0'
};

// Version info for debugging
console.log('📋 App Config Loaded - Version:', window.APP_CONFIG.version);
console.log('🔗 Script URL:', window.APP_CONFIG.scriptUrl);

// Backward compatibility - create PRODUCTION_CONFIG alias
window.PRODUCTION_CONFIG = window.APP_CONFIG;