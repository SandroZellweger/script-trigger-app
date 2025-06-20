/*************************************************************
 * FIXED GOOGLE APPS SCRIPT FOR SCRIPT TRIGGER AND EXPENSE TRACKING
 * Handles script triggers, expense logging, viewing, and editing
 *************************************************************/

// Configuration
const STRIPE_SECRET_KEY = "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"; // Your Stripe secret key
const AUTH_TOKEN = "myAppToken2025"; // Matches frontend
const PARENT_FOLDER_ID = "1Nq3Fd_sDgpd2pKyDGsu9QNlcCoey5vsd"; // Google Drive parent folder ID
const EXPENSE_SHEET_ID = "1gcsmRTRMIIXsRmMx7l_43NVknJQCb9o-NB80O4WtX4M"; // Google Sheet ID

// Validate authentication token
function validateAuthToken(token) {
  return token === AUTH_TOKEN;
}

// Helper function to create proper JSON response with CORS headers (FIXED!)
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

// Main doGet handler for script triggers and fetching expenses
function doGet(e) {
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
        result = triggerStripePayment(e.parameter.amount, e.parameter.description);
        break;      case "sendHowToBookMessageApp":
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
        break;      case "getCalendarEventsApp":
        result = getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate);
        break;
      // ADD JSONP CALENDAR EVENTS FUNCTION TO doGet
      case "getCalendarEventsAppJsonp":
        return getCalendarEventsAppJsonp(e.parameter);
        break;case "getExpenses":
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
      // ADD IGLOHOME CODE GENERATION TO doGet
      case "generateIglohomeCodeApp":
        result = generateIglohomeCodeApp(e.parameter);
        break;// ADD CLEANING FUNCTIONS TO doGet
      case "getCleaningData":
        result = getCleaningData(e.parameter);
        break;
      // ADD MAINTENANCE DATA FUNCTION TO doGet
      case "getMaintenanceData":
        result = getMaintenanceData(e.parameter);
        break;
      // ADD JSONP MAINTENANCE DATA FUNCTION TO doGet
      case "getMaintenanceDataJsonp":
        return getMaintenanceDataJsonp(e.parameter);
        break;
      // ADD OVERVIEW FUNCTION TO doGet
      case "getVehicleOverview":
        result = getVehicleOverview(e.parameter);
        break;
      // ADD JSONP OVERVIEW FUNCTION TO doGet
      case "getVehicleOverviewJsonp":
        return getVehicleOverviewJsonp(e.parameter);
        break;
      // ADD VEHICLE NOTES UPDATE FUNCTION TO doGet
      case "updateVehicleNotes":
        result = updateVehicleNotes(e.parameter);
        break;
      // ADD JSONP VEHICLE NOTES UPDATE FUNCTION TO doGet
      case "updateVehicleNotesJsonp":
        return updateVehicleNotesJsonp(e.parameter);
        break;      // GENERATE IGLOOHOME CODE FUNCTION
      case "generateIglohomeCodeApp":
        result = generateIglohomeCodeApp(e.parameter);
        break;
      case "generateIglohomeCodeAppJsonp":
        return generateIglohomeCodeAppJsonp(e.parameter);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }

    // Return JSON response (Google handles CORS automatically)
    const response = typeof result === "string" ? { result } : result;
    return createJsonResponse(response);
      
  } catch (error) {
    const errorResponse = { error: error.toString() };
    return createJsonResponse(errorResponse);
  }
}

