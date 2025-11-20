/*************************************************************
 * 7_Iglohome_Logic.gs
 * Iglohome Smart Lock Integration
 *************************************************************/

function generateIglohomeCodeApp(params) {
  try {
    const vehicleId = params.vehicleId;
    const startDate = params.startDate;
    const endDate = params.endDate;
    
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
    
    return {
      success: true,
      pin: mockPin,
      message: `Generated PIN for ${vehicle.calendarName}`,
      vehicle: vehicleId,
      validFrom: startDate,
      validTo: endDate
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