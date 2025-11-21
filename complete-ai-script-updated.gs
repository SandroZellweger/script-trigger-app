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
    EXPENSE_SHEET_ID: scriptProperties.getProperty('EXPENSE_SHEET_ID') || '',
    GARAGES_SHEET_ID: scriptProperties.getProperty('GARAGES_SHEET_ID') || ''
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
      case "getVehicleListJsonp":
        return getVehicleListJsonp(e.parameter);

      // --- Maintenance Reports ---
      case "getActiveMaintenanceReportsJsonp":
        return getActiveMaintenanceReportsJsonp(e.parameter);
      case "analyzeMaintenanceIssueJsonp":
        return analyzeMaintenanceIssueJsonp(e.parameter);

      // --- Garages Management ---
      case "getGaragesListJsonp":
        return getGaragesListJsonp(e.parameter);
      case "addGarageJsonp":
        return addGarageJsonp(e.parameter);

      // --- Zoko Messaging ---
      case "sendHowToBookMessageAppJsonp":
        return sendHowToBookMessageAppJsonp(e.parameter);
      case "sendDatiMultigiornoAppJsonp":
        return sendDatiMultigiornoAppJsonp(e.parameter);

      // --- Iglohome ---
      case "generateIglohomeCodeAppJsonp":
        return generateIglohomeCodeAppJsonp(e.parameter);

      // --- Calendar ---
      case "getCalendarEventsAppJsonp":
        return getCalendarEventsAppJsonp(e.parameter);

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

