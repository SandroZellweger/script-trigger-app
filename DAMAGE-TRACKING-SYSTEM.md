# 🚨 Vehicle Damage Tracking System

## Overview
Complete damage tracking system integrated into your maintenance app for managing vehicle damages, repairs, and customer claims.

## ✅ What's Been Implemented

### 1. **Google Apps Script Backend** (`complete-secure-script.gs`)

#### New Configuration
```javascript
DAMAGE_SHEET_ID: '1EGs4USQz2CGAPt4T56zjmxWW4TWBWlBERctI_gjWsO0'
DAMAGE_FOLDER_ID: '1fZcLxq0S_yIceB_qsA6DLUnj8lcq3HtM'
VEHICLE_SHEET_ID: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E'
```

#### New Functions
- **`getVehicleList()`** - Fetches all vehicles from your vehicle sheet
- **`initializeDamageFolders()`** - Auto-creates a folder for each van in Google Drive
- **`reportDamage(data)`** - Creates a new damage report
- **`getDamageReports(vehicleId)`** - Retrieves all damage reports (optional filter by vehicle)
- **`updateDamageReport(data)`** - Updates existing damage report
- **`getVehicleBookings(vehicleId, startDate, endDate)`** - Gets calendar bookings for a vehicle
- All functions have JSONP wrappers for frontend compatibility

### 2. **Google Sheet Structure** (Auto-created on first damage report)

