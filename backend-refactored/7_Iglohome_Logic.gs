/*************************************************************
 * 7_Iglohome_Logic.gs
 * Iglohome Smart Lock Integration
 *************************************************************/

function generateIglohomeCodeApp(params) {
  try {
    const vehicleId = params.vehicleId;
    const startDate = params.startDate;
    const endDate = params.endDate;
    const phoneNumber = params.phoneNumber;
    
    // Placeholder logic - In real implementation this calls Iglohome API
    // We need to fetch the vehicle data to get the lock ID
    const vehicleDataResult = getVehicleData();
    if (vehicleDataResult.error) {
      return { success: false, error: "Vehicle data not found" };
    }
    
    const vehicle = vehicleDataResult.vehicles.find(v => v.vehicleType === vehicleId);
    if (!vehicle) {
      return { success: false, error: "Vehicle not found: " + vehicleId };
    }
    
    // Simulate API call success
    const mockPin = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Format dates for WhatsApp message
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    // Send WhatsApp message with PIN using Zoko API
    if (phoneNumber) {
      try {
        const url = "https://chat.zoko.io/v2/message";
        const config = getConfig();
        const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
        
        const payload = {
          channel: "whatsapp",
          recipient: phoneNumber,
          type: "template",
          templateId: "how_to_book_new",
          templateLanguage: "it",
          templateArgs: [
            mockPin, // PIN code
            vehicle.calendarName, // Vehicle name
            formatDate(startDate), // Start date
            formatDate(endDate), // End date
            vehicle.vehicleAdress || "Indirizzo da confermare" // Vehicle address
          ]
        };
        
        const options = {
          method: 'post',
          contentType: 'application/json',
          headers: {
            'apikey': apiKey
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };
        
        const response = UrlFetchApp.fetch(url, options);
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();
        
        Logger.log('Zoko WhatsApp response: ' + responseCode + ' - ' + responseText);
        
        if (responseCode !== 200 && responseCode !== 201) {
          Logger.log('Warning: WhatsApp message may not have been sent. Status: ' + responseCode);
        }
      } catch (whatsappError) {
        // Log the error but don't fail the PIN generation
        Logger.log('Error sending WhatsApp message: ' + whatsappError.toString());
      }
    }
    
    return {
      success: true,
      pin: mockPin,
      message: `Generated PIN for ${vehicle.calendarName}`,
      vehicle: vehicleId,
      validFrom: startDate,
      validTo: endDate,
      whatsappSent: !!phoneNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP Wrapper
function generateIglohomeCodeAppJsonp(params) {
  return handleJsonpRequest({ parameter: params }, generateIglohomeCodeApp);
}