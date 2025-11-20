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
    
    Logger.log('🔐 generateIglohomeCodeApp called with:', { vehicleId, startDate, endDate, phoneNumber });
    
    if (!phoneNumber) {
      return { success: false, error: "Phone number is required" };
    }
    
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
    
    // Simulate API call success - Generate 8-digit PIN
    const mockPin = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    Logger.log('📱 Generated PIN:', mockPin, 'for vehicle:', vehicle.calendarName);
    
    // Send WhatsApp message with PIN using sendIglohomePin from 6_Messaging_Logic.gs
    if (phoneNumber) {
      try {
        Logger.log('📤 Sending WhatsApp message to:', phoneNumber);
        
        const whatsappSuccess = sendIglohomePin(phoneNumber, mockPin);
        
        if (whatsappSuccess) {
          Logger.log('✅ WhatsApp message sent successfully');
          return {
            success: true,
            pin: mockPin,
            message: `PIN generated and sent via WhatsApp to ${phoneNumber}`,
            vehicle: vehicleId,
            validFrom: startDate,
            validTo: endDate,
            whatsappSent: true
          };
        } else {
          Logger.log('⚠️ WhatsApp send failed');
          return {
            success: true,
            pin: mockPin,
            message: `PIN generated but WhatsApp send failed`,
            vehicle: vehicleId,
            validFrom: startDate,
            validTo: endDate,
            whatsappSent: false
          };
        }
      } catch (whatsappError) {
        Logger.log('❌ WhatsApp send error:', whatsappError.toString());
        return {
          success: true,
          pin: mockPin,
          message: `PIN generated but WhatsApp send failed: ${whatsappError.toString()}`,
          vehicle: vehicleId,
          validFrom: startDate,
          validTo: endDate,
          whatsappSent: false
        };
      }
    }
    
    return {
      success: true,
      pin: mockPin,
      message: `Generated PIN for ${vehicle.calendarName}`,
      vehicle: vehicleId,
      validFrom: startDate,
      validTo: endDate,
      whatsappSent: false
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