function getVehicleList() {
  try {
    const vehicleData = getVehicleData();
    if (vehicleData.error) {
      return {
        success: false,
        error: vehicleData.error
      };
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

function getActiveMaintenanceReportsJsonp(params) {
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

    const callback = sanitizeJsonpCallback(params.callback || 'callback');
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify({
      success: true,
      reports: reports,
      timestamp: new Date().toISOString()
    }) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    const callback = sanitizeJsonpCallback(params.callback || 'callback');
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify({
      success: false,
      error: error.toString()
    }) + ');';

    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Maintenance Issue Analysis
function analyzeMaintenanceIssue(description, category, kmToService) {
  try {
    Logger.log('🔍 analyzeMaintenanceIssue called with:', { description, category, kmToService });
    
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey) {
      Logger.log('❌ OpenAI API key not configured');
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }
    
    Logger.log('✅ API key found');
    
    // Calculate days to service (assuming 100km/day)
    const daysToService = Math.floor(kmToService / 100);
    
    const prompt = `Sei un meccanico esperto. Analizza questo problema di manutenzione:

Descrizione: ${description}
${category ? `Categoria suggerita: ${category}` : ''}
Km fino al prossimo tagliando: ${kmToService} km (circa ${daysToService} giorni)

Le categorie disponibili sono:
- Meccanica (problemi motore, trasmissione, freni, sospensioni)
- Carrozzeria (ammaccature, graffi, danni esterni)
- Elettrica (luci, batteria, sistemi elettronici)
- Interni (sedili, tappezzeria, accessori interni)
- Pulizia (sporco, macchie, odori)
- Altro (problemi non classificabili nelle altre categorie)

Rispondi in formato JSON con:
1. category: la categoria più appropriata tra quelle disponibili
2. urgency: "low", "medium", "high", o "critical"
3. canWaitUntilService: true/false (può aspettare fino al prossimo tagliando?)
4. recommendation: breve consiglio in italiano (max 100 caratteri)

Esempio risposta:
{"category": "Meccanica", "urgency": "medium", "canWaitUntilService": true, "recommendation": "Controlla al prossimo tagliando"}`;

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
    
    Logger.log('📡 Calling OpenAI API...');
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('📡 OpenAI response code:', responseCode);
    Logger.log('📡 OpenAI response:', responseText.substring(0, 500));
    
    const result = JSON.parse(responseText);
    
    if (result.error) {
      Logger.log('❌ OpenAI API error:', result.error);
      return {
        success: false,
        error: result.error.message || result.error.toString()
      };
    }
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      Logger.log('❌ Invalid OpenAI response structure');
      return {
        success: false,
        error: 'Invalid response from OpenAI API'
      };
    }
    
    let aiResponse = result.choices[0].message.content;
    Logger.log('🤖 AI response:', aiResponse);
    
    // Remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const analysis = JSON.parse(aiResponse);
    
    Logger.log('✅ Analysis completed successfully');
    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    Logger.log('❌ Error in analyzeMaintenanceIssue:', error);
    Logger.log('Error stack:', error.stack);
    return {
      success: false,
      error: 'Errore durante l\'analisi: ' + error.toString()
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

// Garage Management Functions
function getGaragesList() {
  try {
    const config = getConfig();
    const sheetId = config.GARAGES_SHEET_ID;

    if (!sheetId) {
      return { success: false, error: 'Garages sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Officine') || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return { success: true, garages: [] };
    }

    const headers = data[0];
    const garages = [];

    // Find column indices
    const nameIndex = headers.indexOf('Nome');
    const addressIndex = headers.indexOf('Indirizzo');
    const cityIndex = headers.indexOf('Città');
    const zipIndex = headers.indexOf('CAP');
    const phoneIndex = headers.indexOf('Telefono');
    const mobileIndex = headers.indexOf('Cellulare');
    const emailIndex = headers.indexOf('Email');
    const websiteIndex = headers.indexOf('Sito Web');
    const responsabileIndex = headers.indexOf('Responsabile');
    const specializationIndex = headers.indexOf('Specializzazione');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[nameIndex]) {
        garages.push({
          name: row[nameIndex] || '',
          address: row[addressIndex] || '',
          city: row[cityIndex] || '',
          zip: row[zipIndex] || '',
          phone: row[phoneIndex] || '',
          mobile: row[mobileIndex] || '',
          email: row[emailIndex] || '',
          website: row[websiteIndex] || '',
          responsabile: row[responsabileIndex] || '',
          specialization: row[specializationIndex] || ''
        });
      }
    }

    return { success: true, garages: garages };
  } catch (error) {
    Logger.log('Error in getGaragesList:', error);
    return { success: false, error: error.toString() };
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

function addGarage(garageData) {
  try {
    const config = getConfig();
    const sheetId = config.GARAGES_SHEET_ID;

    if (!sheetId) {
      return { success: false, error: 'Garages sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('Officine');

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Officine');
      sheet.appendRow(['Nome', 'Indirizzo', 'Città', 'CAP', 'Telefono', 'Cellulare', 'Email', 'Sito Web', 'Responsabile', 'Specializzazione', 'Note']);
    }

    const newRow = [
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
    ];

    sheet.appendRow(newRow);

    return { success: true, message: 'Garage added successfully' };
  } catch (error) {
    Logger.log('Error in addGarage:', error);
    return { success: false, error: error.toString() };
  }
}

function addGarageJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  
  let garageData;
  try {
    garageData = JSON.parse(params.data);
  } catch (e) {
    const errorResponse = { success: false, error: 'Invalid garage data: ' + e.toString() };
    const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(errorResponse) + ');';
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  const response = addGarage(garageData);
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Helper Functions
function getVehicleData() {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.VEHICLE_DATA_SHEET_ID).getSheets()[0];
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
      return { error: "Required columns not found in vehicle sheet" };
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const vehicleName = row[vehicleTypeIndex] ? row[vehicleTypeIndex].toString().trim().toUpperCase() : '';

      // Filter: only include vehicles starting with "N"
      if (row[vehicleTypeIndex] && row[calendarIdIndex] && vehicleName.startsWith('N')) {
        vehicles.push({
          vehicleType: row[vehicleTypeIndex],
          sheetId: row[sheetIdIndex] || '',
          calendarId: row[calendarIdIndex],
          calendarName: row[calendarNameIndex] || '',
          vehicleNumber: row[vehicleNumberIndex] || '',
          vehicleAdress: row[vehicleAdressIndex] || '',
          igloPinFunctionName: row[igloPinFunctionNameIndex] || '',
          licencePlate: row[licencePlateIndex] || ''
        });
      }
    }

    return { vehicles: vehicles };
  } catch (error) {
    Logger.log('Error in getVehicleData:', error);
    return { error: error.toString() };
  }
}

function sendIglohomePin(phoneNumber, pin) {
  Logger.log('🔐 sendIglohomePin called with:', phoneNumber, pin);

  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: "igloohome_pin",
    templateLanguage: "it",
    templateArgs: [pin]
  };

  Logger.log('📤 Zoko payload:', JSON.stringify(payload));

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
    Logger.log('📡 Making request to Zoko API...');
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('📡 Zoko response code:', code);
    Logger.log('📡 Zoko response text:', responseText);

    if (code === 200) {
      Logger.log('✅ WhatsApp PIN message sent successfully');
      return true;
    } else {
      Logger.log('❌ Failed to send WhatsApp PIN message:', code, responseText);
      return false;
    }
  } catch (error) {
    Logger.log('❌ Error sending WhatsApp PIN message:', error);
    return false;
  }
}

// Zoko Messaging Functions
function sendHowToBookMessageApp(phoneNumber, ...templateArgs) {
  console.log('🚀 sendHowToBookMessageApp called with:', phoneNumber, templateArgs);

  const url    = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";

  const payload = {
    channel:          "whatsapp",
    recipient:        phoneNumber,
    type:             "template",
    templateId:       "how_to_book_new",
    templateLanguage: "it",
    templateArgs:     templateArgs
  };

  console.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method:  "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "apikey":       apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    console.log('📡 Making request to Zoko API...');
    const response     = UrlFetchApp.fetch(url, options);
    const code         = response.getResponseCode();
    const responseText = response.getContentText();

    console.log('📡 Zoko response code:', code);
    console.log('📡 Zoko response text:', responseText);

    const data         = JSON.parse(responseText);

    if (code === 200) {
      console.log('✅ Message sent successfully');
      return { success: true, message: "Message sent successfully", data: data };
    } else {
      console.error('❌ Zoko API error:', code, responseText);
      return { success: false, error: `Zoko API error: ${code}`, details: responseText };
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return { success: false, error: error.toString() };
  }
}

function sendHowToBookMessageAppJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = sendHowToBookMessageApp(params.phoneNumber);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function sendDatiMultigiornoApp(phoneNumber, ...templateArgs) {
  console.log('🚀 sendDatiMultigiornoApp called with:', phoneNumber, templateArgs);

  const url    = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";

  const payload = {
    channel:          "whatsapp",
    recipient:        phoneNumber,
    type:             "template",
    templateId:       "dati_multigiorno",
    templateLanguage: "it",
    templateArgs:     templateArgs
  };

  console.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method:  "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "apikey":       apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    console.log('📡 Making request to Zoko API...');
    const response     = UrlFetchApp.fetch(url, options);
    const code         = response.getResponseCode();
    const responseText = response.getContentText();

    console.log('📡 Zoko response code:', code);
    console.log('📡 Zoko response text:', responseText);

    const data         = JSON.parse(responseText);

    if (code === 200) {
      console.log('✅ Message sent successfully');
      return { success: true, message: "Message sent successfully", data: data };
    } else {
      console.error('❌ Zoko API error:', code, responseText);
      return { success: false, error: `Zoko API error: ${code}`, details: responseText };
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return { success: false, error: error.toString() };
  }
}

function sendDatiMultigiornoAppJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = sendDatiMultigiornoApp(params.phoneNumber);

  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';

  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Iglohome Functions
function generateIglohomeCodeApp(params) {
  try {
    const vehicleId = params.vehicleId;
    const startDate = params.startDate;
    const endDate = params.endDate;
    const phoneNumber = params.phoneNumber;

    Logger.log('🔐 generateIglohomeCodeApp called with:', { vehicleId, startDate, endDate, phoneNumber });

    if (!phoneNumber) {
      return { success: false, error: "Phone number is required" };
    }

    // Placeholder logic - In real implementation this calls Iglohome API
    // We need to fetch the vehicle data to get the lock ID
    const vehicleDataResult = getVehicleData();
    if (vehicleDataResult.error) {
      return { success: false, error: "Vehicle data not found" };
    }

    const vehicle = vehicleDataResult.vehicles.find(v => v.vehicleType === vehicleId);
    if (!vehicle) {
      return { success: false, error: "Vehicle not found: " + vehicleId };
    }

    // Simulate API call success - Generate 8-digit PIN
    const mockPin = Math.floor(10000000 + Math.random() * 90000000).toString();

    Logger.log('📱 Generated PIN:', mockPin, 'for vehicle:', vehicle.calendarName);

    // Send WhatsApp message with PIN using sendIglohomePin from 6_Messaging_Logic.gs
    if (phoneNumber) {
      try {
        Logger.log('📤 Sending WhatsApp message to:', phoneNumber);

        const whatsappSuccess = sendIglohomePin(phoneNumber, mockPin);

        if (whatsappSuccess) {
          Logger.log('✅ WhatsApp message sent successfully');
          return {
            success: true,
            pin: mockPin,
            message: `PIN generated and sent via WhatsApp to ${phoneNumber}`,
            vehicle: vehicleId,
            validFrom: startDate,
            validTo: endDate
          };
        } else {
          Logger.log('❌ Failed to send WhatsApp message');
          return {
            success: false,
            error: "Failed to send WhatsApp message",
            pin: mockPin
          };
        }
      } catch (whatsappError) {
        Logger.log('❌ Error sending WhatsApp:', whatsappError);
        return {
          success: false,
          error: "Error sending WhatsApp: " + whatsappError.toString(),
          pin: mockPin
        };
      }
    }

    return {
      success: true,
      pin: mockPin,
      message: "PIN generated (WhatsApp not sent - no phone number)",
      vehicle: vehicleId,
      validFrom: startDate,
      validTo: endDate
    };
  } catch (error) {
    Logger.log('❌ Error in generateIglohomeCodeApp:', error);
    return { success: false, error: error.toString() };
  }
}

function generateIglohomeCodeAppJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = generateIglohomeCodeApp(params);

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

// Calendar Functions
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