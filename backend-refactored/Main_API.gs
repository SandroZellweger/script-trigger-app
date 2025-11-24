/*************************************************************
 * Main_API.gs
 * Entry points (doGet, doPost) and Routing Logic
 *************************************************************/

function doGet(e) {
  Logger.log('doGet called - Function: ' + (e.parameter ? e.parameter.function : 'undefined'));
  
  // Helper to return error in correct format (JSON or JSONP)
  const returnError = (msg) => {
    if (e.parameter && e.parameter.callback) {
      return createJsonpResponse(e.parameter.callback, { success: false, error: msg });
    }
    return createJsonResponse({ error: msg });
  };

  try {
    // Validate authentication
    const authToken = e.parameter.authToken;
    if (!validateAuthToken(authToken)) {
      return returnError("Unauthorized: Invalid auth token");
    }

    const functionName = e.parameter.function;
    if (!functionName) {
      return returnError("No function specified");
    }

    // Routing Logic
    switch (functionName) {
      // --- Stripe Payments ---
      case "triggerStripePayment":
        return createJsonResponse(triggerStripePayment(e.parameter.amount, e.parameter.description, e.parameter.account));
      case "triggerStripePaymentJsonp":
        return triggerStripePaymentJsonp(e.parameter);
      case "createPaymentLinkJsonp":
        return createPaymentLinkJsonp(e.parameter);
      
      // --- Calendar & Booking ---
      case "getBookingDetailsByReference": // New direct endpoint if needed
         return createJsonResponse(getBookingDetailsByReference(e.parameter.reference));
      case "findBookingByReferenceJsonp":
         return findBookingByReferenceJsonp(e.parameter);
      case "getCalendarEventsApp":
        return createJsonResponse(getCalendarEventsApp(e.parameter.startDate, e.parameter.endDate));
      case "getCalendarEventsAppJsonp":
        return getCalendarEventsAppJsonp(e.parameter);
      
      // --- Maintenance & Vehicles ---
      case "getVehicleOverviewJsonp":
        return getVehicleOverviewJsonp(e.parameter);
      case "getMaintenanceDataJsonp":
        return getMaintenanceDataJsonp(e.parameter);
      case "getVehicleList":
        return createJsonResponse(getVehicleList());
      case "getVehicleListJsonp":
        return getVehicleListJsonp(e.parameter);
      case "getVehicleListWithKmJsonp":
        return getVehicleListWithKmJsonp(e.parameter);
      case "getActiveMaintenanceReportsJsonp":
        return getActiveMaintenanceReportsJsonp(e.parameter);
      case "saveMaintenanceReportJsonp":
        return saveMaintenanceReportJsonp(e.parameter);
      case "analyzeMaintenanceIssueJsonp":
        return analyzeMaintenanceIssueJsonp(e.parameter);
      case "getGaragesListJsonp":
        return getGaragesListJsonp(e.parameter);
      case "addGarageJsonp":
        return addGarageJsonp(e.parameter);
      case "generateDraftPdfJsonp":
        return generateDraftPdfJsonp(e.parameter);
      case "createWorkshopListJsonp":
        return createWorkshopListJsonp(e.parameter);
      case "getWorkshopListsJsonp":
        return getWorkshopListsJsonp(e.parameter);
      case "testGetWorkshopListsJsonp":
        return testGetWorkshopListsJsonp(e.parameter);
      case "createTestWorkshopDataJsonp":
        return createTestWorkshopDataJsonp(e.parameter);
      case "deleteWorkshopListJsonp":
        return deleteWorkshopListJsonp(e.parameter);
      case "moveIssueBackToActiveJsonp":
        return moveIssueBackToActiveJsonp(e.parameter);
      case "completeWorkshopListJsonp":
        return completeWorkshopListJsonp(e.parameter);
      case "archiveWorkshopListJsonp":
        return archiveWorkshopListJsonp(e.parameter);
      case "addWorkToListJsonp":
        return addWorkToListJsonp(e.parameter);
      case "removeWorkFromListJsonp":
        return removeWorkFromListJsonp(e.parameter);
      case "uploadPdfChunkJsonp":
        return uploadPdfChunkJsonp(e.parameter);
      case "finalizePdfUploadJsonp":
        return finalizePdfUploadJsonp(e.parameter);
      case "uploadInvoiceChunkJsonp":
        return uploadInvoiceChunkJsonp(e.parameter);
      case "finalizeInvoiceUploadJsonp":
        return finalizeInvoiceUploadJsonp(e.parameter);
        
      // --- Messaging ---
      case "sendHowToBookMessageApp":
        return createJsonResponse(sendHowToBookMessageApp(e.parameter.phoneNumber));
      case "sendHowToBookMessageAppJsonp":
        return sendHowToBookMessageAppJsonp(e.parameter);
      case "sendDatiMultigiornoApp":
        return createJsonResponse(sendDatiMultigiornoApp(e.parameter.phoneNumber));
      case "sendDatiMultigiornoAppJsonp":
        return sendDatiMultigiornoAppJsonp(e.parameter);

      // --- Iglohome ---
      case "generateIglohomeCodeApp":
        return createJsonResponse(generateIglohomeCodeApp(e.parameter));
      case "generateIglohomeCodeAppJsonp":
        return generateIglohomeCodeAppJsonp(e.parameter);

      // --- Utilities ---
      case "ping":
        return createJsonResponse({ result: "Ping successful" });
      case "pingJsonp":
        return createJsonpResponse(e.parameter.callback, { result: "Ping successful" });
      case "getOpenAIApiKeyJsonp":
        return getOpenAIApiKeyJsonp(e.parameter);
      case "getGoogleCredentialsJsonp":
        return getGoogleCredentialsJsonp(e.parameter);

      // --- AI Assistant ---
      case "handleMaintenanceAiRequestJsonp":
        return handleMaintenanceAiRequestJsonp(e.parameter);
      case "testAiEndpointJsonp":
        return testAiEndpointJsonp(e.parameter);
        
      default:
        return returnError(`Unknown function: ${functionName}`);
    }

  } catch (error) {
    return returnError(error.toString());
  }
}

