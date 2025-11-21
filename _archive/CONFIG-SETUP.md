# Configuration Setup Guide

## 🔐 Security Notice

This project uses separate configuration files to keep sensitive data out of version control.

**IMPORTANT:** This app requires `config.private.js` to run. It will NOT work on GitHub Pages without credentials.

## Files Structure

- **`config.public.js`** ✅ Safe for GitHub - Contains only public settings
- **`config.private.js`** ⛔ NEVER commit - Contains all sensitive credentials
- **`config.google.js.example`** ✅ Template only - Shows structure, no real data

## Quick Setup

### 1. Create `config.private.js`

Copy the example structure and add your real credentials:

```javascript
window.PRIVATE_CONFIG = {
    // Google Apps Script Configuration
    scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    authToken: 'YOUR_AUTH_TOKEN',
    
    // Google Drive OAuth Configuration
    driveOauthClientId: 'YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com',
    driveUploadFolderId: 'YOUR_DRIVE_FOLDER_ID',

    // Google Sheets Configuration
    expenseSheetId: 'YOUR_EXPENSE_SHEET_ID',
    maintenanceSheetId: 'YOUR_MAINTENANCE_SHEET_ID',

    // Google Drive Picker API Configuration
    googleApiKey: 'YOUR_GOOGLE_API_KEY',
    googleClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    googleAppId: 'YOUR_APP_ID'
};

console.log('🔐 Private config loaded');

// Merge with public config
if (typeof window.APP_CONFIG !== 'undefined' && typeof mergePrivateConfig === 'function') {
    mergePrivateConfig();
}
```

### 2. Get Google Credentials

#### Google API Key (for Drive Picker)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **"CREATE CREDENTIALS"** → **"API key"**
3. Copy the key to `googleApiKey`

#### OAuth 2.0 Client ID (for Drive authentication)
1. Same page, click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **Web application**
3. Authorized JavaScript origins:
   - `http://localhost:8000`
   - `http://localhost:5500`
   - Your production domain
4. Copy the Client ID (format: `123456789-abc...xyz.apps.googleusercontent.com`)
5. Extract App ID: take the first part before hyphen (e.g., `123456789`)

#### Google Apps Script URL
1. Open your Google Apps Script project
2. Click **Deploy** → **Manage deployments**
3. Copy the web app URL
4. Add to `scriptUrl`

### 3. Verify Setup

After creating `config.private.js`, open your app and check the browser console:

✅ Expected output:
```
🔐 Private config loaded
🔐 Private config merged successfully
📋 Config ready - Script URL configured
```

❌ If you see:
```
⚠️ PRIVATE_CONFIG not loaded - sensitive data missing!
```
→ Make sure `config.private.js` exists and is loaded before `config.public.js`

## Load Order

The HTML files load configs in this order:
1. `config.private.js` (your credentials)
2. `config.public.js` (public settings + merge logic)

## What NOT to Commit

⛔ **NEVER commit these files:**
- `config.private.js` - Contains all secrets
- `config.google.js` - If you created it with real data

✅ **Safe to commit:**
- `config.public.js` - No sensitive data
- `config.google.js.example` - Template only
- `CONFIG-SETUP.md` - This guide

## Testing

Test files that need credentials:
- `maintenance-new.html` - Main app
- `test-google-drive-picker.html` - Picker standalone test
- `test-analyze-drive-invoice.html` - Drive analysis test

All these files automatically load `config.private.js` first.

## Troubleshooting

### "Script URL not configured"
→ Check that `scriptUrl` is set in `config.private.js`

### "Google API initialization failed"
→ Verify `googleApiKey` and `googleClientId` in `config.private.js`

### "OAuth 2.0 redirect URI mismatch"
→ Add your current URL to Authorized JavaScript origins in Google Console

### Config not loading
→ Open browser DevTools Console and check for JavaScript errors
→ Verify `config.private.js` exists in the same folder as HTML files