| Column | Field | Description |
|--------|-------|-------------|
| A | Report ID | Auto-generated (DMG-YYYYMMDD-###) |
| B | Date Reported | When the damage was reported |
| C | Damage Date | When the damage occurred |
| D | Vehicle | Van name |
| E | Vehicle ID | Van identifier |
| F | Description | Damage description |
| G | Reporter Name | Who reported it |
| H | Reporter Contact | Phone/Email |
| I | Responsible Party | Who caused the damage |
| J | Associated Booking | Linked booking info |
| K | Booking Contact | Customer contact |
| L | Photos/Documents | URLs to uploaded files |
| M | Damage Cost | Estimated cost |
| N | Repair Cost | Actual repair cost |
| O | Fee Claimed | Yes/No |
| P | Fee Amount | Amount charged to customer |
| Q | Status | Reported/Assessed/In Repair/Repaired/Closed |
| R | Notes | Additional notes |
| S | Created At | Timestamp |
| T | Updated At | Last modified |

### 3. **Frontend UI** (`maintenance.html`)

#### New Tab: "🚨 Damage Reports"
- View all damage reports in a sortable table
- Report new damages
- Edit existing reports
- Initialize folder structure

#### Damage Report Form Features
- **Vehicle Selection** - Dropdown of all vans
- **Date Picker** - When damage occurred
- **Description** - Detailed damage description
- **Reporter Info** - Name and contact
- **Booking Integration** - Link damage to specific calendar booking
  - Shows recent bookings (last 3 months)
  - Auto-fills responsible party from booking
- **Responsible Party** - Who caused it (customer name)
- **Financial Tracking**:
  - Estimated damage cost
  - Actual repair cost
  - Fee claimed checkbox
  - Fee amount charged
- **Status Tracking**: Reported → Assessed → In Repair → Repaired → Closed
- **Photo Upload** - Multiple photos (stored in Google Drive)
- **Additional Notes** - Insurance, mechanic details, etc.

## 📁 Google Drive Structure

After clicking "Initialize Folders", the system creates:
```
Damage Folder (1fZcLxq0S_yIceB_qsA6DLUnj8lcq3HtM)
├── Van 1 Name/
├── Van 2 Name/
├── Van 3 Name/
└── ... (one folder per van)
```

## 🚀 How to Use

### First Time Setup

1. **Deploy the Updated Apps Script**
   - Open your Google Apps Script: `https://script.google.com/home/projects/1xoNWXgkl9LY4OsFpvK2LXD4t8uVpLjB2OPNzZdYuY-b1ljx1Tdt27QmI/edit`
   - Copy the updated `complete-secure-script.gs` content
   - Click "Deploy" → "New deployment"
   - Select "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the new Web App URL
   - Update `scriptUrl` in your `maintenance.html` (localStorage or default settings)

2. **Initialize Damage Folders**
   - Open `maintenance.html`
   - Click on "🚨 Damage Reports" tab
   - Click "📁 Initialize Folders" button
   - This creates one folder per van in your Google Drive

3. **Set Up Damage Sheet**
   - The sheet headers will be created automatically on the first damage report
   - Sheet ID: `1EGs4USQz2CGAPt4T56zjmxWW4TWBWlBERctI_gjWsO0`

### Reporting a Damage

1. Click "🚨 Damage Reports" tab
2. Click "🚨 Report Damage" button
3. Fill in the form:
   - Select the vehicle
   - Choose damage date
   - Describe the damage
   - Add reporter information
   - **Optional**: Check "Link to booking" to see calendar events and associate damage with a specific rental
   - Add financial details (costs, fees)
   - Set status
   - Upload photos
4. Click "Save Report"

### Tracking Damages

- **View All**: The table shows all damage reports with key info
- **Edit**: Click the ✏️ icon to edit a report
- **View Details**: Click the 👁️ icon to see full details
- **Filter**: Use the search and filters (coming soon) to find specific reports

## 🔄 Workflow Example

1. **Customer returns van with damage**
   - Staff reports damage immediately
   - Links to customer's booking
   - Uploads photos
   - Status: "Reported"

2. **Assess damage**
   - Update report with estimated damage cost
   - Contact customer if needed
   - Status: "Assessed"

3. **Send to mechanic**
   - Add mechanic notes
   - Status: "In Repair"

4. **Repair completed**
   - Enter actual repair cost
   - Status: "Repaired"

5. **Claim fee from customer**
   - Check "Fee claimed"
   - Enter amount charged
   - Status: "Closed"

## 📊 Benefits

- **Centralized tracking** - All damages in one place
- **Financial overview** - Track repair costs and claimed fees
- **Customer accountability** - Link damages to specific bookings
- **Photo documentation** - Visual evidence of damages
- **Status tracking** - Know what's pending, in repair, or resolved
- **Historical data** - Analyze patterns (which vans have more damages, common issues, etc.)

## 🔐 Security

- All endpoints require authentication token
- Only authorized users can report/edit damages
- Photos stored securely in Google Drive with folder permissions

## 📱 Mobile Friendly

- Responsive design works on phones and tablets
- Easy photo upload from mobile camera
- Touch-friendly interface

## 🆘 Troubleshooting

### "Failed to connect to server"
- Check that you've deployed the updated Apps Script
- Verify the `scriptUrl` in settings matches your deployment

### "Calendar ID not found"
- Make sure column C in your vehicle sheet contains valid calendar IDs
- Run a test with `getVehicleList()` to verify vehicle data

### Photos not uploading
- Currently photos are Base64 encoded (works but may be slow for large files)
- Future enhancement: Direct Google Drive API upload

### Booking integration not working
- Verify calendar IDs are correct in vehicle sheet
- Check that the calendar is shared with your Apps Script account

## 🔮 Future Enhancements (Suggestions)

- Dashboard with damage statistics
- Email notifications when damage is reported
- Mobile app integration
- Automatic insurance claim generation
- Damage cost trends and analytics
- Customer damage history (repeat offenders)
- Integration with payment/billing system
- Damage report PDF export

## 📞 Next Steps

1. Deploy the updated Apps Script
2. Test with one damage report
3. Initialize folders
4. Train staff on how to use the system
5. Start tracking all damages

---

**Note**: All sensitive data (Sheet IDs, Folder IDs) are now in the configuration. The system is production-ready! 🎉
