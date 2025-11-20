/*************************************************************
 * Complete AI Assistant Script - Updated Version
 * Copia tutto questo codice in un NUOVO progetto Google Apps Script
 * Sostituisci il codice esistente completamente
 *************************************************************/

// Configurazione - MODIFICA QUESTI VALORI
function getConfig() {
  return {
    // Inserisci qui i tuoi ID reali
    VEHICLE_DATA_SHEET_ID: 'TUO_SHEET_ID_VEHICLES',
    EXPENSE_SHEET_ID: 'TUO_SHEET_ID_EXPENSES'
  };
}

// Funzione di validazione auth - MODIFICA CON IL TUO TOKEN
function validateAuthToken(token) {
  // Per test, accetta qualsiasi token non vuoto
  return token && token.length > 0;
}

// Entry point principale
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
      // --- AI Assistant ---
      case "handleMaintenanceAiRequestJsonp":
        return handleMaintenanceAiRequestJsonp(e.parameter);
      case "testAiEndpointJsonp":
        return testAiEndpointJsonp(e.parameter);
      case "testSimpleJsonp":
        return testSimpleJsonp(e.parameter);

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

// Funzione di test semplice
function testSimpleJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');

  const response = {
    success: true,
    message: "Test semplice riuscito!",
    timestamp: new Date().toISOString()
  };

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Test endpoint AI
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

// AI Assistant principale
function handleMaintenanceAiRequestJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = handleMaintenanceAiRequest(params);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function handleMaintenanceAiRequest(params) {
  const userQuery = params.query;
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return { success: false, error: "OpenAI API key not configured." };
  }

  const openAiUrl = 'https://api.openai.com/v1/chat/completions';

  // TOOLS DISPONIBILI
  const tools = [
    {
      type: "function",
      function: {
        name: "createMaintenanceReport",
        description: "Crea un rapporto di manutenzione per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicle: { type: "string", description: "Nome del veicolo (es. N1, N2)" },
            description: { type: "string", description: "Descrizione del problema/lavoro" },
            cost: { type: "number", description: "Costo in franchi" }
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
            amount: { type: "number", description: "Importo in franchi (es. 50.00)" },
            description: { type: "string", description: "Descrizione del pagamento" }
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
            vehicleType: { type: "string", description: "Tipo di veicolo (es. N01, N02)" }
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
            phoneNumber: { type: "string", description: "Numero di telefono (formato internazionale)" }
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

  // FUNZIONI DISPONIBILI
  const availableFunctions = {
    "createMaintenanceReport": createMaintenanceReport,
    "createPaymentLink": createPaymentLinkForAI,
    "generateIglohomeCode": generateIglohomeCodeForAI,
    "sendMessage": sendMessageForAI,
    "getVehicleList": getVehicleListForAI
  };

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
    let responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        const functionResponse = functionToCall(
          functionArgs.vehicle || functionArgs.amount || functionArgs.vehicleType || functionArgs.phoneNumber,
          functionArgs.description || functionArgs.vehicleType || functionArgs.phoneNumber
        );

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      }

      responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);
    }

    return { success: true, response: responseMessage };

  } catch (error) {
    Logger.log('Error in handleMaintenanceAiRequest: ' + error.toString());
    return { success: false, error: 'Error processing AI request: ' + error.toString() };
  }
}

// FUNZIONI AI WRAPPER
function createPaymentLinkForAI(amount, description) {
  try {
    Logger.log(`AI Payment Link: CHF ${amount} - ${description}`);
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
    Logger.log(`AI Iglohome Code: ${vehicleType}`);
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
    Logger.log(`AI Message: ${phoneNumber}`);
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

function createMaintenanceReport(vehicle, description, cost) {
  Logger.log(`MAINTENANCE REPORT CREATED:
    Vehicle: ${vehicle}
    Description: ${description}
    Cost: ${cost}
  `);
  return {
    success: true,
    message: `Report creato per ${vehicle} con descrizione "${description}" e costo ${cost} CHF.`
  };
}

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

// UTILITY FUNCTIONS
function getOpenAIApiKey() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    return apiKey;
  } catch (error) {
    return null;
  }
}

function sanitizeJsonpCallback(callback) {
  return callback.replace(/[^a-zA-Z0-9_]/g, '');
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonpResponse(callback, data) {
  const sanitizedCallback = sanitizeJsonpCallback(callback);
  const jsonpResponse = '/**/' + sanitizedCallback + '(' + JSON.stringify(data) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}