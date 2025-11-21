/**
 * SETUP SCRIPT - Esegui questo script UNA VOLTA per configurare la cartella PDF
 * 
 * ISTRUZIONI:
 * 1. Apri Google Apps Script Editor
 * 2. Crea un nuovo file chiamato "setup-pdf-folder.gs"
 * 3. Copia e incolla questo codice
 * 4. Clicca su "Esegui" (play button) e scegli la funzione "setupPdfFolder"
 * 5. Autorizza lo script quando richiesto
 * 6. Verifica il log per confermare il successo
 * 7. ELIMINA questo file dopo l'esecuzione (per sicurezza)
 */

function setupPdfFolder() {
  const MAINTENANCE_PDF_FOLDER_ID = '15mMdeeZboqWyo-Mzx5ERi-Px2JNrg6eB';
  
  try {
    // Test if folder is accessible
    const folder = DriveApp.getFolderById(MAINTENANCE_PDF_FOLDER_ID);
    Logger.log('✅ Cartella trovata: ' + folder.getName());
    
    // Save to Script Properties
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('MAINTENANCE_PDF_FOLDER_ID', MAINTENANCE_PDF_FOLDER_ID);
    
    Logger.log('✅ MAINTENANCE_PDF_FOLDER_ID salvato con successo!');
    Logger.log('📁 Folder ID: ' + MAINTENANCE_PDF_FOLDER_ID);
    Logger.log('📁 Folder Name: ' + folder.getName());
    Logger.log('');
    Logger.log('✨ Setup completato! Ora puoi:');
    Logger.log('   1. Eliminare questo file setup-pdf-folder.gs');
    Logger.log('   2. Testare il caricamento PDF dalla tua app');
    
    // Verify it was saved
    const savedValue = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID');
    if (savedValue === MAINTENANCE_PDF_FOLDER_ID) {
      Logger.log('');
      Logger.log('✅ VERIFICA OK: Property salvata correttamente');
      return { success: true, folderId: MAINTENANCE_PDF_FOLDER_ID };
    } else {
      Logger.log('');
      Logger.log('⚠️ ATTENZIONE: Property non salvata correttamente');
      return { success: false, error: 'Property verification failed' };
    }
    
  } catch (error) {
    Logger.log('❌ ERRORE durante il setup: ' + error.toString());
    Logger.log('');
    Logger.log('Possibili cause:');
    Logger.log('1. ID cartella non corretto');
    Logger.log('2. Non hai accesso alla cartella');
    Logger.log('3. Cartella eliminata o spostata');
    return { success: false, error: error.toString() };
  }
}

/**
 * Funzione opzionale per verificare la configurazione
 */
function verifyPdfFolderSetup() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const folderId = scriptProperties.getProperty('MAINTENANCE_PDF_FOLDER_ID');
  
  if (!folderId) {
    Logger.log('❌ MAINTENANCE_PDF_FOLDER_ID non configurato');
    Logger.log('Esegui prima setupPdfFolder()');
    return;
  }
  
  try {
    const folder = DriveApp.getFolderById(folderId);
    Logger.log('✅ Configurazione OK!');
    Logger.log('📁 Folder ID: ' + folderId);
    Logger.log('📁 Folder Name: ' + folder.getName());
    Logger.log('📁 Folder URL: ' + folder.getUrl());
  } catch (error) {
    Logger.log('❌ Errore: Cartella non accessibile');
    Logger.log('Error: ' + error.toString());
  }
}
