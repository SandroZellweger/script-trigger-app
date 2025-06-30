/**
 * PUBLIC CONFIGURATION - Safe for GitHub
 * No sensitive data should be in this file
 */

window.APP_CONFIG = {
    // Frontend Configuration Only
    environment: 'production',
    version: '1.2.1',
    
    // Feature Flags
    enableAnalytics: true,
    enableDiagnostics: true,
    corsMode: 'jsonp-primary',
    
    // Network Settings
    retryAttempts: 3,
    timeout: 15000,
    
    // Calendar Configuration
    enableCalendarIntegration: true,
    defaultCalendarView: 'month',
    
    // PWA Settings
    enableServiceWorker: true,
    cacheVersion: 'v1.2.1',
    
    // IMPORTANT: Sensitive data loaded from separate config
    // These will be set by config.private.js (not committed to git)
    scriptUrl: null,
    authToken: null,
    expenseSheetId: null,
    maintenanceSheetId: null
};

// Load private configuration if available
if (typeof PRIVATE_CONFIG !== 'undefined') {
    Object.assign(window.APP_CONFIG, PRIVATE_CONFIG);
} else {
    console.warn('⚠️ Private configuration not loaded. Some features may not work.');
}

// Version info for debugging
console.log('📋 App Config Loaded - Version:', window.APP_CONFIG.version);
if (window.APP_CONFIG.scriptUrl) {
    console.log('🔗 Script URL configured');
} else {
    console.warn('⚠️ Script URL not configured');
}

// Backward compatibility
window.PRODUCTION_CONFIG = window.APP_CONFIG;
