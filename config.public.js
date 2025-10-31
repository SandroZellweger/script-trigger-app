/**
 * PUBLIC CONFIGURATION - Safe for GitHub
 * No sensitive data should be in this file
 */

window.APP_CONFIG = {
    // Frontend Configuration Only
    environment: 'production',
    version: '1.2.3',
    
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
    cacheVersion: 'v1.2.3',
    
// IMPORTANT: Sensitive data loaded from separate config
// These will be set by config.private.js (not committed to git)
scriptUrl: null,
authToken: null,
expenseSheetId: null,
maintenanceSheetId: null
};

// Function to merge private config when it loads
function mergePrivateConfig() {
    if (typeof window.PRIVATE_CONFIG !== 'undefined') {
        Object.assign(window.APP_CONFIG, window.PRIVATE_CONFIG);
        console.log('🔐 Private config merged successfully');
        console.log('🔗 Script URL configured:', window.APP_CONFIG.scriptUrl);
        return true;
    }
    return false;
}

// Try to merge immediately (in case private config loads first)
mergePrivateConfig();

// Also try again after a short delay (in case private config loads after)
setTimeout(() => {
    if (mergePrivateConfig()) {
        // Config merged successfully on retry
    } else {
        console.warn('⚠️ Private configuration still not loaded after delay');
    }
}, 100);

// Version info for debugging
console.log('📋 App Config Loaded - Version:', window.APP_CONFIG.version);
if (window.APP_CONFIG.scriptUrl) {
    console.log('🔗 Script URL configured');
} else {
    console.warn('⚠️ Script URL not configured - will use fallback');
}

// Backward compatibility
window.PRODUCTION_CONFIG = window.APP_CONFIG;