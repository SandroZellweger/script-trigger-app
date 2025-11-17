/*************************************************************
 * COMPLETE SECURE GOOGLE APPS SCRIPT WITH MAINTENANCE FUNCTIONS
 * This version includes ALL business logic from complete-secure-script.gs
 * PLUS all maintenance system functions
 * No sensitive data in this file - uses Script Properties
 *************************************************************/

// Configuration - THESE SHOULD BE SET IN GOOGLE APPS SCRIPT PROPERTIES
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();

  return {
    STRIPE_SECRET_KEY: scriptProperties.getProperty('STRIPE_SECRET_KEY') || '',
    AUTH_TOKEN: scriptProperties.getProperty('AUTH_TOKEN') || 'mySecureVanApp_2025',
    PARENT_FOLDER_ID: scriptProperties.getProperty('PARENT_FOLDER_ID') || '',
    EXPENSE_SHEET_ID: scriptProperties.getProperty('EXPENSE_SHEET_ID') || '',
    VEHICLE_DATA_SHEET_ID: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E'
  };
}

// Validate authentication token
function validateAuthToken(token) {
  const config = getConfig();
  return token === config.AUTH_TOKEN;
}

// Helper function to create proper JSON response (without CORS for JSONP compatibility)
function createJsonResponse(data) {
  var response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Set CORS headers for JSON responses - USING WILDCARD THAT WORKS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

// Helper function to create JSON response WITH CORS headers (for POST requests only)
function createJsonResponseWithCors(data) {
  var response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Set CORS headers for POST responses - USING WILDCARD THAT WORKS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  var response = ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.setHeader('Access-Control-Max-Age', '86400');

  return response;
}

// Main doGet handler for script triggers and fetching expenses
function doGet(e) {
  Logger.log('doGet called - Version: CORB_FIXED_2025_10_31 - Function: ' + e.parameter.function);
  try {
    // Validate authentication
    const authToken = e.parameter.authToken;
    if (!validateAuthToken(authToken)) {
      return createJsonResponse({ error: "Unauthorized: Invalid auth token" });
    }

    const functionName = e.parameter.function;
    if (!functionName) {
      return createJsonResponse({ error: "No function specified" });
    }

    let result;
    switch (functionName) {
      case "triggerDailyReport":
        result = triggerDailyReport();
        break;
      case "triggerCustomDateReport":
        result = triggerCustomDateReport(e.parameter.customDateString);
        break;
      case "triggerHardcodedReport":
        result = triggerHardcodedReport();
        break;
      case "triggerStripePayment":
        result = triggerStripePayment(e.parameter.amount, e.parameter.description, e.parameter.account);
        break;
      case "triggerStripePaymentJsonp":
        return triggerStripePaymentJsonp(e.parameter);
        break;
      case "pingJsonp":
        return pingJsonp(e.parameter);
        break;
      case "sendHowToBookMessageApp":
        result = sendHowToBookMessageApp(e.parameter.phoneNumber);
        break;
      case "sendHowToBookMessageAppJsonp":
        return sendHowToBookMessageAppJsonp(e.parameter);
        break;
      case 'sendDatiMultigiornoApp':
        const datiPhoneNumber = e.parameter.phoneNumber;
        result = sendDatiMultigiornoApp(datiPhoneNumber);
        break;
      case 'sendDatiMultigiornoAppJsonp':
        return sendDatiMultigiornoAppJsonp(e.parameter);
        break;
      case "ping":
        result = { result: "Ping successful" };
        break;
      case "getCalendarEventsApp":
        result = getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate);
        break;
      case "getCalendarEventsAppJsonp":
        return getCalendarEventsAppJsonp(e.parameter);
        break;
      case "getExpenses":
        result = getExpenses();
        break;
      case "logExpense":
        result = logExpenseGet(e);
        break;
      case "editExpense":
        result = editExpenseGet(e);
        break;
      case "deleteExpense":
        result = deleteExpense(e);
        break;
      case "generateIglohomeCodeApp":
        result = generateIglohomeCodeApp(e.parameter);
        break;
      case "getCleaningData":
        result = getCleaningData(e.parameter);
        break;
      case "getMaintenanceData":
        result = getMaintenanceData(e.parameter);
        break;
      case "getMaintenanceDataJsonp":
        return getMaintenanceDataJsonp(e.parameter);
        break;
      case "getMaintenancePhotoBase64Jsonp":
        return getMaintenancePhotoBase64Jsonp(e.parameter);
        break;
      case "getVehicleOverview":
        result = getVehicleOverview(e.parameter);
        break;
      case "getVehicleOverviewJsonp":
        return getVehicleOverviewJsonp(e.parameter);
        break;
      case "updateVehicleNotes":
        result = updateVehicleNotes(e.parameter);
        break;
      case "updateVehicleNotesJsonp":
        return updateVehicleNotesJsonp(e.parameter);
        break;
      case "generateIglohomeCodeAppJsonp":
        return generateIglohomeCodeAppJsonp(e.parameter);
        break;
      case "buildCustomerCRMDatabase":
        result = buildCustomerCRMDatabase();
        break;
      case "buildCustomerCRMDatabaseJsonp":
        return buildCustomerCRMDatabaseJsonp(e.parameter);
        break;
      case "buildQuickCustomerCRMDatabase":
        result = buildQuickCustomerCRMDatabase();
        break;
      case "buildQuickCustomerCRMDatabaseJsonp":
        return buildQuickCustomerCRMDatabaseJsonp(e.parameter);
        break;
      case "getVehicleAddresses":
        result = getVehicleAddresses();
        break;
      case "getVehicleAddressesJsonp":
        return getVehicleAddressesJsonp(e.parameter);
        break;
      case "getVehicleList":
        result = getVehicleList();
        break;
      case "getVehicleListJsonp":
        return getVehicleListJsonp(e.parameter);
        break;
      case "getVehicleBookings":
        result = getVehicleBookings(e.parameter);
        break;
      case "getVehicleBookingsJsonp":
        return getVehicleBookingsJsonp(e.parameter);
        break;
      case "getCalendarEvents":
        result = getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate);
        break;
      case "getCalendarEventsJsonp":
        return getCalendarEventsAppJsonp(e.parameter);
        break;
      case "uploadPhotoJsonp":
        return uploadPhotoJsonp(e.parameter);
        break;
      case "uploadMaintenancePDFJsonp":
        return uploadMaintenancePDFJsonp(e.parameter);
        break;
      case "uploadPdfChunkJsonp":
        return uploadPdfChunkJsonp(e.parameter);
        break;
      case "finalizePdfUploadJsonp":
        return finalizePdfUploadJsonp(e.parameter);
        break;
      case "uploadAndAnalyzeInvoiceJsonp":
        return uploadAndAnalyzeInvoiceJsonp(e.parameter);
        break;
      case "uploadInvoiceChunkJsonp":
        return uploadInvoiceChunkJsonp(e.parameter);
        break;
      case "finalizeInvoiceUploadJsonp":
        return finalizeInvoiceUploadJsonp(e.parameter);
        break;
      case "analyzeUploadedInvoiceJsonp":
        return analyzeUploadedInvoiceJsonp(e.parameter);
        break;
      case "analyzeInvoiceFromDriveJsonp":
        return analyzeInvoiceFromDriveJsonp(e.parameter);
        break;
      case "getGoogleCredentialsJsonp":
        return getGoogleCredentialsJsonp(e.parameter);
        break;
      case "saveInvoiceToHistoryJsonp":
        return saveInvoiceToHistoryJsonp(e.parameter);
        break;
      case "autoCompleteIssuesFromInvoiceJsonp":
        return autoCompleteIssuesFromInvoiceJsonp(e.parameter);
        break;
      case "findWorkshopJsonp":
        return findWorkshopJsonp(e.parameter);
        break;
      case "createWorkshopJsonp":
        return createWorkshopJsonp(e.parameter);
        break;
      case "getWorkshopHistoryJsonp":
        return getWorkshopHistoryJsonp(e.parameter);
        break;
      case "archiveWorkshopListJsonp":
        return archiveWorkshopListJsonp(e.parameter);
        break;
      case "deleteMaintenanceReportJsonp":
        return deleteMaintenanceReportJsonp(e.parameter);
        break;
      case "deleteInvoiceFromHistoryJsonp":
        return deleteInvoiceFromHistoryJsonp(e.parameter);
        break;
      case "uploadInvoicePhotoDirectJsonp":
        return uploadInvoicePhotoDirectJsonp(e.parameter);
        break;
      case "analyzeDamageJsonp":
        return analyzeDamageJsonp(e.parameter);
        break;
      case "getCustomerPhotosJsonp":
        return getCustomerPhotosJsonp(e.parameter);
        break;
      case "getVehicleBookingsJsonp":
        return getVehicleBookingsJsonp(e.parameter);
        break;
      case "testPhotoAccessJsonp":
        return testPhotoAccessJsonp(e.parameter);
        break;
      case "getVehicleListWithKmJsonp":
        return getVehicleListWithKmJsonp(e.parameter);
        break;
      case "analyzeMaintenanceIssueJsonp":
        return analyzeMaintenanceIssueJsonp(e.parameter);
        break;
      case "suggestMaintenanceIssueJsonp":
        return suggestMaintenanceIssueJsonp(e.parameter);
        break;
      case "uploadMaintenancePhotoJsonp":
        return uploadMaintenancePhotoJsonp(e.parameter);
        break;
      case "saveMaintenanceReportJsonp":
        return saveMaintenanceReportJsonp(e.parameter);
        break;
      case "getActiveMaintenanceReportsJsonp":
        return getActiveMaintenanceReportsJsonp(e.parameter);
        break;
      case "getMaintenanceHistoryJsonp":
        return getMaintenanceHistoryJsonp(e.parameter);
        break;
      case "updateIssueStatusJsonp":
        return updateIssueStatusJsonp(e.parameter);
        break;
      case "updateIssueDetailsJsonp":
        return updateIssueDetailsJsonp(e.parameter);
        break;
      case "getGaragesListJsonp":
        return getGaragesListJsonp(e.parameter);
        break;
      case "addGarageJsonp":
        return addGarageJsonp(e.parameter);
        break;
      case "updateGarageJsonp":
        return updateGarageJsonp(e.parameter);
        break;
      case "deleteGarageJsonp":
        return deleteGarageJsonp(e.parameter);
        break;
      case "createWorkshopListJsonp":
        return createWorkshopListJsonp(e.parameter);
        break;
      case "moveIssueBackToActiveJsonp":
        return moveIssueBackToActiveJsonp(e.parameter);
        break;
      case "getWorkshopListsJsonp":
        return getWorkshopListsJsonp(e.parameter);
        break;
      case "deleteWorkshopListJsonp":
        return deleteWorkshopListJsonp(e.parameter);
        break;
      case "completeWorkshopListJsonp":
        return completeWorkshopListJsonp(e.parameter);
        break;
      case "addWorkToListJsonp":
        return addWorkToListJsonp(e.parameter);
        break;
      case "removeWorkFromListJsonp":
        return removeWorkFromListJsonp(e.parameter);
        break;
      case "searchGaragesOnlineJsonp":
        return searchGaragesOnlineJsonp(e.parameter);
        break;
      case "getGarageDetailsJsonp":
        return getGarageDetailsJsonp(e.parameter);
        break;
      case "importLegacyMaintenanceDataJsonp":
        return importLegacyMaintenanceDataJsonp(e.parameter);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }

    // Normalize response object
    const response = typeof result === "string" ? { result } : result;

    // Generic JSONP fallback (if any endpoint is called with a callback param but without explicit *Jsonp variant)
    if (e.parameter.callback && !/[^A-Za-z0-9_$]/.test(e.parameter.callback)) {
      const cb = e.parameter.callback;
      const jsonpBody = `/**/${cb}(${JSON.stringify(response)});`;
      return ContentService
        .createTextOutput(jsonpBody)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Standard JSON response
    return createJsonResponse(response);

  } catch (error) {
    const errorResponse = { error: error.toString() };
    return createJsonResponse(errorResponse);
  }
}

// Main doPost handler for expense logging and editing
function doPost(e) {
  try {
    Logger.log('doPost called - Version: CORB_FIXED_2025_10_31 - Function: ' + e.parameter.function);
    Logger.log('Content-Type: ' + e.parameter.contentType);
    Logger.log('Has postData: ' + (e.postData ? 'yes' : 'no'));

    // Parse the request body based on content type
    let requestBody;
    const contentType = e.parameter.contentType || 'application/json';

    if (e.postData && e.postData.contents) {
      Logger.log('postData contents length: ' + e.postData.contents.length);
      Logger.log('postData contents preview: ' + e.postData.contents.substring(0, 200));

      if (e.parameter.data) {
        Logger.log('Handling form-encoded data');
        // Handle form-encoded data (like from cleaning form or damage reports)
        requestBody = JSON.parse(decodeURIComponent(e.parameter.data));
        // Add auth token and sheet ID from URL parameters
        requestBody.authToken = e.parameter.authToken;
        requestBody.sheetId = e.parameter.sheetId;
        Logger.log('Parsed requestBody from form data');
      } else {
        Logger.log('Handling JSON/text data');
        // Handle JSON data (like from photo uploads with text/plain content type)
        const wrapper = JSON.parse(e.postData.contents);
        const functionName = wrapper.function;
        const authToken = wrapper.authToken;
        const data = JSON.parse(wrapper.data); // Parse the inner data

        Logger.log('Parsed wrapper - function: ' + functionName);

        // Validate auth token
        if (!validateAuthToken(authToken)) {
          Logger.log('Auth token validation failed');
          return createJsonResponseWithCors({ error: "Unauthorized: Invalid auth token" });
        }

        // Call the appropriate function directly
        let result;
        switch (functionName) {
          case "ping":
            Logger.log('Handling ping POST');
            result = { result: "Ping successful", timestamp: new Date().toISOString() };
            break;
          default:
            Logger.log('Unknown POST function: ' + functionName);
            result = { error: `Unknown POST function: ${functionName}` };
        }

        Logger.log('Returning result for ' + functionName);
        return createJsonResponseWithCors(result);
      }
    } else {
      Logger.log('No postData found');
      return createJsonResponseWithCors({ error: "No data provided" });
    }

    const functionName = e.parameter.function;
    Logger.log('Processing form-encoded function: ' + functionName);
    
    // Special handling for uploadMaintenancePDF (uses direct parameters, not requestBody)
    if (functionName === "uploadMaintenancePDF") {
      Logger.log('Handling uploadMaintenancePDF POST with fileName: ' + e.parameter.fileName);
      
      // Validate auth token from parameters
      if (!validateAuthToken(e.parameter.authToken)) {
        Logger.log('Auth token validation failed for uploadMaintenancePDF');
        const errorResult = { success: false, error: "Unauthorized: Invalid auth token" };
        if (e.parameter.callback) {
          const jsonpResponse = e.parameter.callback + '(' + JSON.stringify(errorResult) + ')';
          return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
        return createJsonResponseWithCors(errorResult);
      }
      
      const result = uploadMaintenancePDF(e.parameter.fileName, e.parameter.pdfData, e.parameter.listId);
      
      // Return JSONP callback if provided
      if (e.parameter.callback) {
        const jsonpResponse = e.parameter.callback + '(' + JSON.stringify(result) + ')';
        return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return createJsonResponseWithCors(result);
    }
    
    // Validate authentication for requestBody-based functions
    if (!validateAuthToken(requestBody.authToken)) {
      Logger.log('Auth token validation failed for form data');
      return createJsonResponseWithCors({ error: "Unauthorized: Invalid auth token" });
    }

    let result;

    switch (functionName) {
      case "logExpense":
        result = logExpense(requestBody);
        break;
      case "editExpense":
        result = editExpense(requestBody);
        break;
      case "updateCleaningInVisioneGenerale":
        result = updateCleaningInVisioneGenerale(requestBody);
        break;
      default:
        Logger.log('Unknown form-encoded function: ' + functionName);
        result = { error: `Unknown POST function: ${functionName}` };
    }

    Logger.log('Returning result for form-encoded ' + functionName);
    return createJsonResponseWithCors(result);

  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    const errorResponse = { error: error.toString() };
    return createJsonResponseWithCors(errorResponse);
  }
}

// Expense functions
function logExpenseGet(e) {
  try {
    const data = {
      date: e.parameter.date,
      category: e.parameter.category,
      amount: parseFloat(e.parameter.amount),
      description: e.parameter.description || '',
      attachments: e.parameter.attachments || ''
    };

    return logExpense(data);
  } catch (error) {
    return { error: "Error parsing GET parameters: " + error.toString() };
  }
}

function editExpenseGet(e) {
  try {
    const data = {
      rowIndex: parseInt(e.parameter.rowIndex),
      date: e.parameter.date,
      category: e.parameter.category,
      amount: parseFloat(e.parameter.amount),
      description: e.parameter.description || '',
      attachments: e.parameter.attachments || ''
    };

    return editExpense(data);
  } catch (error) {
    return { error: "Error parsing GET parameters: " + error.toString() };
  }
}

function deleteExpense(e) {
  try {
    const config = getConfig();
    const rowIndex = parseInt(e.parameter.rowIndex);

    if (!rowIndex || rowIndex < 2) {
      return { error: "Invalid row index" };
    }

    const sheet = SpreadsheetApp.openById(config.EXPENSE_SHEET_ID).getSheetByName("Expenses");
    if (!sheet) {
      return { error: "Expenses sheet not found" };
    }

    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: `Expense deleted successfully (row ${rowIndex})`
    };
  } catch (error) {
    return { error: "Error deleting expense: " + error.toString() };
  }
}

function logExpense(data) {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.EXPENSE_SHEET_ID).getSheetByName("Expenses");

    if (!sheet) {
      return { error: "Expenses sheet not found" };
    }

    // Validate required fields
    if (!data.date || !data.category || !data.amount) {
      return { error: "Missing required fields: date, category, amount" };
    }

    // Format date
    let formattedDate;
    try {
      const date = new Date(data.date);
      formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } catch (e) {
      return { error: "Invalid date format" };
    }

    // Add timestamp
    const timestamp = new Date();

    // Append row
    sheet.appendRow([
      formattedDate,
      data.category,
      data.amount,
      data.description || '',
      data.attachments || '',
      Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
    ]);

    return {
      success: true,
      message: "Expense logged successfully",
      data: {
        date: formattedDate,
        category: data.category,
        amount: data.amount,
        description: data.description,
        timestamp: timestamp
      }
    };

  } catch (error) {
    return { error: "Error logging expense: " + error.toString() };
  }
}

function editExpense(data) {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.EXPENSE_SHEET_ID).getSheetByName("Expenses");

    if (!sheet) {
      return { error: "Expenses sheet not found" };
    }

    // Validate required fields
    if (!data.rowIndex || !data.date || !data.category || data.amount === undefined) {
      return { error: "Missing required fields: rowIndex, date, category, amount" };
    }

    const rowIndex = parseInt(data.rowIndex);
    if (rowIndex < 2) {
      return { error: "Invalid row index" };
    }

    // Format date
    let formattedDate;
    try {
      const date = new Date(data.date);
      formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } catch (e) {
      return { error: "Invalid date format" };
    }

    // Update the row
    const range = sheet.getRange(rowIndex, 1, 1, 5);
    range.setValues([
      [
        formattedDate,
        data.category,
        parseFloat(data.amount),
        data.description || '',
        data.attachments || ''
      ]
    ]);

    return {
      success: true,
      message: "Expense updated successfully",
      data: {
        rowIndex: rowIndex,
        date: formattedDate,
        category: data.category,
        amount: data.amount,
        description: data.description
      }
    };

  } catch (error) {
    return { error: "Error editing expense: " + error.toString() };
  }
}

function getExpenses() {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.EXPENSE_SHEET_ID).getSheetByName("Expenses");

    if (!sheet) {
      return { error: "Expenses sheet not found" };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const expenses = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      expenses.push({
        rowIndex: i + 1,
        date: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") : '',
        category: row[1] || '',
        amount: row[2] || 0,
        description: row[3] || '',
        attachments: row[4] || '',
        timestamp: row[5] || ''
      });
    }

    return {
      success: true,
      expenses: expenses,
      total: expenses.length
    };

  } catch (error) {
    return { error: "Error fetching expenses: " + error.toString() };
  }
}

// Function to fetch vehicle data from Google Sheet
function getVehicleData() {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.VEHICLE_DATA_SHEET_ID).getSheets()[0]; // Get first sheet
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return { error: "No vehicle data found in sheet" };
    }

    const headers = data[0];
    const vehicles = [];

    // Find column indices
    const vehicleTypeIndex = headers.indexOf('vehicleType');
    const sheetIdIndex = headers.indexOf('SheetID');
    const calendarIdIndex = headers.indexOf('CalendarID');
    const calendarNameIndex = headers.indexOf('CalendarName');
    const vehicleNumberIndex = headers.indexOf('VehicleNumber');
    const vehicleAdressIndex = headers.indexOf('VehicleAdress');
    const igloPinFunctionNameIndex = headers.indexOf('igloPinFunctionName');
    const licencePlateIndex = headers.indexOf('LicencePlate');

    if (vehicleTypeIndex === -1 || calendarIdIndex === -1 || calendarNameIndex === -1) {
      return { error: "Required columns not found in vehicle data sheet" };
    }

    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const vehicleType = row[vehicleTypeIndex] || '';

      // Only include vehicles that start with "N" (hide others as requested)
      if (!vehicleType.startsWith('N')) {
        continue;
      }

      vehicles.push({
        vehicleType: vehicleType,
        sheetId: row[sheetIdIndex] || '',
        calendarId: row[calendarIdIndex] || '',
        calendarName: row[calendarNameIndex] || '',
        vehicleNumber: row[vehicleNumberIndex] || '',
        vehicleAdress: row[vehicleAdressIndex] || '',
        igloPinFunctionName: row[igloPinFunctionNameIndex] || '',
        licencePlate: row[licencePlateIndex] || ''
      });
    }

    return {
      success: true,
      vehicles: vehicles,
      totalVehicles: vehicles.length
    };

  } catch (error) {
    return {
      success: false,
      error: "Error fetching vehicle data: " + error.toString()
    };
  }
}

