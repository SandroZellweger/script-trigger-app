/*************************************************************
 * 8_AI_Logic.gs
 * AI Assistant and OpenAI Integration
 *************************************************************/

// Utility function to get OpenAI API key securely
function getOpenAIApiKey() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
    
    if (!apiKey) {
      Logger.log('OpenAI API key not configured in Script Properties');
      return null;
    }
    
    return apiKey;
  } catch (error) {
    Logger.log('Error retrieving OpenAI API key: ' + error.toString());
    return null;
  }
}

// JSONP wrapper for OpenAI API key
function getOpenAIApiKeyJsonp(params) {
  return handleJsonpRequest({ parameter: params }, function() {
    const apiKey = getOpenAIApiKey();
    if (!apiKey) return { success: false, error: 'OpenAI API key not configured' };
    return { success: true, apiKey: apiKey };
  });
}

// JSONP wrapper for AI Assistant
function handleMaintenanceAiRequestJsonp(params) {
  return handleJsonpRequest({ parameter: params }, handleMaintenanceAiRequest);
}

/**
 * Handles requests for the AI assistant, using OpenAI's function calling.
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
            vehicle: { type: "string", description: "Nome del veicolo (es. N1, N2)" },
            description: { type: "string", description: "Descrizione del problema/lavoro" },
            cost: { type: "number", description: "Costo in franchi" }
          },
          required: ["vehicle", "description", "cost"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createPaymentLink",
        description: "Crea un link di pagamento Stripe per un importo specifico.",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Importo in franchi (es. 50.00)" },
            description: { type: "string", description: "Descrizione del pagamento" },
            account: { type: "string", description: "Conto Stripe: 'green' o 'black'", enum: ["green", "black"] },
            bookingRef: { type: "string", description: "Riferimento prenotazione" }
          },
          required: ["amount", "description"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "generateIglohomeCode",
        description: "Genera un codice di accesso Igloohome per un veicolo specifico.",
        parameters: {
          type: "object",
          properties: {
            vehicleType: { type: "string", description: "Tipo di veicolo (es. N01, N02)" }
          },
          required: ["vehicleType"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "sendMessage",
        description: "Invia un messaggio WhatsApp per spiegare come prenotare.",
        parameters: {
          type: "object",
          properties: {
            phoneNumber: { type: "string", description: "Numero di telefono (formato internazionale)" }
          },
          required: ["phoneNumber"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getVehicleList",
        description: "Ottieni la lista dei veicoli disponibili.",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createWorkspaceTask",
        description: "Crea un nuovo task nella board del team.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titolo del task" },
            description: { type: "string", description: "Descrizione dettagliata (opzionale)" },
            priority: { type: "string", enum: ["low", "medium", "high"], description: "Priorità" },
            assignee: { type: "string", enum: ["Sandro", "Alessandro"], description: "A chi assegnare il task" }
          },
          required: ["title"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createWorkspaceNote",
        description: "Crea una nota o un appunto nel workspace.",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string", description: "Contenuto della nota" },
            shared: { type: "boolean", description: "Se condividere con il team (true) o privata (false)" }
          },
          required: ["content"]
        }
      }
    }
  ];

  // Define the available functions
  const availableFunctions = {
    "createMaintenanceReport": createMaintenanceReport,
    "createPaymentLink": createPaymentLinkForAI,
    "generateIglohomeCode": generateIglohomeCodeForAI,
    "sendMessage": sendMessageForAI,
    "getVehicleList": getVehicleListForAI,
    "createWorkspaceTask": createWorkspaceTaskForAI,
    "createWorkspaceNote": createWorkspaceNoteForAI
  };

  const messages = [
    {
      role: "system",
      content: "Sei un assistente AI per la gestione di una flotta di veicoli e per il coordinamento del team (Sandro e Alessandro). Puoi creare report di manutenzione, generare link di pagamento, creare codici Igloohome, inviare messaggi WhatsApp, e gestire il Workspace (creare task e note). Rispondi sempre in italiano."
    },
    {
      role: "user",
      content: userQuery
    }
  ];

  try {
    let responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let functionResponse;
        
        // Handle different function signatures
        if (functionName === 'createWorkspaceTask') {
          functionResponse = functionToCall(functionArgs.title, functionArgs.description, functionArgs.priority, functionArgs.assignee, params.user);
        } else if (functionName === 'createWorkspaceNote') {
          functionResponse = functionToCall(functionArgs.content, functionArgs.shared, params.user);
        } else {
          // Legacy signature handling
          functionResponse = functionToCall(
            functionArgs.vehicle || functionArgs.amount || functionArgs.vehicleType || functionArgs.phoneNumber,
            functionArgs.description || functionArgs.vehicleType || functionArgs.phoneNumber,
            functionArgs.cost || functionArgs.account,
            functionArgs.bookingRef
          );
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      }

      responseMessage = callOpenAI(openAiUrl, apiKey, messages, tools);
    }

    return { success: true, response: responseMessage };

  } catch (error) {
    Logger.log('Error in handleMaintenanceAiRequest: ' + error.toString());
    return { success: false, error: 'Error processing AI request: ' + error.toString() };
  }
}

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

// AI Function Wrappers
function createWorkspaceTaskForAI(title, description, priority, assignee, user) {
  try {
    const task = {
      title: title,
      description: description || '',
      priority: priority || 'medium',
      assignee: assignee || user || 'Sandro',
      status: 'todo'
    };
    // Call saveTask from 10_Workspace_Logic.gs
    const result = saveTask(task, user || 'AI');
    return { success: true, message: `Task creato: ${title}`, id: result.data.id };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function createWorkspaceNoteForAI(content, shared, user) {
  try {
    const note = {
      content: content,
      shared: shared !== false,
      color: '#ffffff'
    };
    // Call saveNote from 10_Workspace_Logic.gs
    const result = saveNote(note, user || 'AI');
    return { success: true, message: `Nota creata`, id: result.data.id };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function createPaymentLinkForAI(amount, description, account, bookingRef) {
  try {
    // Call the real function from 3_Stripe_Logic.gs
    const result = createStripePaymentLink(amount, description, account || 'green', 'checkout', bookingRef);
    if (result.success) {
      return { success: true, link: result.url, message: `Link creato: ${result.url}` };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function generateIglohomeCodeForAI(vehicleType) {
  // Call real function from 7_Iglohome_Logic.gs (mock for now)
  return generateIglohomeCodeApp({ vehicleId: vehicleType });
}

function sendMessageForAI(phoneNumber) {
  // Call real function from 6_Messaging_Logic.gs
  return sendHowToBookMessageApp(phoneNumber);
}

function getVehicleListForAI() {
  // Call real function from 5_Maintenance_Logic.gs
  return getVehicleList();
}

function createMaintenanceReport(vehicle, description, cost) {
  // Placeholder
  return { success: true, message: `Report creato per ${vehicle}: ${description} (${cost} CHF)` };
}

// Test endpoint
function testAiEndpointJsonp(params) {
  return handleJsonpRequest({ parameter: params }, function() {
    const apiKey = getOpenAIApiKey();
    return { success: true, message: "AI endpoint reachable", hasApiKey: !!apiKey };
  });
}
