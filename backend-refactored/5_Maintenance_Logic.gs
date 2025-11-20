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

// Get Vehicle List (simple version for dropdowns)
function getVehicleList() {
  const vehicleData = getVehicleData();
  if (vehicleData.error) return vehicleData;
  
  return {
    success: true,
    vehicles: vehicleData.vehicles.map(v => ({
      id: v.vehicleType,
      name: v.calendarName || v.vehicleType,
      plate: v.licencePlate || ''
    }))
  };
}

// JSONP Wrapper for getVehicleList
function getVehicleListJsonp(params) {
  return handleJsonpRequest({ parameter: params }, () => getVehicleList());
}

// JSONP wrapper for AI Assistant
function handleMaintenanceAiRequestJsonp(params) {
  return handleJsonpRequest({ parameter: params }, handleMaintenanceAiRequest);
}

/*************************************************************
 * AI Assistant Logic
 *************************************************************/

/**
 * Placeholder for creating a maintenance report.
 * In a real scenario, this would interact with a spreadsheet or database.
 */
function createMaintenanceReport(vehicle, description, cost) {
  Logger.log(`MAINTENANCE REPORT CREATED:
    Vehicle: ${vehicle}
    Description: ${description}
    Cost: ${cost}
  `);
  return {
    success: true,
    message: `Maintenance report created for ${vehicle} with description "${description}" and cost ${cost}.`
  };
}


/**
 * Handles requests for the AI assistant, using OpenAI's function calling.
 * This function now supports a multi-step conversation to execute tool calls.
 */
function handleMaintenanceAiRequest(params) {
  const userQuery = params.query;
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return { success: false, error: "OpenAI API key not configured." };
  }

  const openAiUrl = 'https://api.openai.com/v1/chat/completions';

  // 1. Define the available tools
  const tools = [
    {
      type: "function",
      function: {
        name: "createMaintenanceReport",
        description: "Crea un rapporto di manutenzione per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicle: {
              type: "string",
              description: "L'identificativo o nome del veicolo, es. 'N1', 'N2'."
            },
            description: {
              type: "string",
              description: "Una descrizione dettagliata del lavoro di manutenzione eseguito."
            },
            cost: {
              type: "number",
              description: "Il costo totale della manutenzione."
            }
          },
          required: ["vehicle", "description", "cost"]
        }
      }
    }
  ];
  
  // Define the available functions in this script that the AI can call
  const availableFunctions = {
    "createMaintenanceReport": createMaintenanceReport,
  };

  // 2. Initial conversation messages
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant for managing vehicle maintenance. You can create maintenance reports. Ask for clarification if the user's request is ambiguous or missing information. Always reply to the user in Italian."
    },
    {
      role: "user",
      content: userQuery
    }
  ];

  try {
    // 3. First call to OpenAI to see what it wants to do
    let responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);

    // 4. Check if the AI wants to call a tool
    if (responseMessage.tool_calls) {
      // Add the AI's response to the message history
      messages.push(responseMessage);

      // 5. Execute each tool call requested by the AI
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        // Call the local function with the arguments provided by the AI
        const functionResponse = functionToCall(
          functionArgs.vehicle,
          functionArgs.description,
          functionArgs.cost
        );

        // 6. Add the result of the tool execution to the message history
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      }

      // 7. Make a second call to OpenAI with the tool results to get a final, user-friendly response
      responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);
    }

    // 8. Return the final response to the frontend
    return { success: true, response: responseMessage };

  } catch (error) {
    Logger.log('Error in handleMaintenanceAiRequest: ' + error.toString());
    return { success: false, error: 'Error processing AI request: ' + error.toString() };
  }
}

/**
 * Helper function to call the OpenAI API.
 */
function callOpenAI(url, apiKey, messages, tools) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    })
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseData = JSON.parse(response.getContentText());
  return responseData.choices[0].message;
}