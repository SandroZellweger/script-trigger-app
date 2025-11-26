/*************************************************************
 * 9_Photo_Capture.gs
 * Customer Photo Capture for Vehicle Check-in
 * 
 * Allows customers to capture 4 photos of the vehicle (front, back, left, right)
 * via a personalized link sent through WhatsApp.
 *************************************************************/

const PHOTO_POSITIONS = ['front', 'back', 'left', 'right'];
const PHOTO_TOKEN_VALIDITY_HOURS = 48;

/**
 * Get or create the PhotoTokens sheet
 */
function getPhotoTokensSheet() {
  const config = getConfig();
  const ss = SpreadsheetApp.openById(config.MAINTENANCE_SHEET_ID);
  
  let sheet = ss.getSheetByName('PhotoTokens');
  if (!sheet) {
    sheet = ss.insertSheet('PhotoTokens');
    // Set headers
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Token',           // A - Unique token
      'BookingReference',// B - Booking/Reference ID
      'CustomerPhone',   // C - Customer phone number
      'VehicleName',     // D - Vehicle name
      'VehiclePlate',    // E - Vehicle license plate
      'CreatedAt',       // F - Token creation timestamp
      'ExpiresAt',       // G - Token expiration timestamp
      'Status',          // H - pending, completed, expired
      'PhotoFront',      // I - Front photo URL
      'PhotoBack',       // J - Back photo URL
      'PhotoLeft',       // K - Left photo URL
      'PhotoRight'       // L - Right photo URL
    ]]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * Generate a unique photo capture link for a booking
 * @param {string} bookingReference - The booking reference or ID
 * @param {string} customerPhone - Customer's phone number
 * @param {string} vehicleName - Name of the vehicle
 * @param {string} vehiclePlate - License plate (optional)
 * @returns {Object} - { success, link, token, expiresAt }
 */
function generatePhotoLinkForBooking(bookingReference, customerPhone, vehicleName, vehiclePlate) {
  try {
    const token = Utilities.getUuid();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PHOTO_TOKEN_VALIDITY_HOURS * 60 * 60 * 1000);
    
    // Store token in sheet
    const sheet = getPhotoTokensSheet();
    sheet.appendRow([
      token,
      bookingReference || '',
      customerPhone || '',
      vehicleName || '',
      vehiclePlate || '',
      now.toISOString(),
      expiresAt.toISOString(),
      'pending',
      '', // PhotoFront
      '', // PhotoBack
      '', // PhotoLeft
      ''  // PhotoRight
    ]);
    
    // Build the link - update this URL to your GitHub Pages URL
    const baseUrl = 'https://sandrozellweger.github.io/script-trigger-app/photo-capture.html';
    const link = `${baseUrl}?token=${token}`;
    
    Logger.log('Generated photo link for booking: ' + bookingReference + ' -> ' + link);
    
    return {
      success: true,
      link: link,
      token: token,
      expiresAt: expiresAt.toISOString(),
      vehicleName: vehicleName
    };
    
  } catch (error) {
    Logger.log('Error generating photo link: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Validate a photo capture token
 * @param {string} token - The token to validate
 * @returns {Object} - { valid, bookingReference, vehicleName, uploadedPositions, error }
 */
function validatePhotoToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'Token mancante' };
    }
    
    const sheet = getPhotoTokensSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === token) {
        const row = data[i];
        const expiresAt = new Date(row[6]);
        const status = row[7];
        const now = new Date();
        
        // Check if completed
        if (status === 'completed') {
          return { valid: false, error: 'Le foto sono già state inviate per questo link.' };
        }
        
        // Check if expired
        if (now > expiresAt) {
          // Mark as expired
          sheet.getRange(i + 1, 8).setValue('expired');
          return { valid: false, error: 'Il link è scaduto. Richiedi un nuovo link.' };
        }
        
        // Check which photos are already uploaded
        const uploadedPositions = [];
        if (row[8]) uploadedPositions.push('front');
        if (row[9]) uploadedPositions.push('back');
        if (row[10]) uploadedPositions.push('left');
        if (row[11]) uploadedPositions.push('right');
        
        return {
          valid: true,
          bookingReference: row[1],
          customerPhone: row[2],
          vehicleName: row[3],
          vehiclePlate: row[4],
          uploadedPositions: uploadedPositions,
          rowIndex: i + 1
        };
      }
    }
    
    return { valid: false, error: 'Link non valido.' };
    
  } catch (error) {
    Logger.log('Error validating photo token: ' + error);
    return { valid: false, error: 'Errore di sistema. Riprova.' };
  }
}

