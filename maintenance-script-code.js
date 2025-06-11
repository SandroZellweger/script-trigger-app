/**
 * Google Apps Script functions for the Maintenance Tracker
 * Add these functions to your existing Google Apps Script project
 */

// Function to get maintenance data from the spreadsheet
function getMaintenanceData(e) {
  try {
    // Verify auth token
    if (e.parameter.authToken !== 'myAppToken2025') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid authentication token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet ID from the request
    const sheetId = e.parameter.sheetId;
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet ID is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet and get the maintenance sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const maintenanceSheet = spreadsheet.getSheetByName('Maintenance') || spreadsheet.getSheets()[0];
    
    // Get all data from the sheet
    const data = maintenanceSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Create an array of maintenance records
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const record = {};
      
      // Map each column to its header
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      
      // Skip deleted records
      if (record.isDeleted) continue;
      
      // Format dates if they exist
      if (record.dueDate instanceof Date) {
        record.dueDate = Utilities.formatDate(record.dueDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      if (record.completedDate instanceof Date) {
        record.completedDate = Utilities.formatDate(record.completedDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      records.push(record);
    }
    
    // Get unique vehicles for the dropdown
    const vehicles = [...new Set(records.map(record => record.vehicle))].filter(Boolean);
    
    // Return the data as JSON
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      records: records,
      vehicles: vehicles
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to save a maintenance record
function saveMaintenanceRecord(e) {
  try {
    // Verify auth token
    if (e.parameter.authToken !== 'myAppToken2025') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid authentication token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet ID from the request
    const sheetId = e.parameter.sheetId;
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet ID is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the request payload
    const payload = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet and get the maintenance sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const maintenanceSheet = spreadsheet.getSheetByName('Maintenance') || spreadsheet.getSheets()[0];
    
    // Get all data from the sheet
    const data = maintenanceSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Check if the record exists
    let recordIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === payload.id) {
        recordIndex = i;
        break;
      }
    }
    
    // If the record exists, update it
    if (recordIndex !== -1) {
      // If marked for deletion, just set isDeleted flag
      if (payload.isDeleted) {
        maintenanceSheet.getRange(recordIndex + 1, headers.indexOf('isDeleted') + 1).setValue(true);
      } else {
        // Update each field in the record
        for (const key in payload) {
          const columnIndex = headers.indexOf(key);
          if (columnIndex !== -1) {
            maintenanceSheet.getRange(recordIndex + 1, columnIndex + 1).setValue(payload[key]);
          }
        }
      }
    } 
    // If the record doesn't exist, create a new one
    else {
      // Create a new row with the correct values in each column
      const newRow = headers.map(header => {
        if (header === 'timestamp') {
          return new Date();
        }
        return payload[header] || '';
      });
      
      // Add the new row to the sheet
      maintenanceSheet.appendRow(newRow);
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to get cleaning data from the spreadsheet
function getCleaningData(e) {
  try {
    // Verify auth token
    if (e.parameter.authToken !== 'myAppToken2025') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid authentication token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet ID from the request
    const sheetId = e.parameter.sheetId;
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet ID is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet and get the cleaning sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const cleaningSheet = spreadsheet.getSheetByName('Cleaning') || spreadsheet.getSheets()[0];
    
    // Get all data from the sheet
    const data = cleaningSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Create an array of cleaning records
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const record = {};
      
      // Map each column to its header
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      
      // Skip deleted records
      if (record.isDeleted) continue;
      
      // Format dates if they exist
      if (record.date instanceof Date) {
        record.date = Utilities.formatDate(record.date, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      if (record.completedDate instanceof Date) {
        record.completedDate = Utilities.formatDate(record.completedDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      records.push(record);
    }
    
    // Return the data as JSON
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: records
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to save a new cleaning record or update an existing one
function saveCleaningRecord(e) {
  try {
    // Verify auth token
    if (e.parameter.authToken !== 'myAppToken2025') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid authentication token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the sheet ID from the request
    const sheetId = e.parameter.sheetId;
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet ID is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the record data from the request
    const recordData = JSON.parse(e.parameter.data);
    if (!recordData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Record data is required'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet and get the cleaning sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    let cleaningSheet = spreadsheet.getSheetByName('Cleaning');
    
    // If the sheet doesn't exist, create it with headers
    if (!cleaningSheet) {
      cleaningSheet = spreadsheet.insertSheet('Cleaning');
      const headers = ['id', 'timestamp', 'vehicle', 'cleaningType', 'date', 'time', 'assignedTo', 'status', 'completedDate', 'notes', 'isDeleted'];
      cleaningSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Get all data from the sheet to find the record or add a new one
    const data = cleaningSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Check if this is an update or a new record
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === recordData.id) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    // Create a new record if id doesn't exist or generate a new ID
    if (rowIndex === -1) {
      // Generate a new ID if not provided
      if (!recordData.id) {
        recordData.id = 'clean_' + new Date().getTime();
      }
      
      // Set timestamp for new records
      recordData.timestamp = new Date();
      
      // Add a new row at the end
      rowIndex = data.length + 1;
    }
    
    // Create a row array with the values in the correct order
    const rowData = [];
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (header === 'isDeleted' && recordData[header] === undefined) {
        rowData.push(false); // Default isDeleted to false
      } else {
        rowData.push(recordData[header] !== undefined ? recordData[header] : '');
      }
    }
    
    // Update the sheet with the new or updated record
    cleaningSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    
    // Return success with the updated record
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: recordData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Update the main doGet function to include the new maintenance functions
function doGet(e) {
  try {
    // Verify auth token (unless this is a ping)
    if (e.parameter.function !== 'ping' && e.parameter.authToken !== 'myAppToken2025') {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Invalid authentication token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle different functions
    let result;
    switch (e.parameter.function) {
      case 'ping':
        result = { result: true, message: 'API is online' };
        break;
        
      case 'sendHowToBookMessageApp':
        const phoneNumber = e.parameter.phoneNumber;
        result = sendHowToBookMessageApp(phoneNumber);
        break;
        
      case 'sendDatiMultigiornoApp':
        const datiPhoneNumber = e.parameter.phoneNumber; // Fixed: using e.parameter instead of params
        result = sendDatiMultigiornoApp(datiPhoneNumber);
        break;
        
      case 'getMaintenanceData':
        return getMaintenanceData(e);
        
      case 'saveMaintenanceRecord':
        return saveMaintenanceRecord(e);
        
      case 'getCleaningData':
        return getCleaningData(e);
        
      case 'saveCleaningRecord':
        return saveCleaningRecord(e);
        
      // Add other functions as needed
        
      default:
        result = { error: 'Unknown function' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
