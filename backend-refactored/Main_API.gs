/*************************************************************
 * Main_API.gs
 * Entry points (doGet, doPost) and Routing Logic
 *************************************************************/

function doGet(e) {
  Logger.log('doGet called - Function: ' + (e.parameter ? e.parameter.function : 'undefined'));
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
        
      default:
        return createJsonResponse({ error: `Unknown function: ${functionName}` });
    }

  } catch (error) {
    return createJsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  try {
    Logger.log('doPost called');
    
    // Basic POST handling for now
    if (e.parameter.function === 'logExpense') {
       // Parse body...
       return createJsonResponseWithCors({ result: "Expense logged (placeholder)" });
    }
    
    return createJsonResponseWithCors({ result: "doPost processed" });

  } catch (error) {
    return createJsonResponseWithCors({ error: error.toString() });
  }
}