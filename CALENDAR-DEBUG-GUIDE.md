# 🐛 Calendar Loading Debug Guide

## ✅ What We've Done

### 1. **Added Comprehensive Logging**
All calendar-related operations now log detailed information to the browser console:

- 📅 Load Events button click
- 📅 Settings (script URL, auth token)
- 📅 Date range being requested
- 📅 Full request URL
- 📅 JSONP callback name
- 📅 Response data structure
- 📅 Success/failure status
- ❌ Any errors with full stack traces

### 2. **Added Debug Test Button**
A new orange button "🔍 Debug: Test Calendar Endpoint" has been added to `zoko.html` (Iglohome section)

**What it does:**
- Tests the calendar endpoint directly
- Shows detailed logs in console
- Displays alert with test results
- Changes color based on result (green=success, orange=no events, red=error)

### 3. **Added Timeout Protection**
The JSONP request now has a 15-second timeout to prevent hanging

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Open `zoko.html` in your browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### Step 2: Run the Debug Test
1. Click the **🔍 Debug: Test Calendar Endpoint** button
2. Watch the console for detailed output
3. The test will show:
   - ✅ If endpoint is accessible
   - ✅ If data is returned
   - ✅ Event count
   - ❌ Any errors

### Step 3: Try Loading Events Normally
1. Select a period (Yesterday/Today/Tomorrow)
2. Click **📋 Load Events** button
3. Watch console for detailed logs

## 📊 What to Look For

### ✅ Success Indicators
```
🔍 Script URL: https://script.google.com/...
🔍 Auth Token: mySecureVanApp_2025
🔍 Test date range: 2025-11-02 to 2025-11-03
✅ JSONP Callback received!
✅ Data: {success: true, result: [...]}
🔍 Success: true
🔍 Event count: 5
```

### ❌ Common Issues

**Issue 1: "JSONP request failed"**
- Script couldn't be loaded from Google Apps Script
- Possible causes:
  - Script URL is wrong
  - Script is not deployed
  - Network issue

**Issue 2: "Invalid auth token"**
- The auth token in `config.private.js` doesn't match Google Apps Script
- Solution: Check `AUTH_TOKEN` in Script Properties

**Issue 3: "No events found"**
```json
{
  "success": true,
  "result": []
}
```
- Script is working but no events in that date range
- Try selecting a different period

**Issue 4: "No result array"**
```json
{
  "success": false,
  "error": "Error fetching vehicle data: ..."
}
```
- Vehicle data sheet issue
- Check if sheet ID is correct
- Check if sheet has proper permissions

## 🔧 Debugging Checklist

Run through these in order:

- [ ] **Test 1**: Does ping work? (Check in `settings.html` or `deployment-test.html`)
- [ ] **Test 2**: Click Debug Test button in zoko.html - what happens?
- [ ] **Test 3**: Check console logs - what errors appear?
- [ ] **Test 4**: Verify `config.private.js` has correct values:
  ```javascript
  scriptUrl: 'https://script.google.com/macros/s/AKfycby7RIyw5npOagppAl0kor5oF126QolGxwTLAAf3a7ONJLaJejMo5U8Elq5y8fY2X1b2/exec'
  authToken: 'mySecureVanApp_2025'
  ```
- [ ] **Test 5**: Verify Google Apps Script is deployed with latest code
- [ ] **Test 6**: Check if `getVehicleData()` function exists in your script

## 📝 Console Output Examples

### Successful Calendar Load
```
📅 Load Events button clicked
📅 Current period: today
📅 Settings loaded: {scriptUrl: "...", authToken: "..."}
📅 Date range: {start: "2025-11-02", end: "2025-11-02"}
📅 Request URL: https://script.google.com/...
🔄 JSONP Request starting...
🔄 Callback name: jsonpCallback1
🔄 Full URL with callback: https://...&callback=jsonpCallback1
🔄 Adding script to document head...
✅ JSONP Callback received!
✅ Data: {success: true, result: Array(5), calendars: Array(10)}
📅 ✅ Success! Events count: 5
📅 Unique calendars: ["N01 - Opel Vivaro", "N03 - Peugeot Boxer", ...]
```

### Failed Request
```
📅 Load Events button clicked
📅 Current period: today
🔄 JSONP Request starting...
❌ JSONP script load error: Error: Script load failed
❌ Failed URL: https://...
📅 ❌ Error loading events: Error: JSONP request failed - script could not be loaded
```

## 🎯 Next Steps

After running the debug test, report back with:

1. **What happened when you clicked the debug test button?**
   - ✅ Success with event count?
   - ⚠️ No events found?
   - ❌ Error message?

2. **What appears in the console?**
   - Copy and paste the full console output

3. **Screenshot of the test result** (optional but helpful)

## 💡 Quick Fixes

### If ping works but calendar doesn't:
- Script is deployed but `getCalendarEventsAppJsonp` function may have issues
- Check Google Apps Script logs

### If nothing works:
- Clear browser cache (Ctrl+F5)
- Check if `config.public.js` and `config.private.js` are loading
- Verify network tab shows the script request

### About Script Versions:
✅ **You DON'T need to tell me the URL** when deploying a new version
✅ Just deploy a new version - URL stays the same!
❌ Only tell me if you create a COMPLETELY NEW deployment

---

**Remember**: Open browser console (F12) before testing to see all the debug logs!
