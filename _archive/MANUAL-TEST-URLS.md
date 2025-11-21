# 🔗 MANUAL BACKEND TEST URLS

## Quick Test URLs (Copy and paste into browser)

### 1. Basic Ping Test
```
https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec?function=ping&authToken=myAppToken2025
```
**Expected Response:** `{"result":"Ping successful"}`

### 2. Calendar Names JSON Test
```
https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec?function=getCalendarNames&authToken=myAppToken2025
```
**Expected Response:** JSON with calendar names and data

### 3. Calendar Names JSONP Test
```
https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec?function=getCalendarNamesAppJsonp&authToken=myAppToken2025&callback=test
```
**Expected Response:** `test({"result":[...],"calendars":[...],"success":true})`

## 🔍 What Each Test Shows

### Test 1 (Ping)
- ✅ Basic script connectivity
- ✅ Authentication working
- ✅ Function parameter handling
- ✅ CORS headers present

### Test 2 (JSON)
- ✅ Calendar access permissions
- ✅ Calendar data retrieval
- ✅ JSON response formatting

### Test 3 (JSONP)
- ✅ JSONP function exists
- ✅ Callback parameter handling
- ✅ Cross-domain scripting support

## 🚨 Common Error Responses

### "Unauthorized: Invalid auth token"
- Script is working but auth token issue
- Check if `myAppToken2025` matches script

### "No function specified"
- URL parameter issue
- Ensure using `function=` not `action=`

### "Unknown function: [name]"
- Function not deployed in script
- Need to redeploy complete-fixed-script.gs

### 404 or script error
- Script not deployed or wrong URL
- Check Google Apps Script deployment

### Authorization required
- Script deployment permissions
- Redeploy with "Anyone" access

## 📋 If Tests Fail

1. **Open Google Apps Script console**
2. **Check deployment status** 
3. **Verify complete-fixed-script.gs content**
4. **Deploy as new version**
5. **Test again with URLs above**
