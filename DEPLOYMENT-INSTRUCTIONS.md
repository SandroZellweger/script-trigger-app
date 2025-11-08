# 🚀 BACKEND DEPLOYMENT GUIDE

## ❗ PROBLEM
Your frontend is calling `getMaintenancePhotoBase64Jsonp` but this function doesn't exist in your deployed Google Apps Script yet.

**Error**: `Unknown function: getMaintenancePhotoBase64Jsonp`

## ✅ SOLUTION: Deploy the Backend Functions

### Step 1: Copy the Functions
1. Open `MAINTENANCE-FUNCTIONS-TO-ADD.gs` in VS Code
2. Press `Ctrl+A` to select all (789 lines)
3. Press `Ctrl+C` to copy

### Step 2: Open Google Apps Script
1. Go to: https://script.google.com/home
2. Find your project: **"complete-secure-script"** or similar
3. Click to open it
4. You should see your main `.gs` file

### Step 3: Paste at the End
1. **Scroll to the very bottom** of your existing code
2. Add a new line
3. Press `Ctrl+V` to paste all 789 lines
4. The new functions will appear after your existing code

### Step 4: Save
1. Press `Ctrl+S` or click the floppy disk icon
2. Wait for "Saving..." to complete
3. Check for any red error markers (there shouldn't be any)

### Step 5: Deploy New Version
1. Click **"Distribuisci"** (Deploy) in the top right
2. Select **"Gestisci distribuzioni"** (Manage deployments)
3. Click the **✏️ pencil icon** next to your active deployment
4. In the "Versione" dropdown, select **"Nuova versione"** (New version)
5. Add description: `Added maintenance photo retrieval and reporting functions`
6. Click **"Distribuisci"** (Deploy)
7. Wait for "Deployment successful" message

### Step 6: Test
1. Go back to your maintenance page (https://sandrozellweger.github.io/...)
2. Press `Ctrl+F5` to hard refresh (clear cache)
3. Try generating a PDF again
4. Check console - you should see:
   ```
   📦 Backend response received: {success: true, dataUrl: "data:image/jpeg;base64,..."}
   ✅ Photo loaded successfully: 1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G
   ```

## 📋 Functions Being Added

These 10 functions will be added to your backend:

1. `getVehicleListWithKm()` - Get vehicles with KM data
2. `getVehicleListWithKmJsonp()` - JSONP wrapper
3. `analyzeMaintenanceIssue()` - AI analysis of maintenance issues
4. `analyzeMaintenanceIssueJsonp()` - JSONP wrapper
5. `uploadMaintenancePhoto()` - Upload photos to Drive
6. `uploadMaintenancePhotoJsonp()` - JSONP wrapper
7. **`getMaintenancePhotoBase64()`** - ⭐ **The critical one for PDFs**
8. **`getMaintenancePhotoBase64Jsonp()`** - ⭐ **The one that's missing**
9. `saveMaintenanceReport()` - Save reports to Sheets
10. `saveMaintenanceReportJsonp()` - JSONP wrapper
11. `getActiveMaintenanceReports()` - Get active reports
12. `getActiveMaintenanceReportsJsonp()` - JSONP wrapper
13. `getMaintenanceHistory()` - Get completed reports
14. `getMaintenanceHistoryJsonp()` - JSONP wrapper
15. `updateIssueStatus()` - Mark issues complete
16. `updateIssueStatusJsonp()` - JSONP wrapper

## 🔍 Verification Checklist

After deployment, verify:

- [ ] No errors when saving in Apps Script
- [ ] New version deployed successfully
- [ ] Frontend hard-refreshed (Ctrl+F5)
- [ ] Console shows "📦 Backend response received" with success:true
- [ ] Console shows "✅ Photo loaded successfully"
- [ ] PDF downloads with photos embedded
- [ ] No CORS errors in console
- [ ] No "Unknown function" errors

## ⚠️ Common Issues

### Issue 1: "Function already exists"
**Solution**: The function is already in your script. Skip pasting and just deploy a new version.

### Issue 2: "Syntax error" after pasting
**Solution**: Make sure you pasted at the END of the file, not in the middle of another function.

### Issue 3: Still showing "Unknown function" after deployment
**Solution**: 
1. Check you deployed the correct project (the one with the URL in config.public.js)
2. Make sure you created a NEW VERSION (not just saved)
3. Hard refresh your page (Ctrl+F5)
4. Check browser console for the Request URL - make sure it matches your deployment URL

### Issue 4: "MAINTENANCE_SHEET_ID not configured"
**Solution**: You need to add this property:
1. In Apps Script, go to Project Settings (⚙️ icon on left)
2. Scroll to "Script Properties"
3. Add property: `MAINTENANCE_SHEET_ID` = `YOUR_SHEET_ID`
4. Deploy new version

## 📞 Need Help?

If you're stuck:
1. Copy the exact error message from console
2. Check which step you're on
3. Verify the deployment URL matches config.public.js
4. Check if other backend functions (like vehicle list) are working

## ✨ After Successful Deployment

Once working, you'll see:
- Photos loading in PDF wizard summary
- Console logs showing successful photo retrieval
- Generated PDFs with embedded photos
- No CORS or "Unknown function" errors

The system will automatically:
- Cache photos to avoid redundant downloads
- Extract Drive IDs from URLs if needed
- Handle missing photos gracefully
- Show loading progress for each photo