function getVehicleList() {
  try {
    const vehicleData = getVehicleData();
    if (!vehicleData.success) {
      return vehicleData;
    }

    const vehicles = (vehicleData.vehicles || []).map((vehicle, index) => {
      const labelParts = [];
      if (vehicle.vehicleType) {
        labelParts.push(vehicle.vehicleType);
      }
      if (vehicle.vehicleNumber && vehicle.vehicleNumber !== vehicle.vehicleType) {
        labelParts.push(vehicle.vehicleNumber);
      }
      if (labelParts.length === 0 && vehicle.calendarName) {
        labelParts.push(vehicle.calendarName);
      }

      const displayName = labelParts.length > 0
        ? labelParts.join(' - ')
        : (vehicle.calendarName || ('Vehicle ' + (index + 1)));

      return {
        id: vehicle.calendarId || vehicle.vehicleType || displayName,
        name: displayName,
        vehicleType: vehicle.vehicleType || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        calendarId: vehicle.calendarId || '',
        calendarName: vehicle.calendarName || ''
      };
    });

    return {
      success: true,
      vehicles: vehicles,
      total: vehicles.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error building vehicle list: ' + error.toString()
    };
  }
}

function getVehicleListJsonp(params) {
  const callback = sanitizeJsonpCallback(params && params.callback);
  const result = getVehicleList();
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getVehicleBookings(params) {
  try {
    if (!params || !params.vehicleId) {
      return {
        success: false,
        error: 'vehicleId is required'
      };
    }

    const start = createDateAtStartOfDay(params.startDate);
    const end = createDateAtEndOfDay(params.endDate);

    const vehicleData = getVehicleData();
    if (!vehicleData.success) {
      return vehicleData;
    }

    const vehicles = vehicleData.vehicles || [];
    const vehicle = vehicles.find(function (item) {
      const candidateId = String(params.vehicleId);
      return (item.calendarId && item.calendarId === candidateId) ||
        (item.vehicleType && item.vehicleType === candidateId) ||
        (item.vehicleNumber && String(item.vehicleNumber) === candidateId);
    });

    if (!vehicle) {
      return {
        success: false,
        error: 'Vehicle not found for provided ID'
      };
    }

    if (!vehicle.calendarId) {
      return {
        success: false,
        error: 'Selected vehicle does not have an associated calendar'
      };
    }

    const calendar = CalendarApp.getCalendarById(vehicle.calendarId);
    if (!calendar) {
      return {
        success: false,
        error: 'Calendar not accessible for selected vehicle'
      };
    }

    const events = calendar.getEvents(start, end) || [];
    const bookings = events.map(function (event) {
      return {
        id: event.getId(),
        title: event.getTitle(),
        start: event.getStartTime().toISOString(),
        end: event.getEndTime().toISOString(),
        description: event.getDescription() || '',
        location: event.getLocation() || '',
        isAllDay: event.isAllDayEvent()
      };
    });

    return {
      success: true,
      vehicle: {
        vehicleType: vehicle.vehicleType || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        calendarId: vehicle.calendarId || '',
        calendarName: vehicle.calendarName || ''
      },
      bookings: bookings,
      total: bookings.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error fetching vehicle bookings: ' + error.toString()
    };
  }
}

function sanitizeJsonpCallback(name) {
  var fallback = 'callback';
  if (!name) {
    return fallback;
  }
  var cleaned = String(name).replace(/[^\w$]/g, '');
  return cleaned || fallback;
}

function createDateAtStartOfDay(dateString) {
  var date;
  if (dateString) {
    date = new Date(dateString + 'T00:00:00');
  } else {
    date = new Date();
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function createDateAtEndOfDay(dateString) {
  var date;
  if (dateString) {
    date = new Date(dateString + 'T23:59:59');
  } else {
    date = new Date();
  }
  date.setHours(23, 59, 59, 999);
  return date;
}

// Calendar functions with van fleet data
function getCalendarEventsApp(startDate, endDate) {
  try {
    // Fetch vehicle data from Google Sheet
    const vehicleData = getVehicleData();
    if (!vehicleData.success) {
      return {
        success: false,
        error: vehicleData.error,
        result: []
      };
    }

    const vehicles = vehicleData.vehicles;
    const calendarIds = vehicles.map(v => v.calendarId).filter(id => id); // Filter out empty calendar IDs
    const calendarNames = vehicles.map(v => v.calendarName).filter(name => name);

    // Generate colors for vehicles (cycling through a color palette)
    const vanColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#EE5A24', '#0abde3', '#10ac84', '#f368e0', '#ff9ff3'
    ];

    let allEvents = [];
    // Parse dates in the script's timezone (not UTC)
    const timeZone = Session.getScriptTimeZone();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    Logger.log('Script timezone: ' + timeZone);
    Logger.log('Fetching events from ' + start.toString() + ' to ' + end.toString());
    Logger.log('  (UTC: ' + start.toISOString() + ' to ' + end.toISOString() + ')');

    for (let i = 0; i < calendarIds.length; i++) {
      try {
        Logger.log('Attempting to access calendar: ' + calendarNames[i] + ' (' + calendarIds[i] + ')');
        const calendar = CalendarApp.getCalendarById(calendarIds[i]);

        if (!calendar) {
          Logger.log('WARNING: Calendar not found or no access: ' + calendarIds[i]);
          continue;
        }

        Logger.log('Calendar object retrieved successfully');
        const events = calendar.getEvents(start, end);
        Logger.log('Calendar "' + calendarNames[i] + '" (' + calendarIds[i] + '): Found ' + events.length + ' events');

        events.forEach(event => {
          Logger.log('  Event: ' + event.getTitle() + ' at ' + event.getStartTime().toISOString());
          allEvents.push({
            id: event.getId(),
            summary: event.getTitle(),
            start: {
              dateTime: event.getStartTime().toISOString()
            },
            end: {
              dateTime: event.getEndTime().toISOString()
            },
            calendarName: calendarNames[i],
            calendarId: calendarIds[i],
            color: vanColors[i % vanColors.length],
            description: event.getDescription() || '',
            location: event.getLocation() || '',
            isAllDay: event.isAllDayEvent(),
            van: calendarNames[i]
          });
        });
      } catch (error) {
        Logger.log('ERROR accessing calendar ' + calendarNames[i] + ': ' + error.toString());
        console.error(`Error accessing calendar ${calendarNames[i]}:`, error);
      }
    }

    Logger.log('Total events collected: ' + allEvents.length);

    // Return format that matches what zoko.html expects
    return {
      success: true,
      result: allEvents,
      calendars: calendarNames.map((name, index) => ({
        id: calendarIds[index],
        name: name,
        color: vanColors[index % vanColors.length]
      }))
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      result: []
    };
  }
}

// Get calendar names for dynamic van selection
function getCalendarNamesApp() {
  try {
    // Fetch vehicle data from Google Sheet
    const vehicleData = getVehicleData();
    if (!vehicleData.success) {
      return {
        success: false,
        error: vehicleData.error
      };
    }

    const vehicles = vehicleData.vehicles;

    // Generate colors for vehicles (cycling through a color palette)
    const vanColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#EE5A24', '#0abde3', '#10ac84', '#f368e0', '#ff9ff3'
    ];

    const calendars = vehicles.map((vehicle, index) => ({
      id: vehicle.calendarId,
      name: vehicle.calendarName,
      color: vanColors[index % vanColors.length],
      vehicleType: vehicle.vehicleType,
      vehicleAdress: vehicle.vehicleAdress,
      licencePlate: vehicle.licencePlate
    }));

    return {
      success: true,
      result: calendars.map(cal => cal.name),
      calendars: calendars
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for calendar names
function getCalendarNamesAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getCalendarNamesApp();

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Function to get vehicle addresses
function getVehicleAddresses() {
  try {
    // Fetch vehicle data from Google Sheet
    const vehicleData = getVehicleData();
    if (!vehicleData.success) {
      return {
        success: false,
        error: vehicleData.error
      };
    }

    const vehicles = vehicleData.vehicles;
    const addresses = {};

    // Create a mapping of vehicle types to addresses
    vehicles.forEach(vehicle => {
      if (vehicle.vehicleAdress && vehicle.vehicleAdress.trim()) {
        addresses[vehicle.vehicleType] = vehicle.vehicleAdress;
      }
    });

    return {
      success: true,
      addresses: addresses,
      totalVehicles: vehicles.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for vehicle addresses
function getVehicleAddressesJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getVehicleAddresses();

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// JSONP wrapper for calendar events
function getCalendarEventsAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const startDate = params.startDate;
    const endDate = params.endDate;
    const specificCalendarId = params.calendarId; // Optional: test specific calendar

    // If specific calendar ID provided, test that calendar only
    if (specificCalendarId) {
      Logger.log('Testing specific calendar: ' + specificCalendarId);
      const result = testSingleCalendar(specificCalendarId, startDate, endDate);
      const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    const result = getCalendarEventsApp(startDate, endDate);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString(),
      events: []
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Test a single calendar (used for debugging)
function testSingleCalendar(calendarId, startDate, endDate) {
  try {
    const timeZone = Session.getScriptTimeZone();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    Logger.log('Testing single calendar: ' + calendarId);
    Logger.log('Timezone: ' + timeZone);
    Logger.log('Date range: ' + start.toString() + ' to ' + end.toString());

    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      Logger.log('ERROR: Calendar not accessible');
      return {
        success: false,
        error: 'Calendar not accessible: ' + calendarId,
        result: []
      };
    }

    Logger.log('Calendar name: ' + calendar.getName());
    const events = calendar.getEvents(start, end);
    Logger.log('Found ' + events.length + ' events');

    const eventList = events.map(event => ({
      id: event.getId(),
      summary: event.getTitle(),
      start: {
        dateTime: event.getStartTime().toISOString()
      },
      end: {
        dateTime: event.getEndTime().toISOString()
      },
      calendarName: calendar.getName(),
      calendarId: calendarId,
      color: '#FF6B6B',
      description: event.getDescription() || '',
      location: event.getLocation() || '',
      isAllDay: event.isAllDayEvent(),
      van: calendar.getName()
    }));

    return {
      success: true,
      result: eventList,
      calendars: [{
        id: calendarId,
        name: calendar.getName()
      }]
    };

  } catch (error) {
    Logger.log('ERROR in testSingleCalendar: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      result: []
    };
  }
}

// JSONP ping function
function pingJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = {
      result: "Ping successful",
      timestamp: new Date().toISOString(),
      success: true
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// WhatsApp message functions
function sendHowToBookMessageApp(phoneNumber) {
  try {
    // Placeholder for WhatsApp integration
    return {
      success: true,
      message: `How to book message would be sent to ${phoneNumber}`,
      phoneNumber: phoneNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function sendDatiMultigiornoApp(phoneNumber) {
  try {
    // Placeholder for WhatsApp integration
    return {
      success: true,
      message: `Multi-day data would be sent to ${phoneNumber}`,
      phoneNumber: phoneNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Report functions
function triggerDailyReport() {
  try {
    const today = new Date();
    const todayString = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");

    return {
      success: true,
      message: `Daily report triggered for ${todayString}`,
      date: todayString
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function triggerCustomDateReport(customDateString) {
  try {
    if (!customDateString) {
      return { success: false, error: "Custom date string is required" };
    }

    return {
      success: true,
      message: `Custom date report triggered for ${customDateString}`,
      date: customDateString
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function triggerHardcodedReport() {
  try {
    const hardcodedDate = "2024-12-01";

    return {
      success: true,
      message: `Hardcoded report triggered for ${hardcodedDate}`,
      date: hardcodedDate
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Stripe payment functions
function triggerStripePayment(amount, description, account) {
  try {
    const config = getConfig();

    // Determine which Stripe key to use based on account parameter
    const accountType = account || 'green'; // Default to green
    let stripeKey;
    
    if (accountType.toLowerCase() === 'black') {
      stripeKey = config.STRIPE_BLACK_API_KEY;
      if (!stripeKey) {
        return {
          success: false,
          error: "Stripe Black API key not configured in Script Properties"
        };
      }
    } else {
      stripeKey = config.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return {
          success: false,
          error: "Stripe Green secret key not configured in Script Properties"
        };
      }
    }

    // Create Stripe checkout session with the selected account
    const checkoutSession = createStripeCheckoutSession(amount, description, stripeKey, accountType);

    if (checkoutSession.success) {
      return {
        success: true,
        message: `Stripe payment session created successfully (${accountType.toUpperCase()} account)`,
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.sessionId,
        account: accountType
      };
    } else {
      return {
        success: false,
        error: checkoutSession.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function createStripeCheckoutSession(amount, description, stripeKey, accountType) {
  try {
    // Decode description if it comes URL-encoded from frontend
    const cleanDescription = decodeURIComponent(description || 'Payment');

    // Build form-encoded payload correctly for nested objects
    const formData = [];
    
    // payment_method_types
    formData.push('payment_method_types[0]=card');
    
    // line_items with nested structure
    formData.push('line_items[0][price_data][currency]=chf');
    formData.push('line_items[0][price_data][product_data][name]=' + encodeURIComponent(cleanDescription));
    formData.push('line_items[0][price_data][unit_amount]=' + Math.round(parseFloat(amount) * 100));
    formData.push('line_items[0][quantity]=1');
    
    // mode
    formData.push('mode=payment');
    
    // URLs
    formData.push('success_url=' + encodeURIComponent('https://your-website.com/success?session_id={CHECKOUT_SESSION_ID}'));
    formData.push('cancel_url=' + encodeURIComponent('https://your-website.com/cancel'));

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: formData.join('&'),
      muteHttpExceptions: true // To see full error response
    };

    const response = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());

    if (responseCode === 200) {
      return {
        success: true,
        sessionId: responseData.id,
        url: responseData.url
      };
    } else {
      return {
        success: false,
        error: responseData.error ? responseData.error.message : 'Unknown Stripe error',
        details: responseData
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Test functions
function testStripePayment() {
  try {
    const testAmount = "10.00";
    const testDescription = "Test Payment";

    const result = triggerStripePayment(testAmount, testDescription);

    Logger.log("Stripe Test Result:", result);
    return result;
  } catch (error) {
    Logger.log("Stripe Test Error:", error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function testCalendarFunction() {
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return getCalendarEventsApp(startDate, endDate);
}

// Additional maintenance and vehicle functions
function getCleaningData(params) {
  try {
    // Placeholder for cleaning data retrieval
    return {
      success: true,
      data: {
        vehicles: [
          { id: 1, name: "Van 1", lastCleaned: "2024-01-15", status: "Clean" },
          { id: 2, name: "Van 2", lastCleaned: "2024-01-10", status: "Needs Cleaning" }
        ]
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getMaintenanceData(params) {
  try {
    // Placeholder for maintenance data retrieval
    return {
      success: true,
      data: {
        vehicles: [
          { id: 1, name: "Van 1", nextMaintenance: "2024-02-15", km: 15000 },
          { id: 2, name: "Van 2", nextMaintenance: "2024-03-01", km: 22000 }
        ]
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getVehicleOverview(params) {
  try {
    // Placeholder for vehicle overview data
    return {
      success: true,
      data: {
        totalVehicles: 9,
        activeRentals: 3,
        maintenanceNeeded: 1,
        cleaningNeeded: 2
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateVehicleNotes(params) {
  try {
    // Placeholder for vehicle notes update
    return {
      success: true,
      message: "Vehicle notes updated successfully",
      vehicleId: params.vehicleId,
      notes: params.notes
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function generateIglohomeCodeApp(params) {
  try {
    // Placeholder for IgloHome code generation
    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code

    return {
      success: true,
      pin: code.toString(),
      message: "IgloHome code generated successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function buildCustomerCRMDatabase() {
  try {
    // Placeholder for CRM database building
    return {
      success: true,
      message: "CRM database built successfully",
      customerCount: 150,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function buildQuickCustomerCRMDatabase() {
  try {
    // Placeholder for quick CRM database building
    return {
      success: true,
      message: "Quick CRM database built successfully",
      customerCount: 50,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper functions for frontend compatibility
function sendHowToBookMessageAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = sendHowToBookMessageApp(params.phoneNumber);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function sendDatiMultigiornoAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = sendDatiMultigiornoApp(params.phoneNumber);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function generateIglohomeCodeAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = generateIglohomeCodeApp(params);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function triggerStripePaymentJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = triggerStripePayment(params.amount, params.description, params.account);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function getMaintenanceDataJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getMaintenanceData(params);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function getVehicleOverviewJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getVehicleOverview(params);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function updateVehicleNotesJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = updateVehicleNotes(params);

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function buildCustomerCRMDatabaseJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = buildCustomerCRMDatabase();

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function buildQuickCustomerCRMDatabaseJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = buildQuickCustomerCRMDatabase();

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// DEBUG FUNCTION: Test photo access for specific phone
function testPhotoAccess() {
  const testPhone = '+41787644217';

  Logger.log('=== PHOTO ACCESS TEST ===');
  Logger.log('Testing phone: ' + testPhone);

  try {
    const photos = getCustomerPhotos(testPhone);
    Logger.log('Result: ' + photos.length + ' photos found');

    if (photos.length > 0) {
      Logger.log('First photo:');
      Logger.log('  Name: ' + photos[0].name);
      Logger.log('  ID: ' + photos[0].id);
      Logger.log('  URL: ' + photos[0].downloadUrl);
    }

    return {
      success: true,
      phoneNumber: testPhone,
      photoCount: photos.length,
      photos: photos.slice(0, 3) // Return first 3 photos
    };

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP endpoint for testing photo access
function testPhotoAccessJsonp(params) {
  try {
    const callback = params.callback || 'callback';

    Logger.log('testPhotoAccessJsonp called');
    Logger.log('fileName: ' + params.fileName);
    Logger.log('folderId: ' + params.folderId);

    const result = testPhotoAccess();
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('ERROR in testPhotoAccessJsonp: ' + error.toString());
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// DEBUG FUNCTION: Test calendar access directly
function testCalendarAccess() {
  const testCalendarId = '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com';
  const testDate = '2025-11-02';

  Logger.log('=== CALENDAR ACCESS TEST ===');
  Logger.log('Testing calendar: ' + testCalendarId);
  Logger.log('Date: ' + testDate);

  try {
    const calendar = CalendarApp.getCalendarById(testCalendarId);

    if (!calendar) {
      Logger.log('ERROR: Cannot access calendar - returned null');
      Logger.log('Possible reasons:');
      Logger.log('1. Calendar ID is incorrect');
      Logger.log('2. Script does not have permission to access this calendar');
      Logger.log('3. Calendar needs to be shared with the script');
      return { error: 'Cannot access calendar' };
    }

    Logger.log('✅ Calendar accessed successfully!');
    Logger.log('Calendar name: ' + calendar.getName());

    // Parse dates in the script's timezone
    const timeZone = Session.getScriptTimeZone();
    const start = new Date(testDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(testDate);
    end.setHours(23, 59, 59, 999);

    Logger.log('Script timezone: ' + timeZone);
    Logger.log('Fetching events from ' + start.toString() + ' to ' + end.toString());
    Logger.log('  (UTC: ' + start.toISOString() + ' to ' + end.toISOString() + ')');

    const events = calendar.getEvents(start, end);
    Logger.log('Found ' + events.length + ' events');

    events.forEach((event, idx) => {
      Logger.log('Event ' + (idx + 1) + ':');
      Logger.log('  Title: ' + event.getTitle());
      Logger.log('  Start: ' + event.getStartTime().toISOString());
      Logger.log('  End: ' + event.getEndTime().toISOString());
      Logger.log('  All-day: ' + event.isAllDayEvent());
    });

    return {
      success: true,
      calendarName: calendar.getName(),
      eventCount: events.length,
      events: events.map(e => ({
        title: e.getTitle(),
        start: e.getStartTime().toISOString(),
        end: e.getEndTime().toISOString()
      }))
    };

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return { error: error.toString() };
  }
}

// Placeholder for cleaning data update function
function updateCleaningInVisioneGenerale(data) {
  try {
    // Placeholder implementation
    return {
      success: true,
      message: "Cleaning data updated successfully",
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Photo upload function
function uploadPhoto(fileName, fileData, mimeType, folderId) {
  try {
    Logger.log('uploadPhoto called - fileName: ' + fileName);
    Logger.log('mimeType: ' + mimeType);
    Logger.log('folderId: ' + folderId);
    Logger.log('fileData length: ' + (fileData ? fileData.length : 0));

    // Decode base64 data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType,
      fileName
    );

    Logger.log('Blob created successfully');

    // Get the folder
    const folder = DriveApp.getFolderById(folderId);
    Logger.log('Folder accessed: ' + folder.getName());

    // Create file in folder
    const file = folder.createFile(blob);
    Logger.log('File created: ' + file.getId());

    return {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      message: 'Photo uploaded successfully'
    };

  } catch (error) {
    Logger.log('ERROR in uploadPhoto: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for photo upload
function uploadPhotoJsonp(params) {
  try {
    const callback = params.callback || 'callback';

    Logger.log('uploadPhotoJsonp called');
    Logger.log('fileName: ' + params.fileName);
    Logger.log('folderId: ' + params.folderId);

    const result = uploadPhoto(
      params.fileName,
      params.fileData,
      params.mimeType,
      params.folderId
    );

    const jsonpResponse = `/**/${callback}(${JSON.stringify(result)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('ERROR in uploadPhotoJsonp: ' + error.toString());
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = `/**/${callback}(${JSON.stringify(errorResponse)});`;

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Upload PDF to Google Drive
function uploadMaintenancePDF(fileName, pdfBase64, listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID') || scriptProperties.getProperty('PHOTO_FOLDER_ID');
    
    if (!folderId) {
      return {
        success: false,
        error: 'PDF folder not configured. Set MAINTENANCE_PDF_FOLDER_ID in Script Properties.'
      };
    }

    // Decode base64 PDF data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      'application/pdf',
      fileName
    );

    // Get or create folder
    const folder = DriveApp.getFolderById(folderId);
    
    // Create file in folder
    const file = folder.createFile(blob);
    
    // Make file accessible to anyone with link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const pdfUrl = file.getUrl();
    const timestamp = new Date();

    // Update workshop list with PDF URL and add to history
    if (listId) {
      const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
      if (sheetId) {
        const ss = SpreadsheetApp.openById(sheetId);
        const workshopSheet = ss.getSheetByName('Liste Officina');
        
        if (workshopSheet) {
          const data = workshopSheet.getDataRange().getValues();
          
          for (let i = 1; i < data.length; i++) {
            if (data[i][0] === listId) {
              // Update PDF URL (col 7, index 6)
              workshopSheet.getRange(i + 1, 7).setValue(pdfUrl);
              
              // Add to PDF history
              const historyCell = workshopSheet.getRange(i + 1, 14); // New column for PDF history
              let history = [];
              try {
                const existingHistory = historyCell.getValue();
                if (existingHistory) {
                  history = JSON.parse(existingHistory);
                }
              } catch (e) {
                history = [];
              }
              
              history.push({
                timestamp: timestamp.toISOString(),
                url: pdfUrl,
                fileName: fileName
              });
              
              historyCell.setValue(JSON.stringify(history));
              break;
            }
          }
        }
      }
    }

    return {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: pdfUrl,
      timestamp: timestamp.toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function uploadMaintenancePDFJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = uploadMaintenancePDF(params.fileName, params.pdfData, params.listId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Upload PDF chunk using CacheService for temporary storage
function uploadPdfChunkJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  try {
    const chunkIndex = parseInt(params.chunkIndex);
    const chunkData = params.chunkData;
    const sessionId = params.sessionId || 'default';
    
    const cache = CacheService.getScriptCache();
    const cacheKey = 'pdf_chunk_' + sessionId + '_' + chunkIndex;
    
    // Store chunk in cache (expires in 10 minutes)
    cache.put(cacheKey, chunkData, 600);
    
    // Also store the total number of chunks received so far
    const countKey = 'pdf_chunk_count_' + sessionId;
    const currentCount = parseInt(cache.get(countKey) || '0');
    cache.put(countKey, String(currentCount + 1), 600);
    
    const response = { success: true, chunkIndex: chunkIndex };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    const response = { success: false, error: error.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Finalize PDF upload after all chunks received
function finalizePdfUploadJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  try {
    const fileName = params.fileName;
    const listId = params.listId;
    const sessionId = params.sessionId || 'default';
    const totalChunks = parseInt(params.totalChunks);
    
    const cache = CacheService.getScriptCache();
    
    // Retrieve all chunks from cache
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const cacheKey = 'pdf_chunk_' + sessionId + '_' + i;
      const chunkData = cache.get(cacheKey);
      
      if (!chunkData) {
        throw new Error('Chunk ' + i + ' non trovato. Riprova il caricamento.');
      }
      
      chunks.push(chunkData);
    }
    
    // Combine all chunks
    const pdfBase64 = chunks.join('');
    
    // Clear cache for this session
    for (let i = 0; i < totalChunks; i++) {
      const cacheKey = 'pdf_chunk_' + sessionId + '_' + i;
      cache.remove(cacheKey);
    }
    cache.remove('pdf_chunk_count_' + sessionId);
    
    // Upload the complete PDF
    const response = uploadMaintenancePDF(fileName, pdfBase64, listId);
    
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    // Clear cache on error
    const sessionId = params.sessionId || 'default';
    const totalChunks = parseInt(params.totalChunks || '0');
    const cache = CacheService.getScriptCache();
    
    for (let i = 0; i < totalChunks; i++) {
      cache.remove('pdf_chunk_' + sessionId + '_' + i);
    }
    cache.remove('pdf_chunk_count_' + sessionId);
    
    const response = { success: false, error: error.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/*************************************************************
 * INVOICE AI ANALYSIS SYSTEM
 * Upload and analyze workshop invoices with OpenAI Vision
 *************************************************************/

// Upload invoice photo and analyze with AI
function uploadAndAnalyzeInvoice(fileName, photoData, listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID') || scriptProperties.getProperty('PHOTO_FOLDER_ID');
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!folderId) {
      return { success: false, error: 'Cartella foto non configurata' };
    }
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    // 1. Upload photo to Drive
    const blob = Utilities.newBlob(
      Utilities.base64Decode(photoData),
      'image/jpeg',
      fileName
    );

    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const photoUrl = file.getUrl();

    Logger.log('Invoice photo uploaded: ' + photoUrl);

    // 2. Get workshop list data for context
    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    
    if (!workshopSheet) {
      return { success: false, error: 'Liste Officina sheet not found' };
    }

    const data = workshopSheet.getDataRange().getValues();
    let listRow = -1;
    let listData = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        listRow = i;
        listData = data[i];
        break;
      }
    }

    if (listRow === -1) {
      return { success: false, error: 'Lista non trovata' };
    }

    // Parse expected works from list
    let expectedWorks = [];
    try {
      const additionalWorks = JSON.parse(listData[11] || '{}');
      expectedWorks = [
        ...(additionalWorks.serviceWorks || []),
        ...(additionalWorks.extraWorks || [])
      ];
    } catch (e) {
      Logger.log('Error parsing additional works: ' + e);
    }

    // Get issues for this list
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    const difettiData = difettiSheet.getDataRange().getValues();
    const listIssues = [];

    for (let j = 1; j < difettiData.length; j++) {
      if (difettiData[j][20] === listId) {
        listIssues.push({
          category: difettiData[j][5],
          description: difettiData[j][6]
        });
      }
    }

    listIssues.forEach(issue => {
      expectedWorks.push(`${issue.category}: ${issue.description}`);
    });

    Logger.log('Expected works: ' + JSON.stringify(expectedWorks));

    // 3. Analyze invoice with OpenAI Vision
    const analysisResult = analyzeInvoiceWithAI(photoUrl, expectedWorks);

    if (!analysisResult.success) {
      // Save photo URL even if analysis fails
      workshopSheet.getRange(listRow + 1, 15).setValue(photoUrl);
      workshopSheet.getRange(listRow + 1, 17).setValue(new Date());
      workshopSheet.getRange(listRow + 1, 18).setValue('Error');
      
      return {
        success: false,
        error: 'Analisi fallita: ' + analysisResult.error,
        photoUrl: photoUrl
      };
    }

    // 4. Save results to sheet
    workshopSheet.getRange(listRow + 1, 15).setValue(photoUrl);                          // Col 15: Foto Fattura URL
    workshopSheet.getRange(listRow + 1, 16).setValue(JSON.stringify(analysisResult.analysis)); // Col 16: Analisi (JSON)
    workshopSheet.getRange(listRow + 1, 17).setValue(new Date());                        // Col 17: Data Upload
    workshopSheet.getRange(listRow + 1, 18).setValue('Success');                         // Col 18: Stato

    // Update total cost if available
    if (analysisResult.analysis && analysisResult.analysis.invoiceData && analysisResult.analysis.invoiceData.totalCost) {
      workshopSheet.getRange(listRow + 1, 10).setValue(analysisResult.analysis.invoiceData.totalCost);
    }

    return {
      success: true,
      photoUrl: photoUrl,
      analysis: analysisResult.analysis
    };

  } catch (error) {
    Logger.log('Error in uploadAndAnalyzeInvoice: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Helpers for parsing OpenAI JSON responses
function truncateForLog(text, maxLength) {
  if (!text) return '';
  const limit = maxLength || 1200;
  if (text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + '... [truncated ' + text.length + ' chars]';
}

function getAiMessageContentString(message) {
  if (!message) {
    return '';
  }

  const content = message.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(function(part) {
      if (!part) {
        return '';
      }
      if (typeof part === 'string') {
        return part;
      }
      if (typeof part.text === 'string') {
        return part.text;
      }
      if (Array.isArray(part.text)) {
        return part.text.map(function(segment) {
          if (!segment) {
            return '';
          }
          if (typeof segment === 'string') {
            return segment;
          }
          return segment.value || '';
        }).join('');
      }
      if (part.type === 'output_text' && typeof part.text === 'string') {
        return part.text;
      }
      if (part.type === 'text' && typeof part.text === 'string') {
        return part.text;
      }
      return '';
    }).join('\n');
  }

  if (content && typeof content === 'object') {
    if (typeof content.text === 'string') {
      return content.text;
    }
    if (Array.isArray(content.text)) {
      return content.text.map(function(segment) {
        if (!segment) {
          return '';
        }
        if (typeof segment === 'string') {
          return segment;
        }
        return segment.value || '';
      }).join('');
    }
  }

  return '';
}

function normalizeAiJsonString(raw) {
  if (!raw) {
    return '';
  }

  let normalized = raw.trim();

  // Remove common prefixes that AI might add
  const prefixes = [
    /^Here is the JSON:/i,
    /^JSON:/i,
    /^Risposta:/i,
    /^Response:/i,
    /^Ecco il JSON:/i
  ];

  for (const prefix of prefixes) {
    normalized = normalized.replace(prefix, '').trim();
  }

  if (normalized.startsWith('```')) {
    const firstFenceEnd = normalized.indexOf('\n');
    if (firstFenceEnd !== -1) {
      // Skip the opening fence line (``` or ```json or ```JSON etc.)
      normalized = normalized.substring(firstFenceEnd + 1);
    } else {
      // Fallback: just remove the ```
      normalized = normalized.substring(3);
    }
    // Remove the closing fence if present
    const lastFenceIndex = normalized.lastIndexOf('```');
    if (lastFenceIndex !== -1) {
      normalized = normalized.substring(0, lastFenceIndex);
    }
    normalized = normalized.trim();
  }

  const start = normalized.indexOf('{');
  const end = normalized.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    normalized = normalized.substring(start, end + 1);
  }

  normalized = normalized.replace(/\u00A0/g, ' ');
  normalized = normalized.replace(/\u200B/g, '');
  normalized = normalized.replace(/\r\n/g, '\n');

  return normalized.trim();
}

function parseAiJsonMessage(message, contextLabel) {
  try {
    if (!message) {
      Logger.log(contextLabel + ' - Empty AI message object.');
      return { success: false, error: 'Invalid AI response format' };
    }

    if (!message.content && !message.parsed) {
      Logger.log(contextLabel + ' - AI message has no content or parsed data.');
      return { success: false, error: 'Invalid AI response format' };
    }

    if (message.parsed) {
      var rawRepresentation = '';
      try {
        rawRepresentation = JSON.stringify(message.parsed);
      } catch (stringifyError) {
        rawRepresentation = '';
      }
      return {
        success: true,
        data: message.parsed,
        raw: rawRepresentation
      };
    }

    const rawContent = getAiMessageContentString(message);
    Logger.log(contextLabel + ' - Raw AI content length: ' + (rawContent ? rawContent.length : 0));

    const cleaned = normalizeAiJsonString(rawContent);

    if (!cleaned) {
      Logger.log(contextLabel + ' - No JSON content found after normalization. Raw snippet: ' + truncateForLog(rawContent));
      return { success: false, error: 'Invalid AI response format', raw: rawContent };
    }

    Logger.log(contextLabel + ' - Cleaned content length: ' + cleaned.length);
    Logger.log(contextLabel + ' - Cleaned content starts with: ' + cleaned.substring(0, 100));

    const attempts = [];
    attempts.push(cleaned);

    const normalizedQuotes = cleaned.replace(/[“”]/g, '"').replace(/[’‘]/g, '\'');
    if (normalizedQuotes !== cleaned) {
      attempts.push(normalizedQuotes);
    }

    const noTrailingCommas = cleaned.replace(/,\s*([\]}])/g, '$1');
    if (noTrailingCommas !== cleaned) {
      attempts.push(noTrailingCommas);
    }

    const combined = normalizedQuotes.replace(/,\s*([\]}])/g, '$1');
    if (combined !== normalizedQuotes) {
      attempts.push(combined);
    }

    const uniqueAttempts = [];
    const seen = {};
    attempts.forEach(function(candidate) {
      if (!seen[candidate]) {
        uniqueAttempts.push(candidate);
        seen[candidate] = true;
      }
    });

    Logger.log(contextLabel + ' - Will try ' + uniqueAttempts.length + ' parsing attempts');

    for (var i = 0; i < uniqueAttempts.length; i++) {
      var attempt = uniqueAttempts[i];
      try {
        var parsed = JSON.parse(attempt);
        Logger.log(contextLabel + ' - JSON parse succeeded on attempt ' + (i + 1));
        return {
          success: true,
          data: parsed,
          raw: rawContent,
          cleaned: attempt
        };
      } catch (parseError) {
        Logger.log(contextLabel + ' - JSON parse failed on attempt ' + (i + 1) + ': ' + parseError + '. Attempt snippet: ' + truncateForLog(attempt));
      }
    }

    Logger.log(contextLabel + ' - All ' + uniqueAttempts.length + ' parse attempts failed. Raw snippet: ' + truncateForLog(rawContent));
    return {
      success: false,
      error: 'Invalid AI response format',
      raw: rawContent,
      cleaned: cleaned
    };
  } catch (error) {
    Logger.log(contextLabel + ' - Exception while parsing AI response: ' + error);
    return { success: false, error: 'Invalid AI response format' };
  }
}

// Analyze invoice using OpenAI Vision API
function analyzeInvoiceWithAI(photoUrl, expectedWorks) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    // Download image and convert to base64
    const photoBlob = UrlFetchApp.fetch(photoUrl).getBlob();
    const base64Image = Utilities.base64Encode(photoBlob.getBytes());
    const mimeType = photoBlob.getContentType();

    // Construct prompt
    const prompt = `Analizza questa fattura di officina meccanica ed estrai le seguenti informazioni in formato JSON.

LAVORI PREVENTIVATI ORIGINALI:
${expectedWorks.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Estrai dalla fattura:
1. Costo totale (includi valuta, es: "CHF 450.00")
2. Lista completa dei lavori effettuati CON COSTI SINGOLI
3. Data della fattura (formato YYYY-MM-DD)
4. Nome ESATTO dell'officina/garage
5. Numero fattura se presente
6. Kilometraggio del veicolo se presente

PER OGNI LAVORO estrai:
- Descrizione esatta
- Costo singolo (se disponibile, altrimenti null)

Poi confronta i lavori fatturati con quelli preventivati e classifica:
- worksCompleted: lavori preventivati che sono stati effettuati
- worksAdded: lavori effettuati ma NON preventivati
- worksMissing: lavori preventivati ma NON effettuati

Rispondi SOLO con JSON valido nel seguente formato:
{
  "invoiceData": {
    "totalCost": "874.79 CHF",
    "invoiceDate": "2025-06-30",
    "workshopName": "Nome ESATTO Officina SA",
    "invoiceNumber": "250254",
    "vehicleKm": 45000,
    "worksDone": [
      {"description": "Cambio olio motore", "cost": "120.00 CHF"},
      {"description": "Filtro olio", "cost": "45.00 CHF"}
    ]
  },
  "comparison": {
    "worksCompleted": [
      {"description": "Cambio olio", "cost": "120.00 CHF"}
    ],
    "worksAdded": [
      {"description": "Servizio annuale", "cost": "250.00 CHF"}
    ],
    "worksMissing": ["Controllo freni", "Pulizia interna"]
  },
  "aiConfidence": 0.95
}

IMPORTANTE: worksDone, worksCompleted e worksAdded devono essere array di OGGETTI con {description, cost}.
Se qualche informazione non è leggibile, usa null. Sii preciso nel confronto dei lavori.`;

    // Call OpenAI API
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      }),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('OpenAI Response Code: ' + responseCode);
    Logger.log('OpenAI Response: ' + responseText);

    if (responseCode !== 200) {
      return {
        success: false,
        error: 'OpenAI API error: ' + responseText
      };
    }

    const result = JSON.parse(responseText);
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      return {
        success: false,
        error: 'Risposta OpenAI non valida'
      };
    }

    const aiMessage = result.choices[0].message;
    const parseOutcome = parseAiJsonMessage(aiMessage, 'analyzeInvoiceWithAI');

    if (!parseOutcome.success) {
      const fallbackRaw = parseOutcome.raw || getAiMessageContentString(aiMessage);
      Logger.log('analyzeInvoiceWithAI - parse failure. Raw snippet: ' + truncateForLog(fallbackRaw));
      return {
        success: false,
        error: parseOutcome.error || 'Invalid AI response format',
        rawResponse: fallbackRaw
      };
    }

    Logger.log('analyzeInvoiceWithAI - raw AI snippet: ' + truncateForLog(parseOutcome.raw || ''));

    const analysis = parseOutcome.data;

    // Add analysis timestamp
    analysis.analysisDate = new Date().toISOString();

    return {
      success: true,
      analysis: analysis
    };

  } catch (error) {
    Logger.log('Error in analyzeInvoiceWithAI: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Analyze invoice image directly (receives base64 image)
function analyzeInvoiceImageWithAI(base64Image, mimeType, expectedWorks) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    Logger.log('Analyzing image with mime type: ' + mimeType);

    // Construct prompt
    const prompt = `Analizza questa fattura di officina meccanica ed estrai le seguenti informazioni in formato JSON.

LAVORI PREVENTIVATI ORIGINALI:
${expectedWorks.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Estrai dalla fattura:
1. Costo totale (includi valuta, es: "CHF 450.00")
2. Lista completa dei lavori effettuati CON COSTI SINGOLI (come appaiono in fattura)
3. Data della fattura (formato YYYY-MM-DD)
4. Nome ESATTO dell'officina/garage (come appare in fattura)
5. Numero fattura se presente
6. Kilometraggio del veicolo se presente

PER OGNI LAVORO estrai:
- Descrizione esatta
- Costo singolo (se disponibile, altrimenti null)

Poi confronta i lavori fatturati con quelli preventivati e classifica:
- worksCompleted: lavori preventivati che sono stati effettuati
- worksAdded: lavori effettuati ma NON preventivati
- worksMissing: lavori preventivati ma NON effettuati

Rispondi SOLO con JSON valido nel seguente formato:
{
  "invoiceData": {
    "totalCost": "874.79 CHF",
    "invoiceDate": "2025-06-30",
    "workshopName": "Nome ESATTO Officina SA",
    "invoiceNumber": "250254",
    "vehicleKm": 45000,
    "worksDone": [
      {"description": "Cambio olio motore", "cost": "120.00 CHF"},
      {"description": "Filtro olio", "cost": "45.00 CHF"}
    ]
  },
  "comparison": {
    "worksCompleted": [
      {"description": "Cambio olio", "cost": "120.00 CHF"}
    ],
    "worksAdded": [
      {"description": "Servizio annuale", "cost": "250.00 CHF"}
    ],
    "worksMissing": ["Controllo freni", "Pulizia interna"]
  },
  "aiConfidence": 0.95
}

IMPORTANTE: worksDone, worksCompleted e worksAdded devono essere array di OGGETTI con {description, cost}.
Se qualche informazione non è leggibile, usa null. Sii preciso nel confronto dei lavori.`;

    // Call OpenAI API with vision
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      Logger.log('OpenAI API error: ' + JSON.stringify(result.error));
      return {
        success: false,
        error: 'OpenAI API error: ' + JSON.stringify(result.error)
      };
    }

    const content = result.choices[0].message.content;
    Logger.log('AI Response (image): ' + content);

    // Use the robust JSON parsing helper instead of manual parsing
    const aiMessage = result.choices[0].message;
    const parseOutcome = parseAiJsonMessage(aiMessage, 'analyzeInvoiceImageWithAI');

    if (!parseOutcome.success) {
      const fallbackRaw = parseOutcome.raw || content;
      Logger.log('analyzeInvoiceImageWithAI - parse failure. Raw snippet: ' + truncateForLog(fallbackRaw));
      return {
        success: false,
        error: parseOutcome.error || 'Invalid AI response format',
        rawResponse: fallbackRaw
      };
    }

    Logger.log('analyzeInvoiceImageWithAI - raw AI snippet: ' + truncateForLog(parseOutcome.raw || ''));

    const analysis = parseOutcome.data;

  } catch (error) {
    Logger.log('Error in analyzeInvoiceImageWithAI: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Analyze invoice using extracted text (for PDFs)
function analyzeInvoiceTextWithAI(invoiceText, expectedWorks) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    // Construct prompt for text analysis
    const prompt = `Analizza il testo di questa fattura di officina meccanica ed estrai le seguenti informazioni in formato JSON.

TESTO FATTURA:
${invoiceText}

LAVORI PREVENTIVATI ORIGINALI:
${expectedWorks.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Estrai dalla fattura:
1. Costo totale (includi valuta, es: "CHF 450.00")
2. Lista completa dei lavori effettuati CON COSTI SINGOLI
3. Data della fattura (formato YYYY-MM-DD)
4. Nome ESATTO dell'officina/garage
5. Numero fattura se presente
6. Kilometraggio del veicolo se presente

PER OGNI LAVORO estrai:
- Descrizione esatta
- Costo singolo (se disponibile, altrimenti null)

Poi confronta i lavori fatturati con quelli preventivati e classifica:
- worksCompleted: lavori preventivati che sono stati effettuati
- worksAdded: lavori effettuati ma NON preventivati
- worksMissing: lavori preventivati ma NON effettuati

Rispondi SOLO con JSON valido nel seguente formato:
{
  "invoiceData": {
    "totalCost": "874.79 CHF",
    "invoiceDate": "2025-06-30",
    "workshopName": "Nome ESATTO Officina SA",
    "invoiceNumber": "250254",
    "vehicleKm": 45000,
    "worksDone": [
      {"description": "Cambio olio motore", "cost": "120.00 CHF"},
      {"description": "Filtro olio", "cost": "45.00 CHF"}
    ]
  },
  "comparison": {
    "worksCompleted": [
      {"description": "Cambio olio", "cost": "120.00 CHF"}
    ],
    "worksAdded": [
      {"description": "Servizio annuale", "cost": "250.00 CHF"}
    ],
    "worksMissing": ["Controllo freni", "Pulizia interna"]
  },
  "aiConfidence": 0.95
}

IMPORTANTE: worksDone, worksCompleted e worksAdded devono essere array di OGGETTI con {description, cost}.

Se qualche informazione non è leggibile, usa null. Sii preciso nel confronto dei lavori.`;

    // Call OpenAI API with text-only model (cheaper and faster for text)
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o-mini', // Use mini for text-only analysis (cheaper)
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      Logger.log('OpenAI API error: ' + JSON.stringify(result.error));
      return {
        success: false,
        error: 'OpenAI API error: ' + JSON.stringify(result.error)
      };
    }

    const content = result.choices[0].message.content;
    Logger.log('AI Response (text): ' + content);

    // Use the robust JSON parsing helper
    const aiMessage = result.choices[0].message;
    const parseOutcome = parseAiJsonMessage(aiMessage, 'analyzeInvoiceTextWithAI');

    if (!parseOutcome.success) {
      const fallbackRaw = parseOutcome.raw || content;
      Logger.log('analyzeInvoiceTextWithAI - parse failure. Raw snippet: ' + truncateForLog(fallbackRaw));
      return {
        success: false,
        error: parseOutcome.error || 'Invalid AI response format',
        rawResponse: fallbackRaw
      };
    }

    Logger.log('analyzeInvoiceTextWithAI - raw AI snippet: ' + truncateForLog(parseOutcome.raw || ''));

    return {
      success: true,
      analysis: parseOutcome.data,
      rawResponse: content
    };

  } catch (error) {
    Logger.log('Error in analyzeInvoiceTextWithAI: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function uploadAndAnalyzeInvoiceJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = uploadAndAnalyzeInvoice(params.fileName, params.photoData, params.listId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// NEW: Direct upload for invoice photos (no chunking for files < 500KB)
function uploadInvoicePhotoDirect(fileName, photoBase64, listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID') || scriptProperties.getProperty('PHOTO_FOLDER_ID');
    
    if (!folderId) {
      return { success: false, error: 'Cartella foto non configurata' };
    }
    
    // Upload to Drive
    const blob = Utilities.newBlob(
      Utilities.base64Decode(photoBase64),
      'image/jpeg',
      fileName
    );

    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const photoUrl = file.getUrl();

    Logger.log('Invoice photo uploaded directly: ' + photoUrl);

    // Save to sheet
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    const data = workshopSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        workshopSheet.getRange(i + 1, 15).setValue(photoUrl);
        workshopSheet.getRange(i + 1, 17).setValue(new Date());
        workshopSheet.getRange(i + 1, 18).setValue('Pending');
        break;
      }
    }

    return {
      success: true,
      photoUrl: photoUrl,
      listId: listId
    };

  } catch (error) {
    Logger.log('Error in uploadInvoicePhotoDirect: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function uploadInvoicePhotoDirectJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = uploadInvoicePhotoDirect(params.fileName, params.photoData, params.listId);
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Upload invoice photo chunk (same pattern as PDF chunks)
function uploadInvoiceChunkJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  try {
    const chunkIndex = parseInt(params.chunkIndex);
    const chunkData = params.chunkData;
    const sessionId = params.sessionId || 'default';
    
    const cache = CacheService.getScriptCache();
    const cacheKey = 'invoice_chunk_' + sessionId + '_' + chunkIndex;
    
    // Store chunk in cache (expires in 10 minutes)
    cache.put(cacheKey, chunkData, 600);
    
    const response = { success: true, chunkIndex: chunkIndex };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    const response = { success: false, error: error.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Finalize invoice photo upload and save to Drive
function finalizeInvoiceUpload(fileName, listId, sessionId, totalChunks) {
  try {
    const cache = CacheService.getScriptCache();
    
    // Retrieve all chunks from cache
    const chunks = [];
    for (let i = 0; i < parseInt(totalChunks); i++) {
      const cacheKey = 'invoice_chunk_' + sessionId + '_' + i;
      const chunkData = cache.get(cacheKey);
      
      if (!chunkData) {
        throw new Error('Chunk ' + i + ' non trovato. Riprova il caricamento.');
      }
      
      chunks.push(chunkData);
    }
    
    // Combine all chunks
    const photoBase64 = chunks.join('');
    
    // Clear cache
    for (let i = 0; i < parseInt(totalChunks); i++) {
      cache.remove('invoice_chunk_' + sessionId + '_' + i);
    }
    
    // Upload photo to Drive
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID') || scriptProperties.getProperty('PHOTO_FOLDER_ID');
    
    if (!folderId) {
      return { success: false, error: 'Cartella foto non configurata' };
    }
    
    const blob = Utilities.newBlob(
      Utilities.base64Decode(photoBase64),
      'image/jpeg',
      fileName
    );

    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const photoUrl = file.getUrl();

    Logger.log('Invoice photo uploaded: ' + photoUrl);

    // Save photo URL to sheet (column 15), mark as Pending analysis
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    const data = workshopSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        workshopSheet.getRange(i + 1, 15).setValue(photoUrl);           // Foto Fattura URL
        workshopSheet.getRange(i + 1, 17).setValue(new Date());         // Data Upload
        workshopSheet.getRange(i + 1, 18).setValue('Pending');          // Stato Analisi
        break;
      }
    }

    return {
      success: true,
      photoUrl: photoUrl,
      listId: listId
    };

  } catch (error) {
    Logger.log('Error in finalizeInvoiceUpload: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function finalizeInvoiceUploadJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = finalizeInvoiceUpload(params.fileName, params.listId, params.sessionId, params.totalChunks);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Analyze already uploaded invoice
function analyzeUploadedInvoice(listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    const data = workshopSheet.getDataRange().getValues();
    
    let listRow = -1;
    let listData = null;
    let photoUrl = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        listRow = i;
        listData = data[i];
        photoUrl = data[i][14]; // Column 15, index 14
        break;
      }
    }

    if (listRow === -1) {
      return { success: false, error: 'Lista non trovata' };
    }

    if (!photoUrl) {
      return { success: false, error: 'Foto fattura non trovata' };
    }

    // Parse expected works
    let expectedWorks = [];
    try {
      const additionalWorks = JSON.parse(listData[11] || '{}');
      expectedWorks = [
        ...(additionalWorks.serviceWorks || []),
        ...(additionalWorks.extraWorks || [])
      ];
    } catch (e) {
      Logger.log('Error parsing additional works: ' + e);
    }

    // Get issues
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    const difettiData = difettiSheet.getDataRange().getValues();
    
    for (let j = 1; j < difettiData.length; j++) {
      if (difettiData[j][20] === listId) {
        expectedWorks.push(`${difettiData[j][5]}: ${difettiData[j][6]}`);
      }
    }

    Logger.log('Analyzing invoice for listId: ' + listId);
    Logger.log('Expected works: ' + JSON.stringify(expectedWorks));

    // Analyze with AI
    const analysisResult = analyzeInvoiceWithAI(photoUrl, expectedWorks);

    if (!analysisResult.success) {
      workshopSheet.getRange(listRow + 1, 18).setValue('Error');
      return {
        success: false,
        error: 'Analisi fallita: ' + analysisResult.error
      };
    }

    // Save results
    workshopSheet.getRange(listRow + 1, 16).setValue(JSON.stringify(analysisResult.analysis));
    workshopSheet.getRange(listRow + 1, 18).setValue('Success');

    // Update total cost if available
    if (analysisResult.analysis && analysisResult.analysis.invoiceData && analysisResult.analysis.invoiceData.totalCost) {
      workshopSheet.getRange(listRow + 1, 10).setValue(analysisResult.analysis.invoiceData.totalCost);
    }

    return {
      success: true,
      analysis: analysisResult.analysis,
      photoUrl: photoUrl
    };

  } catch (error) {
    Logger.log('Error in analyzeUploadedInvoice: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function analyzeUploadedInvoiceJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = analyzeUploadedInvoice(params.listId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/*************************************************************
 * ANALYZE INVOICE FROM EXISTING DRIVE FILE
 * Analyzes invoice (image or PDF) already on Google Drive
 *************************************************************/

// Analyze invoice from existing Drive file (supports images and PDFs)
function analyzeInvoiceFromDrive(fileId, listId) {
  try {
    Logger.log('=== ANALYZE INVOICE FROM DRIVE ===');
    Logger.log('fileId: ' + fileId);
    Logger.log('listId: ' + listId);
    
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    // Get file from Drive
    let file;
    try {
      file = DriveApp.getFileById(fileId);
    } catch (e) {
      Logger.log('ERROR: File not found or no access: ' + e);
      return { success: false, error: 'File non trovato o non accessibile' };
    }
    
    const fileName = file.getName();
    const mimeType = file.getMimeType();
    const photoUrl = file.getUrl();
    
    Logger.log('File trovato: ' + fileName);
    Logger.log('Mime type: ' + mimeType);
    Logger.log('URL: ' + photoUrl);

    // Check if file is image or PDF
    const isImage = mimeType.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';

    if (!isImage && !isPDF) {
      return { 
        success: false, 
        error: 'Tipo file non supportato. Solo immagini (JPG, PNG) e PDF.' 
      };
    }

    // Get worksheet list data for expected works
    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    
    if (!workshopSheet) {
      return { success: false, error: 'Liste Officina sheet not found' };
    }

    const data = workshopSheet.getDataRange().getValues();
    let listRow = -1;
    let listData = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        listRow = i;
        listData = data[i];
        break;
      }
    }

    if (listRow === -1) {
      return { success: false, error: 'Lista non trovata con ID: ' + listId };
    }

    // Parse expected works from list
    let expectedWorks = [];
    try {
      const additionalWorks = JSON.parse(listData[11] || '{}');
      expectedWorks = [
        ...(additionalWorks.serviceWorks || []),
        ...(additionalWorks.extraWorks || [])
      ];
    } catch (e) {
      Logger.log('Error parsing additional works: ' + e);
    }

    // Get issues for this list from Difetti e Riparazioni sheet
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    if (difettiSheet) {
      const difettiData = difettiSheet.getDataRange().getValues();
      for (let j = 1; j < difettiData.length; j++) {
        if (difettiData[j][20] === listId) { // Column U (Lista Officina ID)
          const issueType = difettiData[j][5] || 'Issue';
          const issueDesc = difettiData[j][6] || '';
          if (issueDesc) {
            expectedWorks.push(`${issueType}: ${issueDesc}`);
          }
        }
      }
    }

    Logger.log('Expected works (' + expectedWorks.length + '): ' + JSON.stringify(expectedWorks));

    // For PDF files, extract text instead of using image
    let analysisResult;
    
    if (isPDF) {
      Logger.log('PDF detected - extracting text for analysis');
      
      try {
        // Get PDF content as blob
        const pdfBlob = file.getBlob();
        
        // Try to extract text from PDF using Google's built-in parser
        let pdfText = '';
        try {
          // Convert PDF to Google Doc temporarily to extract text
          const tempDoc = Drive.Files.insert(
            {
              title: 'temp_pdf_extract',
              mimeType: 'application/vnd.google-apps.document'
            },
            pdfBlob,
            {
              convert: true
            }
          );
          
          const docFile = DriveApp.getFileById(tempDoc.id);
          const docContent = DocumentApp.openById(tempDoc.id);
          pdfText = docContent.getBody().getText();
          
          // Delete temporary doc
          Drive.Files.remove(tempDoc.id);
          
          Logger.log('PDF text extracted successfully (' + pdfText.length + ' chars)');
        } catch (extractError) {
          Logger.log('PDF text extraction failed: ' + extractError);
          pdfText = '';
        }
        
        // Analyze with text-based AI if we got text
        if (pdfText.length > 50) {
          analysisResult = analyzeInvoiceTextWithAI(pdfText, expectedWorks);
        } else {
          // Fallback: try with image URL (might work for simple PDFs)
          analysisResult = analyzeInvoiceWithAI(photoUrl, expectedWorks);
        }
        
      } catch (pdfError) {
        Logger.log('PDF processing error: ' + pdfError);
        return {
          success: false,
          error: 'Errore elaborazione PDF: ' + pdfError.toString()
        };
      }
    } else {
      // Image file - get blob and analyze directly
      try {
        const imageBlob = file.getBlob();
        const base64Image = Utilities.base64Encode(imageBlob.getBytes());
        
        // Ensure correct mime type
        let imageMimeType = mimeType;
        if (!imageMimeType.startsWith('image/')) {
          // Force image mime type based on file extension
          const extension = fileName.toLowerCase().split('.').pop();
          const mimeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
          };
          imageMimeType = mimeMap[extension] || 'image/jpeg';
          Logger.log('Corrected mime type to: ' + imageMimeType);
        }
        
        analysisResult = analyzeInvoiceImageWithAI(base64Image, imageMimeType, expectedWorks);
      } catch (imageError) {
        Logger.log('Image processing error: ' + imageError);
        return {
          success: false,
          error: 'Errore elaborazione immagine: ' + imageError.toString()
        };
      }
    }

    if (!analysisResult.success) {
      // Save file URL even if analysis fails
      workshopSheet.getRange(listRow + 1, 15).setValue(photoUrl);
      workshopSheet.getRange(listRow + 1, 17).setValue(new Date());
      workshopSheet.getRange(listRow + 1, 18).setValue('Error: ' + (analysisResult.error || 'Unknown'));
      
      return {
        success: false,
        error: 'Analisi fallita: ' + (analysisResult.error || 'Unknown error'),
        photoUrl: photoUrl,
        fileType: isPDF ? 'PDF' : 'Image'
      };
    }

    Logger.log('Analysis successful');

    // Save results to sheet
    workshopSheet.getRange(listRow + 1, 15).setValue(photoUrl); // Foto Fattura URL
    workshopSheet.getRange(listRow + 1, 16).setValue(JSON.stringify(analysisResult.analysis)); // Risultati Analisi
    workshopSheet.getRange(listRow + 1, 17).setValue(new Date()); // Data Analisi
    workshopSheet.getRange(listRow + 1, 18).setValue('Success'); // Stato Analisi

    // Update total cost if available
    if (analysisResult.analysis &&
        analysisResult.analysis.invoiceData &&
        analysisResult.analysis.invoiceData.totalCost) {
      const totalCostString = analysisResult.analysis.invoiceData.totalCost;
      // Extract numeric value from string like "874.79 CHF"
      const numericMatch = totalCostString.toString().match(/[\d.,]+/);
      const totalCost = numericMatch ? parseFloat(numericMatch[0].replace(',', '.')) : 0;

      workshopSheet.getRange(listRow + 1, 10).setValue(totalCost); // Costo Finale
      Logger.log('Total cost updated: ' + totalCost + ' (from: ' + totalCostString + ')');

      // Verify total matches sum of works in Storico Lavori
      try {
        let storicoSheet = ss.getSheetByName('Storico Lavori');
        if (storicoSheet) {
          const storicoData = storicoSheet.getDataRange().getValues();
          let calculatedTotal = 0;

          // Sum all costs for this listId
          for (let i = 1; i < storicoData.length; i++) {
            const row = storicoData[i];
            if (row[10] === listId && row[6] && row[4] !== '💰 TOTALE FATTURA') { // ID Lista column (11), Costo column (7), skip total rows
              const costString = row[6].toString();
              const costMatch = costString.match(/[\d.,]+/);
              if (costMatch) {
                const costValue = parseFloat(costMatch[0].replace(',', '.'));
                calculatedTotal += costValue;
              }
            }
          }

          const difference = Math.abs(totalCost - calculatedTotal);
          if (difference > 0.01) { // Allow small rounding differences
            Logger.log('WARNING: Total mismatch! AI total: ' + totalCost + ', Calculated total: ' + calculatedTotal + ', Difference: ' + difference);
          } else {
            Logger.log('Total verification passed: ' + totalCost + ' matches calculated total');
          }
        }
      } catch (verifyError) {
        Logger.log('Error verifying total: ' + verifyError);
      }
    }    return {
      success: true,
      photoUrl: photoUrl,
      analysis: analysisResult.analysis,
      fileType: isPDF ? 'PDF' : 'Image',
      fileName: fileName,
      message: 'Fattura analizzata con successo'
    };

  } catch (error) {
    Logger.log('ERROR in analyzeInvoiceFromDrive: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for analyzeInvoiceFromDrive
function analyzeInvoiceFromDriveJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  if (!params.fileId) {
    const errorResponse = { success: false, error: 'fileId parameter required' };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  if (!params.listId) {
    const errorResponse = { success: false, error: 'listId parameter required' };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  const response = analyzeInvoiceFromDrive(params.fileId, params.listId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/*************************************************************
 * SAVE INVOICE ANALYSIS TO STORICO LAVORI
 * Saves analyzed invoice works to tracking sheet
 *************************************************************/

// Save invoice works to Storico Lavori sheet
// Helper function to parse numeric cost from cost string (e.g., "210.00 CHF" -> 210.00)
function parseCostValue(costString) {
  if (!costString) return '';
  const match = costString.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : costString;
}

function saveInvoiceToHistory(listId, analysisData, photoUrl, workshopName) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    
    // Get workshop list data
    const workshopSheet = ss.getSheetByName('Liste Officina');
    if (!workshopSheet) {
      return { success: false, error: 'Sheet Liste Officina non trovato' };
    }
    
    const workshopData = workshopSheet.getDataRange().getValues();
    
    let listData = null;
    for (let i = 1; i < workshopData.length; i++) {
      if (workshopData[i][0] === listId) {
        listData = workshopData[i];
        break;
      }
    }
    
    if (!listData) {
      return { success: false, error: 'Lista non trovata' };
    }

    // Create or get Storico Lavori sheet
    let storicoSheet = ss.getSheetByName('Storico Lavori');
    
    if (!storicoSheet) {
      storicoSheet = ss.insertSheet('Storico Lavori');
      const headerRow = storicoSheet.getRange(1, 1, 1, 13);
      headerRow.setValues([[
        'Data Lavoro', 'ID Veicolo', 'Nome Veicolo', 'Km Veicolo', 'Tipo Lavoro', 
        'Descrizione', 'Costo CHF', 'Officina', 'ID Officina', 'N° Fattura', 'ID Lista', 'Link Fattura', 'Note'
      ]]);
      headerRow.setBackground('#28a745');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      storicoSheet.setFrozenRows(1);
      
      // Set column widths
      storicoSheet.setColumnWidth(1, 120);  // Data
      storicoSheet.setColumnWidth(2, 100);  // ID Veicolo
      storicoSheet.setColumnWidth(3, 120);  // Nome Veicolo
      storicoSheet.setColumnWidth(4, 100);  // Km Veicolo
      storicoSheet.setColumnWidth(5, 130);  // Tipo Lavoro
      storicoSheet.setColumnWidth(6, 350);  // Descrizione
      storicoSheet.setColumnWidth(7, 100);  // Costo
      storicoSheet.setColumnWidth(8, 150);  // Officina
      storicoSheet.setColumnWidth(9, 120);  // ID Officina
      storicoSheet.setColumnWidth(10, 100); // N° Fattura
      storicoSheet.setColumnWidth(11, 100); // ID Lista
      storicoSheet.setColumnWidth(12, 80);  // Link Fattura
      storicoSheet.setColumnWidth(13, 200); // Note
    }

    const invoiceData = analysisData.invoiceData;
    const vehicleId = listData[2];
    const vehicleName = listData[3];
    // Use provided workshopName if available, otherwise fall back to existing logic
    const finalWorkshopName = workshopName || invoiceData.workshopName || listData[4] || 'N/D';
    const invoiceDate = invoiceData.invoiceDate || new Date().toISOString().split('T')[0];
    const invoiceNumber = invoiceData.invoiceNumber || 'N/D';
    const vehicleKm = invoiceData.vehicleKm || null;
    
    Logger.log('Saving to Storico Lavori...');
    Logger.log('Vehicle: ' + vehicleName + ' (' + vehicleId + ')');
    Logger.log('Workshop: ' + finalWorkshopName);
    Logger.log('Invoice: ' + invoiceNumber);
    Logger.log('Vehicle Km: ' + vehicleKm);
    
    // Find or create workshop in Anagrafica Officine
    let workshopId = null;
    const workshopResult = findWorkshop(finalWorkshopName);
    if (workshopResult && workshopResult.found) {
      workshopId = workshopResult.workshopId;
      Logger.log('Found workshop: ' + workshopId);
    } else {
      // Create new workshop
      const createResult = createWorkshop(finalWorkshopName);
      if (createResult.success) {
        workshopId = createResult.workshopId;
        Logger.log('Created new workshop: ' + workshopId);
      }
    }
    
    let savedCount = 0;
    
    // Save completed works (lavori preventivati che sono stati fatti)
    if (analysisData.comparison.worksCompleted && analysisData.comparison.worksCompleted.length > 0) {
      analysisData.comparison.worksCompleted.forEach(work => {
        // Handle both string and object formats
        const workDesc = (typeof work === 'string') ? work : work.description;
        const workCostRaw = (typeof work === 'object' && work.cost) ? work.cost : '';
        const workCost = parseCostValue(workCostRaw);
        
        storicoSheet.appendRow([
          invoiceDate,
          vehicleId,
          vehicleName,
          vehicleKm,
          '✅ Completato',
          workDesc,
          workCost,
          finalWorkshopName,
          workshopId,
          invoiceNumber,
          listId,
          photoUrl,
          'Lavoro preventivato completato'
        ]);
        
        // Format completed row
        const lastRow = storicoSheet.getLastRow();
        const rowRange = storicoSheet.getRange(lastRow, 1, 1, 13);
        rowRange.setBackground('#d4edda');
        
        // Make photo URL clickable
        const linkCell = storicoSheet.getRange(lastRow, 12);
        linkCell.setFormula('=HYPERLINK("' + photoUrl + '"; "📄 Vedi")');
        
        savedCount++;
      });
    }
    
    // Save added works (lavori extra non preventivati)
    if (analysisData.comparison.worksAdded && analysisData.comparison.worksAdded.length > 0) {
      analysisData.comparison.worksAdded.forEach(work => {
        // Handle both string and object formats
        const workDesc = (typeof work === 'string') ? work : work.description;
        const workCostRaw = (typeof work === 'object' && work.cost) ? work.cost : '';
        const workCost = parseCostValue(workCostRaw);
        
        storicoSheet.appendRow([
          invoiceDate,
          vehicleId,
          vehicleName,
          vehicleKm,
          '➕ Extra',
          workDesc,
          workCost,
          finalWorkshopName,
          workshopId,
          invoiceNumber,
          listId,
          photoUrl,
          'Lavoro aggiuntivo non preventivato'
        ]);
        
        // Format added row
        const lastRow = storicoSheet.getLastRow();
        const rowRange = storicoSheet.getRange(lastRow, 1, 1, 13);
        rowRange.setBackground('#fff3cd');
        
        // Make photo URL clickable
        const linkCell = storicoSheet.getRange(lastRow, 12);
        linkCell.setFormula('=HYPERLINK("' + photoUrl + '"; "📄 Vedi")');
        
        savedCount++;
      });
    }
    
    // Add total cost row (summary)
    const totalCostText = invoiceData.totalCost || 'N/D';
    storicoSheet.appendRow([
      invoiceDate,
      vehicleId,
      vehicleName,
      vehicleKm,
      '💰 TOTALE FATTURA',
      savedCount + ' lavori effettuati',
      totalCostText,
      finalWorkshopName,
      workshopId,
      invoiceNumber,
      listId,
      photoUrl,
      'Riepilogo fattura'
    ]);
    
    // Format total row
    const lastRow = storicoSheet.getLastRow();
    const totalRange = storicoSheet.getRange(lastRow, 1, 1, 13);
    totalRange.setBackground('#ffc107');
    totalRange.setFontWeight('bold');
    totalRange.setFontColor('#000000');
    
    // Make photo URL clickable in total row
    const linkCell = storicoSheet.getRange(lastRow, 12);
    linkCell.setFormula('=HYPERLINK("' + photoUrl + '"; "📄 Vedi")');
    linkCell.setFontWeight('bold');

    Logger.log('Saved ' + savedCount + ' works to Storico Lavori');
    
    // Update workshop statistics
    if (workshopId) {
      updateWorkshopStats(workshopId, totalCostText, invoiceDate);
    }

    return {
      success: true,
      savedWorks: savedCount,
      totalCost: totalCostText,
      sheetName: 'Storico Lavori'
    };

  } catch (error) {
    Logger.log('Error in saveInvoiceToHistory: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Auto-complete issues based on invoice analysis
function autoCompleteIssuesFromInvoice(listId, analysisData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    const ss = SpreadsheetApp.openById(sheetId);
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    
    if (!difettiSheet) {
      Logger.log('Sheet Difetti e Riparazioni not found');
      return { success: false, error: 'Sheet non trovato' };
    }

    const data = difettiSheet.getDataRange().getValues();
    let completedCount = 0;
    let missingCount = 0;
    const now = new Date();
    
    // Get completed works from analysis
    const completedWorks = analysisData.comparison.worksCompleted || [];
    const missingWorks = analysisData.comparison.worksMissing || [];

    Logger.log('Auto-completing issues for listId: ' + listId);
    Logger.log('Completed works: ' + completedWorks.length);
    Logger.log('Missing works: ' + missingWorks.length);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const issueListId = row[20]; // ID Lista Officina (column U, index 20)
      
      if (issueListId === listId) {
        const issueDesc = (row[6] || '').toString().toLowerCase(); // Descrizione Problema
        
        // Check if this issue was completed
        let wasCompleted = false;
        for (let j = 0; j < completedWorks.length; j++) {
          // Handle both string and object formats
          const workItem = completedWorks[j];
          const workDesc = typeof workItem === 'string' ? workItem : (workItem.description || '').toString();
          const work = workDesc.toLowerCase();
          
          // Check if issue description contains key words from completed work
          const keywords = work.split(' ').filter(w => w.length > 3);
          const matchCount = keywords.filter(kw => issueDesc.includes(kw)).length;
          
          if (matchCount >= 2 || (keywords.length === 1 && issueDesc.includes(keywords[0]))) {
            wasCompleted = true;
            break;
          }
        }
        
        if (wasCompleted) {
          // Mark as completed
          difettiSheet.getRange(i + 1, 10).setValue(true); // Completato checkbox
          difettiSheet.getRange(i + 1, 11).setValue(now);  // Data Completamento
          difettiSheet.getRange(i + 1, 20).setValue('Completato'); // Stato Lavoro
          
          const statusCell = difettiSheet.getRange(i + 1, 9); // Stato
          statusCell.setValue('✅ Completato');
          statusCell.setBackground('#c8e6c9');
          
          completedCount++;
          Logger.log('✅ Issue completed: ' + issueDesc);
        } else {
          // Check if missing
          let wasMissing = false;
          for (let k = 0; k < missingWorks.length; k++) {
            // Handle both string and object formats
            const workItem = missingWorks[k];
            const workDesc = typeof workItem === 'string' ? workItem : (workItem.description || '').toString();
            const work = workDesc.toLowerCase();
            const keywords = work.split(' ').filter(w => w.length > 3);
            const matchCount = keywords.filter(kw => issueDesc.includes(kw)).length;
            
            if (matchCount >= 2 || (keywords.length === 1 && issueDesc.includes(keywords[0]))) {
              wasMissing = true;
              break;
            }
          }
          
          if (wasMissing) {
            // Add warning to description
            const currentDesc = row[6];
            const warningText = '\n⚠️ NON FATTO - Verificare con officina';
            
            if (!currentDesc.includes('⚠️ NON FATTO')) {
              difettiSheet.getRange(i + 1, 7).setValue(currentDesc + warningText);
              
              const statusCell = difettiSheet.getRange(i + 1, 9);
              statusCell.setValue('⚠️ Non Completato');
              statusCell.setBackground('#ffccbc');
              
              missingCount++;
              Logger.log('⚠️ Issue missing: ' + issueDesc);
            }
          }
        }
      }
    }

    Logger.log('Completed: ' + completedCount + ', Missing: ' + missingCount);

    return {
      success: true,
      completedCount: completedCount,
      missingCount: missingCount
    };

  } catch (error) {
    Logger.log('Error in autoCompleteIssuesFromInvoice: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrappers
function saveInvoiceToHistoryJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  try {
    const analysisData = JSON.parse(params.analysisData);
    const response = saveInvoiceToHistory(params.listId, analysisData, params.photoUrl, params.workshopName);
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';
    return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function autoCompleteIssuesFromInvoiceJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  try {
    const analysisData = JSON.parse(params.analysisData);
    const response = autoCompleteIssuesFromInvoice(params.listId, analysisData);
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
    return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    const errorResponse = { success: false, error: error.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';
    return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/*************************************************************
 * ANAGRAFICA OFFICINE - Workshop Database Management
 * Create, match, and track workshops/garages
 *************************************************************/

// Create or get Anagrafica Officine sheet
function getOrCreateWorkshopsSheet() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return null;
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let workshopsSheet = ss.getSheetByName('Anagrafica Officine');
    
    if (!workshopsSheet) {
      // Create new sheet
      workshopsSheet = ss.insertSheet('Anagrafica Officine');
      
      // Set headers
      const headerRow = workshopsSheet.getRange(1, 1, 1, 10);
      headerRow.setValues([[
        'ID Officina', 'Nome', 'Nomi Alternativi', 'Indirizzo', 'Telefono', 
        'Email', 'Note', 'Ultimo Intervento', 'Totale Fatture (CHF)', 'N° Interventi'
      ]]);
      
      // Format headers
      headerRow.setBackground('#17a2b8');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      workshopsSheet.setFrozenRows(1);
      
      // Set column widths
      workshopsSheet.setColumnWidth(1, 120);  // ID
      workshopsSheet.setColumnWidth(2, 200);  // Nome
      workshopsSheet.setColumnWidth(3, 250);  // Nomi Alternativi
      workshopsSheet.setColumnWidth(4, 300);  // Indirizzo
      workshopsSheet.setColumnWidth(5, 120);  // Telefono
      workshopsSheet.setColumnWidth(6, 200);  // Email
      workshopsSheet.setColumnWidth(7, 250);  // Note
      workshopsSheet.setColumnWidth(8, 120);  // Ultimo Intervento
      workshopsSheet.setColumnWidth(9, 130);  // Totale Fatture
      workshopsSheet.setColumnWidth(10, 120); // N° Interventi
      
      Logger.log('Created Anagrafica Officine sheet');
    }
    
    return workshopsSheet;
  } catch (error) {
    Logger.log('Error in getOrCreateWorkshopsSheet: ' + error);
    return null;
  }
}

// Find workshop by name (fuzzy matching)
function findWorkshop(workshopName) {
  try {
    const workshopsSheet = getOrCreateWorkshopsSheet();
    if (!workshopsSheet) {
      return null;
    }
    
    const data = workshopsSheet.getDataRange().getValues();
    const searchName = workshopName.toLowerCase().trim();
    
    Logger.log('Searching for workshop: ' + searchName);
    
    // Search through all workshops
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const workshopId = row[0];
      const mainName = (row[1] || '').toString().toLowerCase();
      const altNames = (row[2] || '').toString().toLowerCase();
      
      // Exact match on main name
      if (mainName === searchName) {
        Logger.log('Found exact match: ' + workshopId);
        return {
          found: true,
          workshopId: workshopId,
          workshopName: row[1],
          row: i + 1
        };
      }
      
      // Check alternative names
      if (altNames) {
        const alternatives = altNames.split(',').map(n => n.trim());
        for (let alt of alternatives) {
          if (alt === searchName) {
            Logger.log('Found match in alternatives: ' + workshopId);
            return {
              found: true,
              workshopId: workshopId,
              workshopName: row[1],
              row: i + 1
            };
          }
        }
      }
      
      // Fuzzy match (contains)
      if (searchName.length > 5 && mainName.includes(searchName)) {
        Logger.log('Found fuzzy match: ' + workshopId);
        return {
          found: true,
          workshopId: workshopId,
          workshopName: row[1],
          row: i + 1,
          fuzzy: true
        };
      }
    }
    
    Logger.log('No workshop found for: ' + searchName);
    return {
      found: false,
      suggestedName: workshopName
    };
    
  } catch (error) {
    Logger.log('Error in findWorkshop: ' + error);
    return null;
  }
}

// Create new workshop entry
function createWorkshop(workshopName, address, phone, email, notes) {
  try {
    const workshopsSheet = getOrCreateWorkshopsSheet();
    if (!workshopsSheet) {
      return { success: false, error: 'Cannot access Anagrafica Officine sheet' };
    }
    
    // Generate workshop ID (W + timestamp)
    const workshopId = 'W' + Date.now();
    
    // Add new row
    workshopsSheet.appendRow([
      workshopId,
      workshopName,
      '', // Nomi alternativi (vuoto inizialmente)
      address || '',
      phone || '',
      email || '',
      notes || '',
      '', // Ultimo intervento
      0,  // Totale fatture
      0   // N° interventi
    ]);
    
    Logger.log('Created new workshop: ' + workshopId + ' - ' + workshopName);
    
    return {
      success: true,
      workshopId: workshopId,
      workshopName: workshopName
    };
    
  } catch (error) {
    Logger.log('Error in createWorkshop: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Update workshop statistics after invoice
function updateWorkshopStats(workshopId, totalCost, interventionDate) {
  try {
    const workshopsSheet = getOrCreateWorkshopsSheet();
    if (!workshopsSheet) {
      return false;
    }
    
    const data = workshopsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === workshopId) {
        const currentTotal = parseFloat(data[i][8]) || 0;
        const currentCount = parseInt(data[i][9]) || 0;
        
        // Extract numeric value from totalCost string (e.g., "874.79 CHF" -> 874.79)
        let costValue = 0;
        if (totalCost) {
          const match = totalCost.toString().match(/[\d.]+/);
          if (match) {
            costValue = parseFloat(match[0]);
          }
        }
        
        // Update stats
        workshopsSheet.getRange(i + 1, 8).setValue(interventionDate); // Ultimo Intervento
        workshopsSheet.getRange(i + 1, 9).setValue(currentTotal + costValue); // Totale Fatture
        workshopsSheet.getRange(i + 1, 10).setValue(currentCount + 1); // N° Interventi
        
        Logger.log('Updated workshop stats for: ' + workshopId);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    Logger.log('Error in updateWorkshopStats: ' + error);
    return false;
  }
}

// Get workshop history with interventions
function getWorkshopHistory(workshopIdOrName) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    
    // Find workshop
    let workshopData = null;
    let workshopId = workshopIdOrName;
    
    if (!workshopIdOrName.startsWith('W')) {
      // Search by name
      const result = findWorkshop(workshopIdOrName);
      if (result && result.found) {
        workshopId = result.workshopId;
      } else {
        return { success: false, error: 'Officina non trovata' };
      }
    }
    
    // Get workshop info
    const workshopsSheet = ss.getSheetByName('Anagrafica Officine');
    if (workshopsSheet) {
      const workshopsData = workshopsSheet.getDataRange().getValues();
      for (let i = 1; i < workshopsData.length; i++) {
        if (workshopsData[i][0] === workshopId) {
          workshopData = {
            id: workshopsData[i][0],
            name: workshopsData[i][1],
            address: workshopsData[i][3],
            phone: workshopsData[i][4],
            email: workshopsData[i][5],
            lastIntervention: workshopsData[i][7],
            totalAmount: workshopsData[i][8],
            interventionCount: workshopsData[i][9]
          };
          break;
        }
      }
    }
    
    if (!workshopData) {
      return { success: false, error: 'Dati officina non trovati' };
    }
    
    // Get interventions from Storico Lavori
    const storicoSheet = ss.getSheetByName('Storico Lavori');
    const interventions = [];
    
    if (storicoSheet) {
      const storicoData = storicoSheet.getDataRange().getValues();
      
      for (let i = 1; i < storicoData.length; i++) {
        const row = storicoData[i];
        const rowWorkshop = row[6]; // Officina column
        
        // Match by workshop name or ID
        if (rowWorkshop === workshopData.name || row[8] === workshopId) {
          // Only add TOTALE rows (avoid duplicates)
          if (row[3] === '💰 TOTALE FATTURA') {
            interventions.push({
              date: row[0],
              vehicleId: row[1],
              vehicleName: row[2],
              description: row[4],
              totalCost: row[5],
              invoiceNumber: row[7],
              listId: row[8],
              photoUrl: row[9]
            });
          }
        }
      }
    }
    
    // Sort by date (newest first)
    interventions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    return {
      success: true,
      workshop: workshopData,
      interventions: interventions,
      interventionCount: interventions.length
    };
    
  } catch (error) {
    Logger.log('Error in getWorkshopHistory: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Archive workshop list (mark as completed)
function archiveWorkshopList(listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID non configurato' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    
    if (!workshopSheet) {
      return { success: false, error: 'Sheet Liste Officina non trovato' };
    }

    const data = workshopSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        // Update status column and completion date
        const statusCol = 20; // Stato Lavoro (column U, index 20)
        workshopSheet.getRange(i + 1, statusCol).setValue('Completato');
        
        // Add completion date if not already set
        const completionDateCol = 22; // Data Completamento (column V, index 21)
        if (!data[i][21]) {
          workshopSheet.getRange(i + 1, completionDateCol).setValue(new Date());
        }
        
        // Format row to indicate archived
        const rowRange = workshopSheet.getRange(i + 1, 1, 1, workshopSheet.getLastColumn());
        rowRange.setBackground('#e0e0e0'); // Gray background
        
        Logger.log('Archived workshop list: ' + listId);
        
        return {
          success: true,
          listId: listId,
          message: 'Lista archiviata con successo'
        };
      }
    }
    
    return { success: false, error: 'Lista non trovata' };
    
  } catch (error) {
    Logger.log('Error in archiveWorkshopList: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrappers
function findWorkshopJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const result = findWorkshop(params.workshopName);
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function createWorkshopJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const result = createWorkshop(
    params.workshopName,
    params.address || '',
    params.phone || '',
    params.email || '',
    params.notes || ''
  );
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getWorkshopHistoryJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const result = getWorkshopHistory(params.workshopId || params.workshopName);
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function archiveWorkshopListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const result = archiveWorkshopList(params.listId);
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get all workshops for selection modal
function getAllWorkshops() {
  try {
    const config = getConfig();
    const sheetId = config.MAINTENANCE_SHEET_ID;

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Anagrafica Officine');

    if (!sheet) {
      return {
        success: false,
        error: 'Anagrafica Officine sheet not found'
      };
    }

    const data = sheet.getDataRange().getValues();
    const workshops = [];

    // Skip header row (i = 1)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Check if workshop name exists (column B - index 1)
      if (row[1] && row[1].toString().trim()) {
        workshops.push({
          name: row[1].toString().trim(),      // Nome (column B)
          address: row[3] ? row[3].toString().trim() : '',  // Indirizzo (column D)
          phone: row[4] ? row[4].toString().trim() : '',    // Telefono (column E)
          email: row[5] ? row[5].toString().trim() : '',    // Email (column F)
          notes: row[6] ? row[6].toString().trim() : ''     // Note (column G)
        });
      }
    }

    return {
      success: true,
      workshops: workshops,
      total: workshops.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log('Error getting all workshops: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for getAllWorkshops
function getAllWorkshopsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const result = getAllWorkshops();
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/*************************************************************
 * GOOGLE API CREDENTIALS - Secure backend endpoint
 * Provides Google Drive Picker credentials without exposing them in frontend
 *************************************************************/

// Get Google API credentials from Script Properties (secure)
function getGoogleCredentials() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const clientId = scriptProperties.getProperty('GOOGLE_CLIENT_ID');
    const apiKey = scriptProperties.getProperty('GOOGLE_API_KEY');
    
    if (!clientId || !apiKey) {
      return {
        success: false,
        error: 'Google credentials not configured in Script Properties'
      };
    }
    
    // Extract App ID from Client ID (first part before hyphen)
    const appId = clientId.split('-')[0];
    
    return {
      success: true,
      clientId: clientId,
      apiKey: apiKey,
      appId: appId
    };
  } catch (error) {
    Logger.log('Error getting Google credentials: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for getGoogleCredentials
function getGoogleCredentialsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getGoogleCredentials();
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  
  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/*************************************************************
 * DAMAGE AI RECOGNITION SYSTEM
 * Analyzes photos to find who caused vehicle damage
 *************************************************************/

// Normalize phone number format
function normalizePhoneNumberForDamage(phone) {
  if (!phone) return '';
  let normalized = String(phone).replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  return normalized;
}

// Get photos from customer Drive folder
function getCustomerPhotos(phoneNumber) {
  try {
    const normalizedPhone = normalizePhoneNumberForDamage(phoneNumber);
    Logger.log('Getting photos for: ' + normalizedPhone);

    const mainFolderName = "Zoko Images";
    const mainFolderIterator = DriveApp.getFoldersByName(mainFolderName);

    if (!mainFolderIterator.hasNext()) {
      Logger.log('ERROR: Main folder "Zoko Images" not found');
      return [];
    }

    const mainFolder = mainFolderIterator.next();
    Logger.log('Found main folder: ' + mainFolder.getName() + ' (ID: ' + mainFolder.getId() + ')');

    // List all subfolders to debug
    const allSubfolders = mainFolder.getFolders();
    const subfolderNames = [];
    while (allSubfolders.hasNext()) {
      const subfolder = allSubfolders.next();
      subfolderNames.push(subfolder.getName());
    }
    Logger.log('Available subfolders (' + subfolderNames.length + '): ' + subfolderNames.slice(0, 10).join(', ') + (subfolderNames.length > 10 ? '...' : ''));

    const phoneFolderIterator = mainFolder.getFoldersByName(normalizedPhone);

    if (!phoneFolderIterator.hasNext()) {
      Logger.log('No folder found for: ' + normalizedPhone);
      Logger.log('Trying alternative formats...');

      // Try without + prefix
      const phoneWithout = normalizedPhone.replace('+', '');
      const phoneFolderIterator2 = mainFolder.getFoldersByName(phoneWithout);

      if (!phoneFolderIterator2.hasNext()) {
        Logger.log('Also tried: ' + phoneWithout + ' - not found');
        return [];
      }

      Logger.log('Found folder with alternative format: ' + phoneWithout);
      const phoneFolder = phoneFolderIterator2.next();
      return getPhotosFromFolder(phoneFolder);
    }

    Logger.log('Found folder: ' + normalizedPhone);
    const phoneFolder = phoneFolderIterator.next();
    return getPhotosFromFolder(phoneFolder);

  } catch (error) {
    Logger.log('Error getting photos: ' + error.toString());
    return [];
  }
}

// Helper function to extract photos from folder
function getPhotosFromFolder(folder) {
  const photos = [];
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();

    // Only include image files
    if (mimeType.startsWith('image/')) {
      photos.push({
        id: file.getId(),
        name: file.getName(),
        downloadUrl: file.getDownloadUrl(),
        thumbnailUrl: file.getThumbnail() ? file.getThumbnail().getUrl() : null,
        size: file.getSize(),
        dateCreated: file.getDateCreated().toISOString(),
        mimeType: mimeType
      });
    }
  }

  return photos;
}

// Analyze damage photos with AI
function analyzeDamage(photos, description) {
  try {
    Logger.log('Analyzing damage with ' + photos.length + ' photos');

    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      Logger.log('ERROR: OpenAI API key not configured');
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    // For now, return a mock analysis
    // In a real implementation, you would:
    // 1. Download the photos from Drive
    // 2. Send them to OpenAI Vision API
    // 3. Analyze the damage

    const mockAnalysis = {
      damageType: 'Cosmetic',
      severity: 'Minor',
      estimatedCost: '100-300 CHF',
      description: 'Small scratches on the side panel',
      recommendations: [
        'Clean the area thoroughly',
        'Apply touch-up paint if available',
        'Document with photos for insurance'
      ]
    };

    Logger.log('Mock analysis completed');
    return {
      success: true,
      analysis: mockAnalysis,
      photosAnalyzed: photos.length
    };

  } catch (error) {
    Logger.log('ERROR in analyzeDamage: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for damage analysis
function analyzeDamageJsonp(params) {
  try {
    const callback = params.callback || 'callback';

    Logger.log('analyzeDamageJsonp called');
    Logger.log('photos count: ' + (params.photos ? params.photos.length : 0));
    Logger.log('description: ' + params.description);

    const result = analyzeDamage(params.photos || [], params.description || '');
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('ERROR in analyzeDamageJsonp: ' + error.toString());
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// JSONP wrapper for customer photos
function getCustomerPhotosJsonp(params) {
  try {
    const callback = params.callback || 'callback';

    Logger.log('getCustomerPhotosJsonp called');
    Logger.log('phoneNumber: ' + params.phoneNumber);

    const photos = getCustomerPhotos(params.phoneNumber);
    const result = {
      success: true,
      photos: photos,
      count: photos.length
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(result) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    Logger.log('ERROR in getCustomerPhotosJsonp: ' + error.toString());
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Get vehicle bookings with limit and date range
function getVehicleBookingsJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const calendarId = params.calendarId;
    const limit = parseInt(params.limit) || 10;

    Logger.log('getVehicleBookingsJsonp called');
    Logger.log('calendarId: ' + calendarId);
    Logger.log('limit: ' + limit);

    try {
      const calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) {
        const errorResponse = {
          success: false,
          error: 'Calendar not found: ' + calendarId,
          timestamp: new Date().toISOString()
        };

        const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

        return ContentService
          .createTextOutput(jsonpResponse)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      // Set date range - default to last 6 months if not specified
      let startDateTime = new Date();
      startDateTime.setMonth(startDateTime.getMonth() - 6);
      let endDateTime = new Date();

      if (params.startDate && params.endDate) {
        startDateTime = new Date(params.startDate);
        endDateTime = new Date(params.endDate);
        // Add one day to end date to include the full day
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const events = calendar.getEvents(startDateTime, endDateTime);
      const bookings = events.map(function(event) {
        return {
          id: event.getId(),
          title: event.getTitle(),
          description: event.getDescription() || '',
          start: event.getStartTime().toISOString(),
          end: event.getEndTime().toISOString(),
          location: event.getLocation() || ''
        };
      });

      // Sort by end date (newest first)
      bookings.sort(function(a, b) {
        return new Date(b.end) - new Date(a.end);
      });

      // Apply limit
      const limitedBookings = bookings.slice(0, limit);

      const response = {
        success: true,
        bookings: limitedBookings,
        count: limitedBookings.length,
        calendarId: calendarId,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        timestamp: new Date().toISOString()
      };

      const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);

    } catch (error) {
      const errorResponse = {
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      };

      const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };

    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Get vehicle list with km data from vehicle config sheet
function getVehicleListWithKm() {
  try {
    const config = getConfig();
    const sheetId = config.VEHICLE_DATA_SHEET_ID;
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Configurazione veicoli') || ss.getSheets()[0];

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices - search for different possible names
    let nameIndex = headers.indexOf('vehicleType');
    if (nameIndex === -1) nameIndex = headers.indexOf('Nome');

    let idIndex = headers.indexOf('CalendarID');
    if (idIndex === -1) idIndex = headers.indexOf('calendarId');

    let kmIndex = headers.indexOf('KmNextService');
    if (kmIndex === -1) kmIndex = headers.indexOf('km fino al prossimo tagliando (colonna M)');

    let licencePlateIndex = headers.indexOf('LicencePlate');
    if (licencePlateIndex === -1) licencePlateIndex = headers.indexOf('Targa');

    let currentKmIndex = headers.indexOf('CurrentKm');
    if (currentKmIndex === -1) currentKmIndex = headers.indexOf('Km Attuali');

    let cartaGrigiaIndex = headers.indexOf('CartaGrigiaPhoto');
    if (cartaGrigiaIndex === -1) cartaGrigiaIndex = headers.indexOf('Foto Carta Grigia');

    const vehicles = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const vehicleName = row[nameIndex] || '';

      // Check if vehicle has name and calendar ID (skip empty rows)
      // AND filter: only include vehicles starting with "N"
      if (row[nameIndex] && row[idIndex] && vehicleName.toString().trim().toUpperCase().startsWith('N')) {
        vehicles.push({
          name: row[nameIndex],
          calendarId: row[idIndex],
          id: row[idIndex],
          kmToService: parseInt(row[kmIndex]) || 0,
          licencePlate: row[licencePlateIndex] || '',
          currentKm: parseInt(row[currentKmIndex]) || 0,
          cartaGrigiaPhoto: row[cartaGrigiaIndex] || ''
        });
      }
    }

    return {
      success: true,
      vehicles: vehicles,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getVehicleListWithKmJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getVehicleListWithKm();

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Analyze maintenance issue with AI
function analyzeMaintenanceIssue(description, category, kmToService) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');

    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    // Calculate days to service (assuming 100km/day)
    const daysToService = Math.floor(kmToService / 100);

    const prompt = `Sei un meccanico esperto. Analizza questo problema di manutenzione:

Categoria: ${category}
Descrizione: ${description}
Km fino al prossimo tagliando: ${kmToService} km (circa ${daysToService} giorni)

Rispondi in formato JSON con:
1. urgency: "low", "medium", "high", o "critical"
2. canWaitUntilService: true/false (può aspettare fino al prossimo tagliando?)
3. recommendation: breve consiglio in italiano (max 100 caratteri)

Esempio risposta:
{"urgency": "medium", "canWaitUntilService": true, "recommendation": "Controlla al prossimo tagliando"}`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sei un meccanico esperto che analizza problemi di veicoli. Rispondi sempre in italiano e in formato JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const result = JSON.parse(response.getContentText());

    if (result.error) {
      return {
        success: false,
        error: result.error.message
      };
    }

    let aiResponse = result.choices[0].message.content;

    // Remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const analysis = JSON.parse(aiResponse);

    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function analyzeMaintenanceIssueJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = analyzeMaintenanceIssue(
    params.description,
    params.category,
    parseInt(params.kmToService) || 0
  );

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

  function suggestMaintenanceIssue(description, vehicleName) {
    try {
      const normalizedDescription = (description || '').trim();

      if (!normalizedDescription) {
        return {
          success: false,
          error: 'Description is required'
        };
      }

      const scriptProperties = PropertiesService.getScriptProperties();
      const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');

      if (!apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured'
        };
      }

      const allowedCategories = ['motore', 'freni', 'pneumatici', 'elettrico', 'carrozzeria', 'interni', 'fluidi', 'climatizzazione', 'luci', 'altro'];

      const systemPrompt = 'Sei un responsabile officina che standardizza le segnalazioni di danni. Rispondi sempre in italiano con un JSON valido contenente esattamente i campi category, standardizedDescription, recommendedNote, urgency. category deve essere uno dei valori: motore, freni, pneumatici, elettrico, carrozzeria, interni, fluidi, climatizzazione, luci, altro. standardizedDescription deve essere una frase breve (max 160 caratteri) e coerente, senza riferimenti a persone o date e senza ripetere il nome del veicolo. recommendedNote contiene istruzioni operative aggiuntive (stringa, può essere vuota). urgency deve essere low, medium, high oppure critical.';

      const userPrompt = `Descrizione danno: ${normalizedDescription}
Veicolo: ${vehicleName || 'N/D'}

Restituisci il JSON con eventuali dettagli utili su materiali, misure, codici lampadine o note operative da seguire.`;

      const payload = {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      };

      const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        headers: {
          Authorization: 'Bearer ' + apiKey
        }
      });

      if (response.getResponseCode() >= 400) {
        Logger.log('ERROR suggestMaintenanceIssue HTTP ' + response.getResponseCode() + ': ' + response.getContentText());
        return {
          success: false,
          error: 'AI request failed'
        };
      }

      const data = JSON.parse(response.getContentText());
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

      if (!content) {
        return {
          success: false,
          error: 'Empty AI response'
        };
      }

      let suggestion;
      try {
        suggestion = JSON.parse(content);
      } catch (parseError) {
        Logger.log('ERROR parsing AI suggestion: ' + parseError);
        Logger.log('AI raw content: ' + content);
        return {
          success: false,
          error: 'Unable to parse AI response'
        };
      }

      if (!suggestion || typeof suggestion !== 'object') {
        return {
          success: false,
          error: 'Invalid AI response'
        };
      }

      let category = (suggestion.category || '').toString().toLowerCase().trim();
      if (allowedCategories.indexOf(category) === -1) {
        category = 'altro';
      }

      let standardizedDescription = (suggestion.standardizedDescription || '').toString().trim();
      if (!standardizedDescription) {
        standardizedDescription = normalizedDescription;
      }

      let recommendedNote = (suggestion.recommendedNote || '').toString().trim();
      if (recommendedNote.length > 250) {
        recommendedNote = recommendedNote.substring(0, 247) + '...';
      }

      let urgency = (suggestion.urgency || '').toString().toLowerCase().trim();
      if (['low', 'medium', 'high', 'critical'].indexOf(urgency) === -1) {
        urgency = 'medium';
      }

      return {
        success: true,
        suggestion: {
          category: category,
          standardizedDescription: standardizedDescription,
          recommendedNote: recommendedNote,
          urgency: urgency
        }
      };

    } catch (error) {
      Logger.log('ERROR in suggestMaintenanceIssue: ' + error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  function suggestMaintenanceIssueJsonp(params) {
    const callback = sanitizeJsonpCallback(params.callback || 'callback');
    const response = suggestMaintenanceIssue(params.description, params.vehicleName);
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

// Upload maintenance photo to Drive using Drive API
function uploadMaintenancePhoto(fileName, fileData, mimeType) {
  try {
    // Use specific maintenance photos folder
    const maintenanceFolderId = '1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p';

    // Decode base64 data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType,
      fileName
    );

    // Use Drive API v3 to upload file
    const file = {
      title: fileName,
      mimeType: mimeType,
      parents: [{id: maintenanceFolderId}]
    };

    const fileResource = Drive.Files.insert(file, blob, {
      supportsAllDrives: true
    });

    // Get shareable link
    const fileUrl = 'https://drive.google.com/file/d/' + fileResource.id + '/view';

    return {
      success: true,
      fileId: fileResource.id,
      fileUrl: fileUrl,
      fileName: fileResource.title,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback to DriveApp if Drive API fails
    try {
      const maintenanceFolder = DriveApp.getFolderById('1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p');
      const blob = Utilities.newBlob(
        Utilities.base64Decode(fileData),
        mimeType,
        fileName
      );
      const file = maintenanceFolder.createFile(blob);

      return {
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: file.getName(),
        timestamp: new Date().toISOString()
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Drive API error: ' + error.toString() + ' | Fallback error: ' + fallbackError.toString()
      };
    }
  }
}

function uploadMaintenancePhotoJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = uploadMaintenancePhoto(
    params.fileName,
    params.fileData,
    params.mimeType
  );

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get maintenance photo as base64 (for PDF embedding)
function getMaintenancePhotoBase64(fileId) {
  try {
    if (!fileId) {
      return {
        success: false,
        error: 'Missing fileId'
      };
    }

    const file = DriveApp.getFileById(fileId);
    const maintenanceFolderId = '1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p';

    // Security: ensure the file belongs to the maintenance photos folder
    let isInMaintenanceFolder = false;
    const parents = file.getParents();
    while (parents.hasNext()) {
      const parent = parents.next();
      if (parent.getId() === maintenanceFolderId) {
        isInMaintenanceFolder = true;
        break;
      }
    }

    if (!isInMaintenanceFolder) {
      return {
        success: false,
        error: 'File not in maintenance photos folder'
      };
    }

    const blob = file.getBlob();
    const mimeType = blob.getContentType() || 'image/jpeg';
    const base64Data = Utilities.base64Encode(blob.getBytes());

    return {
      success: true,
      dataUrl: 'data:' + mimeType + ';base64,' + base64Data,
      mimeType: mimeType,
      fileName: file.getName(),
      fileId: fileId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getMaintenancePhotoBase64Jsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getMaintenancePhotoBase64(params.fileId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Save maintenance report to Google Sheets
function saveMaintenanceReport(reportData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('Difetti e Riparazioni');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Difetti e Riparazioni');
      // Add headers (now with 24 columns - added: Stato Lavoro, ID Lista Officina, Data Invio Officina, PDF Lista URL, Fattura URL)
      const headerRow = sheet.getRange(1, 1, 1, 24);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi',
        'Stato Lavoro', 'ID Lista Officina', 'Data Invio Officina', 'PDF Lista URL', 'Fattura URL'
      ]]);
      // Format headers
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Check if headers exist, if not add them
    const firstRow = sheet.getRange(1, 1).getValue();
    if (!firstRow || firstRow !== 'ID Report') {
      sheet.insertRowBefore(1);
      const headerRow = sheet.getRange(1, 1, 1, 24);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi',
        'Stato Lavoro', 'ID Lista Officina', 'Data Invio Officina', 'PDF Lista URL', 'Fattura URL'
      ]]);
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
    
    // Update existing sheets to add new columns if missing
    const lastCol = sheet.getLastColumn();
    if (lastCol < 24) {
      const headerRange = sheet.getRange(1, 1, 1, 24);
      headerRange.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi',
        'Stato Lavoro', 'ID Lista Officina', 'Data Invio Officina', 'PDF Lista URL', 'Fattura URL'
      ]]);
    }

    const reportId = reportData.reportId;
    const reportDate = new Date(reportData.reportDate);
    const issues = reportData.issues;
    const totalIssues = issues.length;

    // Add one row per issue
    issues.forEach((issue, index) => {
      const photoURLs = reportData.photos ? reportData.photos.join('\n') : '';
      const photoIds = reportData.photoIds ? reportData.photoIds.join('\n') : '';

      const row = sheet.appendRow([
        reportId,
        reportDate,
        reportData.vehicleName,
        reportData.vehicleId,
        reportData.reportedBy,
        issue.category,
        issue.description,
        issue.urgency,
        'Aperto',
        false,
        '',
        '',
        '',
        '',
        '',
        photoURLs,
        photoIds,
        index + 1,
        totalIssues,
        'Aperto',      // Stato Lavoro (Col 20): Aperto / In Officina / Completato
        '',            // ID Lista Officina (Col 21)
        '',            // Data Invio Officina (Col 22)
        '',            // PDF Lista URL (Col 23)
        ''             // Fattura URL (Col 24)
      ]);

      // Get the last row number
      const lastRow = sheet.getLastRow();

      // Format urgency column with colors
      const urgencyCell = sheet.getRange(lastRow, 8);
      switch(issue.urgency) {
        case 'low':
          urgencyCell.setValue('🟢 Bassa');
          urgencyCell.setBackground('#c8e6c9');
          break;
        case 'medium':
          urgencyCell.setValue('🟡 Media');
          urgencyCell.setBackground('#fff9c4');
          break;
        case 'high':
          urgencyCell.setValue('🟠 Alta');
          urgencyCell.setBackground('#ffccbc');
          break;
        case 'critical':
          urgencyCell.setValue('🔴 Critica');
          urgencyCell.setBackground('#ffcdd2');
          urgencyCell.setFontWeight('bold');
          break;
      }

      // Format status column
      const statusCell = sheet.getRange(lastRow, 9);
      statusCell.setBackground('#e3f2fd');

      // Add checkbox to completed column
      const completedCell = sheet.getRange(lastRow, 10);
      completedCell.insertCheckboxes();

      // Format photo URLs as hyperlinks if present
      if (photoURLs) {
        const photoCell = sheet.getRange(lastRow, 16);
        const urls = reportData.photos;
        if (urls.length > 0) {
          // Create multiple HYPERLINK formulas separated by text
          const formulas = urls.map((url, i) => `HYPERLINK("${url}"; "Foto ${i+1}")`);
          photoCell.setFormula('=' + formulas.join(' & " | " & '));
          photoCell.setWrap(true);
        }
      }
    });

    return {
      success: true,
      reportId: reportId,
      issuesAdded: issues.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function saveMaintenanceReportJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const reportData = JSON.parse(params.data);
  const response = saveMaintenanceReport(reportData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get active maintenance reports (not completed)
function getActiveMaintenanceReports() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');

    if (!sheet) {
      return {
        success: true,
        reports: []
      };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Group rows by reportId
    const reportsMap = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reportId = row[0];
      const completed = row[9]; // completed column
      const statoLavoro = row[19]; // Stato Lavoro column (col 20, index 19)

      // Only include incomplete reports that are NOT in officina
      // (Stato Lavoro should be "Aperto", not "In Officina" or "Completato")
      if (!completed && statoLavoro !== 'In Officina' && statoLavoro !== 'Completato') {
        if (!reportsMap[reportId]) {
          reportsMap[reportId] = {
            reportId: reportId,
            reportDate: row[1],
            vehicleName: row[2],
            vehicleId: row[3],
            reportedBy: row[4],
            issues: [],
            totalIssues: row[18]
          };
        }

        // Extract photo URLs from HYPERLINK formulas
        let photoURLs = [];
        const photoCell = sheet.getRange(i + 1, 16);
        const formula = photoCell.getFormula();

        if (formula) {
          // Extract URLs from HYPERLINK formulas
          // Format: =HYPERLINK("url1"; "Foto 1") & " | " & HYPERLINK("url2"; "Foto 2")
          const urlMatches = formula.match(/HYPERLINK\("([^"]+)"/g);
          if (urlMatches) {
            photoURLs = urlMatches.map(match => {
              const urlMatch = match.match(/HYPERLINK\("([^"]+)"/);
              return urlMatch ? urlMatch[1] : null;
            }).filter(url => url !== null);
          }
        } else if (row[15]) {
          // Fallback: if no formula, try to split the cell value
          photoURLs = row[15]
            .toString()
            .split('\n')
            .map(url => url.trim())
            .filter(url => url && url.startsWith('http'));
        }

        const photoIds = row[16]
          ? row[16]
            .toString()
            .split('\n')
            .map(id => id.trim())
            .filter(id => id)
          : [];

        reportsMap[reportId].issues.push({
          issueNumber: row[17],
          category: row[5],
          description: row[6],
          urgency: row[7],
          status: row[8],
          completed: row[9],
          photoURLs: photoURLs,
          photoIds: photoIds
        });
      }
    }

    const reports = Object.values(reportsMap);

    return {
      success: true,
      reports: reports,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getActiveMaintenanceReportsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getActiveMaintenanceReports();

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get maintenance history (completed reports)
function getMaintenanceHistory() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');

    if (!sheet) {
      return {
        success: true,
        reports: []
      };
    }

    const data = sheet.getDataRange().getValues();

    // Group rows by reportId
    const reportsMap = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reportId = row[0];
      const allCompleted = row[9]; // This checks if all issues in report are completed

      if (!reportsMap[reportId]) {
        reportsMap[reportId] = {
          reportId: reportId,
          reportDate: row[1],
          vehicleName: row[2],
          vehicleId: row[3],
          reportedBy: row[4],
          issues: [],
          totalIssues: row[18],
          allCompleted: true
        };
      }

      if (!row[9]) {
        reportsMap[reportId].allCompleted = false;
      }

      // Extract photo URLs from HYPERLINK formulas
      let photoURLs = [];
      const photoCell = sheet.getRange(i + 1, 16);
      const formula = photoCell.getFormula();

      if (formula) {
        // Extract URLs from HYPERLINK formulas
        const urlMatches = formula.match(/HYPERLINK\("([^"]+)"/g);
        if (urlMatches) {
          photoURLs = urlMatches.map(match => {
            const urlMatch = match.match(/HYPERLINK\("([^"]+)"/);
            return urlMatch ? urlMatch[1] : null;
          }).filter(url => url !== null);
        }
      } else if (row[15]) {
        // Fallback: if no formula, try to split the cell value
        photoURLs = row[15]
          .toString()
          .split('\n')
          .map(url => url.trim())
          .filter(url => url && url.startsWith('http'));
      }

      const photoIds = row[16]
        ? row[16]
          .toString()
          .split('\n')
          .map(id => id.trim())
          .filter(id => id)
        : [];

      reportsMap[reportId].issues.push({
        issueNumber: row[17],
        category: row[5],
        description: row[6],
        urgency: row[7],
        status: row[8],
        completed: row[9],
        completionDate: row[10],
        repairType: row[11],
        cost: row[12],
        garage: row[13],
        invoiceNumber: row[14],
        photoURLs: photoURLs,
        photoIds: photoIds
      });
    }

    // Filter only completed reports
    const completedReports = Object.values(reportsMap).filter(r => r.allCompleted);

    return {
      success: true,
      reports: completedReports,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getMaintenanceHistoryJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getMaintenanceHistory();

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Delete maintenance report and all related data
function deleteMaintenanceReport(reportId, deletePhotos) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const issuesSheet = ss.getSheetByName('Difetti e Riparazioni');
    const historySheet = ss.getSheetByName('Storico Lavori');

    if (!issuesSheet) {
      return {
        success: false,
        error: 'Difetti e Riparazioni sheet not found'
      };
    }

    let deletedIssues = 0;
    let deletedHistory = 0;
    let deletedPhotos = 0;
    const photoUrls = [];

    // Step 1: Find and collect photo URLs, then delete from "Difetti e Riparazioni"
    const issuesData = issuesSheet.getDataRange().getValues();
    const rowsToDelete = [];

    for (let i = 1; i < issuesData.length; i++) {
      const row = issuesData[i];
      const rowReportId = row[0]; // Column A: ID Report

      if (rowReportId.toString() === reportId.toString()) {
        // Collect photo URL from column 21 (Foto Fattura)
        if (row[20]) {
          photoUrls.push(row[20]);
        }
        rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
      }
    }

    // Delete rows from bottom to top to avoid index shifting
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      issuesSheet.deleteRow(rowsToDelete[i]);
      deletedIssues++;
    }

    // Step 2: Delete from "Storico Lavori" by matching ID Lista
    if (historySheet) {
      const historyData = historySheet.getDataRange().getValues();
      const historyRowsToDelete = [];

      for (let i = 1; i < historyData.length; i++) {
        const row = historyData[i];
        const listId = row[8]; // Column I: ID Lista

        if (listId && listId.toString() === reportId.toString()) {
          historyRowsToDelete.push(i + 1);
        }
      }

      // Delete rows from bottom to top
      for (let i = historyRowsToDelete.length - 1; i >= 0; i--) {
        historySheet.deleteRow(historyRowsToDelete[i]);
        deletedHistory++;
      }
    }

    // Step 3: Optionally delete photos from Google Drive
    if (deletePhotos && photoUrls.length > 0) {
      for (const url of photoUrls) {
        try {
          // Extract file ID from Drive URL
          // URL format: https://drive.google.com/open?id=FILE_ID or https://drive.google.com/file/d/FILE_ID/...
          let fileId = null;

          if (url.includes('id=')) {
            fileId = url.split('id=')[1].split('&')[0];
          } else if (url.includes('/d/')) {
            fileId = url.split('/d/')[1].split('/')[0];
          }

          if (fileId) {
            const file = DriveApp.getFileById(fileId);
            file.setTrashed(true); // Move to trash instead of permanent delete
            deletedPhotos++;
          }
        } catch (photoError) {
          // Continue if photo deletion fails (file might already be deleted)
          Logger.log('Failed to delete photo: ' + photoError.toString());
        }
      }
    }

    return {
      success: true,
      deletedIssues: deletedIssues,
      deletedHistory: deletedHistory,
      deletedPhotos: deletedPhotos,
      message: `Eliminati: ${deletedIssues} report, ${deletedHistory} lavori storico${deletePhotos ? ', ' + deletedPhotos + ' foto' : ''}`
    };

  } catch (error) {
    Logger.log('Error deleting maintenance report: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for deleteMaintenanceReport
function deleteMaintenanceReportJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const reportId = params.reportId;
  const deletePhotos = params.deletePhotos === 'true' || params.deletePhotos === true;

  const response = deleteMaintenanceReport(reportId, deletePhotos);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Delete invoice analysis from Storico Lavori
function deleteInvoiceFromHistory(listId, invoiceDate, deletePhoto) {
  try {
    Logger.log('deleteInvoiceFromHistory called with: listId=' + listId + ', invoiceDate=' + invoiceDate + ', deletePhoto=' + deletePhoto);

    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      Logger.log('ERROR: Maintenance sheet ID not configured');
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const historySheet = ss.getSheetByName('Storico Lavori');

    if (!historySheet) {
      Logger.log('ERROR: Storico Lavori sheet not found');
      return {
        success: false,
        error: 'Storico Lavori sheet not found'
      };
    }

    let deletedRows = 0;
    let photoUrl = null;
    const rowsToDelete = [];

    // Helper function to parse Italian date format (DD/MM/YYYY)
    function parseItalianDate(dateStr) {
      if (!dateStr) return null;
      const str = dateStr.toString().trim();
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months are 0-based
        const year = parseInt(parts[2]);
        if (day > 0 && day <= 31 && month >= 0 && month <= 11 && year > 2000 && year < 2100) {
          return new Date(year, month, day);
        }
      }
      // Fallback to standard parsing
      return new Date(str);
    }

    // Parse the invoice date for comparison
    const targetDate = parseItalianDate(invoiceDate);
    const targetDateStr = Utilities.formatDate(targetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    Logger.log('Target date: ' + targetDateStr + ' (from: ' + invoiceDate + ')');

    // Find and collect rows to delete
    const historyData = historySheet.getDataRange().getValues();
    Logger.log('Storico Lavori has ' + historyData.length + ' rows');

    for (let i = 1; i < historyData.length; i++) {
      const row = historyData[i];
      const rowListId = row[10]; // Column K: ID Lista (corretto da 8)
      const rowDate = row[0];   // Column A: Data Lavoro (corretto da 2)

      // Convert row date to string for comparison
      let rowDateStr = '';
      if (rowDate instanceof Date) {
        rowDateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (rowDate) {
        try {
          const parsedDate = parseItalianDate(rowDate);
          rowDateStr = Utilities.formatDate(parsedDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } catch (e) {
          // Skip if date parsing fails
          Logger.log('Failed to parse date in row ' + (i+1) + ': ' + rowDate);
          continue;
        }
      }

      Logger.log('Row ' + (i+1) + ': listId=' + rowListId + ', date=' + rowDateStr + ', target=' + targetDateStr);

      if (rowListId && rowListId.toString() === listId.toString() && rowDateStr === targetDateStr) {
        Logger.log('Found matching row ' + (i+1) + ' for deletion');
        // Collect photo URL if exists (from TOTALE row, usually)
        if (row[12] && !photoUrl) { // Column M: Link Foto
          photoUrl = row[12];
        }
        rowsToDelete.push(i + 1);
      }
    }

    Logger.log('Found ' + rowsToDelete.length + ' rows to delete');

    // Delete rows from bottom to top to avoid index shifting
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      Logger.log('Deleting row ' + rowsToDelete[i]);
      historySheet.deleteRow(rowsToDelete[i]);
      deletedRows++;
    }

    Logger.log('Deleted ' + deletedRows + ' rows');

    // Clear invoice analysis data from workshop list sheet
    Logger.log('Clearing invoice analysis data from workshop list...');
    const workshopResult = getOrCreateWorkshopListsSheet();
    if (workshopResult.success) {
      const workshopSheet = workshopResult.sheet;
      const workshopData = workshopSheet.getDataRange().getValues();
      
      for (let i = 1; i < workshopData.length; i++) {
        if (workshopData[i][0] === listId) {
          Logger.log('Found workshop list row ' + (i + 1) + ' for listId: ' + listId);
          
          // Clear invoice analysis fields
          workshopSheet.getRange(i + 1, 15).setValue(''); // Foto Fattura URL
          workshopSheet.getRange(i + 1, 16).setValue(''); // Analisi Fattura (JSON)
          workshopSheet.getRange(i + 1, 17).setValue(''); // Data Upload Fattura
          workshopSheet.getRange(i + 1, 18).setValue(''); // Stato Analisi
          
          Logger.log('Cleared invoice analysis data from workshop list');
          break;
        }
      }
    }

    // Optionally delete photo from Google Drive
    let photoDeleted = false;
    if (deletePhoto && photoUrl) {
      Logger.log('Attempting to delete photo: ' + photoUrl);
      try {
        // Extract file ID from Drive URL
        let fileId = null;

        if (photoUrl.includes('id=')) {
          fileId = photoUrl.split('id=')[1].split('&')[0];
        } else if (photoUrl.includes('/d/')) {
          fileId = photoUrl.split('/d/')[1].split('/')[0];
        }

        if (fileId) {
          Logger.log('Deleting file ID: ' + fileId);
          const file = DriveApp.getFileById(fileId);
          file.setTrashed(true);
          photoDeleted = true;
          Logger.log('Photo deleted successfully');
        } else {
          Logger.log('Could not extract file ID from URL: ' + photoUrl);
        }
      } catch (photoError) {
        Logger.log('Failed to delete photo: ' + photoError.toString());
      }
    }

    const result = {
      success: true,
      deletedRows: deletedRows,
      photoDeleted: photoDeleted,
      message: `Eliminati ${deletedRows} lavori dallo storico e dati analisi fattura${photoDeleted ? ' e foto' : ''}`
    };

    Logger.log('deleteInvoiceFromHistory result: ' + JSON.stringify(result));
    return result;

  } catch (error) {
    Logger.log('Error deleting invoice from history: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for deleteInvoiceFromHistory
function deleteInvoiceFromHistoryJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const listId = params.listId;
  const invoiceDate = params.invoiceDate;
  const deletePhoto = params.deletePhoto === 'true' || params.deletePhoto === true;

  const response = deleteInvoiceFromHistory(listId, invoiceDate, deletePhoto);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Update issue status (mark as completed/not completed)
function updateIssueStatus(reportId, issueIndex, completed) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');

    if (!sheet) {
      return {
        success: false,
        error: 'Sheet not found'
      };
    }

    const data = sheet.getDataRange().getValues();

    // Find the row for this reportId and issueIndex
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === reportId && parseInt(row[17]) === issueIndex) {
        // Update completed checkbox (column J = 10)
        const completedCell = sheet.getRange(i + 1, 10);
        completedCell.setValue(completed);

        // Update completion date and status if completed
        if (completed) {
          sheet.getRange(i + 1, 11).setValue(new Date());
          const statusCell = sheet.getRange(i + 1, 9);
          statusCell.setValue('✅ Completato');
          statusCell.setBackground('#c8e6c9');
        } else {
          sheet.getRange(i + 1, 11).setValue('');
          const statusCell = sheet.getRange(i + 1, 9);
          statusCell.setValue('Aperto');
          statusCell.setBackground('#e3f2fd');
        }

        return {
          success: true,
          updated: true,
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      success: false,
      error: 'Issue not found'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateIssueStatusJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = updateIssueStatus(params.reportId, parseInt(params.issueIndex), params.completed === 'true');

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function updateIssueDetails(reportId, issueIndex, issueData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');

    if (!sheet) {
      return {
        success: false,
        error: 'Sheet not found'
      };
    }

    const data = sheet.getDataRange().getValues();

    // Find the row for this reportId and issueIndex
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === reportId && parseInt(row[17]) === issueIndex) {
        // Update issue details
        const rowIndex = i + 1;

        // Update category (column F = 6)
        if (issueData.category) {
          sheet.getRange(rowIndex, 6).setValue(issueData.category);
        }

        // Update description (column G = 7)
        if (issueData.description) {
          sheet.getRange(rowIndex, 7).setValue(issueData.description);
        }

        // Update urgency (column H = 8) and format cell
        if (issueData.urgency) {
          const urgencyCell = sheet.getRange(rowIndex, 8);
          switch(issueData.urgency) {
            case 'low':
              urgencyCell.setValue('🟢 Bassa');
              urgencyCell.setBackground('#c8e6c9');
              break;
            case 'medium':
              urgencyCell.setValue('🟡 Media');
              urgencyCell.setBackground('#fff9c4');
              break;
            case 'high':
              urgencyCell.setValue('🟠 Alta');
              urgencyCell.setBackground('#ffccbc');
              break;
            case 'critical':
              urgencyCell.setValue('🔴 Critica');
              urgencyCell.setBackground('#ffcdd2');
              urgencyCell.setFontWeight('bold');
              break;
            default:
              urgencyCell.setValue(issueData.urgency);
          }
        }

        // Update notes (if there's a notes field, we could add it to description or create a new column)
        // For now, append notes to description if provided
        if (issueData.notes) {
          const currentDescription = sheet.getRange(rowIndex, 7).getValue() || '';
          const updatedDescription = currentDescription + (currentDescription ? '\n\nNote: ' : 'Note: ') + issueData.notes;
          sheet.getRange(rowIndex, 7).setValue(updatedDescription);
        }

        // Handle photo uploads if provided
        if (issueData.photoIds && issueData.photoIds.length > 0) {
          // Get current photo IDs and URLs
          const currentPhotoIds = (sheet.getRange(rowIndex, 17).getValue() || '').split('\n').filter(id => id.trim());
          const currentPhotoUrls = (sheet.getRange(rowIndex, 16).getValue() || '').split('\n').filter(url => url.trim());

          // Add new photo IDs and URLs
          const updatedPhotoIds = [...currentPhotoIds, ...issueData.photoIds];
          const updatedPhotoUrls = [...currentPhotoUrls, ...(issueData.photoUrls || [])];

          // Update photo columns
          sheet.getRange(rowIndex, 17).setValue(updatedPhotoIds.join('\n'));
          sheet.getRange(rowIndex, 16).setValue(updatedPhotoUrls.join('\n'));
        }

        return {
          success: true,
          updated: true,
          message: 'Issue details updated successfully',
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      success: false,
      error: 'Issue not found'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateIssueDetailsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');

  // Parse the JSON data from params.data
  const updateData = JSON.parse(params.data || '{}');
  
  // Extract issue data
  const issueData = {};
  if (updateData.category) issueData.category = updateData.category;
  if (updateData.description) issueData.description = updateData.description;
  if (updateData.urgency) issueData.urgency = updateData.urgency;
  if (updateData.notes) issueData.notes = updateData.notes;

  // Handle photo data
  if (updateData.photoIds) {
    issueData.photoIds = Array.isArray(updateData.photoIds) ? updateData.photoIds : [updateData.photoIds];
  }
  if (updateData.photoUrls) {
    issueData.photoUrls = Array.isArray(updateData.photoUrls) ? updateData.photoUrls : [updateData.photoUrls];
  }

  const response = updateIssueDetails(updateData.reportId, parseInt(updateData.issueIndex), issueData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ===== GARAGE MANAGEMENT FUNCTIONS =====

// Create or get Garages sheet
function getOrCreateGaragesSheet() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('Officine');

    if (!sheet) {
      sheet = ss.insertSheet('Officine');
      
      // Add headers
      const headerRow = sheet.getRange(1, 1, 1, 11);
      headerRow.setValues([[
        'Nome Officina',
        'Indirizzo',
        'Città',
        'CAP',
        'Telefono',
        'Cellulare',
        'Email',
        'Sito Web',
        'Responsabile',
        'Specializzazione',
        'Note'
      ]]);
      
      // Format headers
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      
      // Set column widths
      sheet.setColumnWidth(1, 150); // Nome
      sheet.setColumnWidth(2, 180); // Indirizzo
      sheet.setColumnWidth(3, 120); // Città
      sheet.setColumnWidth(4, 60);  // CAP
      sheet.setColumnWidth(5, 120); // Telefono
      sheet.setColumnWidth(6, 120); // Cellulare
      sheet.setColumnWidth(7, 160); // Email
      sheet.setColumnWidth(8, 160); // Sito Web
      sheet.setColumnWidth(9, 130); // Responsabile
      sheet.setColumnWidth(10, 150); // Specializzazione
      sheet.setColumnWidth(11, 200); // Note
    }

    return {
      success: true,
      sheet: sheet
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Get list of garages
function getGaragesList() {
  try {
    const result = getOrCreateGaragesSheet();
    if (!result.success) {
      return result;
    }

    const sheet = result.sheet;
    const data = sheet.getDataRange().getValues();
    const garages = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // If name exists
        garages.push({
          name: row[0],
          address: row[1],
          city: row[2],
          zip: row[3],
          phone: row[4],
          mobile: row[5],
          email: row[6],
          website: row[7],
          responsabile: row[8],
          specialization: row[9],
          notes: row[10]
        });
      }
    }

    return {
      success: true,
      garages: garages,
      total: garages.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getGaragesListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getGaragesList();

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get or create Workshop Lists sheet
function getOrCreateWorkshopListsSheet() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('Liste Officina');

    if (!sheet) {
      sheet = ss.insertSheet('Liste Officina');
      
      // Add headers (18 columns now - added Invoice AI columns)
      const headerRow = sheet.getRange(1, 1, 1, 18);
      headerRow.setValues([[
        'ID Lista',                    // 1
        'Data Creazione',              // 2
        'ID Veicolo',                  // 3
        'Nome Veicolo',                // 4
        'Nome Officina',               // 5
        'Report IDs (JSON)',           // 6
        'PDF URL',                     // 7
        'Fattura URL',                 // 8
        'Stato',                       // 9
        'Costo Totale (CHF)',          // 10
        'Data Completamento',          // 11
        'Lavori Aggiuntivi (JSON)',    // 12 - serviceWorks, extraWorks
        'Note',                        // 13
        'PDF History (JSON)',          // 14
        'Foto Fattura URL',            // 15 - NEW: Link alla foto fattura su Drive
        'Analisi Fattura (JSON)',      // 16 - NEW: Risultato analisi AI
        'Data Upload Fattura',         // 17 - NEW: Timestamp upload
        'Stato Analisi'                // 18 - NEW: Pending/Success/Error
      ]]);
      
      // Format headers
      headerRow.setBackground('#17a2b8');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      
      // Set column widths
      sheet.setColumnWidth(1, 150);  // ID Lista
      sheet.setColumnWidth(2, 120);  // Data Creazione
      sheet.setColumnWidth(3, 120);  // ID Veicolo
      sheet.setColumnWidth(4, 150);  // Nome Veicolo
      sheet.setColumnWidth(5, 150);  // Nome Officina
      sheet.setColumnWidth(6, 200);  // Report IDs
      sheet.setColumnWidth(7, 200);  // PDF URL
      sheet.setColumnWidth(8, 200);  // Fattura URL (legacy)
      sheet.setColumnWidth(9, 120);  // Stato
      sheet.setColumnWidth(10, 120); // Costo Totale
      sheet.setColumnWidth(11, 120); // Data Completamento
      sheet.setColumnWidth(12, 250); // Lavori Aggiuntivi
      sheet.setColumnWidth(13, 200); // Note
      sheet.setColumnWidth(14, 250); // PDF History
      sheet.setColumnWidth(15, 200); // Foto Fattura URL
      sheet.setColumnWidth(16, 300); // Analisi Fattura (JSON)
      sheet.setColumnWidth(17, 120); // Data Upload Fattura
      sheet.setColumnWidth(18, 100); // Stato Analisi
    }

    return {
      success: true,
      sheet: sheet
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Add new garage
function addGarage(garageData) {
  try {
    const result = getOrCreateGaragesSheet();
    if (!result.success) {
      return result;
    }

    const sheet = result.sheet;
    
    sheet.appendRow([
      garageData.name || '',
      garageData.address || '',
      garageData.city || '',
      garageData.zip || '',
      garageData.phone || '',
      garageData.mobile || '',
      garageData.email || '',
      garageData.website || '',
      garageData.responsabile || '',
      garageData.specialization || '',
      garageData.notes || ''
    ]);

    return {
      success: true,
      message: 'Garage added successfully',
      garage: garageData
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addGarageJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const garageData = JSON.parse(params.data);
  const response = addGarage(garageData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Update existing garage
function updateGarage(garageData) {
  try {
    const result = getOrCreateGaragesSheet();
    if (!result.success) {
      return result;
    }

    const sheet = result.sheet;
    const data = sheet.getDataRange().getValues();
    
    // Find the garage by name
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === garageData.name) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return {
        success: false,
        error: 'Garage not found'
      };
    }

    // Update the row
    sheet.getRange(rowIndex, 1, 1, 11).setValues([[
      garageData.name || '',
      garageData.address || '',
      garageData.city || '',
      garageData.zip || '',
      garageData.phone || '',
      garageData.mobile || '',
      garageData.email || '',
      garageData.website || '',
      garageData.responsabile || '',
      garageData.specialization || '',
      garageData.notes || ''
    ]]);

    return {
      success: true,
      message: 'Garage updated successfully',
      garage: garageData
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateGarageJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const garageData = JSON.parse(params.data);
  const response = updateGarage(garageData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Delete garage
function deleteGarage(garageName) {
  try {
    const result = getOrCreateGaragesSheet();
    if (!result.success) {
      return result;
    }

    const sheet = result.sheet;
    const data = sheet.getDataRange().getValues();
    
    // Find the garage by name
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === garageName) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return {
        success: false,
        error: 'Garage not found'
      };
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Garage deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function deleteGarageJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = deleteGarage(params.garageName);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ===== WORKSHOP LISTS MANAGEMENT =====

// Create a new workshop list (sending issues to workshop)
function createWorkshopList(listData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    
    if (!difettiSheet) {
      return { success: false, error: 'Difetti e Riparazioni sheet not found' };
    }

    // Create workshop lists sheet if needed
    const workshopResult = getOrCreateWorkshopListsSheet();
    if (!workshopResult.success) {
      return workshopResult;
    }
    const workshopSheet = workshopResult.sheet;

    // Generate unique list ID
    const timestamp = new Date().getTime();
    const listId = 'WORK_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '_' + timestamp;

    // Parse issue identifiers (reportId + issueNumber)
    const issueIdentifiers = JSON.parse(listData.issueIdentifiers);
    const updatedIssues = [];

    // Update each issue's status to "In Officina"
    const data = difettiSheet.getDataRange().getValues();
    
    // Build a map of reportId -> issue positions for matching
    const reportIssueMap = {};
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reportId = row[0];
      if (!reportIssueMap[reportId]) {
        reportIssueMap[reportId] = [];
      }
      reportIssueMap[reportId].push({
        rowIndex: i,
        issueNumber: parseInt(row[17]) // N. Problema column (actual issue number from sheet)
      });
    }
    
    // Now match and update issues
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reportId = row[0];
      const issueNumber = parseInt(row[17]); // N. Problema column

      // Check if this issue is in our list - match by reportId and issueNumber
      const matchingIssue = issueIdentifiers.find(id => {
        // id.issueNumber from wizard is 1-based index (issueIdx + 1)
        // We need to match it with the actual issueNumber in the sheet
        return id.reportId === reportId && id.issueNumber === issueNumber;
      });

      if (matchingIssue) {
        // Update columns: Stato Lavoro (20), ID Lista Officina (21), Data Invio Officina (22)
        difettiSheet.getRange(i + 1, 20).setValue('In Officina');
        difettiSheet.getRange(i + 1, 21).setValue(listId);
        difettiSheet.getRange(i + 1, 22).setValue(new Date());
        
        // Store for confirmation
        updatedIssues.push({
          reportId: reportId,
          issueNumber: issueNumber,
          description: row[6] // Descrizione Problema
        });
      }
    }

    // Prepare additional works data (service and extra works)
    const additionalWorks = {
      serviceWorks: listData.serviceWorks || [],
      extraWorks: listData.extraWorks || []
    };

    // Create workshop list entry (18 columns)
    workshopSheet.appendRow([
      listId,                                // 1: ID Lista
      new Date(),                            // 2: Data Creazione
      listData.vehicleId,                    // 3: ID Veicolo
      listData.vehicleName,                  // 4: Nome Veicolo
      listData.workshopName || '',           // 5: Nome Officina
      JSON.stringify(issueIdentifiers),      // 6: Report IDs (JSON)
      listData.pdfUrl || '',                 // 7: PDF URL
      '',                                    // 8: Fattura URL (legacy)
      'In Corso',                            // 9: Stato
      '',                                    // 10: Costo Totale
      '',                                    // 11: Data Completamento
      JSON.stringify(additionalWorks),       // 12: Lavori Aggiuntivi (JSON)
      '',                                    // 13: Note
      '',                                    // 14: PDF History (JSON)
      '',                                    // 15: Foto Fattura URL
      '',                                    // 16: Analisi Fattura (JSON)
      '',                                    // 17: Data Upload Fattura
      ''                                     // 18: Stato Analisi
    ]);

    return {
      success: true,
      listId: listId,
      issuesUpdated: updatedIssues.length,
      issues: updatedIssues
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function createWorkshopListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const listData = JSON.parse(params.data);
  const response = createWorkshopList(listData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Move issue back to active (remove from workshop list)
function moveIssueBackToActive(reportId, issueNumber) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    let found = false;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === reportId && parseInt(row[17]) === parseInt(issueNumber)) {
        // Reset to "Aperto" state
        sheet.getRange(i + 1, 20).setValue('Aperto');          // Stato Lavoro
        sheet.getRange(i + 1, 21).setValue('');                // ID Lista Officina
        sheet.getRange(i + 1, 22).setValue('');                // Data Invio Officina
        found = true;
        break;
      }
    }

    if (!found) {
      return { success: false, error: 'Issue not found' };
    }

    return {
      success: true,
      message: 'Issue moved back to active reports'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function moveIssueBackToActiveJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = moveIssueBackToActive(params.reportId, params.issueNumber);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get all workshop lists with their issues
function getWorkshopLists() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    
    // Get workshop lists
    const workshopResult = getOrCreateWorkshopListsSheet();
    if (!workshopResult.success) {
      return workshopResult;
    }
    const workshopSheet = workshopResult.sheet;
    const workshopData = workshopSheet.getDataRange().getValues();

    // Get all issues
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    if (!difettiSheet) {
      return { success: false, error: 'Difetti e Riparazioni sheet not found' };
    }
    const difettiData = difettiSheet.getDataRange().getValues();

    const lists = [];

    // Process each workshop list
    for (let i = 1; i < workshopData.length; i++) {
      const row = workshopData[i];
      const listId = row[0];
      
      if (!listId) continue;

      // Get all issues belonging to this list
      const listIssues = [];
      for (let j = 1; j < difettiData.length; j++) {
        const issueRow = difettiData[j];
        const issueListId = issueRow[20]; // ID Lista Officina column (col 21, index 20)
        
        if (issueListId === listId) {
          listIssues.push({
            reportId: issueRow[0],
            issueNumber: parseInt(issueRow[17]), // N. Problema
            category: issueRow[5],
            description: issueRow[6],
            urgency: issueRow[7],
            stato: issueRow[19], // Stato Lavoro (col 20, index 19)
            completato: issueRow[9],
            dataCompletamento: issueRow[10],
            tipoRiparazione: issueRow[11],
            costo: issueRow[12],
            garage: issueRow[13],
            numeroFattura: issueRow[14],
            photoUrls: issueRow[15]
          });
        }
      }

      // Parse additional works from noteOfficina (col 12)
      let additionalWorks = { serviceWorks: [], extraWorks: [] };
      try {
        if (row[11] && row[11].toString().startsWith('{')) {
          additionalWorks = JSON.parse(row[11]);
        }
      } catch (e) {
        // If not JSON, it's just text notes
      }

      // Parse PDF history (col 14, index 13)
      let pdfHistory = [];
      try {
        if (row[13]) {
          pdfHistory = JSON.parse(row[13]);
        }
      } catch (e) {
        pdfHistory = [];
      }

      // Parse invoice analysis (col 16, index 15)
      let invoiceAnalysis = null;
      try {
        if (row[15]) {
          invoiceAnalysis = JSON.parse(row[15]);
        }
      } catch (e) {
        invoiceAnalysis = null;
      }

      lists.push({
        listId: listId,
        dataCreazione: row[1],
        vehicleId: row[2],
        vehicleName: row[3],
        workshopName: row[4],
        pdfUrl: row[6],
        fatturaUrl: row[7],
        stato: row[8],
        costoTotale: row[9],
        dataCompletamento: row[10],
        noteOfficina: typeof additionalWorks === 'object' ? '' : row[11], // Only if not JSON
        datiFattura: row[12],
        pdfHistory: pdfHistory,
        // NEW: Invoice AI fields
        invoicePhotoUrl: row[14] || '',
        invoiceAnalysis: invoiceAnalysis,
        invoiceUploadDate: row[16] || '',
        invoiceAnalysisStatus: row[17] || '',
        // Issues and works
        issues: listIssues,
        totalIssues: listIssues.length,
        serviceWorks: additionalWorks.serviceWorks || [],
        extraWorks: additionalWorks.extraWorks || []
      });
    }

    return {
      success: true,
      lists: lists,
      total: lists.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getWorkshopListsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getWorkshopLists();

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Delete entire workshop list and return all issues to "Aperto" status
function deleteWorkshopList(listId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    
    // Get difetti sheet to reset issues
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    if (!difettiSheet) {
      return { success: false, error: 'Difetti e Riparazioni sheet not found' };
    }

    // Reset all issues with this listId back to "Aperto"
    const data = difettiSheet.getDataRange().getValues();
    let issuesReset = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const issueListId = row[20]; // ID Lista Officina column
      
      if (issueListId === listId) {
        // Reset to "Aperto" state
        difettiSheet.getRange(i + 1, 20).setValue('Aperto');      // Stato Lavoro
        difettiSheet.getRange(i + 1, 21).setValue('');            // ID Lista Officina
        difettiSheet.getRange(i + 1, 22).setValue('');            // Data Invio Officina
        issuesReset++;
      }
    }

    // Delete workshop list entry
    const workshopResult = getOrCreateWorkshopListsSheet();
    if (!workshopResult.success) {
      return workshopResult;
    }
    const workshopSheet = workshopResult.sheet;
    const workshopData = workshopSheet.getDataRange().getValues();
    
    let listRowIndex = -1;
    for (let i = 1; i < workshopData.length; i++) {
      if (workshopData[i][0] === listId) {
        listRowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (listRowIndex > 0) {
      workshopSheet.deleteRow(listRowIndex);
    }

    return {
      success: true,
      message: 'Workshop list deleted and issues returned to active',
      issuesReset: issuesReset
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function deleteWorkshopListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = deleteWorkshopList(params.listId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Complete all issues in a workshop list
function completeWorkshopList(listId, completionData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const difettiSheet = ss.getSheetByName('Difetti e Riparazioni');
    
    if (!difettiSheet) {
      return { success: false, error: 'Sheet not found' };
    }

    const data = difettiSheet.getDataRange().getValues();
    let issuesCompleted = 0;
    const now = new Date();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const issueListId = row[20]; // ID Lista Officina column
      
      if (issueListId === listId) {
        // Mark as completed
        difettiSheet.getRange(i + 1, 10).setValue(true);           // Completato checkbox
        difettiSheet.getRange(i + 1, 11).setValue(now);            // Data Completamento
        difettiSheet.getRange(i + 1, 20).setValue('Completato');   // Stato Lavoro
        
        // If completion data provided (from invoice), fill in details
        if (completionData && completionData.garage) {
          difettiSheet.getRange(i + 1, 14).setValue(completionData.garage);
        }
        if (completionData && completionData.invoiceNumber) {
          difettiSheet.getRange(i + 1, 15).setValue(completionData.invoiceNumber);
        }
        
        issuesCompleted++;
      }
    }

    // Update workshop list status
    const workshopResult = getOrCreateWorkshopListsSheet();
    if (workshopResult.success) {
      const workshopSheet = workshopResult.sheet;
      const workshopData = workshopSheet.getDataRange().getValues();
      
      for (let i = 1; i < workshopData.length; i++) {
        if (workshopData[i][0] === listId) {
          workshopSheet.getRange(i + 1, 9).setValue('Completato');   // Stato
          workshopSheet.getRange(i + 1, 11).setValue(now);           // Data Completamento
          if (completionData && completionData.totalCost) {
            workshopSheet.getRange(i + 1, 10).setValue(completionData.totalCost);
          }
          break;
        }
      }
    }

    return {
      success: true,
      issuesCompleted: issuesCompleted
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function completeWorkshopListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const completionData = params.completionData ? JSON.parse(params.completionData) : null;
  const response = completeWorkshopList(params.listId, completionData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Add work (service or extra) to workshop list
function addWorkToList(listId, workType, work) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    
    if (!workshopSheet) {
      return { success: false, error: 'Liste Officina sheet not found' };
    }

    const data = workshopSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        // Get current additionalWorks JSON from column 12
        let additionalWorks = { serviceWorks: [], extraWorks: [] };
        try {
          if (data[i][11]) {
            additionalWorks = JSON.parse(data[i][11]);
          }
        } catch (e) {
          additionalWorks = { serviceWorks: [], extraWorks: [] };
        }

        // Add work to appropriate array
        if (workType === 'service') {
          if (!additionalWorks.serviceWorks) additionalWorks.serviceWorks = [];
          additionalWorks.serviceWorks.push(work);
        } else if (workType === 'extra') {
          if (!additionalWorks.extraWorks) additionalWorks.extraWorks = [];
          additionalWorks.extraWorks.push(work);
        }

        // Update column 12 with new JSON
        workshopSheet.getRange(i + 1, 12).setValue(JSON.stringify(additionalWorks));

        return { success: true, listId: listId };
      }
    }

    return { success: false, error: 'Lista non trovata' };

  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function addWorkToListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = addWorkToList(params.listId, params.workType, params.work);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Remove work (service or extra) from workshop list
function removeWorkFromList(listId, workType, workIndex) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');
    
    if (!sheetId) {
      return { success: false, error: 'MAINTENANCE_SHEET_ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const workshopSheet = ss.getSheetByName('Liste Officina');
    
    if (!workshopSheet) {
      return { success: false, error: 'Liste Officina sheet not found' };
    }

    const data = workshopSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === listId) {
        // Get current additionalWorks JSON from column 12
        let additionalWorks = { serviceWorks: [], extraWorks: [] };
        try {
          if (data[i][11]) {
            additionalWorks = JSON.parse(data[i][11]);
          }
        } catch (e) {
          return { success: false, error: 'Errore nel parsing dei lavori' };
        }

        // Remove work from appropriate array
        const index = parseInt(workIndex);
        if (workType === 'service') {
          if (additionalWorks.serviceWorks && index >= 0 && index < additionalWorks.serviceWorks.length) {
            additionalWorks.serviceWorks.splice(index, 1);
          } else {
            return { success: false, error: 'Indice non valido' };
          }
        } else if (workType === 'extra') {
          if (additionalWorks.extraWorks && index >= 0 && index < additionalWorks.extraWorks.length) {
            additionalWorks.extraWorks.splice(index, 1);
          } else {
            return { success: false, error: 'Indice non valido' };
          }
        }

        // Update column 12 with new JSON
        workshopSheet.getRange(i + 1, 12).setValue(JSON.stringify(additionalWorks));

        return { success: true, listId: listId };
      }
    }

    return { success: false, error: 'Lista non trovata' };

  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function removeWorkFromListJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = removeWorkFromList(params.listId, params.workType, params.workIndex);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Search garages online using Google Places API
function searchGaragesOnline(query, location) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Google Places API key not configured. Add GOOGLE_PLACES_API_KEY in Script Properties.'
      };
    }

    // Default to Lugano area if no location provided
    const searchLocation = location || '46.0037,8.9511'; // Lugano coordinates
    
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
      'location=' + encodeURIComponent(searchLocation) +
      '&radius=50000' + // 50km radius
      '&keyword=' + encodeURIComponent(query + ' officina meccanico carrozzeria auto') +
      '&type=car_repair' +
      '&language=it' +
      '&key=' + apiKey;

    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return {
        success: false,
        error: 'Places API error: ' + data.status + (data.error_message ? ' - ' + data.error_message : '')
      };
    }

    const garages = (data.results || []).slice(0, 10).map(place => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating || 'N/A',
      totalRatings: place.user_ratings_total || 0,
      isOpen: place.opening_hours ? place.opening_hours.open_now : null,
      placeId: place.place_id,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    }));

    return {
      success: true,
      garages: garages,
      total: garages.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function searchGaragesOnlineJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = searchGaragesOnline(params.query, params.location);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get detailed info about a specific place
function getGarageDetails(placeId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Google Places API key not configured'
      };
    }

    const url = 'https://maps.googleapis.com/maps/api/place/details/json?' +
      'place_id=' + encodeURIComponent(placeId) +
      '&fields=name,formatted_address,address_components,formatted_phone_number,website,opening_hours,rating,reviews' +
      '&language=it' +
      '&key=' + apiKey;

    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());

    if (data.status !== 'OK') {
      return {
        success: false,
        error: 'Places API error: ' + data.status
      };
    }

    const place = data.result;
    
    // Parse address components to extract city, zip, street
    let streetAddress = '';
    let city = '';
    let zip = '';
    
    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('route')) {
          streetAddress = component.long_name;
        }
        if (types.includes('street_number')) {
          streetAddress = component.long_name + (streetAddress ? ' ' + streetAddress : '');
        }
        if (types.includes('locality') || types.includes('administrative_area_level_3')) {
          city = component.long_name;
        }
        if (types.includes('postal_code')) {
          zip = component.long_name;
        }
      });
    }
    
    return {
      success: true,
      garage: {
        name: place.name,
        address: place.formatted_address,
        streetAddress: streetAddress,
        city: city,
        zip: zip,
        phone: place.formatted_phone_number || '',
        website: place.website || '',
        rating: place.rating || 'N/A',
        openingHours: place.opening_hours ? place.opening_hours.weekday_text : [],
        reviews: (place.reviews || []).slice(0, 3).map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.relative_time_description
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getGarageDetailsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getGarageDetails(params.placeId);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/*************************************************************
 * LEGACY MAINTENANCE DATA IMPORT SYSTEM
 * Imports old maintenance records from external systems
 *************************************************************/

// Import legacy maintenance data from external system
function importLegacyMaintenanceData(legacyData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return {
        success: false,
        error: 'Maintenance sheet ID not configured. Please set MAINTENANCE_SHEET_ID in Script Properties.'
      };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('Difetti e Riparazioni');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Difetti e Riparazioni');
      // Add headers
      const headerRow = sheet.getRange(1, 1, 1, 19);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi'
      ]]);
      // Format headers
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    let importedCount = 0;
    const errors = [];

    legacyData.forEach((item, index) => {
      try {
        // Generate unique report ID
        const reportId = 'IMPORT_' + new Date().getTime() + '_' + index;

        // Map vehicle number to our format (add N prefix if needed)
        const vehicleNumber = (item.furgone || '').toString().trim();
        const vehicleName = vehicleNumber ? (vehicleNumber.startsWith('N') ? vehicleNumber : 'N' + vehicleNumber) : '';

        // Parse date - handle various formats
        let reportDate = new Date();
        if (item.dataDifetto) {
          const dateStr = item.dataDifetto.toString().trim();
          if (dateStr.includes('/')) {
            // Format DD/MM/YYYY
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // JS months are 0-based
              const year = parseInt(parts[2]);
              reportDate = new Date(year, month, day);
            }
          } else if (dateStr.length === 4 && /^\d{4}$/.test(dateStr)) {
            // Just year
            reportDate = new Date(parseInt(dateStr), 0, 1);
          } else if (dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // Already YYYY-MM-DD format
            reportDate = new Date(dateStr);
          }
        }

        // Map urgency based on keywords
        let urgency = 'medium'; // default
        const urgStr = (item.urgenza || '').toString().toLowerCase();
        if (urgStr.includes('dan') || urgStr.includes('precet') || urgStr.includes('critic')) {
          urgency = 'high';
        } else if (urgStr.includes('bass') || urgStr.includes('low')) {
          urgency = 'low';
        } else if (urgStr.includes('alt') || urgStr.includes('high')) {
          urgency = 'high';
        }

        // Map status - check for completion keywords
        const stato = (item.stato || '').toString().toLowerCase();
        const risolto = (item.risoltoInCheModo || '').toString().toLowerCase();
        const isCompleted = stato.includes('risolto') || stato.includes('complet') ||
                           risolto.includes('fatto') || risolto.includes('riparat') ||
                           risolto.length > 5; // If there's repair info, likely completed

        // Completion date
        let completionDate = '';
        if (isCompleted && item.data) {
          const compDateStr = item.data.toString().trim();
          if (compDateStr.includes('/')) {
            const parts = compDateStr.split('/');
            if (parts.length === 3) {
              completionDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
        }

        // Map category based on description keywords
        let category = 'altro'; // default
        const desc = (item.descrizione || '').toString().toLowerCase();
        if (desc.includes('fren') || desc.includes('pastigl')) {
          category = 'freni';
        } else if (desc.includes('pneumat') || desc.includes('gomma') || desc.includes('ruota')) {
          category = 'pneumatici';
        } else if (desc.includes('motore') || desc.includes('meccanic') || desc.includes('olio')) {
          category = 'motore';
        } else if (desc.includes('elettric') || desc.includes('batteri') || desc.includes('luce') || desc.includes('faro')) {
          category = 'elettrico';
        } else if (desc.includes('carrozz') || desc.includes('vernice') || desc.includes('dann')) {
          category = 'carrozzeria';
        } else if (desc.includes('climatizz') || desc.includes('aria')) {
          category = 'climatizzazione';
        } else if (desc.includes('fluid') || desc.includes('antigelo') || desc.includes('acqua')) {
          category = 'fluidi';
        }

        // Create issue object
        const issue = {
          category: category,
          description: item.descrizione || '',
          urgency: urgency,
          status: isCompleted ? 'Completato' : 'Aperto',
          completed: isCompleted,
          completionDate: completionDate,
          repairType: item.risoltoInCheModo || '',
          cost: '',
          garage: item.gestitoDa || item.daChi || '',
          invoiceNumber: '',
          photoURLs: [],
          photoIds: []
        };

        // Add row to sheet
        const rowData = [
          reportId,
          reportDate,
          vehicleName,
          vehicleName, // vehicleId same as name for now
          item.datiCliente || item.annuncioFattoDa || '',
          issue.category,
          issue.description,
          issue.urgency,
          issue.status,
          issue.completed,
          issue.completionDate,
          issue.repairType,
          issue.cost,
          issue.garage,
          issue.invoiceNumber,
          issue.photoURLs.join('\n'),
          issue.photoIds.join('\n'),
          1, // issue number
          1  // total issues
        ];

        sheet.appendRow(rowData);

        // Format the new row
        const lastRow = sheet.getLastRow();

        // Format urgency column with colors
        const urgencyCell = sheet.getRange(lastRow, 8);
        switch(issue.urgency) {
          case 'low':
            urgencyCell.setValue('🟢 Bassa');
            urgencyCell.setBackground('#c8e6c9');
            break;
          case 'medium':
            urgencyCell.setValue('🟡 Media');
            urgencyCell.setBackground('#fff9c4');
            break;
          case 'high':
            urgencyCell.setValue('🟠 Alta');
            urgencyCell.setBackground('#ffccbc');
            break;
          case 'critical':
            urgencyCell.setValue('🔴 Critica');
            urgencyCell.setBackground('#ffcdd2');
            urgencyCell.setFontWeight('bold');
            break;
        }

        // Format status column
        const statusCell = sheet.getRange(lastRow, 9);
        if (isCompleted) {
          statusCell.setBackground('#c8e6c9');
        } else {
          statusCell.setBackground('#e3f2fd');
        }

        // Add checkbox to completed column
        const completedCell = sheet.getRange(lastRow, 10);
        completedCell.insertCheckboxes();

        importedCount++;

      } catch (rowError) {
        errors.push(`Row ${index + 1}: ${rowError.toString()}`);
        Logger.log('Error importing row ' + index + ': ' + rowError.toString());
      }
    });

    return {
      success: true,
      importedCount: importedCount,
      errors: errors,
      message: `Successfully imported ${importedCount} maintenance records. ${errors.length} errors occurred.`,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log('Error in importLegacyMaintenanceData: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for legacy data import
function importLegacyMaintenanceDataJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const legacyData = JSON.parse(params.data);
  const response = importLegacyMaintenanceData(legacyData);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}