// Main doPost handler for expense logging and editing (FIXED!)
function doPost(e) {
  try {
    // Parse the request body based on content type
    let requestBody;
    const contentType = e.parameter.contentType || 'application/json';
    
    if (e.postData && e.postData.contents) {
      if (e.parameter.data) {
        // Handle form-encoded data (like from cleaning form)
        requestBody = JSON.parse(decodeURIComponent(e.parameter.data));
        // Add auth token and sheet ID from URL parameters
        requestBody.authToken = e.parameter.authToken;
        requestBody.sheetId = e.parameter.sheetId;
      } else {
        // Handle JSON data (like from expense forms)
        requestBody = JSON.parse(e.postData.contents);
      }
    } else {
      return createJsonResponse({ error: "No data provided" });
    }

    // Validate authentication
    if (!validateAuthToken(requestBody.authToken)) {
      return createJsonResponse({ error: "Unauthorized: Invalid auth token" });
    }

    const functionName = e.parameter.function;
    if (!functionName) {
      return createJsonResponse({ error: "No function specified" });
    }

    let result;
    switch (functionName) {
      case "logExpense":
        result = logExpense(requestBody);
        break;      case "editExpense":
        result = editExpense(requestBody);
        break;      // ADD CLEANING FUNCTION TO doPost
      case "updateCleaningInVisioneGenerale":
        result = updateCleaningInVisioneGenerale(requestBody);
        break;
      // ADD VEHICLE NOTES UPDATE FUNCTION TO doPost
      case "updateVehicleNotes":
        result = updateVehicleNotes(e.parameter);
        break;
      default:
        result = { error: `Unknown function: ${functionName}` };
    }

    return createJsonResponse(result);
      
  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

// Log expense via GET request
function logExpenseGet(e) {
  try {
    const date = e.parameter.date;
    const method = e.parameter.method;
    const paidBy = e.parameter.paidBy;
    const category = e.parameter.category || "";
    const amount = e.parameter.amount;
    const vehicle = e.parameter.vehicle;
    const profiteur = e.parameter.profiteur;
    const imageUrl = e.parameter.imageUrl || ""; // Direct URL if provided

    // Log expense to Google Sheet
    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses") || spreadsheet.insertSheet("Expenses");
    const headers = ["Date of Purchase", "Method of Purchase", "Paid By", "Category", "Amount (CHF)", "Vehicle", "Profiteur", "Image URL"];
    
    if (expenseSheet.getRange(1, 1).getValue() !== "Date of Purchase") {
      expenseSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = [date, method, paidBy, category, amount, vehicle, profiteur, imageUrl];
    expenseSheet.appendRow(row);

    return { result: "Expense logged successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Edit expense via GET request
function editExpenseGet(e) {
  try {
    const rowNumber = parseInt(e.parameter.rowNumber);
    const date = e.parameter.date;
    const method = e.parameter.method;
    const paidBy = e.parameter.paidBy;
    const category = e.parameter.category || "";
    const amount = e.parameter.amount;
    const vehicle = e.parameter.vehicle;
    const profiteur = e.parameter.profiteur;
    const imageUrl = e.parameter.imageUrl;

    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses");
    if (!expenseSheet) {
      throw new Error("Expenses sheet not found");
    }

    // Get the existing expense data for logging
    const oldData = expenseSheet.getRange(rowNumber, 1, 1, 8).getValues()[0];

    // Update the expense row
    const newData = [[date, method, paidBy, category, amount, vehicle, profiteur, imageUrl || oldData[7]]];
    expenseSheet.getRange(rowNumber, 1, 1, 8).setValues(newData);

    // Log the edit
    const editLogSheet = spreadsheet.getSheetByName("Edit Logs") || spreadsheet.insertSheet("Edit Logs");
    const editHeaders = ["Timestamp", "Row Number", "Changed By", "Changes"];
    if (editLogSheet.getRange(1, 1).getValue() !== "Timestamp") {
      editLogSheet.getRange(1, 1, 1, editHeaders.length).setValues([editHeaders]);
    }

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const changes = `Updated expense: ${oldData[0]} → ${date}, Amount: ${oldData[4]} → ${amount}`;
    editLogSheet.appendRow([timestamp, rowNumber, "Web App", changes]);

    return { result: "Expense edited successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Delete expense
function deleteExpense(e) {
  try {
    const rowNumber = parseInt(e.parameter.rowNumber);
    
    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses");
    if (!expenseSheet) {
      throw new Error("Expenses sheet not found");
    }

    // Get the expense data before deletion for logging
    const expenseData = expenseSheet.getRange(rowNumber, 1, 1, 8).getValues()[0];
    
    // Delete the row
    expenseSheet.deleteRow(rowNumber);

    // Log the deletion
    const editLogSheet = spreadsheet.getSheetByName("Edit Logs") || spreadsheet.insertSheet("Edit Logs");
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    editLogSheet.appendRow([timestamp, rowNumber, "Web App", `Deleted expense: Date: ${expenseData[0]}, Amount: ${expenseData[4]}`]);

    return { result: "Expense deleted successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Log a new expense (POST method - kept for backward compatibility)
function logExpense(data) {
  try {
    const date = data.date;
    const monthYear = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM");
    const method = data.method;
    const paidBy = data.paidBy;
    const category = data.category || "";
    const amount = data.amount;
    const vehicle = data.vehicle;
    const profiteur = data.profiteur;
    const imageBase64 = data.image;
    const imageName = data.imageName;

    let imageUrl = "";
    
    if (imageBase64 && imageName) {
      // Create or get monthly folder in Google Drive
      const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      let monthlyFolder;
      const folders = parentFolder.getFoldersByName(monthYear);
      if (folders.hasNext()) {
        monthlyFolder = folders.next();
      } else {
        monthlyFolder = parentFolder.createFolder(monthYear);
      }

      // Decode base64 image and upload to Google Drive
      const blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), MimeType.JPEG, imageName);
      const file = monthlyFolder.createFile(blob);
      imageUrl = file.getUrl();
    }

    // Log expense to Google Sheet
    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses") || spreadsheet.insertSheet("Expenses");
    const headers = ["Date of Purchase", "Method of Purchase", "Paid By", "Category", "Amount (CHF)", "Vehicle", "Profiteur", "Image URL"];
    if (expenseSheet.getRange(1, 1).getValue() !== "Date of Purchase") {
      expenseSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = [date, method, paidBy, category, amount, vehicle, profiteur, imageUrl];
    expenseSheet.appendRow(row);

    return { result: "Expense logged successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Edit an existing expense (POST method - kept for backward compatibility)
function editExpense(data) {
  try {
    const rowNumber = parseInt(data.rowNumber);
    const date = data.date;
    const monthYear = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM");
    const method = data.method;
    const paidBy = data.paidBy;
    const category = data.category || "";
    const amount = data.amount;
    const vehicle = data.vehicle;
    const profiteur = data.profiteur;
    const imageBase64 = data.image;
    const imageName = data.imageName;

    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses");
    if (!expenseSheet) {
      throw new Error("Expenses sheet not found");
    }

    // Get the existing expense data
    const rowData = expenseSheet.getRange(rowNumber, 1, 1, 8).getValues()[0];
    const oldData = {
      date: rowData[0],
      method: rowData[1],
      paidBy: rowData[2],
      category: rowData[3],
      amount: rowData[4],
      vehicle: rowData[5],
      profiteur: rowData[6],
      imageUrl: rowData[7]
    };

    let imageUrl = oldData.imageUrl;
    if (imageBase64 && imageName) {
      // Delete the old image if it exists
      if (oldData.imageUrl) {
        const fileId = oldData.imageUrl.match(/[-\w]{25,}/);
        if (fileId) {
          try {
            DriveApp.getFileById(fileId[0]).setTrashed(true);
          } catch (e) {
            // File might already be deleted
          }
        }
      }

      // Create or get monthly folder in Google Drive
      const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      let monthlyFolder;
      const folders = parentFolder.getFoldersByName(monthYear);
      if (folders.hasNext()) {
        monthlyFolder = folders.next();
      } else {
        monthlyFolder = parentFolder.createFolder(monthYear);
      }

      // Upload new image
      const blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), MimeType.JPEG, imageName);
      const file = monthlyFolder.createFile(blob);
      imageUrl = file.getUrl();
    }

    // Update the expense row
    const newData = [date, method, paidBy, category, amount, vehicle, profiteur, imageUrl];
    expenseSheet.getRange(rowNumber, 1, 1, 8).setValues([newData]);

    // Log the edit
    const editLogSheet = spreadsheet.getSheetByName("Edit Logs") || spreadsheet.insertSheet("Edit Logs");
    const editHeaders = ["Timestamp", "Row Number", "Old Data", "New Data"];
    if (editLogSheet.getRange(1, 1).getValue() !== "Timestamp") {
      editLogSheet.getRange(1, 1, 1, editHeaders.length).setValues([editHeaders]);
    }

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const editLog = [
      timestamp,
      rowNumber,
      JSON.stringify(oldData),
      JSON.stringify({ date, method, paidBy, category, amount, vehicle, profiteur, imageUrl })
    ];
    editLogSheet.appendRow(editLog);

    return { result: "Expense edited successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Fetch all expenses
function getExpenses() {
  try {
    const spreadsheet = SpreadsheetApp.openById(EXPENSE_SHEET_ID);
    const expenseSheet = spreadsheet.getSheetByName("Expenses");
    if (!expenseSheet) {
      return { result: [] };
    }

    const lastRow = expenseSheet.getLastRow();
    if (lastRow <= 1) {
      return { result: [] }; // No data except headers
    }

    const data = expenseSheet.getRange(2, 1, lastRow - 1, 8).getValues();
    const expenses = data.map((row, index) => ({
      rowNumber: index + 2, // Add row number for editing/deleting
      date: row[0],
      method: row[1],
      paidBy: row[2],
      category: row[3],
      amount: row[4],
      vehicle: row[5],
      profiteur: row[6],
      imageUrl: row[7]
    }));

    return { result: expenses };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Calendar function - fetches events from multiple calendars
function getCalendarEventsApp(startDate, endDate) {
  try {
    Logger.log('📅 Fetching calendar events from ' + startDate + ' to ' + endDate);    const calendarIds = [
      'noleggiosemplice23@gmail.com',                                                          // Main calendar
      'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',                               // Opel Vivaro
      'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com', // Renault Master  
      'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com', // Fiat Ducato
      '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com', // Citroen Boxer
      '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com', // Citroen Jumper
      'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com', // Renault Trafic
      '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com', // Renault Trafic2
      '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com', // Renault Trafic3
      'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com', // Citroen Jumper2
      '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'  // Citroen Jumper3
    ];
    
    const calendarNames = [
      'Main Calendar',
      'Opel Vivaro', 
      'Renault Master',
      'Fiat Ducato',
      'Citroen Boxer',
      'Citroen Jumper',
      'Renault Trafic',
      'Renault Trafic2',
      'Renault Trafic3', 
      'Citroen Jumper2',
      'Citroen Jumper3'
    ];
    
    const allEvents = [];
    
    // Parse start and end dates
    const timeMin = new Date(startDate + 'T00:00:00Z');
    const timeMax = new Date(endDate + 'T23:59:59Z');
    
    for (let index = 0; index < calendarIds.length; index++) {
      const calendarId = calendarIds[index];
      try {
        Logger.log('📋 Fetching from calendar ' + (index + 1) + ': ' + calendarId);
        
        const calendar = CalendarApp.getCalendarById(calendarId);
        if (!calendar) {
          Logger.log('⚠️ Calendar not found: ' + calendarId);
          continue;
        }
        
        // Get events for the date range
        const events = calendar.getEvents(timeMin, timeMax);
        
        Logger.log('📊 Found ' + events.length + ' events in calendar ' + (index + 1));
        
        for (let i = 0; i < events.length; i++) {
          const event = events[i];          allEvents.push({
            id: event.getId(),
            summary: event.getTitle(),
            description: event.getDescription() || '',
            location: event.getLocation() || '',
            start: {
              dateTime: event.getStartTime().toISOString(),
              date: event.isAllDayEvent() ? event.getStartTime().toISOString().split('T')[0] : null
            },
            end: {
              dateTime: event.getEndTime().toISOString(), 
              date: event.isAllDayEvent() ? event.getEndTime().toISOString().split('T')[0] : null
            },
            calendarIndex: index,
            calendarId: calendarId,
            calendarName: calendarNames[index] || `Calendar ${index + 1}`
          });
        }
        
      } catch (calendarError) {
        Logger.log('❌ Error fetching calendar ' + calendarId + ': ' + calendarError.toString());
      }
    }
    
    Logger.log('✅ Total events fetched: ' + allEvents.length);
    
    // Return in the expected format
    return { result: allEvents };
    
  } catch (error) {
    Logger.log('❌ Error in getCalendarEventsApp: ' + error.toString());
    return { error: error.toString() };
  }
}

// Send WhatsApp message function (placeholder - implement your logic)
function sendHowToBookMessageApp(phoneNumber) {
  try {
    // Implement your WhatsApp messaging logic here
    Logger.log('📱 Sending WhatsApp message to: ' + phoneNumber);
    return { result: `WhatsApp message sent to ${phoneNumber}` };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Send Dati Multigiorno message function
function sendDatiMultigiornoApp(phoneNumber) {
  try {
    // Implement your logic here
    Logger.log('📱 Sending Dati Multigiorno message to: ' + phoneNumber);
    return { result: `Dati Multigiorno message sent to ${phoneNumber}` };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Trigger daily report
function triggerDailyReport() {
  try {
    // Replace with your actual function name if different
    // generateDailyKmReportAndSendEmail_newFile();
    return { result: "Daily report generated successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Trigger custom date report
function triggerCustomDateReport(customDateString) {
  try {
    const customDate = new Date(customDateString || new Date());
    if (isNaN(customDate.getTime())) {
      throw new Error("Invalid date format");
    }
    // Replace with your actual function name if different
    // generateDailyKmReportAndSendEmail_newFile(customDate);
    return { result: `Custom date report generated for ${customDate.toISOString()}` };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Trigger hardcoded report
function triggerHardcodedReport() {
  try {
    // Replace with your actual function name if different
    // runReportForDateHardcoded();
    return { result: "Hardcoded date report generated successfully" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Trigger Stripe payment
function triggerStripePayment(amount, description) {
  try {
    // Input validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }
    if (!description || description.trim().length < 3) {
      throw new Error("Invalid description: must be at least 3 characters");
    }

    // Default values
    const paymentAmount = amount || "100.00";
    const paymentDescription = description || "Noleggio Furgone";

    const paymentUrl = createStripeCheckoutSession(paymentAmount, paymentDescription);
    return { result: `Payment link created: ${paymentUrl}` };
  } catch (error) {
    return { error: error.toString() };
  }
}

// Create Stripe checkout session
function createStripeCheckoutSession(amount, description) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not configured");
  }

  const url = "https://api.stripe.com/v1/checkout/sessions";
  const amountInCents = Math.round(parseFloat(amount) * 100);

  const payload = {
    "success_url": "https://noleggio-semplice.com/wpbc-booking-payment-successful",
    "cancel_url": "https://noleggio-semplice.com/wpbc-booking-payment-failed",
    "payment_method_types[]": "card",
    "mode": "payment",
    "line_items[0][price_data][currency]": "chf",
    "line_items[0][price_data][product_data][name]": description,
    "line_items[0][price_data][unit_amount]": amountInCents.toString(),
    "line_items[0][quantity]": "1",
  };

  const formData = Object.keys(payload)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payload[key]))
    .join("&");

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    payload: formData,
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.url) {
    Logger.log(
      `✅ Payment Link: ${result.url} | Amount: CHF ${amountInCents / 100} | Description: ${description}`
    );
    return result.url;
  } else {
    Logger.log(`❌ Error: ${response.getContentText()}`);
    throw new Error(`Stripe error: ${response.getContentText()}`);
  }
}

// Test functions for debugging
function testStripePayment() {
  try {
    Logger.log("=== Testing Stripe Payment Function ===");
    
    const testCases = [
      { amount: "100.00", description: "specchietto" },
      { amount: "50.50", description: "Noleggio Breve" },
      { amount: "-10.00", description: "Invalid Test" }, // Should fail
      { amount: "200.00", description: "A" }, // Should fail (short description)
    ];
    
    const results = [];
    
    for (const test of testCases) {
      Logger.log(`\nTesting with:`);
      Logger.log(`Amount: CHF ${test.amount}`);
      Logger.log(`Description: ${test.description}`);
      
      const result = triggerStripePayment(test.amount, test.description);
      Logger.log(`Result: ${JSON.stringify(result)}`);
      
      if (result.result) {
        Logger.log("✅ Test PASSED");
      } else {
        Logger.log(`❌ Test FAILED - ${result.error}`);
      }
      
      results.push({ test, result });
    }
    
    return results;
  } catch (error) {
    Logger.log(`❌ Test ERROR: ${error.toString()}`);
    return { error: error.toString() };
  }
}

function testCalendarFunction() {
  const result = getCalendarEventsApp('2025-06-01', '2025-06-30');
  Logger.log('Calendar events:', JSON.stringify(result, null, 2));
  return result;
}

// Create a Google Form for image uploads (optional - run this once to set up)
function createExpenseImageForm() {
  const form = FormApp.create('Expense Receipt Uploads');
  
  form.setDescription('Upload receipt images for expense tracking');
  
  form.addTextItem()
    .setTitle('Expense ID')
    .setRequired(true);
    
  form.addImageItem()
    .setTitle('Receipt Image')
    .setHelpText('Upload a photo of your receipt');
    
  // Set up form submission trigger
  ScriptApp.newTrigger('processFormSubmission')
    .forForm(form)
    .onFormSubmit()
    .create();
    
  Logger.log('Form URL: ' + form.getPublishedUrl());
  Logger.log('Form Edit URL: ' + form.getEditUrl());
  
  return {
    formUrl: form.getPublishedUrl(),
    formId: form.getId()
  };
}

// Process form submissions (optional - for image upload form)
function processFormSubmission(e) {
  const responses = e.response.getItemResponses();
  const expenseId = responses[0].getResponse();
  const imageBlob = responses[1].getResponse();
  
  // Save to Drive
  const folder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const file = folder.createFile(imageBlob);
  const imageUrl = file.getUrl();
  
  // Update the expense record with the image URL
  // You'll need to implement the logic to match expenseId with the correct row
  
  Logger.log(`Uploaded image for expense ${expenseId}: ${imageUrl}`);
}

// ===== CLEANING FUNCTIONS =====

function getCleaningData(params) {
  try {
    // Verify auth token
    if (params.authToken !== 'myAppToken2025') {
      return { success: false, error: 'Unauthorized' };
    }
    
    const sheet = SpreadsheetApp.openById(params.sheetId);
    const cleaningSheet = sheet.getSheetByName('Cleaning') || sheet.insertSheet('Cleaning');
    
    // Get all cleaning data
    const data = cleaningSheet.getDataRange().getValues();
    if (data.length === 0) {
      return { success: true, data: [] };
    }
    
    const headers = data[0] || ['Vehicle', 'CleaningType', 'Date'];
    
    const records = data.slice(1).map((row, index) => ({
      id: 'clean_' + index,
      vehicle: row[0] || '',
      cleaningType: row[1] || '',
      date: row[2] || ''
    }));
    
    return {
      success: true,
      data: records
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateCleaningInVisioneGenerale(data) {
  try {
    Logger.log('Received cleaning data:', JSON.stringify(data));
    
    // Verify auth token
    if (data.authToken !== 'myAppToken2025') {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Extract cleaning data - it might be nested or direct
    const cleaningData = data.cleaningRecord || data;
    Logger.log('Processing cleaning data:', JSON.stringify(cleaningData));
    
    if (!cleaningData.vehicle || !cleaningData.cleaningType || !cleaningData.date) {
      return { success: false, error: 'Missing required fields: vehicle, cleaningType, or date' };
    }
    
    const sheet = SpreadsheetApp.openById(data.sheetId);
    const visioneSheet = sheet.getSheetByName('Visione generale');
    
    if (!visioneSheet) {
      return { success: false, error: 'Visione generale sheet not found' };
    }
    
    // Get all data to find the correct row for the vehicle
    const allData = visioneSheet.getDataRange().getValues();
    let targetRow = -1;
    
    // Find the row with the matching vehicle number
    for (let i = 0; i < allData.length; i++) {
      const rowData = allData[i];
      // Check column A for vehicle number (like "1", "3", "4", etc.)
      if (rowData[0] && rowData[0].toString() === cleaningData.vehicle.replace('N', '')) {
        targetRow = i + 1; // +1 because getRange is 1-indexed
        break;
      }
    }
    
    if (targetRow === -1) {
      return { success: false, error: `Vehicle ${cleaningData.vehicle} not found in sheet` };
    }
    
    Logger.log(`Found vehicle ${cleaningData.vehicle} in row ${targetRow}`);
    
    // Determine which column to update based on cleaning type
    let columns = [];
    if (cleaningData.cleaningType === 'outside' || cleaningData.cleaningType === 'both') {
      columns.push(14); // Column N (extern)
    }
    if (cleaningData.cleaningType === 'inside' || cleaningData.cleaningType === 'both') {
      columns.push(15); // Column O (intern)
    }
    
    // Format the date (assuming it comes as YYYY-MM-DD)
    const formattedDate = cleaningData.date;
    
    // Update the appropriate cells
    for (const column of columns) {
      visioneSheet.getRange(targetRow, column).setValue(formattedDate);
      Logger.log(`Updated cell ${String.fromCharCode(64 + column)}${targetRow} with date ${formattedDate}`);
    }
    
    // Also log to the Cleaning sheet for record keeping
    const cleaningSheet = sheet.getSheetByName('Cleaning') || sheet.insertSheet('Cleaning');
    if (cleaningSheet.getLastRow() === 0) {
      cleaningSheet.getRange(1, 1, 1, 3).setValues([['Vehicle', 'CleaningType', 'Date']]);
    }
    cleaningSheet.appendRow([
      cleaningData.vehicle,
      cleaningData.cleaningType,
      cleaningData.date
    ]);
    
    return { success: true };
  } catch (error) {
    Logger.log('Error in updateCleaningInVisioneGenerale:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===== MAINTENANCE FUNCTIONS =====

function getMaintenanceData(params) {
  try {
    const { sheetId } = params;
    
    if (!sheetId) {
      return { success: false, error: 'Sheet ID is required' };
    }
    
    // This is a placeholder - you'll need to implement based on your maintenance sheet structure
    // For now, return empty data to prevent errors
    return { 
      success: true, 
      records: [],
      vehicles: ['N1', 'N3', 'N4', 'N6', 'N7', 'N8', 'N9', 'N10']
    };
    
  } catch (error) {
    Logger.log('Error in getMaintenanceData:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// JSONP version of getMaintenanceData
function getMaintenanceDataJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getMaintenanceData(params);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { success: false, error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// ===== OVERVIEW FUNCTIONS =====

function getVehicleOverview(params) {
  try {
    // Verify auth token
    if (params.authToken !== 'myAppToken2025') {
      return { success: false, error: 'Unauthorized' };
    }
    
    const sheet = SpreadsheetApp.openById(params.sheetId);
    const visioneSheet = sheet.getSheetByName('Visione generale');
    
    if (!visioneSheet) {
      return { success: false, error: 'Visione generale sheet not found' };
    }
      // Get all data from the sheet
    const data = visioneSheet.getDataRange().getValues();
    const vehicles = [];
      Logger.log(`Found ${data.length} rows in Visione generale sheet`);
    
    // Log first few rows to understand structure
    if (data.length > 0) {
      Logger.log('Header row:', data[0]);
    }
    if (data.length > 1) {
      Logger.log('First data row:', data[1]);
    }
    
    // First pass: log the vehicle number to row mapping
    Logger.log('=== VEHICLE TO ROW MAPPING ===');
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        Logger.log(`Vehicle N${row[0]} is in data row index ${i}, actual sheet row ${i + 1}`);
      }
    }
    Logger.log('=== END MAPPING ===');
    
    // Skip header row, process data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows and exclude N2 and N5
      if (!row[0] || row[0] == 2 || row[0] == 5) {
        Logger.log(`Skipping row ${i + 1}: empty or N2/N5`);
        continue;
      }
        const vehicleNumber = row[0]; // Column A
      const licensePlate = row[2]; // Column C (Targa)
      const brand = row[3]; // Column D (Marca)
      const model = row[4]; // Column E (Modello)
      const type = row[5]; // Column F (Tipo)
      const location = row[6]; // Column G (Dove)
      const purchaseDate = row[7]; // Column H (data acquisto)
      const acquisitionKm = row[8]; // Column I (km acquisto)
      const currentKm = row[9]; // Column J (Km attuali)
      const kmDate = row[10]; // Column K (data km)
      const nextServiceKm = row[11]; // Column L (km prossimo servizio)
      const potential = row[12]; // Column M (Potenziale)
      const externalCleaning = row[13]; // Column N (Data ultima pulizia esterna)
      const internalCleaning = row[14]; // Column O (Data ultima pulizia interna)
      const notes1 = row[15]; // Column P (Gom. avanti)
      const notes2 = row[16]; // Column Q (Gom. post.)
      const nextCO = row[17]; // Column R (Next CO)
      
      // Collect all notes/issues from the row (look in columns C through R)
      let vehicleNotes = [];
        Logger.log(`Processing vehicle N${vehicleNumber} (data row index ${i}, actual sheet row ${i + 1})`);      try {
        // Get the range for this specific row to check for text formatting
        // i+1 because sheet rows are 1-indexed, but our data array is 0-indexed with header at 0
        const actualSheetRow = i + 1;
        
        Logger.log(`Vehicle N${vehicleNumber} - Checking actual sheet row ${actualSheetRow}`);
        
        // For Vehicle N1, specifically check cell C3 (which should be the red text area)
        // For other vehicles, check their corresponding cells
        let targetCell = null;
        
        if (vehicleNumber == 1) {
          // N1 should check C3
          targetCell = visioneSheet.getRange(3, 3); // Row 3, Column C
          Logger.log(`Vehicle N1 - Specifically checking cell C3`);
        } else if (vehicleNumber == 3) {
          // N3 should check C7
          targetCell = visioneSheet.getRange(7, 3); // Row 7, Column C
          Logger.log(`Vehicle N3 - Specifically checking cell C7`);
        } else if (vehicleNumber == 4) {
          // N4 should check C9
          targetCell = visioneSheet.getRange(9, 3); // Row 9, Column C
          Logger.log(`Vehicle N4 - Specifically checking cell C9`);
        } else if (vehicleNumber == 6) {
          // N6 should check C13
          targetCell = visioneSheet.getRange(13, 3); // Row 13, Column C
          Logger.log(`Vehicle N6 - Specifically checking cell C13`);
        } else if (vehicleNumber == 7) {
          // N7 should check C15
          targetCell = visioneSheet.getRange(15, 3); // Row 15, Column C
          Logger.log(`Vehicle N7 - Specifically checking cell C15`);
        } else if (vehicleNumber == 8) {
          // N8 should check C17
          targetCell = visioneSheet.getRange(17, 3); // Row 17, Column C
          Logger.log(`Vehicle N8 - Specifically checking cell C17`);
        } else if (vehicleNumber == 9) {
          // N9 should check C19
          targetCell = visioneSheet.getRange(19, 3); // Row 19, Column C
          Logger.log(`Vehicle N9 - Specifically checking cell C19`);
        } else if (vehicleNumber == 10) {
          // N10 should check C21
          targetCell = visioneSheet.getRange(21, 3); // Row 21, Column C
          Logger.log(`Vehicle N10 - Specifically checking cell C21`);
        } else if (vehicleNumber == 11) {
          // N11 should check C23
          targetCell = visioneSheet.getRange(23, 3); // Row 23, Column C
          Logger.log(`Vehicle N11 - Specifically checking cell C23`);
        }
        
        if (targetCell) {
          const cellValue = targetCell.getValue();
          
          if (cellValue && cellValue !== '') {
            const trimmedValue = cellValue.toString().trim();
            Logger.log(`Vehicle N${vehicleNumber} - Target cell content: "${trimmedValue}"`);
            
            // Only skip if it's obviously a license plate - everything else is potentially a note
            const isLicensePlate = trimmedValue.match(/^TI\s?\d+$/i);
            
            if (!isLicensePlate) {
              // Try to detect if it's red text by checking formatting
              let isRedText = false;
              try {
                const textStyle = targetCell.getTextStyle();
                if (textStyle && textStyle.getForegroundColor) {
                  const color = textStyle.getForegroundColor();
                  isRedText = (color === '#ff0000' || color === '#cc0000' || color === '#990000' || color.toLowerCase().includes('red'));
                  Logger.log(`Vehicle N${vehicleNumber} - Text color: ${color}, isRedText: ${isRedText}`);
                }
                
                // Also check rich text for red formatting
                const richText = targetCell.getRichTextValue();
                if (!isRedText && richText && richText.getRuns) {
                  const runs = richText.getRuns();
                  for (let run of runs) {
                    const runStyle = run.getTextStyle();
                    if (runStyle && runStyle.getForegroundColor) {
                      const runColor = runStyle.getForegroundColor();
                      if (runColor === '#ff0000' || runColor === '#cc0000' || runColor === '#990000' || runColor.toLowerCase().includes('red')) {
                        isRedText = true;
                        Logger.log(`Vehicle N${vehicleNumber} - Found RED TEXT in rich text: ${trimmedValue}`);
                        break;
                      }
                    }
                  }
                }
              } catch (styleCheckError) {
                Logger.log(`Could not check text style for target cell:`, styleCheckError);
              }
                const noteText = isRedText ? `🔴 ${trimmedValue}` : trimmedValue;
              
              // Split multi-line notes into individual lines
              const noteLines = noteText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
              vehicleNotes.push(...noteLines);
              
              Logger.log(`Vehicle N${vehicleNumber} - Found ${isRedText ? 'RED TEXT' : 'NOTE'} with ${noteLines.length} lines: ${trimmedValue}`);
            } else {
              Logger.log(`Vehicle N${vehicleNumber} - Skipping license plate: ${trimmedValue}`);
            }
          } else {
            Logger.log(`Vehicle N${vehicleNumber} - Target cell is empty`);
          }
        } else {
          Logger.log(`Vehicle N${vehicleNumber} - No specific target cell defined, checking current row`);
          
          // Fallback: check for any interesting content in the current row
          // But be much more restrictive to avoid picking up standard data
          const fullRowRange = visioneSheet.getRange(actualSheetRow, 1, 1, 20);
          const fullRowValues = fullRowRange.getValues()[0];
          
          for (let colIndex = 0; colIndex < fullRowValues.length; colIndex++) {
            const cellValue = fullRowValues[colIndex];
            if (cellValue && cellValue !== '') {
              const trimmedValue = cellValue.toString().trim();
              
              // Only include if it contains specific maintenance keywords or is long descriptive text
              const isMaintenanceNote = trimmedValue.length > 10 && (
                trimmedValue.toLowerCase().includes('schegg') ||
                trimmedValue.toLowerCase().includes('piccol') ||
                trimmedValue.toLowerCase().includes('vetro') ||
                trimmedValue.toLowerCase().includes('ripar') ||
                trimmedValue.toLowerCase().includes('dannegg') ||
                trimmedValue.toLowerCase().includes('problem') ||
                trimmedValue.toLowerCase().includes('controllo') ||
                trimmedValue.toLowerCase().includes('cambiar') ||
                trimmedValue.toLowerCase().includes('sostit') ||
                trimmedValue.toLowerCase().includes('graffio') ||
                trimmedValue.toLowerCase().includes('ammaccat') ||
                trimmedValue.toLowerCase().includes('usura')
              );
              
              if (isMaintenanceNote && !vehicleNotes.some(note => note.includes(trimmedValue))) {
                const columnLetter = String.fromCharCode(65 + colIndex);
                Logger.log(`Vehicle N${vehicleNumber} - Found maintenance note in ${columnLetter}${actualSheetRow}: ${trimmedValue}`);
                vehicleNotes.push(trimmedValue);
              }
            }
          }
        }
        
      } catch (styleError) {
        Logger.log(`Could not check text styles for vehicle N${vehicleNumber}:`, styleError);
      }
      
      Logger.log(`Vehicle N${vehicleNumber} - Final notes found:`, vehicleNotes);
      
      // Determine cleaning status and last cleaning date
      let cleaningStatus = 'Good';
      let statusClass = 'status-good';
      let lastCleaningDate = null;
      
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Find the most recent cleaning date
      const extDate = externalCleaning && externalCleaning !== '' ? new Date(externalCleaning) : null;
      const intDate = internalCleaning && internalCleaning !== '' ? new Date(internalCleaning) : null;
      
      if (extDate && intDate) {
        lastCleaningDate = extDate > intDate ? extDate : intDate;
      } else if (extDate) {
        lastCleaningDate = extDate;
      } else if (intDate) {
        lastCleaningDate = intDate;
      }
      
      // Determine if cleaning is needed
      let needsCleaning = false;
      if (!lastCleaningDate || lastCleaningDate < weekAgo) {
        needsCleaning = true;
      }
      
      if (needsCleaning) {
        cleaningStatus = 'Needs Cleaning';
        statusClass = 'status-needs-cleaning';
      }
      
      vehicles.push({
        vehicleNumber: `N${vehicleNumber}`,
        licensePlate: licensePlate || '-',
        brand: brand || '-',
        model: model || '-',
        type: type || '-',
        location: location || '-',
        purchaseDate: formatDateForDisplay(purchaseDate),
        acquisitionKm: acquisitionKm || '-',
        currentKm: currentKm || '-',
        kmDate: formatDateForDisplay(kmDate),
        nextServiceKm: nextServiceKm || '-',
        potential: potential || '-',
        externalCleaning: formatDateForDisplay(externalCleaning),
        internalCleaning: formatDateForDisplay(internalCleaning),
        notes1: notes1 || '-',
        notes2: notes2 || '-',
        nextCO: nextCO || '-',
        vehicleNotes: vehicleNotes,
        lastCleaningDate: formatDateForDisplay(lastCleaningDate),
        cleaningStatus: cleaningStatus,
        statusClass: statusClass
      });
    }
    
    return {
      success: true,
      vehicles: vehicles
    };
  } catch (error) {
    Logger.log('Error in getVehicleOverview:', error.toString());
    return { success: false, error: error.toString() };
  }
}

function formatDateForDisplay(dateValue) {
  if (!dateValue || dateValue === '') return '-';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-GB');
  } catch (error) {
    return '-';
  }
}

// Update vehicle notes in Google Sheet
function updateVehicleNotes(params) {
  try {
    Logger.log('updateVehicleNotes called with:', params);
    
    const { vehicleNumber, notes, sheetId } = params;
    
    if (!vehicleNumber) {
      return { success: false, error: 'Vehicle number is required' };
    }
    
    if (!sheetId) {
      return { success: false, error: 'Sheet ID is required' };
    }
    
    // Parse notes from URL parameter (split by |||)
    let notesArray = [];
    if (notes && notes.trim() !== '') {
      const decodedNotes = decodeURIComponent(notes);
      notesArray = decodedNotes.split('|||').map(note => note.trim()).filter(note => note.length > 0);
    }
    
    // Open the sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('Visione generale');
    
    if (!sheet) {
      return { success: false, error: 'Sheet "Visione generale" not found' };
    }
    
    // Find the vehicle's row and note cell
    const vehicleRowMap = {
      'N1': { row: 3, col: 3 },   // C3
      'N3': { row: 7, col: 3 },   // C7  
      'N4': { row: 9, col: 3 },   // C9
      'N6': { row: 13, col: 3 },  // C13
      'N7': { row: 15, col: 3 },  // C15
      'N8': { row: 17, col: 3 },  // C17
      'N9': { row: 19, col: 3 },  // C19
      'N10': { row: 21, col: 3 }  // C21
    };
    
    const vehicleInfo = vehicleRowMap[vehicleNumber];
    if (!vehicleInfo) {
      return { success: false, error: `Vehicle ${vehicleNumber} not found in mapping` };
    }
    
    // Prepare the notes text
    let notesText = '';
    if (notesArray.length > 0) {
      notesText = notesArray.join('\n');
    }
    
    // Update the cell
    const cell = sheet.getRange(vehicleInfo.row, vehicleInfo.col);
    cell.setValue(notesText);
    
    // If the note starts with 🔴, make it red
    if (notesText.includes('🔴')) {
      cell.setFontColor('#d32f2f');
    } else if (notesText.trim() === '') {
      // Clear formatting if empty
      cell.setFontColor('#000000');
    }
    
    Logger.log(`Updated vehicle ${vehicleNumber} notes in cell ${vehicleInfo.col}${vehicleInfo.row}`);
    
    return { 
      success: true, 
      message: `Notes updated for vehicle ${vehicleNumber}`,
      vehicleNumber: vehicleNumber,
      notesCount: notesArray.length
    };
    
  } catch (error) {
    Logger.log('Error in updateVehicleNotes:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// JSONP version of updateVehicleNotes that bypasses CORS
function updateVehicleNotesJsonp(params) {
  try {
    // Get the callback function name
    const callback = params.callback || 'callback';
    
    // Use the existing updateVehicleNotes function
    const result = updateVehicleNotes(params);
    
    // Return JSONP response
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { success: false, error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// JSONP version of getVehicleOverview
function getVehicleOverviewJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getVehicleOverview(params);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { success: false, error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Generate Iglohome PIN and send via Zoko
function generateIglohomeCodeApp(params) {
  try {
    Logger.log('generateIglohomeCodeApp called with:', params);
    
    const { phoneNumber, van, startDate, endDate } = params;
    
    // Validate required parameters
    if (!phoneNumber) {
      return { success: false, error: 'Phone number is required' };
    }
    if (!van) {
      return { success: false, error: 'Van selection is required' };
    }
    if (!startDate) {
      return { success: false, error: 'Start date is required' };
    }
    if (!endDate) {
      return { success: false, error: 'End date is required' };
    }
    
    // Device ID mapping for each van
    const deviceMapping = {
      'N01': 'IGK32067b80d', // Opel Vivaro (Losone)
      'N03': 'IGK320e54802', // Peugeot Boxer (Bellinzona)
      'N04': 'IGK322314358', // Fiat Ducato (Locarno)
      'N06': 'IGK320decee5', // Citroen Jumper (Minusio)
      'N07': 'IGK320803a7d', // Renault Trafic (Lugano)
      'N08': 'IGK32298e527', // Renault Trafic (Lugano)
      'N09': 'IGK322bd6b60', // Renault Trafic (Bellinzona)
      'N10': 'IGK323964023', // Citroen Jumper (Losone)
      'N11': 'IGK331c318e6'  // Citroen Jumper (Losone)
    };
    
    const deviceId = deviceMapping[van];
    if (!deviceId) {
      return { success: false, error: `Device ID not found for van ${van}` };
    }
    
    // Parse dates and adjust timing (2 hours before start, 2 hours after end)
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Adjust startDate to 2 hours before
    const adjustedStartDate = new Date(startDateTime.getTime());
    adjustedStartDate.setHours(adjustedStartDate.getHours() - 2);
    
    // If adjusted start is in the past, use current time
    const now = new Date();
    const finalStartDate = adjustedStartDate < now ? now : adjustedStartDate;
    
    // Adjust endDate to 2 hours after
    const finalEndDate = new Date(endDateTime.getTime());
    finalEndDate.setHours(finalEndDate.getHours() + 2);
    
    // Ensure end is after start
    if (finalEndDate <= finalStartDate) {
      finalEndDate.setTime(finalStartDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
    }
    
    // Iglohome API credentials
    const clientId = '36j00aig9dco7nms0a1lfcf9t9';
    const clientSecret = '1f6scc262em56gfvppr5m43a3k5gj5hhcc8ln7eg2a1g8sals629';
    const tokenUrl = 'https://auth.igloohome.co/oauth2/token';
    const apiUrl = `https://api.igloodeveloper.co/igloohome/devices/${deviceId}/algopin/hourly`;
    
    // Get OAuth token
    const tokenPayload = {
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'scope': 'igloohomeapi/algopin-hourly'
    };
    
    const tokenOptions = {
      'method': 'post',
      'contentType': 'application/x-www-form-urlencoded',
      'payload': tokenPayload
    };
    
    const tokenResponse = UrlFetchApp.fetch(tokenUrl, tokenOptions);
    const tokenData = JSON.parse(tokenResponse.getContentText());
    
    if (!tokenData.access_token) {
      Logger.log('Failed to get access token:', tokenData);
      return { success: false, error: 'Failed to authenticate with Iglohome API' };
    }
    
    // Format dates for API request
    const formattedStartDate = Utilities.formatDate(finalStartDate, "GMT+08:00", "yyyy-MM-dd'T'HH:00:00XXX");
    const formattedEndDate = Utilities.formatDate(finalEndDate, "GMT+08:00", "yyyy-MM-dd'T'HH:00:00XXX");
    
    // Generate PIN
    const apiPayload = JSON.stringify({
      'variance': 1,
      'startDate': formattedStartDate,
      'endDate': formattedEndDate,
      'accessName': 'Zoko Generated Access'
    });
    
    const apiOptions = {
      'method': 'post',
      'headers': {
        'Authorization': 'Bearer ' + tokenData.access_token,
        'Content-Type': 'application/json'
      },
      'payload': apiPayload
    };
    
    const pinResponse = UrlFetchApp.fetch(apiUrl, apiOptions);
    const pinData = JSON.parse(pinResponse.getContentText());
    
    if (!pinData.pin) {
      Logger.log('Failed to generate PIN:', pinData);
      return { success: false, error: 'Failed to generate access code' };
    }
    
    Logger.log(`Generated PIN ${pinData.pin} for van ${van}`);
    
    // Send PIN via Zoko using the igloohome_pin template
    const zokoSuccess = sendIglohomePinMessage(phoneNumber, pinData.pin);
    
    if (zokoSuccess) {
      return { 
        success: true, 
        message: `Access code generated and sent to ${phoneNumber}`,
        pin: pinData.pin,
        van: van,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
    } else {
      return { 
        success: false, 
        error: 'PIN generated but failed to send via WhatsApp' 
      };
    }
    
  } catch (error) {
    Logger.log('Error in generateIglohomeCodeApp:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// Send Iglohome PIN via Zoko WhatsApp
function sendIglohomePinMessage(phoneNumber, pin) {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  const templateId = "igloohome_pin";
  const templateLang = "it";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [pin] // Single argument: the PIN number
  };

  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "apikey": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());

    if (responseCode === 200 || responseCode === 202) {
      Logger.log(`Zoko Iglohome PIN Success for ${phoneNumber}: PIN ${pin}`);
      return true;
    } else {
      Logger.log(`Zoko Iglohome PIN Error - HTTP ${responseCode} for ${phoneNumber}: ${JSON.stringify(responseData)}`);
      return false;
    }
  } catch (e) {
    Logger.log(`Zoko Iglohome PIN Exception for ${phoneNumber}: ${e.toString()}`);
    return false;
  }
}

// JSONP versions for CORS-free messaging
function sendHowToBookMessageAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = sendHowToBookMessageApp(params.phoneNumber);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function sendDatiMultigiornoAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = sendDatiMultigiornoApp(params.phoneNumber);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function generateIglohomeCodeAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = generateIglohomeCodeApp(params);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// JSONP version of getCalendarEventsApp
function getCalendarEventsAppJsonp(params) {
  try {
    const callback = params.callback || 'callback';
    const result = getCalendarEventsApp(params.startDate, params.endDate);
    const jsonpResponse = `${callback}(${JSON.stringify(result)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    const callback = params.callback || 'callback';
    const errorResult = { error: error.toString() };
    const jsonpResponse = `${callback}(${JSON.stringify(errorResult)});`;
    
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