function doPost(e) {
  try {
    Logger.log('doPost called');
    
    // Parse JSON body
    let requestData;
    try {
      const postData = e.postData && e.postData.contents;
      requestData = postData ? JSON.parse(postData) : e.parameter;
    } catch (parseError) {
      Logger.log('Error parsing POST data:', parseError);
      requestData = e.parameter;
    }
    
    Logger.log('POST request data:', requestData);
    
    // Validate authentication
    const authToken = requestData.authToken;
    if (!validateAuthToken(authToken)) {
      return createJsonResponseWithCors({ success: false, error: "Unauthorized: Invalid auth token" });
    }
    
    const functionName = requestData.function;
    
    // Handle specific POST functions
    switch (functionName) {
      case 'generateDraftPdf':
        const result = generateDraftPdf(requestData.data);
        return createJsonResponseWithCors(result);
        
      case 'logExpense':
        // Parse body...
        return createJsonResponseWithCors({ result: "Expense logged (placeholder)" });
        
      default:
        return createJsonResponseWithCors({ success: false, error: `Unknown POST function: ${functionName}` });
    }

  } catch (error) {
    Logger.log('doPost error:', error);
    return createJsonResponseWithCors({ success: false, error: error.toString() });
  }
}

// Utility function to get OpenAI API key securely
// Moved to 8_AI_Logic.gs

// JSONP wrapper for OpenAI API key
// Moved to 8_AI_Logic.gs

// JSONP wrapper for AI Assistant
// Moved to 8_AI_Logic.gs

/**
 * Handles requests for the AI assistant, using OpenAI's function calling.
 * This function now supports a multi-step conversation to execute tool calls.
 */
// Moved to 8_AI_Logic.gs

/**
 * Placeholder for creating a maintenance report.
 * In a real scenario, this would interact with a spreadsheet or database.
 */
// Moved to 8_AI_Logic.gs

/**
 * Helper function to call the OpenAI API.
 */
// Moved to 8_AI_Logic.gs

// Test endpoint for AI functionality
// Moved to 8_AI_Logic.gs

// AI Function Wrappers
// Moved to 8_AI_Logic.gs