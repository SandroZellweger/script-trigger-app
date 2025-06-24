# 🔍 How to Find and Update Your Google Apps Script

## Step-by-Step Instructions

### 1. **Open Google Apps Script Console**
   - Go to: https://script.google.com
   - Sign in with your Google account

### 2. **Find Your Existing Project**
   Your app is calling this URL:
   ```
   https://script.google.com/macros/s/AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl/exec
   ```
   
   **Look for a project with a similar deployment URL or search for:**
   - Project names like: "Calendar API", "Van Fleet", "Calendar Events"
   - Recent projects that have web app deployments

### 3. **Open the Project Editor**
   - Click on your project name
   - You'll see the Apps Script editor with your current code

### 4. **Current Code Structure**
   Your existing script probably looks something like this:
   ```javascript
   function doGet(e) {
     // Your current code here
   }
   
   function getCalendarEvents(params) {
     // Calendar fetching code
   }
   ```

### 5. **Replace with Updated Code**
   - **Select ALL existing code** (Ctrl+A)
   - **Delete it**
   - **Copy the new code** from `GOOGLE-APPS-SCRIPT-UPDATE.md`
   - **Paste it** into the editor

### 6. **Save and Deploy**
   - Click **"Save"** (💾 icon or Ctrl+S)
   - Click **"Deploy"** → **"New deployment"**
   - Type: **"Web app"**
   - Execute as: **"Me"**
   - Who has access: **"Anyone"**
   - Click **"Deploy"**

### 7. **Update Frontend (if URL changes)**
   If you get a new deployment URL, update `config.js`:
   ```javascript
   scriptUrl: 'YOUR_NEW_DEPLOYMENT_URL_HERE'
   ```

## 🚨 **Can't Find Your Script?**

If you can't locate your existing Google Apps Script:

### **Option A: Create New Script**
1. Go to https://script.google.com
2. Click **"New project"**
3. Paste the code from `GOOGLE-APPS-SCRIPT-UPDATE.md`
4. Save as "Van Fleet Calendar API"
5. Deploy as web app
6. Update the URL in your `config.js`

### **Option B: Check Google Drive**
1. Go to https://drive.google.com
2. Search for "Apps Script" or "Calendar"
3. Look for `.gs` files
4. Right-click → "Open with" → "Google Apps Script"

## 📧 **Still Need Help?**
If you're still having trouble:
1. Take a screenshot of your Google Apps Script dashboard
2. Check if you have any existing projects listed
3. The project should be in the same Google account that created the original script

The key is finding the existing script that's generating the URL:
`AKfycbz_FtmMuPSaRck2VcgJfzNvcAiCtDFoxKzcKVNZn4z5bF3GkMrVB-2kXNlTVNehQOPl`
