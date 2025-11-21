// Test script to verify the PDF invoice analysis fix
function testPdfAnalysis() {
  const fileId = "1zT5ifrrvystcCX514GCWn3p-qWDi3g0O";
  const listId = "WORK_20251110_1762797552426";

  Logger.log("🧪 Testing PDF invoice analysis fix...");
  Logger.log("File ID: " + fileId);
  Logger.log("List ID: " + listId);

  try {
    const result = analyzeInvoiceFromDrive(fileId, listId);

    Logger.log("📊 Test result:");
    Logger.log("Success: " + result.success);

    if (result.success) {
      Logger.log("✅ Analysis successful!");
      Logger.log("File type: " + result.fileType);
      Logger.log("Analysis data: " + JSON.stringify(result.analysis, null, 2));
    } else {
      Logger.log("❌ Analysis failed: " + result.error);

      // Check if it's still the old error
      if (result.error && result.error.includes("Invalid AI response format")) {
        Logger.log("⚠️ Still getting 'Invalid AI response format' error - fix may not be working");
      } else {
        Logger.log("ℹ️ Different error - may be unrelated to JSON parsing");
      }
    }

    return result;

  } catch (error) {
    Logger.log("💥 Test failed with exception: " + error);
    return { success: false, error: error.toString() };
  }
}