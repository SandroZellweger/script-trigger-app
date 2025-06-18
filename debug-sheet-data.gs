// Debug version - logs all cell data to help understand what's in the spreadsheet
function debugVehicleData() {
  try {
    // Replace with your actual sheet ID
    const SHEET_ID = 'your-sheet-id-here';
    const AUTH_TOKEN = 'your-auth-token-here';
    
    if (!SHEET_ID || !AUTH_TOKEN) {
      Logger.log('Please set SHEET_ID and AUTH_TOKEN in the debugVehicleData function');
      return;
    }
    
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const visioneSheet = sheet.getSheetByName('Visione generale');
    
    if (!visioneSheet) {
      Logger.log('Visione generale sheet not found');
      return;
    }
    
    // Get all data from the sheet
    const data = visioneSheet.getDataRange().getValues();
    
    Logger.log(`Found ${data.length} rows in Visione generale sheet`);
    
    // Log header row
    if (data.length > 0) {
      Logger.log('HEADER ROW:');
      data[0].forEach((header, index) => {
        Logger.log(`  Column ${String.fromCharCode(65 + index)} (${index}): ${header}`);
      });
    }
    
    // Log first few data rows in detail
    for (let i = 1; i < Math.min(data.length, 4); i++) {
      const row = data[i];
      
      if (!row[0]) {
        Logger.log(`Row ${i + 1}: EMPTY - skipping`);
        continue;
      }
      
      Logger.log(`\n=== ROW ${i + 1} - Vehicle N${row[0]} ===`);
      
      // Log all columns C through R (indices 2-17)
      for (let colIndex = 2; colIndex <= Math.min(17, row.length - 1); colIndex++) {
        const cellValue = row[colIndex];
        const columnLetter = String.fromCharCode(65 + colIndex);
        
        if (cellValue && cellValue !== '') {
          const valueType = typeof cellValue;
          const isDate = cellValue instanceof Date;
          const stringValue = cellValue.toString();
          
          Logger.log(`  ${columnLetter}${i + 1}: [${valueType}${isDate ? ' - Date' : ''}] "${stringValue}"`);
          
          // If it's a date, also log the formatted version
          if (isDate) {
            Logger.log(`    Formatted: ${cellValue.toLocaleDateString('en-GB')}`);
          }
          
          // Check if this looks like a note
          if (valueType === 'string' && stringValue.length > 8) {
            const hasKeywords = stringValue.toLowerCase().includes('schegg') ||
                               stringValue.toLowerCase().includes('vetro') ||
                               stringValue.toLowerCase().includes('piccol') ||
                               stringValue.toLowerCase().includes('dannegg') ||
                               stringValue.toLowerCase().includes('ripar');
            
            if (hasKeywords) {
              Logger.log(`    *** POTENTIAL NOTE: Contains maintenance keywords ***`);
            }
          }
        } else {
          Logger.log(`  ${columnLetter}${i + 1}: EMPTY`);
        }
      }
    }
    
    Logger.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    Logger.log('Debug error:', error.toString());
  }
}
