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
    
    // Production defaults (overridden by config.private.js if present)
    scriptUrl: 'https://script.google.com/macros/s/AKfycbzUtXeqja87wTaEEq8Q5Su1utBJnm3z4kj7ub3OCx1RB95Yh0wwVbwLmdSGpTPy08hY/exec',
    authToken: 'mySecureVanApp_2025',
    expenseSheetId: '1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M',
    maintenanceSheetId: '1e4jz3L_hV5nAic6QwxW2D9BZZYggvAPeLH9tcGpHAYA',
    driveOauthClientId: '552211122555-ar7v9jb2b2gbs4o6nafph3b0599v9frj.apps.googleusercontent.com',
    driveUploadFolderId: '1fZcLxq0S_yIceB_qsA6DLUnj8lcq3HtM'
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
        // Config merged successfully - using local config.private.js
        console.log('� Using local configuration (config.private.js loaded)');
    } else {
        // Private config not available - using production defaults
        console.log('🌐 Using production configuration (GitHub Pages)');
    }
    console.log('📋 Config ready - Script URL:', window.APP_CONFIG.scriptUrl ? 'configured ✅' : 'missing ❌');
}, 100);

// Version info for debugging
console.log('📋 App Config Loaded - Version:', window.APP_CONFIG.version);

// Backward compatibility
window.PRODUCTION_CONFIG = window.APP_CONFIG;
window.CONFIG = window.APP_CONFIG; // Alias for damage-ai-test.html and other pages
