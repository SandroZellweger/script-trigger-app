/*************************************************************
 * MAINTENANCE SYSTEM FUNCTIONS
 * 
 * INSTRUCTIONS: Copy all functions below and paste them at the END of complete-secure-script.gs
 * (after the last function, before the closing brace if any)
 *************************************************************/

// Get vehicle list with km data from vehicle config sheet
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

// Analyze maintenance issue with AI
function analyzeMaintenanceIssue(description, category, kmToService) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }
    
    // Calculate days to service (assuming 100km/day)
    const daysToService = Math.floor(kmToService / 100);
    
    const prompt = `Sei un meccanico esperto. Analizza questo problema di manutenzione:

Categoria: ${category}
Descrizione: ${description}
Km fino al prossimo tagliando: ${kmToService} km (circa ${daysToService} giorni)

Rispondi in formato JSON con:
1. urgency: "low", "medium", "high", o "critical"
2. canWaitUntilService: true/false (può aspettare fino al prossimo tagliando?)
3. recommendation: breve consiglio in italiano (max 100 caratteri)

Esempio risposta:
{"urgency": "medium", "canWaitUntilService": true, "recommendation": "Controlla al prossimo tagliando"}`;

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
    
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      return {
        success: false,
        error: result.error.message
      };
    }
    
    let aiResponse = result.choices[0].message.content;
    
    // Remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const analysis = JSON.parse(aiResponse);
    
    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
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

// Upload maintenance photo to Drive using Drive API
function uploadMaintenancePhoto(fileName, fileData, mimeType) {
  try {
    // Use specific maintenance photos folder
    const maintenanceFolderId = '1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p';
    
    // Decode base64 data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType,
      fileName
    );
    
    // Use Drive API v3 to upload file
    const file = {
      title: fileName,
      mimeType: mimeType,
      parents: [{id: maintenanceFolderId}]
    };
    
    const fileResource = Drive.Files.insert(file, blob, {
      supportsAllDrives: true
    });
    
    // Get shareable link
    const fileUrl = 'https://drive.google.com/file/d/' + fileResource.id + '/view';
    
    return {
      success: true,
      fileId: fileResource.id,
      fileUrl: fileUrl,
      fileName: fileResource.title,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback to DriveApp if Drive API fails
    try {
      const maintenanceFolder = DriveApp.getFolderById('1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p');
      const blob = Utilities.newBlob(
        Utilities.base64Decode(fileData),
        mimeType,
        fileName
      );
      const file = maintenanceFolder.createFile(blob);
      
      return {
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: file.getName(),
        timestamp: new Date().toISOString()
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Drive API error: ' + error.toString() + ' | Fallback error: ' + fallbackError.toString()
      };
    }
  }
}

function uploadMaintenancePhotoJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = uploadMaintenancePhoto(
    params.fileName,
    params.fileData,
    params.mimeType
  );
  
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  
  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Save maintenance report to Google Sheets
