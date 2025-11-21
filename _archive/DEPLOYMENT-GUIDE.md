# Google Apps Script Deployment Guide

## Step 1: Deploy the Ultra-Minimal Script

1. Go to [script.google.com](https://script.google.com)
2. Open your existing project or create a new one
3. Copy the contents of `ultra-minimal-script.gs` into the script editor
4. Save the project (Ctrl+S)
5. Click "Deploy" → "New deployment"
6. Set type to "Web app"
7. Set access to "Anyone" (important for CORS)
8. Click "Deploy"
9. Copy the deployment URL that looks like: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`

## Step 2: Test the Ultra-Minimal Script

1. Open `ultra-minimal-test.html`
2. Replace `PASTE_YOUR_DEPLOYMENT_URL_HERE` with your deployment URL
3. Open the file in a browser
4. Click "Test Basic" button
5. Check if you get a successful JSON response

## Step 3: Update Main Script (if ultra-minimal test works)

1. Copy the contents of `fixed-main-script.gs` into your Google Apps Script project
2. Make sure Calendar API is enabled
3. Deploy a new version
4. Update all HTML files with the new deployment URL

## Expected Success Response:
```json
{
  "status": "success", 
  "message": "Script is working",
  "timestamp": "2025-01-XX...",
  "parameters": {...}
}
```

## If You Get CORS Errors:
- Make sure deployment access is set to "Anyone"
- Try a hard refresh (Ctrl+F5)
- Check browser console for detailed error messages
