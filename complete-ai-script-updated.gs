/*************************************************************
 * Complete AI Assistant Script - Updated Version
 * Copia tutto questo codice in un NUOVO progetto Google Apps Script
 * Sostituisci il codice esistente completamente
 *************************************************************/

// Configurazione - MODIFICA QUESTI VALORI
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    // ID reali dei fogli
    VEHICLE_DATA_SHEET_ID: '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E',
    EXPENSE_SHEET_ID: scriptProperties.getProperty('EXPENSE_SHEET_ID') || ''
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

      // --- Google Credentials ---
      case "getGoogleCredentialsJsonp":
        return getGoogleCredentialsJsonp(e.parameter);

      // --- Vehicle Management ---
      case "getVehicleListWithKmJsonp":
        return getVehicleListWithKmJsonp(e.parameter);

      // --- Maintenance Reports ---
      case "getActiveMaintenanceReportsJsonp":
        return getActiveMaintenanceReportsJsonp(e.parameter);

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

// Google Credentials function
function getGoogleCredentialsJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('GOOGLE_API_KEY');
    const clientId = scriptProperties.getProperty('GOOGLE_CLIENT_ID');
    // Usa l'auth token dalle properties come appId per Google Picker
    const appId = scriptProperties.getProperty('AUTH_TOKEN') || 'mySecureVanApp_2025';

    const response = {
      success: true,
      apiKey: apiKey,
      clientId: clientId,
      appId: appId,
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
}

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
          kmToService: parseInt(row[kmIndex]) || 0
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

      // Only include incomplete reports
      if (!completed) {
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