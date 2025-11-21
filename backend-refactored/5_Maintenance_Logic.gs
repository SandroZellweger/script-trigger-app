/*************************************************************
 * 5_Maintenance_Logic.gs
 * Vehicle Maintenance, Data Sheets, and Reporting
 *************************************************************/

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
      vehicles: vehicles
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Get vehicle overview (JSONP wrapper)
function getVehicleOverviewJsonp(params) {
  return handleJsonpRequest({ parameter: params }, getVehicleOverview);
}

function getVehicleOverview(params) {
  // Placeholder - Implement full logic from original script
  // This function was very large in the original script, extracting just the core logic here
  const vehicleData = getVehicleData();
  if (vehicleData.error) return vehicleData;
  
  return {
    success: true,
    vehicles: vehicleData.vehicles.map(v => ({
      id: v.vehicleType,
      name: v.calendarName,
      plate: v.licencePlate
    }))
  };
}

// Get maintenance data (JSONP wrapper)
function getMaintenanceDataJsonp(params) {
  return handleJsonpRequest({ parameter: params }, getMaintenanceData);
}

function getMaintenanceData(params) {
  // Placeholder - Implement full logic
  return { success: true, message: "Maintenance data endpoint ready" };
}

// Log Expense
function logExpense(data) {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.EXPENSE_SHEET_ID).getSheetByName('Expenses');
    if (!sheet) return { success: false, error: 'Expense sheet not found' };
    
    sheet.appendRow([
      new Date(),
      data.category,
      data.amount,
      data.description,
      data.vehicleId || ''
    ]);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get Vehicle List (simple version for dropdowns)
function getVehicleList() {
  const vehicleData = getVehicleData();
  if (vehicleData.error) return vehicleData;
  
  return {
    success: true,
    vehicles: vehicleData.vehicles.map(v => ({
      id: v.vehicleType,
      name: v.calendarName || v.vehicleType,
      plate: v.licencePlate || ''
    }))
  };
}

// JSONP Wrapper for getVehicleList
function getVehicleListJsonp(params) {
  return handleJsonpRequest({ parameter: params }, () => getVehicleList());
}

// --- New Maintenance Functions ---

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
  return handleJsonpRequest({ parameter: params }, getVehicleListWithKm);
}

function getActiveMaintenanceReportsJsonp(params) {
  return handleJsonpRequest({ parameter: params }, getActiveMaintenanceReports);
}

function getActiveMaintenanceReports() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('MAINTENANCE_SHEET_ID');

    if (!sheetId) {
      return { success: false, error: 'Maintenance sheet ID not configured' };
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Difetti e Riparazioni');

    if (!sheet) {
      return { success: true, reports: [] };
    }

    const data = sheet.getDataRange().getValues();
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
          const urlMatches = formula.match(/HYPERLINK\("([^"]+)"/g);
          if (urlMatches) {
            photoURLs = urlMatches.map(match => {
              const urlMatch = match.match(/HYPERLINK\("([^"]+)"/);
              return urlMatch ? urlMatch[1] : null;
            }).filter(url => url !== null);
          }
        } else if (row[15]) {
          photoURLs = row[15].toString().split('\n').map(url => url.trim()).filter(url => url && url.startsWith('http'));
        }

        const photoIds = row[16] ? row[16].toString().split('\n').map(id => id.trim()).filter(id => id) : [];

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

    return {
      success: true,
      reports: Object.values(reportsMap),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Maintenance Issue Analysis
function analyzeMaintenanceIssue(description, category, kmToService) {
  try {
    Logger.log('🔍 analyzeMaintenanceIssue called with:', { description, category, kmToService });
    
    const apiKey = getOpenAIApiKey(); // Defined in 8_AI_Logic.gs or Main_API.gs, need to ensure availability
    
    if (!apiKey) {
      Logger.log('❌ OpenAI API key not configured');
      return { success: false, error: 'OpenAI API key not configured' };
    }
    
    Logger.log('✅ API key found');
    
    // Calculate days to service (assuming 100km/day)
    const daysToService = Math.floor(kmToService / 100);
    
    const prompt = `Sei un meccanico esperto. Analizza questo problema di manutenzione:

Descrizione: ${description}
${category ? `Categoria suggerita: ${category}` : ''}
Km fino al prossimo tagliando: ${kmToService} km (circa ${daysToService} giorni)

Le categorie disponibili sono:
- motore (problemi motore, trasmissione)
- freni (problemi ai freni)
- pneumatici (gomme, pressione, cerchi)
- elettrico (luci, batteria, sistemi elettronici)
- carrozzeria (ammaccature, graffi, danni esterni)
- interni (sedili, tappezzeria, accessori interni)
- fluidi (olio, acqua, livelli)
- climatizzazione (aria condizionata, riscaldamento)
- luci (fari, lampadine)
- altro (problemi non classificabili nelle altre categorie)

Rispondi in formato JSON con:
1. category: Seleziona la categoria più appropriata basandoti ESCLUSIVAMENTE sulla descrizione del problema. Usa ESATTAMENTE uno dei valori sopra (es. "motore", "freni", "pneumatici", ecc.).
2. urgency: "low", "medium", "high", o "critical"
3. canWaitUntilService: true/false (può aspettare fino al prossimo tagliando?)
4. recommendation: breve consiglio in italiano (max 100 caratteri)
5. standardizedDescription: riscrivi la descrizione del problema in italiano tecnico corretto e professionale.

Esempio risposta:
{"category": "Meccanica", "urgency": "medium", "canWaitUntilService": true, "recommendation": "Controlla al prossimo tagliando", "standardizedDescription": "Rumore anomalo proveniente dal sistema frenante posteriore sinistro in fase di decelerazione."}`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un meccanico esperto che analizza problemi di veicoli. Rispondi sempre in italiano e in formato JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('📡 Calling OpenAI API...');
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      return { success: false, error: result.error.message || result.error.toString() };
    }
    
    let aiResponse = result.choices[0].message.content;
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const analysis = JSON.parse(aiResponse);
    
    return { success: true, analysis: analysis, timestamp: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: 'Errore durante l\'analisi: ' + error.toString() };
  }
}

function analyzeMaintenanceIssueJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => analyzeMaintenanceIssue(p.description, p.category, parseInt(p.kmToService) || 0));
}

// Garage Management Functions
function getGaragesList() {
  try {
    const config = getConfig();
    const sheetId = config.GARAGES_SHEET_ID || PropertiesService.getScriptProperties().getProperty('GARAGES_SHEET_ID');

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
    return { success: false, error: error.toString() };
  }
}

function getGaragesListJsonp(params) {
  return handleJsonpRequest({ parameter: params }, getGaragesList);
}

function addGarage(garageData) {
  try {
    const config = getConfig();
    const sheetId = config.GARAGES_SHEET_ID || PropertiesService.getScriptProperties().getProperty('GARAGES_SHEET_ID');

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
    return { success: false, error: error.toString() };
  }
}

function addGarageJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => {
    let garageData;
    try {
      garageData = JSON.parse(p.data);
    } catch (e) {
      throw new Error('Invalid garage data: ' + e.toString());
    }
    return addGarage(garageData);
  });
}