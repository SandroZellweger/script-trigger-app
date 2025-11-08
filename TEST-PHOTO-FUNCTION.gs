/*************************************************************
 * TEST FUNCTION FOR PHOTO RETRIEVAL
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire file
 * 2. Paste it at the END of your complete-secure-script.gs
 * 3. In Apps Script, click "Run" and select "testPhotoRetrieval"
 * 4. Check the "Execution log" at the bottom for results
 * 5. If successful, you'll see the base64 data URL
 *************************************************************/

/**
 * Test function to verify photo retrieval works
 * Replace the fileId with your actual photo ID: 1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G
 */
function testPhotoRetrieval() {
  Logger.log('🧪 TEST: Starting photo retrieval test...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  // Test with your actual photo ID
  const testFileId = '1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G';
  
  Logger.log('📸 Testing with fileId: ' + testFileId);
  Logger.log('');
  
  // Test the base function first
  Logger.log('▶️ Step 1: Testing getMaintenancePhotoBase64()...');
  try {
    const result = getMaintenancePhotoBase64(testFileId);
    
    if (result.success) {
      Logger.log('✅ SUCCESS! Photo retrieved successfully');
      Logger.log('📊 Photo details:');
      Logger.log('   - File ID: ' + result.fileId);
      Logger.log('   - File Name: ' + result.fileName);
      Logger.log('   - MIME Type: ' + result.mimeType);
      Logger.log('   - Data URL length: ' + result.dataUrl.length + ' characters');
      Logger.log('   - Data URL preview: ' + result.dataUrl.substring(0, 100) + '...');
      Logger.log('   - Timestamp: ' + result.timestamp);
    } else {
      Logger.log('❌ FAILED! Error: ' + result.error);
      Logger.log('');
      Logger.log('💡 Common issues:');
      Logger.log('   1. File ID is incorrect');
      Logger.log('   2. File does not exist in Drive');
      Logger.log('   3. File is not in the maintenance photos folder');
      Logger.log('   4. No permission to access the file');
    }
  } catch (error) {
    Logger.log('❌ EXCEPTION: ' + error.toString());
    Logger.log('');
    Logger.log('💡 This usually means:');
    Logger.log('   1. The function getMaintenancePhotoBase64() does not exist');
    Logger.log('   2. There is a syntax error in the function');
    Logger.log('   3. DriveApp does not have permission');
  }
  
  Logger.log('');
  Logger.log('▶️ Step 2: Testing getMaintenancePhotoBase64Jsonp()...');
  try {
    const params = {
      callback: 'testCallback',
      fileId: testFileId
    };
    
    const jsonpResult = getMaintenancePhotoBase64Jsonp(params);
    const content = jsonpResult.getContent();
    
    Logger.log('✅ JSONP wrapper executed successfully');
    Logger.log('📊 JSONP Response:');
    Logger.log('   - MIME Type: ' + jsonpResult.getMimeType());
    Logger.log('   - Response length: ' + content.length + ' characters');
    Logger.log('   - Response preview: ' + content.substring(0, 150) + '...');
    
    // Try to extract the actual data from JSONP
    const jsonMatch = content.match(/testCallback\((.*)\);/);
    if (jsonMatch && jsonMatch[1]) {
      const actualData = JSON.parse(jsonMatch[1]);
      if (actualData.success) {
        Logger.log('   - ✅ Contains valid success response');
        Logger.log('   - Data URL length: ' + actualData.dataUrl.length);
      } else {
        Logger.log('   - ❌ Contains error: ' + actualData.error);
      }
    }
  } catch (error) {
    Logger.log('❌ JSONP EXCEPTION: ' + error.toString());
    Logger.log('');
    Logger.log('💡 This usually means:');
    Logger.log('   1. The function getMaintenancePhotoBase64Jsonp() does not exist');
    Logger.log('   2. The sanitizeJsonpCallback() function is missing');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🏁 TEST COMPLETE');
  Logger.log('');
  Logger.log('📋 NEXT STEPS:');
  Logger.log('   1. If both tests passed (✅), deploy a new version');
  Logger.log('   2. If tests failed (❌), check the error messages above');
  Logger.log('   3. Make sure the maintenance functions are at the END of the file');
  Logger.log('   4. Verify the fileId is correct: ' + testFileId);
}

/**
 * Test with multiple photo IDs
 */
function testMultiplePhotos() {
  Logger.log('🧪 TEST: Testing multiple photos...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  const photoIds = [
    '1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G',
    // Add more photo IDs here if you want to test multiple
  ];
  
  photoIds.forEach(function(fileId, index) {
    Logger.log('');
    Logger.log('📸 Test ' + (index + 1) + '/' + photoIds.length + ': ' + fileId);
    
    try {
      const result = getMaintenancePhotoBase64(fileId);
      
      if (result.success) {
        Logger.log('   ✅ SUCCESS - ' + result.fileName);
        Logger.log('   Size: ' + Math.round(result.dataUrl.length / 1024) + ' KB');
      } else {
        Logger.log('   ❌ FAILED - ' + result.error);
      }
    } catch (error) {
      Logger.log('   ❌ EXCEPTION - ' + error.toString());
    }
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🏁 MULTIPLE PHOTOS TEST COMPLETE');
}

/**
 * Test folder validation security
 */
function testFolderSecurity() {
  Logger.log('🧪 TEST: Testing folder security validation...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  // Test with a file that's NOT in the maintenance folder
  const unauthorizedFileId = 'REPLACE_WITH_FILE_ID_FROM_DIFFERENT_FOLDER';
  
  Logger.log('🔒 Testing unauthorized file access...');
  Logger.log('File ID: ' + unauthorizedFileId);
  
  if (unauthorizedFileId === 'REPLACE_WITH_FILE_ID_FROM_DIFFERENT_FOLDER') {
    Logger.log('⚠️ Test skipped - replace with actual file ID from different folder');
  } else {
    try {
      const result = getMaintenancePhotoBase64(unauthorizedFileId);
      
      if (result.success) {
        Logger.log('❌ SECURITY ISSUE: Unauthorized file was retrieved!');
      } else if (result.error === 'File not in maintenance photos folder') {
        Logger.log('✅ SECURITY OK: Unauthorized file was blocked');
      } else {
        Logger.log('⚠️ Different error: ' + result.error);
      }
    } catch (error) {
      Logger.log('❌ EXCEPTION: ' + error.toString());
    }
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🏁 SECURITY TEST COMPLETE');
}

/**
 * Quick diagnostic - checks if all required functions exist
 */
function diagnosticCheck() {
  Logger.log('🔍 DIAGNOSTIC: Checking function availability...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  const functionsToCheck = [
    'getMaintenancePhotoBase64',
    'getMaintenancePhotoBase64Jsonp',
    'sanitizeJsonpCallback',
    'getVehicleListWithKm',
    'getActiveMaintenanceReports'
  ];
  
  functionsToCheck.forEach(function(funcName) {
    try {
      const func = this[funcName];
      if (typeof func === 'function') {
        Logger.log('✅ ' + funcName + ' - EXISTS');
      } else {
        Logger.log('❌ ' + funcName + ' - NOT A FUNCTION');
      }
    } catch (error) {
      Logger.log('❌ ' + funcName + ' - NOT FOUND');
    }
  });
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════');
  Logger.log('🏁 DIAGNOSTIC COMPLETE');
}
