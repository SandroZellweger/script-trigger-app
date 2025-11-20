/**
 * Sends the Zoko WhatsApp template "how_to_book_new".
 *
 * ⚠️  Fill in the values for {{1}}, {{2}}, … exactly as they appear
 *     in your Zoko template definition.  Delete any unused placeholders.
 *
 * @param {string} phoneNumber Recipient’s phone number in +41… format
 * @param {...string} templateArgs Values to populate the template placeholders, in order
 * @return {boolean}            True on success, false on failure
 */
function sendHowToBookMessageApp(phoneNumber, ...templateArgs) {
  console.log('🚀 sendHowToBookMessageApp called with:', phoneNumber, templateArgs);
  
  const url    = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";   // TODO: store safely

  const payload = {
    channel:          "whatsapp",
    recipient:        phoneNumber,            // e.g. "+41781234567"
    type:             "template",
    templateId:       "how_to_book_new",      // *** your template name ***
    templateLanguage: "it",                   // or "en", "de", … as defined in Zoko
    templateArgs:     templateArgs            // → values for {{1}}, {{2}}, …
  };

  console.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method:  "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "apikey":       apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    console.log('📡 Making request to Zoko API...');
    const response     = UrlFetchApp.fetch(url, options);
    const code         = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('📡 Zoko response code:', code);
    console.log('📡 Zoko response text:', responseText);
    
    const data         = JSON.parse(responseText);

    if (code === 200) {
      console.log("✅ Zoko success:", JSON.stringify(data));
      return true;
    } else {
      console.log("❌ Zoko HTTP error " + code + ":", JSON.stringify(data));
      return false;
    }
  } catch (e) {
    console.error("❌ Zoko exception:", e.toString());
    return false;
  }
}

/**
 * Sends the Zoko WhatsApp template "dati_multigiorno".
 *
 * ⚠️  Fill in the values for {{1}}, {{2}}, … exactly as they appear
 *     in your Zoko template definition.  Delete any unused placeholders.
 *
 * @param {string} phoneNumber Recipient's phone number in +41… format
 * @param {...string} templateArgs Values to populate the template placeholders, in order
 * @return {boolean}            True on success, false on failure
 */
function sendDatiMultigiornoApp(phoneNumber, ...templateArgs) {
  console.log('🚀 sendDatiMultigiornoApp called with:', phoneNumber, templateArgs);
  
  const url    = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";   // TODO: store safely

  const payload = {
    channel:          "whatsapp",
    recipient:        phoneNumber,            // e.g. "+41781234567"
    type:             "template",
    templateId:       "dati_multigiorno",     // *** your template name ***
    templateLanguage: "it",                   // or "en", "de", … as defined in Zoko
    templateArgs:     templateArgs            // → values for {{1}}, {{2}}, …
  };

  console.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method:  "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "apikey":       apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    console.log('📡 Making request to Zoko API...');
    const response     = UrlFetchApp.fetch(url, options);
    const code         = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('📡 Zoko response code:', code);
    console.log('📡 Zoko response text:', responseText);
    
    const data         = JSON.parse(responseText);

    if (code === 200) {
      console.log("✅ Zoko success:", JSON.stringify(data));
      return true;
    } else {
      console.log("❌ Zoko HTTP error " + code + ":", JSON.stringify(data));
      return false;
    }
  } catch (e) {
    console.error("❌ Zoko exception:", e.toString());
    return false;
  }
}

/**
 * Test sendDatiMultigiornoApp() – no template arguments.
 * Edit `phoneNumber` then press ► Run in Apps Script.
 */
function testSendDatiMultigiornoApp() {
  const phoneNumber = "+41787228385";   // ← put the number you want to test

  const ok = sendDatiMultigiornoApp(phoneNumber);   // no args → []

  Logger.log("Test result: " + (ok ? "✅ success" : "❌ failure"));
}

/**
 * Test sendHowToBookMessage() – no template arguments.
 * Edit `phoneNumber` then press ► Run in Apps Script.
 */
function testSendHowToBookMessageApp() {
  const phoneNumber = "+41787228385";   // ← put the number you want to test

  const ok = sendHowToBookMessageApp(phoneNumber);   // no args → []

  Logger.log("Test result: " + (ok ? "✅ success" : "❌ failure"));
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
  console.log('🔐 sendIglohomePin called with:', phoneNumber, pin);
  
  const url    = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";

  const payload = {
    channel:          "whatsapp",
    recipient:        phoneNumber,
    type:             "template",
    templateId:       "igloohome_pin",
    templateLanguage: "it",
    templateArgs:     [pin]  // Solo il PIN: {{1}}
  };

  console.log('📤 Zoko payload:', JSON.stringify(payload));

  const options = {
    method:  "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "apikey":       apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    console.log('📡 Making request to Zoko API...');
    const response     = UrlFetchApp.fetch(url, options);
    const code         = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('📡 Zoko response code:', code);
    console.log('📡 Zoko response text:', responseText);
    
    const data         = JSON.parse(responseText);

    if (code === 200) {
      console.log("✅ Zoko success:", JSON.stringify(data));
      return true;
    } else {
      console.log("❌ Zoko HTTP error " + code + ":", JSON.stringify(data));
      return false;
    }
  } catch (e) {
    console.error("❌ Zoko exception:", e.toString());
    return false;
  }
}

/**
 * Test sendIglohomePin().
 * Edit `phoneNumber` and `pin` then press ► Run in Apps Script.
 */
function testSendIglohomePin() {
  const phoneNumber = "+41787228385";
  const pin = "12345678";

  const ok = sendIglohomePin(phoneNumber, pin);

  Logger.log("Test result: " + (ok ? "✅ success" : "❌ failure"));
}


