function archiveLabeledEmails() {
  var labelsToProcess = ['Booking', 'contratti'];
  var recipientEmail = 'noleggiosemplice23@gmail.com'; // Replace with your email address
  var subjectsToDelete = [
    'Stripe Payment Execution Log',
    'Neue Rezension',
    'Summary of failures for Google Apps Script'
  ];
  var sendersToDelete = ['noreply@tutti.ch', 'no-reply@zoko.io'];
  var dailyReportSubject = 'Daily Report';
  var dailyReportFolderName = 'Daily Reports';

  // Get or create the Daily Reports folder
  var dailyReportFolder = GmailApp.getUserLabelByName(dailyReportFolderName);
  if (!dailyReportFolder) {
    dailyReportFolder = GmailApp.createLabel(dailyReportFolderName);
  }

  // Delete emails with specified subjects
  for (var s = 0; s < subjectsToDelete.length; s++) {
    var threadsToDelete = GmailApp.search('in:inbox "' + subjectsToDelete[s] + '"');
    for (var d = 0; d < threadsToDelete.length; d++) {
      try {
        threadsToDelete[d].moveToTrash();
        Logger.log('Deleted email with subject: ' + subjectsToDelete[s]);
      } catch (e) {
        Logger.log('Error deleting email with subject: ' + subjectsToDelete[s] + '. Error: ' + e.message);
        MailApp.sendEmail(recipientEmail,
                         'Error Deleting Email',
                         'An error occurred while deleting an email.\n\n' +
                         'Subject: ' + subjectsToDelete[s] + '\n' +
                         'Error: ' + e.message + '\n' +
                         'Please check the script and take necessary actions.');
      }
    }
  }

  // Delete emails from specific senders
  for (var s = 0; s < sendersToDelete.length; s++) {
    var senderThreads = GmailApp.search('in:inbox from:' + sendersToDelete[s]);
    for (var t = 0; t < senderThreads.length; t++) {
      try {
        senderThreads[t].moveToTrash();
        Logger.log('Deleted email from: ' + sendersToDelete[s]);
      } catch (e) {
        Logger.log('Error deleting email from: ' + sendersToDelete[s] + '. Error: ' + e.message);
        MailApp.sendEmail(recipientEmail,
                         'Error Deleting Email',
                         'An error occurred while deleting an email.\n\n' +
                         'From: ' + sendersToDelete[s] + '\n' +
                         'Error: ' + e.message + '\n' +
                         'Please check the script and take necessary actions.');
      }
    }
  }

  // Move Daily Report emails to folder
  var dailyReportThreads = GmailApp.search('in:inbox "' + dailyReportSubject + '"');
  for (var dr = 0; dr < dailyReportThreads.length; dr++) {
    try {
      dailyReportThreads[dr].addLabel(dailyReportFolder);
      dailyReportThreads[dr].moveToArchive();
      Logger.log('Moved email with subject: ' + dailyReportSubject + ' to ' + dailyReportFolderName);
    } catch (e) {
      Logger.log('Error moving email with subject: ' + dailyReportSubject + '. Error: ' + e.message);
      MailApp.sendEmail(recipientEmail,
                       'Error Moving Daily Report',
                       'An error occurred while moving a Daily Report email.\n\n' +
                       'Subject: ' + dailyReportSubject + '\n' +
                       'Error: ' + e.message + '\n' +
                       'Please check the script and take necessary actions.');
    }
  }

  // Process labeled emails for archiving
  for (var l = 0; l < labelsToProcess.length; l++) {
    var labelName = labelsToProcess[l];
    var label = GmailApp.getUserLabelByName(labelName);

    if (!label) {
      continue;
    }

    var threads = label.getThreads();
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      if (thread.isInInbox()) {
        try {
          thread.moveToArchive();
          Logger.log('Archived thread with subject: ' + thread.getFirstMessageSubject());
        } catch (e) {
          Logger.log('Error archiving thread with subject: ' + thread.getFirstMessageSubject() + '. Error: ' + e.message);
          MailApp.sendEmail(recipientEmail,
                           'Error Archiving Email',
                           'An error occurred while archiving an email.\n\n' +
                           'Label: ' + labelName + '\n' +
                           'Subject: ' + thread.getFirstMessageSubject() + '\n' +
                           'Error: ' + e.message + '\n' +
                           'Please check the script and take necessary actions.');
        }
      }
    }
  }
}