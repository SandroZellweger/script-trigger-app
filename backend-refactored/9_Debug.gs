/*************************************************************
 * 9_Debug.gs
 * Debugging functions for AI and other components
 *************************************************************/

function debugAnalyzeIssue() {
  const description = "freno davanti da cambiare";
  const category = ""; // Empty to test auto-detection
  const kmToService = 5000;
  
  Logger.log("🚀 Starting Debug Analysis...");
  
  // 1. Check API Key
  let apiKey = null;
  try {
    apiKey = getOpenAIApiKey();
    Logger.log("🔑 API Key present: " + (apiKey ? "YES" : "NO"));
    if (apiKey) {
      Logger.log("🔑 API Key length: " + apiKey.length);
      Logger.log("🔑 API Key start: " + apiKey.substring(0, 3) + "...");
    } else {
      Logger.log("❌ API Key is null or empty");
    }
  } catch (e) {
    Logger.log("❌ Error retrieving API Key: " + e.toString());
  }
  
  // 2. Call function
  try {
    Logger.log("📡 Calling analyzeMaintenanceIssue...");
    const result = analyzeMaintenanceIssue(description, category, kmToService);
    Logger.log("📊 Result: " + JSON.stringify(result, null, 2));
    
    if (result.success) {
      Logger.log("✅ Analysis Successful!");
      Logger.log("🤖 Recommendation: " + result.analysis.recommendation);
      Logger.log("🏷️ Category: " + result.analysis.category);
    } else {
      Logger.log("❌ Analysis Failed: " + result.error);
    }
  } catch (e) {
    Logger.log("❌ Error calling analyzeMaintenanceIssue: " + e.toString());
    Logger.log("❌ Stack: " + e.stack);
  }
}

function debugOpenAIConnection() {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    Logger.log("❌ No API Key");
    return;
  }
  
  const url = 'https://api.openai.com/v1/models';
  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    muteHttpExceptions: true
  };
  
  try {
    Logger.log("📡 Testing OpenAI Connection...");
    const response = UrlFetchApp.fetch(url, options);
    Logger.log("Response Code: " + response.getResponseCode());
    Logger.log("Response Body (first 100 chars): " + response.getContentText().substring(0, 100));
  } catch (e) {
    Logger.log("❌ Connection Error: " + e.toString());
  }
}
