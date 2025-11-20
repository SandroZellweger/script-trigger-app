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