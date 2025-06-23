# 🎯 UPDATE YOUR EXISTING GOOGLE APPS SCRIPT

## 📋 Current Situation
- **Your URL**: `https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec`
- **Status**: ❌ Missing CORS headers and JSONP endpoints
- **Solution**: Update the existing script with our fixes

## 🔧 Step-by-Step Instructions

### Step 1: Open Your Google Apps Script
1. Go to [Google Apps Script Console](https://script.google.com)
2. Find your existing project with the deployment ID: `AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl`
3. Click on the project to open it

### Step 2: Replace the Code
1. **Select ALL existing code** in the editor (Ctrl+A)
2. **Delete it** 
3. **Copy the entire content** from `complete-fixed-script.gs` file
4. **Paste it** into the editor
5. **Save** the project (Ctrl+S)

### Step 3: Deploy the Updated Version
1. Click **"Deploy"** button
2. Click **"Manage deployments"**
3. Click the **⚙️ (gear icon)** next to your existing deployment
4. Click **"Edit"**
5. Change **"Version"** to **"New version"**
6. Add description: **"Added CORS headers and JSONP endpoints"**
7. Click **"Deploy"**

### Step 4: Verify the URL Stays the Same
After deployment, verify the URL is still:
`https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec`

## 🧪 Test After Deployment

### Option 1: Use url-verification-test.html
1. Open `url-verification-test.html` in browser
2. Click "Test Ping" - Should work without CORS errors
3. Click "Test JSONP" - Should work without 404 errors

### Option 2: Use complete-backend-test.html
1. Open `complete-backend-test.html` in browser
2. Click "Run All Tests"
3. All tests should pass ✅

## ✅ Expected Results

After updating the script, you should see:
- ✅ **No CORS errors** in browser console
- ✅ **Ping endpoint works** with fetch requests
- ✅ **Calendar names endpoint** returns data
- ✅ **JSONP endpoints work** (no 404 errors)
- ✅ **calendar-production.html** loads van data successfully

## ⚠️ Important Notes

1. **Don't create a new deployment** - update the existing one to keep the same URL
2. **The URL in config.js is correct** - no need to change it
3. **All frontend files will automatically use the updated backend**

## 🔍 What We Fixed

The updated script includes:
- ✅ **CORS headers** in all responses
- ✅ **doOptions()** function for preflight requests  
- ✅ **getCalendarNamesAppJsonp** endpoint (fixes 404 error)
- ✅ **Proper authentication** token validation
- ✅ **Error handling** and logging

---

**Next**: Update your Google Apps Script → Test with verification tools → Enjoy working calendar! 🎉
