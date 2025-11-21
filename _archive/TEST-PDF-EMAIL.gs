/*************************************************************
 * TEST FUNCTION - PDF GENERATION AND EMAIL
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire file
 * 2. Paste it at the END of your complete-secure-script.gs
 * 3. Run "testPdfGenerationWithEmail" from Apps Script
 * 4. Check your email: noleggiosemplice23@gmail.com
 * 5. Check the execution log for details
 *************************************************************/

/**
 * Test PDF generation with photo and send via email
 * Uses the same photo ID from previous test
 */
function testPdfGenerationWithEmail() {
  Logger.log('📧 TEST: PDF Generation + Email...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  try {
    // Step 1: Get the photo
    const photoId = '1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G';
    Logger.log('📸 Step 1: Retrieving photo...');
    Logger.log('   Photo ID: ' + photoId);
    
    const photoResult = getMaintenancePhotoBase64(photoId);
    
    if (!photoResult.success) {
      Logger.log('❌ Failed to retrieve photo: ' + photoResult.error);
      return;
    }
    
    Logger.log('✅ Photo retrieved successfully');
    Logger.log('   File: ' + photoResult.fileName);
    Logger.log('   Size: ' + Math.round(photoResult.dataUrl.length / 1024) + ' KB');
    
    // Step 2: Create simple HTML with embedded image
    Logger.log('');
    Logger.log('📄 Step 2: Creating PDF content...');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .header {
            background-color: #667eea;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            padding: 20px;
          }
          .photo {
            margin: 20px 0;
            text-align: center;
          }
          .photo img {
            max-width: 400px;
            border: 2px solid #667eea;
            border-radius: 8px;
          }
          .info {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #667eea;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 LISTA MANUTENZIONE - TEST</h1>
          <p>Report di Test Generato Automaticamente</p>
        </div>
        
        <div class="content">
          <h2>📋 Informazioni Report</h2>
          <div class="info">
            <p><strong>Report ID:</strong> TEST-${new Date().getTime()}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Ora:</strong> ${new Date().toLocaleTimeString('it-IT')}</p>
            <p><strong>Veicolo:</strong> N01 - Veicolo Test</p>
          </div>
          
          <h2>🔧 Danni Segnalati</h2>
          <div class="info">
            <h3>1. 🟡 Danno di Test</h3>
            <p><strong>Categoria:</strong> Carrozzeria</p>
            <p><strong>Descrizione:</strong> Questo è un danno di test per verificare la generazione del PDF con foto incluse.</p>
            <p><strong>Urgenza:</strong> 🟡 Media</p>
          </div>
          
          <h2>📸 Foto Allegate</h2>
          <div class="photo">
            <img src="${photoResult.dataUrl}" alt="Foto danno">
            <p><em>Foto 1 - ${photoResult.fileName}</em></p>
          </div>
          
          <h2>📝 Note</h2>
          <div class="info">
            <p>Questo è un report di test generato automaticamente per verificare:</p>
            <ul>
              <li>✅ Recupero foto da Google Drive</li>
              <li>✅ Conversione foto in base64</li>
              <li>✅ Embedding foto nel PDF</li>
              <li>✅ Invio email con allegato PDF</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>📧 Report inviato automaticamente da Google Apps Script</p>
          <p>🕒 Timestamp: ${new Date().toISOString()}</p>
        </div>
      </body>
      </html>
    `;
    
    Logger.log('✅ HTML content created');
    Logger.log('   Content length: ' + htmlContent.length + ' characters');
    
    // Step 3: Convert HTML to PDF
    Logger.log('');
    Logger.log('📄 Step 3: Converting to PDF...');
    
    const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', 'report.html')
      .getAs('application/pdf')
      .setName('Lista_Manutenzione_Test_' + new Date().getTime() + '.pdf');
    
    Logger.log('✅ PDF created successfully');
    Logger.log('   Size: ' + Math.round(pdfBlob.getBytes().length / 1024) + ' KB');
    
    // Step 4: Send email
    Logger.log('');
    Logger.log('📧 Step 4: Sending email...');
    
    const recipient = 'noleggiosemplice23@gmail.com';
    const subject = '🔧 Lista Manutenzione - Test PDF con Foto';
    const body = `
Ciao!

Questo è un test automatico della generazione PDF con foto incluse.

📋 DETTAGLI TEST:
• Report ID: TEST-${new Date().getTime()}
• Data generazione: ${new Date().toLocaleString('it-IT')}
• Foto inclusa: ${photoResult.fileName}
• Dimensione foto: ${Math.round(photoResult.dataUrl.length / 1024)} KB
• Dimensione PDF: ${Math.round(pdfBlob.getBytes().length / 1024)} KB

✅ SE RICEVI QUESTO EMAIL:
1. Il backend funziona correttamente
2. La foto è stata recuperata da Drive
3. La conversione base64 è riuscita
4. Il PDF è stato generato con la foto
5. L'email è stata inviata con successo

🔍 COSA CONTROLLARE NEL PDF:
• Apri il PDF allegato
• Verifica che la foto sia visibile
• Controlla che la qualità sia accettabile
• Se vedi la foto, il sistema funziona! 🎉

🚀 PROSSIMO PASSO:
Se questo test è riuscito, puoi usare il sistema dalla pagina web!

---
Generato automaticamente da Google Apps Script
${new Date().toISOString()}
    `.trim();
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body,
      attachments: [pdfBlob]
    });
    
    Logger.log('✅ Email sent successfully!');
    Logger.log('   To: ' + recipient);
    Logger.log('   Subject: ' + subject);
    Logger.log('   Attachment: ' + pdfBlob.getName());
    
    // Step 5: Summary
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════');
    Logger.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    Logger.log('');
    Logger.log('📊 SUMMARY:');
    Logger.log('   ✅ Photo retrieved from Drive');
    Logger.log('   ✅ Base64 conversion successful');
    Logger.log('   ✅ PDF generated with embedded photo');
    Logger.log('   ✅ Email sent to ' + recipient);
    Logger.log('');
    Logger.log('📧 CHECK YOUR EMAIL:');
    Logger.log('   Open the PDF attachment');
    Logger.log('   Verify the photo is visible');
    Logger.log('   If you see the photo, everything works! 🚀');
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log('');
    Logger.log('Stack trace:');
    Logger.log(error.stack);
  }
}

/**
 * Test with mock maintenance data (more realistic)
 */
function testRealisticPdfEmail() {
  Logger.log('📧 TEST: Realistic PDF with Maintenance Data...');
  Logger.log('═══════════════════════════════════════════════════════');
  
  try {
    // Mock data
    const vehicleName = 'N01 - Fiat Ducato';
    const reportDate = new Date();
    const photoId = '1fGHLyrElA3Xh-2TtSctdg-WEKa1WK36G';
    
    // Get photo
    Logger.log('📸 Retrieving photo...');
    const photoResult = getMaintenancePhotoBase64(photoId);
    
    if (!photoResult.success) {
      Logger.log('❌ Photo retrieval failed: ' + photoResult.error);
      return;
    }
    
    Logger.log('✅ Photo retrieved: ' + photoResult.fileName);
    
    // Create realistic HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica', Arial, sans-serif; font-size: 10pt; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 24pt; margin-bottom: 10px; }
          .header p { font-size: 12pt; opacity: 0.9; }
          .content { padding: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { background: #667eea; color: white; padding: 10px; 
                          font-size: 14pt; margin-bottom: 10px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #667eea; 
                     padding: 15px; margin: 10px 0; }
          .damage-item { background: white; border: 2px solid #e0e0e0; 
                        border-radius: 8px; padding: 15px; margin: 10px 0; }
          .damage-header { font-size: 12pt; font-weight: bold; color: #333; 
                          margin-bottom: 10px; }
          .urgency-medium { background: #fff9c4; color: #f57f17; padding: 5px 10px; 
                           border-radius: 4px; display: inline-block; }
          .photo-container { text-align: center; margin: 15px 0; }
          .photo-container img { max-width: 400px; border: 3px solid #667eea; 
                                border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .photo-caption { color: #666; font-style: italic; margin-top: 8px; }
          .footer { margin-top: 30px; padding: 20px; background: #f0f0f0; 
                   text-align: center; border-top: 3px solid #667eea; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          table td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
          table td:first-child { font-weight: bold; width: 30%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 LISTA MANUTENZIONE</h1>
          <p>Report Completo per il Meccanico</p>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">📋 INFORMAZIONI VEICOLO</div>
            <table>
              <tr><td>Veicolo</td><td>${vehicleName}</td></tr>
              <tr><td>Data Report</td><td>${reportDate.toLocaleDateString('it-IT')}</td></tr>
              <tr><td>KM fino tagliando</td><td>1,200 km</td></tr>
              <tr><td>Stato</td><td>🟢 In servizio</td></tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">🔧 DANNI E RIPARAZIONI</div>
            
            <div class="damage-item">
              <div class="damage-header">
                1. 🚗 Danno alla Carrozzeria
              </div>
              <table>
                <tr><td>Categoria</td><td>Carrozzeria</td></tr>
                <tr><td>Urgenza</td><td><span class="urgency-medium">🟡 MEDIA</span></td></tr>
                <tr><td>Descrizione</td><td>Graffio profondo sulla portiera lato guida. 
                    Necessita di stuccatura e riverniciatura. Visibile nella foto allegata.</td></tr>
              </table>
              
              <div class="photo-container">
                <img src="${photoResult.dataUrl}" alt="Foto danno">
                <div class="photo-caption">Foto 1: ${photoResult.fileName}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">✅ LAVORI DI TAGLIANDO</div>
            <div class="info-box">
              <ul style="margin-left: 20px;">
                <li>Cambio olio motore</li>
                <li>Sostituzione filtro olio</li>
                <li>Controllo freni</li>
                <li>Verifica pneumatici</li>
              </ul>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">🔧 LAVORI EXTRA</div>
            <div class="info-box">
              <ul style="margin-left: 20px;">
                <li>Riparazione graffio carrozzeria (vedi foto)</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>📧 Report generato automaticamente</strong></p>
          <p>Sistema di Gestione Manutenzione</p>
          <p style="margin-top: 10px; font-size: 9pt; color: #666;">
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      </body>
      </html>
    `;
    
    // Create PDF
    Logger.log('📄 Creating PDF...');
    const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', 'report.html')
      .getAs('application/pdf')
      .setName('Lista_Manutenzione_' + vehicleName.replace(/\s/g, '_') + '_' + 
               reportDate.toISOString().split('T')[0] + '.pdf');
    
    Logger.log('✅ PDF created: ' + Math.round(pdfBlob.getBytes().length / 1024) + ' KB');
    
    // Send email
    Logger.log('📧 Sending email...');
    MailApp.sendEmail({
      to: 'noleggiosemplice23@gmail.com',
      subject: '🔧 Lista Manutenzione - ' + vehicleName + ' - ' + reportDate.toLocaleDateString('it-IT'),
      body: `
Ciao!

In allegato trovi la lista di manutenzione completa per ${vehicleName}.

📋 CONTENUTO:
• Informazioni veicolo
• Danni segnalati con foto
• Lavori di tagliando da eseguire
• Lavori extra richiesti

📸 FOTO INCLUSE:
• ${photoResult.fileName} (${Math.round(photoResult.dataUrl.length / 1024)} KB)

🔧 ISTRUZIONI:
1. Apri il PDF allegato
2. Controlla che la foto sia visibile
3. Verifica la qualità dell'immagine
4. Se tutto OK, il sistema è pronto per l'uso! 🎉

Cordiali saluti,
Sistema Automatico di Gestione Manutenzione
      `.trim(),
      attachments: [pdfBlob]
    });
    
    Logger.log('✅ Email sent successfully!');
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════');
    Logger.log('🎉 REALISTIC TEST COMPLETED!');
    Logger.log('Check your email: noleggiosemplice23@gmail.com');
    Logger.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log(error.stack);
  }
}