/**
 * Upload a customer photo to Google Drive
 * @param {string} token - The photo capture token
 * @param {string} position - Photo position (front, back, left, right)
 * @param {string} base64Data - Base64 encoded image data
 * @returns {Object} - { success, fileUrl, complete }
 */
function uploadCustomerPhoto(token, position, base64Data) {
  try {
    // Validate inputs
    if (!token) {
      return { success: false, error: 'Token mancante' };
    }
    
    if (!PHOTO_POSITIONS.includes(position)) {
      return { success: false, error: 'Posizione foto non valida: ' + position };
    }
    
    if (!base64Data || base64Data.length < 100) {
      return { success: false, error: 'Dati foto mancanti o non validi' };
    }
    
    // Validate token
    const tokenData = validatePhotoToken(token);
    if (!tokenData.valid) {
      return { success: false, error: tokenData.error };
    }
    
    const config = getConfig();
    
    // Get or create customer photos folder
    let parentFolder;
    try {
      // Try to get dedicated customer photos folder
      if (config.CUSTOMER_PHOTOS_FOLDER_ID) {
        parentFolder = DriveApp.getFolderById(config.CUSTOMER_PHOTOS_FOLDER_ID);
      } else {
        // Fall back to maintenance folder
        parentFolder = DriveApp.getFolderById(config.MAINTENANCE_FOLDER_ID || config.driveUploadFolderId);
      }
    } catch (e) {
      // Create in root if folder not found
      Logger.log('Warning: Could not find photos folder, using root');
      parentFolder = DriveApp.getRootFolder();
    }
    
    // Create subfolder for this booking/date
    const dateStr = new Date().toISOString().split('T')[0];
    const folderName = `CheckIn_${tokenData.bookingReference || 'Unknown'}_${dateStr}`;
    
    let bookingFolder;
    const existingFolders = parentFolder.getFoldersByName(folderName);
    if (existingFolders.hasNext()) {
      bookingFolder = existingFolders.next();
    } else {
      bookingFolder = parentFolder.createFolder(folderName);
    }
    
    // Save the photo
    const fileName = `${position}_${Date.now()}.jpg`;
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, 'image/jpeg', fileName);
    const file = bookingFolder.createFile(blob);
    
    // Make file accessible via link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();
    const fileId = file.getId();
    
    // Update token sheet with photo URL
    const sheet = getPhotoTokensSheet();
    const columnIndex = 9 + PHOTO_POSITIONS.indexOf(position); // I=9, J=10, K=11, L=12
    sheet.getRange(tokenData.rowIndex, columnIndex).setValue(fileUrl);
    
    // Check if all photos are complete
    const row = sheet.getRange(tokenData.rowIndex, 1, 1, 12).getValues()[0];
    // After update, re-check
    row[columnIndex - 1] = fileUrl; // Update local copy
    
    const allPhotosComplete = PHOTO_POSITIONS.every((pos, idx) => {
      return row[8 + idx] && row[8 + idx].length > 0;
    });
    
    if (allPhotosComplete) {
      sheet.getRange(tokenData.rowIndex, 8).setValue('completed');
      
      // Optionally notify staff
      try {
        notifyPhotoCompletion(tokenData.bookingReference, tokenData.customerPhone, tokenData.vehicleName, folderName);
      } catch (e) {
        Logger.log('Could not send completion notification: ' + e);
      }
    }
    
    Logger.log(`Photo ${position} uploaded for booking ${tokenData.bookingReference}: ${fileUrl}`);
    
    return {
      success: true,
      fileUrl: fileUrl,
      fileId: fileId,
      position: position,
      complete: allPhotosComplete
    };
    
  } catch (error) {
    Logger.log('Error uploading customer photo: ' + error);
    return { success: false, error: 'Errore durante il caricamento: ' + error.toString() };
  }
}

/**
 * Notify staff when all photos are uploaded
 */
function notifyPhotoCompletion(bookingReference, customerPhone, vehicleName, folderName) {
  // Log completion
  Logger.log(`✅ Photo check-in complete for ${vehicleName} (${bookingReference})`);
  
  // You can add email notification or other alerts here
  // Example: send email to admin
  /*
  MailApp.sendEmail({
    to: 'admin@noleggiosemplice.com',
    subject: `✅ Foto check-in completato - ${vehicleName}`,
    body: `Il cliente ha completato il check-in fotografico.\n\n` +
          `Veicolo: ${vehicleName}\n` +
          `Prenotazione: ${bookingReference}\n` +
          `Telefono: ${customerPhone}\n` +
          `Cartella: ${folderName}`
  });
  */
}

