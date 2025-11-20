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
      case "getOpenAIApiKeyJsonp":
        return getOpenAIApiKeyJsonp(e.parameter);

      // --- AI Assistant ---
      case "handleMaintenanceAiRequestJsonp":
        return handleMaintenanceAiRequestJsonp(e.parameter);
      case "testAiEndpointJsonp":
        return testAiEndpointJsonp(e.parameter);
        
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

// Utility function to get OpenAI API key securely
function getOpenAIApiKey() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      Logger.log('OpenAI API key not configured in Script Properties');
      return null;
    }
    
    return apiKey;
  } catch (error) {
    Logger.log('Error retrieving OpenAI API key: ' + error.toString());
    return null;
  }
}

// JSONP wrapper for OpenAI API key
function getOpenAIApiKeyJsonp(params) {
  try {
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey) {
      return createJsonpResponse(params.callback, { 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }
    
    return createJsonpResponse(params.callback, { 
      success: true, 
      apiKey: apiKey 
    });
  } catch (error) {
    return createJsonpResponse(params.callback, { 
      success: false, 
      error: error.toString() 
    });
  }
}

// JSONP wrapper for AI Assistant
function handleMaintenanceAiRequestJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = handleMaintenanceAiRequest(params);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * Handles requests for the AI assistant, using OpenAI's function calling.
 * This function now supports a multi-step conversation to execute tool calls.
 */
function handleMaintenanceAiRequest(params) {
  const userQuery = params.query;
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return { success: false, error: "OpenAI API key not configured." };
  }

  const openAiUrl = 'https://api.openai.com/v1/chat/completions';

  // 1. Define the available tools
  const tools = [
    {
      type: "function",
      function: {
        name: "createMaintenanceReport",
        description: "Crea un rapporto di manutenzione per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicle: {
              type: "string",
              description: "L'identificativo o nome del veicolo, es. 'N1', 'N2'."
            },
            description: {
              type: "string",
              description: "Una descrizione dettagliata del lavoro di manutenzione eseguito."
            },
            cost: {
              type: "number",
              description: "Il costo totale della manutenzione."
            }
          },
          required: ["vehicle", "description", "cost"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createPaymentLink",
        description: "Crea un link di pagamento Stripe per un importo specifico.",
        parameters: {
          type: "object",
          properties: {
            amount: {
              type: "number",
              description: "Importo in franchi (es. 50.00)"
            },
            description: {
              type: "string",
              description: "Descrizione del pagamento"
            }
          },
          required: ["amount", "description"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "generateIglohomeCode",
        description: "Genera un codice di accesso Igloohome per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicleType: {
              type: "string",
              description: "Tipo di veicolo (es. N01, N02)"
            }
          },
          required: ["vehicleType"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "sendMessage",
        description: "Invia un messaggio WhatsApp per spiegare come prenotare.",
        parameters: {
          type: "object",
          properties: {
            phoneNumber: {
              type: "string",
              description: "Numero di telefono (formato internazionale)"
            }
          },
          required: ["phoneNumber"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getVehicleList",
        description: "Ottieni la lista dei veicoli disponibili.",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    }
  ];

  // Define the available functions in this script that the AI can call
  const availableFunctions = {
    "createMaintenanceReport": createMaintenanceReport,
    "createPaymentLink": createPaymentLinkForAI,
    "generateIglohomeCode": generateIglohomeCodeForAI,
    "sendMessage": sendMessageForAI,
    "getVehicleList": getVehicleListForAI
  };

  // 2. Initial conversation messages
  const messages = [
    {
      role: "system",
      content: "Sei un assistente AI per la gestione di una flotta di veicoli. Puoi creare report di manutenzione, generare link di pagamento Stripe, creare codici di accesso Igloohome, inviare messaggi WhatsApp e fornire informazioni sui veicoli disponibili. Rispondi sempre in italiano e chiedi chiarimenti se necessario."
    },
    {
      role: "user",
      content: userQuery
    }
  ];

  try {
    // 3. First call to OpenAI to see what it wants to do
    let responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);

    // 4. Check if the AI wants to call a tool
    if (responseMessage.tool_calls) {
      // Add the AI's response to the message history
      messages.push(responseMessage);

      // 5. Execute each tool call requested by the AI
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Call the local function with the arguments provided by the AI
        const functionResponse = functionToCall(
          functionArgs.vehicle,
          functionArgs.description,
          functionArgs.cost
        );

        // 6. Add the result of the tool execution to the message history
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      }

      // 7. Make a second call to OpenAI with the tool results to get a final, user-friendly response
      responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);
    }

    // 8. Return the final response to the frontend
    return { success: true, response: responseMessage };

  } catch (error) {
    Logger.log('Error in handleMaintenanceAiRequest: ' + error.toString());
    return { success: false, error: 'Error processing AI request: ' + error.toString() };
  }
}

/**
 * Placeholder for creating a maintenance report.
 * In a real scenario, this would interact with a spreadsheet or database.
 */
function createMaintenanceReport(vehicle, description, cost) {
  Logger.log(`MAINTENANCE REPORT CREATED:
    Vehicle: ${vehicle}
    Description: ${description}
    Cost: ${cost}
  `);
  return {
    success: true,
    message: `Maintenance report created for ${vehicle} with description "${description}" and cost ${cost}.`
  };
}

/**
 * Helper function to call the OpenAI API.
 */
function callOpenAI(url, apiKey, messages, tools) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    })
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseData = JSON.parse(response.getContentText());
  return responseData.choices[0].message;
}

// Test endpoint for AI functionality
function testAiEndpointJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const apiKey = getOpenAIApiKey();

  const response = {
    success: true,
    message: "AI endpoint is reachable",
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  };

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// AI Function Wrappers
function createPaymentLinkForAI(amount, description) {
  try {
    Logger.log(`AI Payment Link Request: CHF ${amount} - ${description}`);
    // For now, return a placeholder - you'll need to implement createPaymentLink
    return { 
      success: true, 
      link: `https://checkout.stripe.com/pay/placeholder_${amount}_${Date.now()}`, 
      message: `Link di pagamento creato per CHF ${amount}: ${description}` 
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function generateIglohomeCodeForAI(vehicleType) {
  try {
    Logger.log(`AI Iglohome Code Request: ${vehicleType}`);
    // For now, return a placeholder - you'll need to implement generateIglohomeCode
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return { 
      success: true, 
      code: code, 
      message: `Codice Igloohome generato per ${vehicleType}: ${code}` 
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function sendMessageForAI(phoneNumber) {
  try {
    Logger.log(`AI Message Request: ${phoneNumber}`);
    // For now, return a placeholder - you'll need to implement sendHowToBookMessageApp
    return { 
      success: true, 
      message: `Messaggio inviato al numero ${phoneNumber}` 
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getVehicleListForAI() {
  try {
    Logger.log('AI Vehicle List Request');
    // For now, return a placeholder - you'll need to implement getVehicleList
    return { 
      success: true, 
      vehicles: [
        { name: 'N1', type: 'Furgone', status: 'Disponibile' },
        { name: 'N2', type: 'Furgone', status: 'In manutenzione' },
        { name: 'N3', type: 'Camion', status: 'Disponibile' }
      ]
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}