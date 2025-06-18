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

// Helper function to create proper JSON response (FIXED!)
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
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
        break;
      case "sendHowToBookMessageApp":
        result = sendHowToBookMessageApp(e.parameter.phoneNumber);
        break;
      case 'sendDatiMultigiornoApp':
        const datiPhoneNumber = e.parameter.phoneNumber;
        result = sendDatiMultigiornoApp(datiPhoneNumber);
        break;
      case "ping":
        result = { result: "Ping successful" };
        break;
      case "getCalendarEventsApp":
        result = getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate);
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
      // ADD CLEANING FUNCTIONS TO doGet
      case "getCleaningData":
        result = getCleaningData(e.parameter);
        break;
      // ADD OVERVIEW FUNCTION TO doGet
      case "getVehicleOverview":
        result = getVehicleOverview(e.parameter);
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
        break;
      case "editExpense":
        result = editExpense(requestBody);
        break;
      // ADD CLEANING FUNCTION TO doPost
      case "updateCleaningInVisioneGenerale":
        result = updateCleaningInVisioneGenerale(requestBody);
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
    Logger.log('📅 Fetching calendar events from ' + startDate + ' to ' + endDate);
    
    const calendarIds = [
      'noleggiosemplice23@gmail.com',
      'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com', 
      'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com',
      'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com'
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
          const event = events[i];
          allEvents.push({
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
            calendarId: calendarId
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
    
    // Skip header row, process data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows and exclude N2 and N5
      if (!row[0] || row[0] == 2 || row[0] == 5) continue;
      
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
        // Collect all notes/issues from the row (look for non-empty text in various columns)
      let vehicleNotes = [];
      
      // Check for notes in columns that might contain red text/issues
      // Look at all columns for longer text content that could be notes
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = row[colIndex];
        if (cellValue && typeof cellValue === 'string') {
          // Skip short values that are likely just data (dates, numbers, short codes)
          if (cellValue.length > 20 && 
              !cellValue.match(/^\d{2}[\./]\d{2}[\./]\d{4}$/) && // Skip dates
              !cellValue.match(/^\d+$/) && // Skip pure numbers
              !cellValue.match(/^[A-Z]{2}\s?\d+[A-Z]*$/) && // Skip license plates
              !cellValue.match(/^(Buone|Good|No|YES|L\d+H\d+)$/i) && // Skip status words
              cellValue !== licensePlate && 
              cellValue !== brand && 
              cellValue !== model && 
              cellValue !== type && 
              cellValue !== location) {
            
            // This looks like a note/issue, add it
            vehicleNotes.push(cellValue);
          }
        }
      }
      
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
