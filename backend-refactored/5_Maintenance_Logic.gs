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

    let plateIndex = headers.indexOf('LicencePlate');
    if (plateIndex === -1) plateIndex = headers.indexOf('Targa');

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
          lastUpdate: lastUpdate, // Aggiunta Data Aggiornamento
          plate: plateIndex !== -1 ? (row[plateIndex] || '') : '' // Aggiunta Targa
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

// Generate Draft PDF for multiple vehicles
function generateDraftPdf(draftData) {
  try {
    Logger.log('📝 generateDraftPdf called with:', draftData);
    
    // Create a new Google Doc for the draft
    const docName = `Bozza Lavori - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm")}`;
    const doc = DocumentApp.create(docName);
    const body = doc.getBody();
    
    // Professional header with better branding
    const headerTable = body.appendTable();
    headerTable.setBorderWidth(0);
    
    const headerRow = headerTable.appendTableRow();
    
    // Left side - Company info
    const leftCell = headerRow.appendTableCell('');
    leftCell.setPaddingTop(10);
    leftCell.setPaddingBottom(10);
    leftCell.setPaddingLeft(0);
    leftCell.setPaddingRight(20);
    leftCell.setWidth(300);
    
    const companyName = leftCell.appendParagraph('Barbone & Zellweger Sagl');
    companyName.setBold(true);
    companyName.setFontSize(14);
    companyName.setForegroundColor('#2c3e50');
    
    const companyDetails = leftCell.appendParagraph('Via Vincenzo d\'Alberti 17\n6600 Locarno\nadmin@noleggiosemplice.com\n091 250 87 87');
    companyDetails.setFontSize(9);
    companyDetails.setForegroundColor('#666666');
    
    // Right side - Document title
    const rightCell = headerRow.appendTableCell('');
    rightCell.setPaddingTop(10);
    rightCell.setPaddingBottom(10);
    rightCell.setPaddingLeft(20);
    rightCell.setPaddingRight(0);
    rightCell.setWidth(250);
    
    const docTitle = rightCell.appendParagraph('BOZZA LAVORI\nMANUTENZIONE');
    docTitle.setBold(true);
    docTitle.setFontSize(16);
    docTitle.setForegroundColor('#2c3e50');
    docTitle.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    
    const genDate = rightCell.appendParagraph(`Generato: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm")}`);
    genDate.setFontSize(8);
    genDate.setForegroundColor('#666666');
    genDate.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    
    body.appendParagraph(''); // Space after header
    
    // Process each vehicle
    draftData.vehicles.forEach((vehicle, index) => {
      // Nuova pagina per ogni veicolo (tranne il primo)
      if (index > 0) {
        body.appendPageBreak();
      }
      
      // Professional vehicle header
      const vehicleTable = body.appendTable();
      vehicleTable.setBorderWidth(0.5);
      vehicleTable.setBorderColor('#2c3e50');
      
      const vehicleRow = vehicleTable.appendTableRow();
      const vehicleCell = vehicleRow.appendTableCell(`VEICOLO: ${vehicle.name}${vehicle.plate ? ` - TARGA: ${vehicle.plate}` : ''}`);
      vehicleCell.setBackgroundColor('#34495e');
      vehicleCell.setForegroundColor('#ffffff');
      vehicleCell.setBold(true);
      vehicleCell.setFontSize(12);
      vehicleCell.setPaddingTop(8);
      vehicleCell.setPaddingBottom(8);
      vehicleCell.setPaddingLeft(12);
      vehicleCell.setPaddingRight(12);
      vehicleCell.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      
      body.appendParagraph(''); // Space after vehicle header
      
      // Issues
      if (vehicle.issues && vehicle.issues.length > 0) {
        // Create table for issues - more compact and professional
        const table = body.appendTable();
        table.setBorderWidth(0.5);
        table.setBorderColor('#666666');
        
        // Table header - more professional styling
        const headerRow = table.appendTableRow();
        const headers = ['N°', 'Categoria', 'Descrizione', 'Urgenza', 'Data Segn.', 'Segnalato da'];
        
        headers.forEach((headerText, colIndex) => {
          const cell = headerRow.appendTableCell(headerText);
          cell.setBackgroundColor('#2c3e50');
          cell.setForegroundColor('#ffffff');
          cell.setBold(true);
          cell.setFontSize(8);
          cell.setPaddingTop(4);
          cell.setPaddingBottom(4);
          cell.setPaddingLeft(3);
          cell.setPaddingRight(3);
          cell.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
          
          // Set column widths - more compact
          if (colIndex === 0) cell.setWidth(25); // N°
          else if (colIndex === 1) cell.setWidth(65); // Categoria
          else if (colIndex === 2) cell.setWidth(180); // Descrizione
          else if (colIndex === 3) cell.setWidth(50); // Urgenza
          else if (colIndex === 4) cell.setWidth(55); // Data
          else cell.setWidth(70); // Segnalato da
        });
        
        // Raggruppa per urgenza per ordinamento, poi ordina per categoria all'interno di ogni gruppo
        const critical = vehicle.issues.filter(i => i.urgency.includes('Critica') || i.urgency === 'critical')
          .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        const high = vehicle.issues.filter(i => i.urgency.includes('Alta') || i.urgency === 'high')
          .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        const medium = vehicle.issues.filter(i => i.urgency.includes('Media') || i.urgency === 'medium')
          .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        const low = vehicle.issues.filter(i => i.urgency.includes('Bassa') || i.urgency === 'low')
          .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        
        const sortedIssues = [...critical, ...high, ...medium, ...low];
        
        // Add issues to table - more compact formatting
        sortedIssues.forEach((issue, issueIndex) => {
          const row = table.appendTableRow();
          
          // Number
          const numCell = row.appendTableCell((issueIndex + 1).toString());
          numCell.setFontSize(8);
          numCell.setPaddingTop(3);
          numCell.setPaddingBottom(3);
          numCell.setPaddingLeft(2);
          numCell.setPaddingRight(2);
          numCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
          
          // Category
          const catCell = row.appendTableCell((issue.category || 'N/D').toUpperCase());
          catCell.setFontSize(7);
          catCell.setBold(true);
          catCell.setPaddingTop(3);
          catCell.setPaddingBottom(3);
          catCell.setPaddingLeft(2);
          catCell.setPaddingRight(2);
          catCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
          
          // Description - more compact
          const descCell = row.appendTableCell(issue.description || '');
          descCell.setFontSize(7);
          descCell.setPaddingTop(3);
          descCell.setPaddingBottom(3);
          descCell.setPaddingLeft(2);
          descCell.setPaddingRight(2);
          descCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
          
          // Urgency with professional colors
          const urgencyCell = row.appendTableCell(getUrgencyLabel(issue.urgency));
          urgencyCell.setFontSize(7);
          urgencyCell.setBold(true);
          urgencyCell.setPaddingTop(3);
          urgencyCell.setPaddingBottom(3);
          urgencyCell.setPaddingLeft(2);
          urgencyCell.setPaddingRight(2);
          urgencyCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
          
          // Set urgency background color - professional palette
          let urgencyColor = '#ffffff'; // default white
          let textColor = '#000000';
          if (issue.urgency.includes('Critica') || issue.urgency === 'critical') {
            urgencyColor = '#dc3545';
            textColor = '#ffffff';
          } else if (issue.urgency.includes('Alta') || issue.urgency === 'high') {
            urgencyColor = '#fd7e14';
            textColor = '#ffffff';
          } else if (issue.urgency.includes('Media') || issue.urgency === 'medium') {
            urgencyColor = '#ffc107';
            textColor = '#000000';
          } else {
            urgencyColor = '#28a745';
            textColor = '#ffffff';
          }
          urgencyCell.setBackgroundColor(urgencyColor);
          urgencyCell.setForegroundColor(textColor);
          
          // Report Date
          let dateStr = 'N/D';
          if (issue.reportDate) {
            try {
              const date = new Date(issue.reportDate);
              dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yy");
            } catch (e) {
              dateStr = issue.reportDate.toString();
            }
          }
          const dateCell = row.appendTableCell(dateStr);
          dateCell.setFontSize(7);
          dateCell.setPaddingTop(3);
          dateCell.setPaddingBottom(3);
          dateCell.setPaddingLeft(2);
          dateCell.setPaddingRight(2);
          dateCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
          
          // Reported By
          const reporterCell = row.appendTableCell(issue.reportedBy || 'N/D');
          reporterCell.setFontSize(7);
          reporterCell.setItalic(true);
          reporterCell.setPaddingTop(3);
          reporterCell.setPaddingBottom(3);
          reporterCell.setPaddingLeft(2);
          reporterCell.setPaddingRight(2);
          reporterCell.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
        });
        
        body.appendParagraph(''); // Space after table
        
        // Professional summary section
        const summaryBox = body.appendParagraph('');
        summaryBox.setSpacingBefore(15);
        summaryBox.setSpacingAfter(10);
        
        // Summary title
        const summaryTitle = body.appendParagraph('📊 SINTESI INTERVENTI');
        summaryTitle.setHeading(DocumentApp.ParagraphHeading.HEADING4);
        summaryTitle.setBold(true);
        summaryTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        summaryTitle.setForegroundColor('#2c3e50');
        summaryTitle.setSpacingAfter(8);
        
        // Summary stats in a more professional format
        const totalIssues = vehicle.issues.length;
        const summaryText = body.appendParagraph(`Totale interventi richiesti: ${totalIssues}`);
        summaryText.setBold(true);
        summaryText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        summaryText.setFontSize(10);
        summaryText.setForegroundColor('#2c3e50');
        summaryText.setSpacingAfter(5);
        
        // Priority breakdown
        const priorityStats = [];
        if (critical.length > 0) priorityStats.push(`🔴 ${critical.length} Critici`);
        if (high.length > 0) priorityStats.push(`🟠 ${high.length} Alti`);
        if (medium.length > 0) priorityStats.push(`🟡 ${medium.length} Medi`);
        if (low.length > 0) priorityStats.push(`🟢 ${low.length} Bassi`);
        
        if (priorityStats.length > 0) {
          const priorityText = body.appendParagraph(`Priorità: ${priorityStats.join(' • ')}`);
          priorityText.setFontSize(9);
          priorityText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
          priorityText.setForegroundColor('#666666');
          priorityText.setSpacingAfter(15);
        }
        
      } else {
        const noIssues = body.appendParagraph('✅ Nessun lavoro aperto per questo veicolo.');
        noIssues.setItalic(true);
        noIssues.setForegroundColor('#00C851');
        noIssues.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        noIssues.setFontSize(12);
        noIssues.setSpacingBefore(40);
        noIssues.setSpacingAfter(40);
      }
    });
    
    // Professional footer
    body.appendParagraph('').appendPageBreak();
    
    const footerTable = body.appendTable();
    footerTable.setBorderWidth(0);
    
    const footerRow = footerTable.appendTableRow();
    const footerCell = footerRow.appendTableCell('Documento generato automaticamente dal Sistema di Gestione Manutenzione\nBarbone & Zellweger Sagl - Noleggio Semplice\nwww.noleggiosemplice.com');
    footerCell.setFontSize(7);
    footerCell.setForegroundColor('#666666');
    footerCell.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footerCell.setPaddingTop(20);
    footerCell.setPaddingBottom(10);
    
    // Save and get URL
    doc.saveAndClose();
    const docUrl = doc.getUrl();
    const docId = doc.getId();
    
    // Convert to PDF
    const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
    pdfBlob.setName(docName + '.pdf');
    
    // Save PDF to Drive
    const config = getConfig();
    const parentFolderId = config.PARENT_FOLDER_ID || PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID');
    
    let pdfFile;
    if (parentFolderId) {
      const parentFolder = DriveApp.getFolderById(parentFolderId);
      pdfFile = parentFolder.createFile(pdfBlob);
    } else {
      pdfFile = DriveApp.createFile(pdfBlob);
    }
    
    const pdfUrl = pdfFile.getUrl();
    
    // Delete the temporary Google Doc
    DriveApp.getFileById(docId).setTrashed(true);
    
    return {
      success: true,
      message: 'PDF Bozza Lavori generato con successo',
      pdfUrl: pdfUrl,
      pdfId: pdfFile.getId()
    };
    
  } catch (error) {
    Logger.log('❌ Error generating draft PDF:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Helper function to get urgency label
function getUrgencyLabel(urgency) {
  if (urgency.includes('Critica') || urgency === 'critical') return 'CRITICA';
  if (urgency.includes('Alta') || urgency === 'high') return 'ALTA';
  if (urgency.includes('Media') || urgency === 'medium') return 'MEDIA';
  if (urgency.includes('Bassa') || urgency === 'low') return 'BASSA';
  return urgency.toUpperCase();
}

function generateDraftPdfJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => {
    let draftData;
    try {
      draftData = JSON.parse(p.data);
    } catch (e) {
      throw new Error('Invalid draft data: ' + e.toString());
    }
    return generateDraftPdf(draftData);
  });
}