function saveMaintenanceReport(reportData) {
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
    let sheet = ss.getSheetByName('Difetti e Riparazioni');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Difetti e Riparazioni');
      // Add headers
      const headerRow = sheet.getRange(1, 1, 1, 19);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi'
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
      const headerRow = sheet.getRange(1, 1, 1, 19);
      headerRow.setValues([[
        'ID Report', 'Data Segnalazione', 'Nome Veicolo', 'ID Veicolo', 'Segnalato Da',
        'Categoria', 'Descrizione Problema', 'Urgenza', 'Stato', 'Completato',
        'Data Completamento', 'Tipo Riparazione', 'Costo (CHF)', 'Garage/Officina', 'N. Fattura',
        'Link Foto', 'ID Foto Drive', 'N. Problema', 'Totale Problemi'
      ]]);
      headerRow.setBackground('#667eea');
      headerRow.setFontColor('#ffffff');
      headerRow.setFontWeight('bold');
      headerRow.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
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
        totalIssues
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
          urgencyCell.setFontWeight('bold');
          break;
      }
      
      // Format status column
      const statusCell = sheet.getRange(lastRow, 9);
      statusCell.setBackground('#e3f2fd');
      
      // Add checkbox to completed column
      const completedCell = sheet.getRange(lastRow, 10);
      completedCell.insertCheckboxes();
      
      // Format photo URLs as hyperlinks if present
      if (photoURLs) {
        const photoCell = sheet.getRange(lastRow, 16);
        const urls = reportData.photos;
        if (urls.length > 0) {
          // Create multiple HYPERLINK formulas separated by text
          const formulas = urls.map((url, i) => `HYPERLINK("${url}"; "Foto ${i+1}")`);
          photoCell.setFormula('=' + formulas.join(' & " | " & '));
          photoCell.setWrap(true);
        }
      }
    });
    
    return {
      success: true,
      reportId: reportId,
      issuesAdded: issues.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function saveMaintenanceReportJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const reportData = JSON.parse(params.data);
  const response = saveMaintenanceReport(reportData);
  
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  
  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Get active maintenance reports (not completed)
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
        
        reportsMap[reportId].issues.push({
          issueNumber: row[17],
          category: row[5],
          description: row[6],
          urgency: row[7],
          status: row[8],
          completed: row[9],
          photoURLs: row[15] ? row[15].split(', ') : [],
          photoIds: row[16] ? row[16].split(', ') : []
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

// Get maintenance history (completed reports)
function getMaintenanceHistory() {
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
    
    // Group rows by reportId
    const reportsMap = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reportId = row[0];
      const allCompleted = row[9]; // This checks if all issues in report are completed
      
      if (!reportsMap[reportId]) {
        reportsMap[reportId] = {
          reportId: reportId,
          reportDate: row[1],
          vehicleName: row[2],
          vehicleId: row[3],
          reportedBy: row[4],
          issues: [],
          totalIssues: row[18],
          allCompleted: true
        };
      }
      
      if (!row[9]) {
        reportsMap[reportId].allCompleted = false;
      }
      
      reportsMap[reportId].issues.push({
        issueNumber: row[17],
        category: row[5],
        description: row[6],
        urgency: row[7],
        status: row[8],
        completed: row[9],
        completionDate: row[10],
        repairType: row[11],
        cost: row[12],
        garage: row[13],
        invoiceNumber: row[14],
        photoURLs: row[15] ? row[15].split(', ') : [],
        photoIds: row[16] ? row[16].split(', ') : []
      });
    }
    
    // Filter only completed reports
    const completedReports = Object.values(reportsMap).filter(r => r.allCompleted);
    
    return {
      success: true,
      reports: completedReports,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function getMaintenanceHistoryJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = getMaintenanceHistory();
  
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  
  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Update issue status (mark as completed/not completed)
function updateIssueStatus(reportId, issueIndex, completed) {
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
        success: false,
        error: 'Sheet not found'
      };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Find the row for this reportId and issueIndex
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === reportId && row[17] === issueIndex) {
        // Update completed checkbox (column J = 10)
        const completedCell = sheet.getRange(i + 1, 10);
        completedCell.setValue(completed);
        
        // Update completion date and status if completed
        if (completed) {
          sheet.getRange(i + 1, 11).setValue(new Date());
          const statusCell = sheet.getRange(i + 1, 9);
          statusCell.setValue('✅ Completato');
          statusCell.setBackground('#c8e6c9');
        } else {
          sheet.getRange(i + 1, 11).setValue('');
          const statusCell = sheet.getRange(i + 1, 9);
          statusCell.setValue('Aperto');
          statusCell.setBackground('#e3f2fd');
        }
        
        return {
          success: true,
          updated: true,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return {
      success: false,
      error: 'Issue not found'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateIssueStatusJsonp(params) {
  const callback = sanitizeJsonpCallback(params.callback || 'callback');
  const response = updateIssueStatus(
    params.reportId,
    parseInt(params.issueIndex),
    params.completed === 'true'
  );
  
  const jsonpResponse = '/**/' + callback + '(' + JSON.stringify(response) + ');';
  
  return ContentService
    .createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
