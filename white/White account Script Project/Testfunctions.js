function testSendZokoTemplate(phoneNumber = "+41787228385") {
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3"; // Your Zoko API key

  // Template details as per your screenshot
  const templateId = "grazie_delle_foto";
  const templateLang = "it";

  // Payload for the button template
  const payload = {
    channel: "whatsapp",
    recipient: phoneNumber,
    type: "buttonTemplate",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: [
      "user_clicked_pickup", // Custom event for "Ritiro" button
      "user_clicked_return"   // Custom event for "Consegna" button
    ]
  };

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
    Logger.log(`Sending Zoko button template "${templateId}" to ${phoneNumber}`);
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());

    if (responseCode === 200) {
      Logger.log(`Success! Template sent to ${phoneNumber}: ${JSON.stringify(responseData)}`);
      return {
        success: true,
        message: "Template sent successfully",
        response: responseData
      };
    } else {
      Logger.log(`Error sending template to ${phoneNumber} - HTTP ${responseCode}: ${JSON.stringify(responseData)}`);
      return {
        success: false,
        message: `Failed to send template - HTTP ${responseCode}`,
        response: responseData
      };
    }
  } catch (error) {
    Logger.log(`Exception sending template to ${phoneNumber}: ${error}`);
    return {
      success: false,
      message: "Exception occurred while sending template",
      error: error.toString()
    };
  }
}


function testWebhook() {
  const webhookData = {
    id: "test-" + new Date().getTime(),
    type: "image",
    fileUrl: "https://platform.cstatic-images.com/xlarge/in/v2/f839c974-4894-58f9-a452-0c5a1e662a1f/1f828e9c-0b74-47e4-a40f-e1786b68a0e9/oNlgp6SxIG21RDaQLXtYYPDp_P0.jpg",
    platformSenderId: "+41787228385"
  };
  doPost({ postData: { contents: JSON.stringify(webhookData) } });
}

function clearProcessedProperties() {
  const properties = PropertiesService.getScriptProperties();
  const keys = properties.getKeys().filter(k => k.startsWith("processed_file_"));
  keys.forEach(key => properties.deleteProperty(key));
  Logger.log(`Cleared ${keys.length} processed_file_ properties`);
}




function testConsegnaFlow() {
  const imageUrls = [
    "https://www.vanviewer.com/wp-content/uploads/2021/08/IMG_2172.jpeg", // Front view
    "https://ik.imagekit.io/hertzch/hertz-vans/media/hertz_vans_h4.png?tr=ar-999-610,w-1200,fo-center", // Rear view
    "https://img.cdn.dragon2000.net/C3163/U8538/IMG_6105-large.jpg", // Left side
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Right side
    "https://images.unsplash.com/photo-1592800807778-127f430d7538?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Interior
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Dashboard
    "https://www.vanviewer.com/wp-content/uploads/2021/08/IMG_2172.jpeg", // Roof
    "https://ik.imagekit.io/hertzch/hertz-vans/media/hertz_vans_c4.png?tr=ar-999-610,w-1200,fo-center" // Undercarriage
  ];

  // Send each image as a webhook
  imageUrls.forEach((url, index) => {
    const webhookData = {
      id: `test-consegna-${new Date().getTime()}-${index}`,
      type: "image",
      fileUrl: url,
      platformSenderId: "+41787228385"
    };
    doPost({ postData: { contents: JSON.stringify(webhookData) } });
    Utilities.sleep(1000); // Add a 1-second delay between sends to simulate user behavior
  });
}

function testUpdateCalendarWithFolderLink() {
  const phoneNumber = "0787228385";
  const folderUrl = "https://drive.google.com/drive/folders/1huTHBcIGU0TZ8B0b3XkWrAw245Dj1Nel";
  
  Logger.log(`Testing calendar update for phone: ${phoneNumber} with folder: ${folderUrl}`);
  
  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const phoneVariants = [
    normalizedPhone,
    normalizedPhone.replace("+", ""),
    normalizedPhone.replace("+", "00")
  ];
  
  const vehicleCalendars = getVehicleCalendarIds();
  if (!vehicleCalendars || vehicleCalendars.length === 0) {
    Logger.log("No vehicle calendars found");
    return;
  }
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - 48); // 48 hours ago
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // 3 months ahead
  
  let eventsUpdated = 0;
  
  for (const vehicleInfo of vehicleCalendars) {
    if (!vehicleInfo.calendarId) continue;
    
    try {
      const calendar = CalendarApp.getCalendarById(vehicleInfo.calendarId);
      if (!calendar) {
        Logger.log(`Could not access calendar: ${vehicleInfo.calendarId}`);
        continue;
      }
      
      const events = calendar.getEvents(startDate, endDate);
      Logger.log(`Checking ${events.length} events in ${vehicleInfo.calendarName}`);
      
      for (const event of events) {
        const description = event.getDescription() || "";
        const title = event.getTitle() || "";
        
        if (phoneVariants.some(variant => description.includes(variant))) {
          Logger.log(`Found matching event: "${title}"`);
          const newDescription = description + `\nImmagini: ${folderUrl}`;
          event.setDescription(newDescription);
          eventsUpdated++;
          Logger.log(`Updated event "${title}" with folder link`);
        }
      }
    } catch (error) {
      Logger.log(`Error accessing calendar ${vehicleInfo.calendarName}: ${error}`);
    }
  }
  
  Logger.log(`Test complete: Updated ${eventsUpdated} events for ${phoneNumber}`);
}

// Reused phone number normalization function
function normalizePhoneNumber(phone) {
  if (!phone) return "";
  let normalized = phone.replace(/\D/g, ""); // Remove all non-digits
  if (normalized.startsWith("00")) normalized = "+" + normalized.slice(2); // Convert 0041 to +41
  if (!normalized.startsWith("+") && normalized.length >= 10) normalized = "+" + normalized; // Add + if missing
  return normalized;
}


function testSendZokoNewFileTemplate() {
  const recipient = "+41775076629";
  const templateId = "new_file";
  const templateLang = "it";
  
  const templateArgs = [
    "Sandro Zellweger", // Full name as a single tag
    "1234",             // Reference number
    "30.02.25 / 07:00-19:00", // Date and time
    "https://drive.google.com/drive/folders/1huTHBcIGU0TZ8B0b3XkWrAw245Dj1Nel" // Folder URL
  ];
  
  const url = "https://chat.zoko.io/v2/message";
  const apiKey = "0a12096d-cfee-43e2-8360-b66d7b460cd3";
  
  const payload = {
    channel: "whatsapp",
    recipient: recipient,
    type: "template",
    templateId: templateId,
    templateLanguage: templateLang,
    templateArgs: templateArgs
  };
  
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
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(`Test Zoko template sent to ${recipient}: ${JSON.stringify(payload)}`);
    Logger.log(`Response: ${response.getContentText()}`);
  } catch (error) {
    Logger.log(`Error sending test Zoko template: ${error}`);
  }
}


