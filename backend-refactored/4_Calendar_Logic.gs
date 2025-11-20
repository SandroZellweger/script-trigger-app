/*************************************************************
 * 4_Calendar_Logic.gs
 * Calendar Management and Booking Lookups
 *************************************************************/

// Get booking details by reference number
function getBookingDetailsByReference(referenceNr) {
  try {
    // Get vehicle data from Google Sheet to find calendars
    const vehicleDataResult = getVehicleData();
    if (vehicleDataResult.error || !vehicleDataResult.vehicles) {
      return { success: false, error: 'Failed to load vehicle data: ' + (vehicleDataResult.error || 'Unknown error') };
    }
    
    const calendarIds = vehicleDataResult.vehicles
      .filter(v => v.calendarId) // Only include vehicles with calendar IDs
      .map(v => ({
        id: v.calendarId,
        vehicle: v.vehicleType, // Just the vehicle code (e.g., "N01")
        displayName: v.calendarName || v.vehicleType // Full name for display
      }));

    // Search in all calendars
    for (let cal of calendarIds) {
      try {
        const calendar = CalendarApp.getCalendarById(cal.id);
        if (!calendar) continue;

        // Get events from last 90 days to next 365 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365);
        
        const events = calendar.getEvents(startDate, endDate);
        
        for (let event of events) {
          const description = event.getDescription() || '';
          
          // Search for "Riferimento: XXXX" in description (no emoji)
          const referenceMatch = description.match(/Riferimento:\s*([^\n]+)/i);
          
          if (referenceMatch) {
            const foundRef = referenceMatch[1].trim();
            
            if (foundRef === referenceNr.trim() || foundRef === referenceNr.toString().trim()) {
              Logger.log(`✅ Match found in ${cal.vehicle}: Ref ${foundRef}`);
              return {
                success: true,
                event: event,
                vehicleId: cal.displayName,
                calendarId: cal.id
              };
            }
          }
        }
      } catch (e) {
        continue;
      }
    }

    return {
      success: false,
      error: 'Booking not found with reference: ' + referenceNr
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// JSONP wrapper for findBookingByReference
function findBookingByReferenceJsonp(params) {
  try {
    const callback = params.callback;
    // Accept both 'reference' and 'referenceNumber' for compatibility
    const reference = params.reference || params.referenceNumber;
    
    if (!reference) {
      return createJsonpResponse(callback, { success: false, error: 'No reference provided' });
    }

    const result = getBookingDetailsByReference(reference);
    
    // Convert event object to simple JSON if found (CalendarEvent object is not JSON serializable directly)
    if (result.success && result.event) {
      const event = result.event;
      const description = event.getDescription() || '';
      const title = event.getTitle();
      
      // Extract customer info from description
      const emailMatch = description.match(/Email:\s*([^\n]+)/i);
      const phoneMatch = description.match(/Numero di cellulare:\s*([^\n]+)/i);
      const vehicleMatch = description.match(/Veicolo:\s*([^\n]+)/i);
      const referenceMatch = description.match(/Riferimento:\s*([^\n]+)/i);
      
      // Extract customer name from title (format: "$ 1 - Alessandro Barbone - CHF 0.00")
      const titleMatch = title.match(/[-–]\s*(?:🖤|🟢)?\s*([^-–]+?)\s*[-–]\s*CHF/i);
      const customerName = titleMatch ? titleMatch[1].trim() : 'N/A';
      
      const simpleResult = {
        success: true,
        vehicleId: result.vehicleId,
        calendarId: result.calendarId,
        booking: {
          reference: referenceMatch ? referenceMatch[1].trim() : reference,
          customerName: customerName,
          customerEmail: emailMatch ? emailMatch[1].trim() : 'N/A',
          customerPhone: phoneMatch ? phoneMatch[1].trim() : 'N/A',
          vehicleName: vehicleMatch ? vehicleMatch[1].trim() : result.vehicleId,
          startDate: event.getStartTime(),
          endDate: event.getEndTime(),
          title: title,
          description: description
        }
      };
      return createJsonpResponse(callback, simpleResult);
    }

    return createJsonpResponse(callback, result);
  } catch (error) {
    const callback = params.callback || 'callback';
    return createJsonpResponse(callback, { success: false, error: error.toString() });
  }
}

// Get calendar events for app
function getCalendarEventsApp(startDateStr, endDateStr) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Get vehicle data to know which calendars to check
    const vehicleDataResult = getVehicleData();
    if (vehicleDataResult.error || !vehicleDataResult.vehicles) {
      return { success: false, error: 'Failed to load vehicle data' };
    }
    
    const allEvents = [];
    
    for (const vehicle of vehicleDataResult.vehicles) {
      if (!vehicle.calendarId) continue;
      
      try {
        const calendar = CalendarApp.getCalendarById(vehicle.calendarId);
        if (!calendar) continue;
        
        const events = calendar.getEvents(startDate, endDate);
        
        for (const event of events) {
          allEvents.push({
            id: event.getId(),
            title: event.getTitle(),
            start: event.getStartTime(),
            end: event.getEndTime(),
            description: event.getDescription(),
            vehicleId: vehicle.vehicleType,
            vehicleName: vehicle.calendarName
          });
        }
      } catch (e) {
        Logger.log('Error fetching calendar for ' + vehicle.vehicleType + ': ' + e.toString());
      }
    }
    
    return { success: true, events: allEvents };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// JSONP wrapper for getCalendarEventsApp
function getCalendarEventsAppJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => getCalendarEventsApp(p.startDate, p.endDate));
}