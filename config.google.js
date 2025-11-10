// Google Drive Picker Configuration
// Configurazione per utilizzare Google Drive Picker nell'app

window.GOOGLE_CONFIG = {
    // Google API Key (per accesso pubblico alle API)
    googleApiKey: 'AIzaSyCqF0sdLZCF0ASr_LWqN5VGV-psvXOLIoo',
    
    // Google OAuth 2.0 Client ID (sostituisci con il tuo dopo averlo creato)
    // Formato: 123456789-abc123def456.apps.googleusercontent.com
    googleClientId: '552211122555-ar7v9jb2b2gbs4o6nafph3b0599v9frj.apps.googleusercontent.com',
    
    // Google App ID (prima parte del Client ID, prima del trattino)
    // Esempio: se Client ID è "123456789-abc.apps.googleusercontent.com"
    // allora App ID è "123456789"
    googleAppId: '552211122555'
};

// Merge con configurazione esistente
if (window.PUBLIC_CONFIG) {
    window.PUBLIC_CONFIG = {
        ...window.PUBLIC_CONFIG,
        ...window.GOOGLE_CONFIG
    };
    console.log('✅ Google Drive Picker config loaded');
} else {
    window.PUBLIC_CONFIG = window.GOOGLE_CONFIG;
}
