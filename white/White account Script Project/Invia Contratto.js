/**
 * This onEdit trigger runs automatically whenever a cell is edited in
 * the specified spreadsheet and sheet:
 *
 *  - Checks for the “Stato di Pagamento” column (24),
 *  - If new value is "Paid",
 *  - It calls `sendContractForRow(editedRow)`.
 */
function onEdit(e) {
  try {
    const reservationSheetId = '1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o';
    const sheetName = 'Sheet1';
    const STATO_PAGAMENTO_COL = 23;

    const activeSpreadsheet = e.source;
    const activeSheet = e.range.getSheet();
    const editedCol = e.range.getColumn();
    const editedRow = e.range.getRow();
    const newValue = e.value;

    if (activeSpreadsheet.getId() !== reservationSheetId) return;
    if (activeSheet.getName() !== sheetName) return;
    if (editedCol === STATO_PAGAMENTO_COL && newValue.toLowerCase() === 'paid') {
      sendContractForRow(editedRow);
    }

  } catch (err) {
    Logger.log('onEdit Error: ' + err);
  }
}

function sendContractForRow(targetRow) {
  const sheetId = '1CfyZmrH0moAu8peDZfjtKu9eeGiWcXMTJ_c3eHgXm4o';
  const templateId = '17RLxTQXf0difsLAbfPWxYHAR6aVFNnOjuIUpHtDuoi8';
  const sheetName = 'Sheet1';
  const emailColumn = 5;
  const statusColumn = 22;
  const pdfFolderId = '10yGwO2Wxx8Sv6apPVUuO3wLPYKlD47Vo';

  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getRange(targetRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const email = data[emailColumn - 1];
    const currentStat = data[statusColumn - 1];
    if (currentStat === 'Sent') {
      Logger.log('Row already marked as Sent. Skipping.');
      return;
    }

    const name = data[headers.indexOf('Nome e Cognome')] || 'Cliente';
    const dateRitiro = formatDate(new Date(data[headers.indexOf('Data Ritiro')]));
    const dateConsegna = formatDate(new Date(data[headers.indexOf('Data Consegna')]));
    const refNumber = data[headers.indexOf('Ref Number')] || '0000';
    const title = `${name} | ${dateRitiro} - ${dateConsegna} | Rif.: ${refNumber} Documento Firmato`;

    const docCopy = DriveApp.getFileById(templateId).makeCopy(title);
    const doc = DocumentApp.openById(docCopy.getId());
    const body = doc.getBody();

    headers.forEach((header, colIndex) => {
      const placeholder = `{{${header}}}`;
      const safePlaceholder = placeholder.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
      const cellValue = data[colIndex] || '';
      const dateVal = new Date(cellValue);

      if (header.toLowerCase().includes('data ritiro')) {
        const timeVal = new Date(data[colIndex + 1]);
        const combined = combineDateAndTime(dateVal, timeVal);
        body.replaceText(safePlaceholder, combined);
      } else if (header.toLowerCase().includes('ora ritiro')) {
        body.replaceText(safePlaceholder, '');
      } else if (header.toLowerCase().includes('data consegna')) {
        const timeVal = new Date(data[colIndex + 1]);
        const combined = combineDateAndTime(dateVal, timeVal);
        body.replaceText(safePlaceholder, combined);
      } else if (header.toLowerCase().includes('ora consegna')) {
        body.replaceText(safePlaceholder, '');
      } else {
        body.replaceText(safePlaceholder, cellValue || '-');
      }
    });

    doc.saveAndClose();
    Logger.log('Document placeholders replaced successfully.');

    const pdfBlob = DriveApp.getFileById(docCopy.getId()).getAs('application/pdf');
    pdfBlob.setName(`${title}.pdf`);

    const subject = `Il Suo Contratto - Rif. ${refNumber}`;
const htmlBody = `
  <p>Gentile Cliente,</p>
  <p>In allegato trova il Suo contratto.</p>
  <br>
  <p>Cordiali saluti,<br>
  <strong>Noleggio Semplice</strong><br>
  +41 91 250 87 87</p>
  <p>
    <a href="https://wa.me/41912508787" target="_blank">
      👉 Clicca qui per scriverci direttamente su WhatsApp
    </a>
  </p>
`;

MailApp.sendEmail({
  to: email,
  subject: subject,
  htmlBody: htmlBody,
  attachments: [pdfBlob],
});

    Logger.log(`Email sent with attachment: ${pdfBlob.getName()}`);

    sheet.getRange(targetRow, statusColumn).setValue('Sent');
    Logger.log(`Row ${targetRow} marked as Sent.`);

    const folder = DriveApp.getFolderById(pdfFolderId);
    folder.createFile(pdfBlob);
    Logger.log(`PDF saved to folder: ${folder.getName()}`);

  } catch (err) {
    Logger.log('Errore in sendContractForRow: ' + err);
  }
}

function combineDateAndTime(dateObj, timeObj) {
  if (isNaN(dateObj.getTime())) return '-';
  const days = ['Dom.', 'Lun.', 'Mar.', 'Mer.', 'Gio.', 'Ven.', 'Sab.'];
  const dayOfWeek = days[dateObj.getDay()];
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  let hh = '00', min = '00';
  if (timeObj && !isNaN(timeObj.getTime())) {
    hh = String(timeObj.getHours()).padStart(2, '0');
    min = String(timeObj.getMinutes()).padStart(2, '0');
  }
  return `${dayOfWeek} ${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatDate(dateObj) {
  if (isNaN(dateObj.getTime())) return '-';
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function testSendContractForRow() {
  const testRow = 21;
  sendContractForRow(testRow);
}
