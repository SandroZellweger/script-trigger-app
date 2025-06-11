/**
 * ULTRA-MINIMAL TEST SCRIPT
 * This is the absolute simplest version to test if the deployment works
 */

function doGet(e) {
  // Don't do any complex logic, just return a simple response
  try {
    const response = {
      status: "success",
      message: "Script is working",
      timestamp: new Date().toISOString(),
      parameters: e.parameter || {}
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Even if there's an error, return a proper JSON response
    const errorResponse = {
      status: "error", 
      message: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Simple test function you can run manually in the editor
function testInEditor() {
  // Test what doGet would return
  const mockEvent = {
    parameter: {
      function: "ping",
      authToken: "myAppToken2025"
    }
  };
  
  const result = doGet(mockEvent);
  console.log("Test result:", result.getContent());
  return result.getContent();
}
