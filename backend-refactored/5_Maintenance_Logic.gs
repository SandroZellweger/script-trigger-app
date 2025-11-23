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

    // Nuovi indici per KM Attuali (Colonna J -> indice 9) e Data (Colonna K -> indice 10)
    const currentKmIndex = 9; // Colonna J
    const lastUpdateIndex = 10; // Colonna K

    const vehicles = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const vehicleName = row[nameIndex] || '';

      // Check if vehicle has name and calendar ID (skip empty rows)
      // AND filter: only include vehicles starting with "N"
      if (row[nameIndex] && row[idIndex] && vehicleName.toString().trim().toUpperCase().startsWith('N')) {
        
        // Formatta la data se presente
        let lastUpdate = '';
        if (row[lastUpdateIndex]) {
          try {
            const dateObj = new Date(row[lastUpdateIndex]);
            lastUpdate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
          } catch (e) {
            lastUpdate = row[lastUpdateIndex];
          }
        }

        vehicles.push({
          name: row[nameIndex],
          calendarId: row[idIndex],
          id: row[idIndex],
          kmToService: parseInt(row[kmIndex]) || 0,
          currentKm: parseInt(row[currentKmIndex]) || 0, // Aggiunto KM Attuali
          lastUpdate: lastUpdate // Aggiunta Data Aggiornamento
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
    let nameIndex = headers.indexOf('Nome Officina');
    if (nameIndex === -1) nameIndex = headers.indexOf('Nome');
    
    const addressIndex = headers.indexOf('Indirizzo');
    const cityIndex = headers.indexOf('Città');
    const zipIndex = headers.indexOf('CAP');
    const phoneIndex = headers.indexOf('Telefono');
    const mobileIndex = headers.indexOf('Cellulare');
    const emailIndex = headers.indexOf('Email');
    const websiteIndex = headers.indexOf('Sito Web');
    const responsabileIndex = headers.indexOf('Responsabile');
    const specializationIndex = headers.indexOf('Specializzazione');
    const notesIndex = headers.indexOf('Note');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (nameIndex !== -1 && row[nameIndex]) {
        garages.push({
          name: row[nameIndex] || '',
          address: addressIndex !== -1 ? row[addressIndex] : '',
          city: cityIndex !== -1 ? row[cityIndex] : '',
          zip: zipIndex !== -1 ? row[zipIndex] : '',
          phone: phoneIndex !== -1 ? row[phoneIndex] : '',
          mobile: mobileIndex !== -1 ? row[mobileIndex] : '',
          email: emailIndex !== -1 ? row[emailIndex] : '',
          website: websiteIndex !== -1 ? row[websiteIndex] : '',
          responsabile: responsabileIndex !== -1 ? row[responsabileIndex] : '',
          specialization: specializationIndex !== -1 ? row[specializationIndex] : '',
          notes: notesIndex !== -1 ? row[notesIndex] : ''
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

// Save Maintenance Report
function saveMaintenanceReport(reportData) {
  try {
    const config = getConfig();
    const sheetId = config.MAINTENANCE_SHEET_ID || PropertiesService.getScriptProperties().getProperty('MAINTENANCE_SHEET_ID');
    
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
      // Add headers
      const headerRow = sheet.getRange(1, 1, 1, 20);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi', 'Scadenza KM'
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
      const headerRow = sheet.getRange(1, 1, 1, 20);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi', 'Scadenza KM'
      ]]);
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // Check if "Scadenza KM" column exists (it's the 20th column)
    const lastCol = sheet.getLastColumn();
    if (lastCol < 20) {
       sheet.getRange(1, 20).setValue('Scadenza KM').setBackground('#667eea').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
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
        issue.deadlineKm || '' // Save Deadline KM
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
          break;
      }
    });
    
    return {
      success: true,
      message: 'Report saved successfully',
      reportId: reportId
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function saveMaintenanceReportJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => {
    let reportData;
    try {
      reportData = JSON.parse(p.data);
    } catch (e) {
      throw new Error('Invalid report data: ' + e.toString());
    }
    return saveMaintenanceReport(reportData);
  });
}