# 🚨 URGENT: Google Apps Script Needs Redeployment

## ❌ Current Problem

Your application is failing with CORS errors because:
1. The Google Apps Script code has been updated (in `complete-secure-script.gs`)
2. But it hasn't been **redeployed** with a new version

## ✅ Solution: Redeploy Your Script

### Step-by-Step Instructions:

1. **Open Google Apps Script Editor**
   - Go to: https://script.google.com
   - Open your project containing `complete-secure-script.gs`

2. **Verify the Code is Up-to-Date**
   - Make sure your script has the `getVehicleData()` function
   - Check that `AUTH_TOKEN` default is `'mySecureVanApp_2025'`
   - Confirm the CORS headers are set with wildcard `'*'`

3. **Deploy as New Version**
   - Click **Deploy** → **Manage deployments**
   - Click **✏️ Edit** on your existing deployment
   - Under "Version", select **"New version"**
   - Add description: "Updated with dynamic vehicle data and correct auth token"
   - Click **Deploy**

4. **Verify New URL (Should Stay the Same)**
   - Your URL should still be: `https://script.google.com/macros/s/AKfycby7RIyw5npOagppAl0kor5oF126QolGxwTLAAf3a7ONJLaJejMo5U8Elq5y8fY2X1b2/exec`
   - If URL changed, update `config.private.js`

5. **Test the Deployment**
   ```bash
   # Test ping endpoint
   curl "https://script.google.com/macros/s/AKfycby7RIyw5npOagppAl0kor5oF126QolGxwTLAAf3a7ONJLaJejMo5U8Elq5y8fY2X1b2/exec?function=ping&authToken=mySecureVanApp_2025"
   
   # Expected response:
   {"result":"Ping successful"}
   ```

## 🔧 What Was Fixed in the Code

### 1. **All HTML Files Updated**
- ✅ `index.html` - Updated fallback URLs and auth token
- ✅ `zoko.html` - Updated for calendar loading
- ✅ `calendar.html` - Updated fallback URLs
- ✅ `maintenance.html` - Updated fallback URLs
- ✅ `expenses.html` - Updated fallback URLs
- ✅ `crm.html` - Updated fallback URLs
- ✅ `cleaning-vans.html` - Updated fallback URLs
- ✅ `reports.html` - Updated fallback URLs
- ✅ All calendar test files updated

### 2. **Centralized Configuration**
- ✅ `config.private.js` - Contains correct script URL and auth token
- ✅ `config.public.js` - Loads private config automatically
- ✅ All pages now reference `window.APP_CONFIG` first, then fall back

### 3. **Google Apps Script Updates**
- ✅ `getVehicleData()` - Fetches vehicle data from Google Sheet
- ✅ `getCalendarEventsApp()` - Uses dynamic vehicle data
- ✅ `getVehicleAddresses()` - New API endpoint
- ✅ Auth token changed to `mySecureVanApp_2025`

## 📋 Current Configuration

```javascript
// config.private.js
scriptUrl: 'https://script.google.com/macros/s/AKfycby7RIyw5npOagppAl0kor5oF126QolGxwTLAAf3a7ONJLaJejMo5U8Elq5y8fY2X1b2/exec'
authToken: 'mySecureVanApp_2025'
vehicleDataSheetId: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E'
```

## 🎯 After Deployment

Once deployed, these features will work:

1. **✅ Calendar Loading in zoko.html**
   - Dynamic vehicle data from Google Sheet
   - Only vehicles starting with "N" displayed
   
2. **✅ No More CORS Errors**
   - Proper CORS headers in Google Apps Script
   - All endpoints accessible from GitHub Pages

3. **✅ Centralized Configuration**
   - One place to change URLs (`config.private.js`)
   - All pages automatically use updated values

## ⚠️ Common Deployment Issues

### Issue: "Authorization required"
**Solution**: Make sure deployment is set to "Anyone" can execute

### Issue: CORS still failing
**Solution**: 
1. Clear browser cache (Ctrl+F5)
2. Check that new version was deployed
3. Verify CORS headers in script code

### Issue: Calendar not loading
**Solution**:
1. Check that `getVehicleData()` function exists in script
2. Verify vehicle data sheet ID is correct
3. Test endpoint directly with curl command above

## 🚀 Quick Test Checklist

After deployment, test these:

- [ ] `index.html` - Main page loads without CORS errors
- [ ] `zoko.html` - Calendar displays with events
- [ ] Ping endpoint responds successfully
- [ ] Vehicle addresses API works
- [ ] No console errors in browser

---

**Remember**: The code is updated, but Google Apps Script needs to be **redeployed** for changes to take effect!
