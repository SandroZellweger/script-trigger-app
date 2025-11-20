/*************************************************************
 * 6_Messaging_Logic.gs
 * WhatsApp/Zoko Messaging Functions
 *************************************************************/

function sendHowToBookMessageApp(phoneNumber) {
  try {
    // Placeholder for WhatsApp integration
    // In a real implementation, this would call the Zoko API
    return {
      success: true,
      message: `How to book message would be sent to ${phoneNumber}`,
      phoneNumber: phoneNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function sendDatiMultigiornoApp(phoneNumber) {
  try {
    // Placeholder for WhatsApp integration
    return {
      success: true,
      message: `Multi-day data would be sent to ${phoneNumber}`,
      phoneNumber: phoneNumber
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Sends the Iglohome PIN via Zoko WhatsApp template "igloohome_pin".
 *
 * Template structure:
 *   Il tuo codice: {{1}}
 *
 * @param {string} phoneNumber Recipient's phone number in +41… format
 * @param {string} pin The 8-digit PIN code
 * @return {boolean} True on success, false on failure
 */
function sendIglohomePin(phoneNumber, pin) {
  Logger.log('🔐 sendIglohomePin called with:', phoneNumber, pin);
  
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";

  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "template",
    templateId: "igloohome_pin",
    templateLanguage: "it",
    templateArgs: [pin]  // Solo il PIN: {{1}}
  };

  Logger.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "apikey": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Logger.log('📡 Making request to Zoko API...');
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('📡 Zoko response code:', code);
    Logger.log('📡 Zoko response text:', responseText);
    
    if (code === 200 || code === 201) {
      Logger.log("✅ Zoko success");
      return true;
    } else {
      Logger.log("❌ Zoko HTTP error " + code);
      return false;
    }
  } catch (e) {
    Logger.log("❌ Zoko exception:", e.toString());
    return false;
  }
}

// JSONP Wrappers
function sendHowToBookMessageAppJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => sendHowToBookMessageApp(p.phoneNumber));
}

function sendDatiMultigiornoAppJsonp(params) {
  return handleJsonpRequest({ parameter: params }, (p) => sendDatiMultigiornoApp(p.phoneNumber));
}