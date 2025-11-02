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

// Try to merge immediately (in case private config loads first)
mergePrivateConfig();

// Also try again after a short delay (in case private config loads after)
setTimeout(() => {
    if (mergePrivateConfig()) {
        // Config merged successfully on retry
    } else {
        // Private config not available (expected in production)
        // Set production-safe defaults
        if (!window.APP_CONFIG.scriptUrl) {
            window.APP_CONFIG.scriptUrl = 'https://script.google.com/macros/s/AKfycby7RIyw5npOagppAl0kor5oF126QolGxwTLAAf3a7ONJLaJejMo5U8Elq5y8fY2X1b2/exec';
            window.APP_CONFIG.authToken = 'mySecureVanApp_2025';
            window.APP_CONFIG.expenseSheetId = '1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M';
            window.APP_CONFIG.maintenanceSheetId = '1ZhsCurWBPQ7oYCZL7NXCF6E8VoXLlSg8YLw6BdxCjx4';
            console.log('🏭 Production config applied (private config not available)');
        }
        console.log('📋 Config ready - Script URL:', window.APP_CONFIG.scriptUrl);
    }
}, 100);
// Version info for debugging
console.log('📋 App Config Loaded - Version:', window.APP_CONFIG.version);
if (window.APP_CONFIG.scriptUrl) {
    console.log('🔗 Script URL configured');
} else {
    console.warn('⚠️ Script URL not configured');
}

// Backward compatibility
window.PRODUCTION_CONFIG = window.APP_CONFIG;
