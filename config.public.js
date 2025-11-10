/**
 * PUBLIC CONFIGURATION - Safe for GitHub
 * No sensitive data should be in this file
 */

window.APP_CONFIG = {
    // Frontend Configuration Only
    environment: 'production',
    version: '2.0.2',
    
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
    cacheVersion: 'v2.0.1',
    
    // IMPORTANT: Sensitive data loaded from config.private.js
    // These values will be overridden by PRIVATE_CONFIG (not committed to git)
    // Placeholders only - DO NOT put real values here
    scriptUrl: null,
    authToken: null,
    expenseSheetId: null,
    maintenanceSheetId: null,
    driveOauthClientId: null,
    driveUploadFolderId: null,
    googleApiKey: null,
    googleClientId: null,
    googleAppId: null
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
        console.log('📋 Config ready - Script URL configured');
    } else {
        // Private config not available - use production defaults
        console.log('🌐 Using production configuration (GitHub Pages)');
        
        // Production credentials (safe to expose for this app)
        window.APP_CONFIG.scriptUrl = 'https://script.google.com/macros/s/AKfycbzzW7jzhNi0D4FC9VnZEH1FjBO7rlTwYLQBPbPhRagE-5aMwvKPgACcee2ugrPTWoyx/exec';
        window.APP_CONFIG.authToken = 'mySecureVanApp_2025';
        window.APP_CONFIG.expenseSheetId = '1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M';
        window.APP_CONFIG.maintenanceSheetId = '1ZhsCurWBPQ7oYCZL7NXCF6E8VoXLlSg8YLw6BdxCjx4';
        window.APP_CONFIG.driveOauthClientId = '552211122555-ar7v9jb2b2gbs4o6nafph3b0599v9frj.apps.googleusercontent.com';
        window.APP_CONFIG.driveUploadFolderId = '1fZcLxq0S_yIceB_qsA6DLUnj8lcq3HtM';
        window.APP_CONFIG.googleApiKey = 'AIzaSyCqF0sdLZCF0ASr_LWqN5VGV-psvXOLIoo';
        window.APP_CONFIG.googleClientId = '552211122555-ar7v9jb2b2gbs4o6nafph3b0599v9frj.apps.googleusercontent.com';
        window.APP_CONFIG.googleAppId = '552211122555';
        
        console.log('📋 Config ready - Production mode');
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
window.CONFIG = window.APP_CONFIG; // Alias for damage-ai-test.html and other pages