/**
 * Send photo link via WhatsApp using Zoko
 * @param {string} phoneNumber - Customer phone in international format
 * @param {string} link - The photo capture link
 * @param {string} vehicleName - Name of the vehicle
 * @returns {Object} - { success, error }
 */
function sendPhotoLinkViaWhatsApp(phoneNumber, link, vehicleName) {
  try {
    const config = getConfig();
    const url = "https://chat.zoko.io/v2/message";
    const apiKey = config.ZOKO_API_KEY || "0a12096d-cfee-43e2-8360-b66d7b460cd3";
    
    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('41') && !formattedPhone.startsWith('+')) {
      formattedPhone = '41' + formattedPhone;
    }
    
    // Send free-form message (or use template if configured)
    const payload = {
      channel: "whatsapp",
      recipient: formattedPhone,
      type: "text",
      message: `📸 *Foto Check-in Veicolo*\n\n` +
               `Gentile Cliente,\n\n` +
               `Prima di ritirare il veicolo *${vehicleName}*, ti chiediamo di scattare 4 foto.\n\n` +
               `👉 Clicca qui per iniziare:\n${link}\n\n` +
               `⏰ Il link è valido per 48 ore.\n\n` +
               `Grazie!\n` +
               `Barbone & Zellweger Sagl`
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
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200 || responseCode === 201) {
      Logger.log('WhatsApp photo link sent to: ' + formattedPhone);
      return { success: true };
    } else {
      Logger.log('WhatsApp send failed: ' + response.getContentText());
      return { success: false, error: 'Errore invio WhatsApp: ' + responseCode };
    }
    
  } catch (error) {
    Logger.log('Error sending WhatsApp: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Generate link AND send via WhatsApp in one step
 */
function generateAndSendPhotoLink(bookingReference, customerPhone, vehicleName, vehiclePlate) {
  // Generate link
  const linkResult = generatePhotoLinkForBooking(bookingReference, customerPhone, vehicleName, vehiclePlate);
  
  if (!linkResult.success) {
    return linkResult;
  }
  
  // Send via WhatsApp
  const sendResult = sendPhotoLinkViaWhatsApp(customerPhone, linkResult.link, vehicleName);
  
  return {
    success: sendResult.success,
    link: linkResult.link,
    token: linkResult.token,
    expiresAt: linkResult.expiresAt,
    whatsappSent: sendResult.success,
    error: sendResult.error
  };
}

/**
 * Get all photo capture sessions (for admin)
 */
function getPhotoCaptureSessions(status) {
  try {
    const sheet = getPhotoTokensSheet();
    const data = sheet.getDataRange().getValues();
    
    const sessions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const sessionStatus = row[7];
      
      // Filter by status if provided
      if (status && sessionStatus !== status) continue;
      
      sessions.push({
        token: row[0],
        bookingReference: row[1],
        customerPhone: row[2],
        vehicleName: row[3],
        vehiclePlate: row[4],
        createdAt: row[5],
        expiresAt: row[6],
        status: sessionStatus,
        photos: {
          front: row[8] || null,
          back: row[9] || null,
          left: row[10] || null,
          right: row[11] || null
        }
      });
    }
    
    // Sort by creation date descending
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return { success: true, sessions: sessions };
    
  } catch (error) {
    Logger.log('Error getting photo sessions: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ========== JSONP WRAPPERS ==========

function generatePhotoLinkJsonp(params) {
  const result = generatePhotoLinkForBooking(
    params.bookingReference,
    params.customerPhone,
    params.vehicleName,
    params.vehiclePlate
  );
  return createJsonpResponse(params.callback, result);
}

function validatePhotoTokenJsonp(params) {
  const result = validatePhotoToken(params.token);
  return createJsonpResponse(params.callback, result);
}

function uploadCustomerPhotoJsonp(params) {
  const result = uploadCustomerPhoto(
    params.token,
    params.position,
    params.photoData
  );
  return createJsonpResponse(params.callback, result);
}

function sendPhotoLinkWhatsAppJsonp(params) {
  const result = sendPhotoLinkViaWhatsApp(
    params.phoneNumber,
    params.link,
    params.vehicleName
  );
  return createJsonpResponse(params.callback, result);
}

function generateAndSendPhotoLinkJsonp(params) {
  const result = generateAndSendPhotoLink(
    params.bookingReference,
    params.customerPhone,
    params.vehicleName,
    params.vehiclePlate
  );
  return createJsonpResponse(params.callback, result);
}

function getPhotoCaptureSessionsJsonp(params) {
  const result = getPhotoCaptureSessions(params.status);
  return createJsonpResponse(params.callback, result);
}
