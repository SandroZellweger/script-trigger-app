/*************************************************************
 * 10_Workspace_Logic.gs
 * Logic for Team Workspace (Tasks, Notes, Orders, Activity)
 *************************************************************/

// Main Workspace Handler
function handleWorkspaceRequest(params) {
  const action = params.action;
  const user = params.user || 'Sandro';
  
  try {
    switch (action) {
      case 'getData':
        return getWorkspaceData(user);
      case 'saveTask':
        return saveTask(JSON.parse(params.data), user);
      case 'saveNote':
        return saveNote(JSON.parse(params.data), user);
      case 'saveOrder':
        return saveOrder(JSON.parse(params.data), user);
      case 'deleteItem':
        return deleteWorkspaceItem(params.type, params.id, user);
      case 'toggleNoteShare':
        return toggleNoteShare(params.id, user);
      case 'markNoteSeen':
        return markNoteSeen(params.id, user);
      default:
        return createErrorResponse('Unknown workspace action: ' + action);
    }
  } catch (e) {
    return createErrorResponse('Workspace Error: ' + e.toString());
  }
}

// Get all workspace data
function getWorkspaceData(user) {
  const ss = getSpreadsheet();
  
  const tasks = getSheetData(ss, 'WS_Tasks');
  const notes = getSheetData(ss, 'WS_Notes');
  const orders = getSheetData(ss, 'WS_Orders');
  const activity = getSheetData(ss, 'WS_Activity');
  
  // Filter notes: Show own notes OR shared notes
  const filteredNotes = notes.filter(n => n.author === user || n.shared === true || n.shared === 'true');
  
  // Process notes to add 'seen' boolean
  const processedNotes = filteredNotes.map(n => {
    const seenBy = n.seen_by ? String(n.seen_by) : '';
    return {
      ...n,
      seen: seenBy.includes(user)
    };
  });
  
  // Sort activity by date desc
  const sortedActivity = activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

  return createSuccessResponse({
    tasks: tasks,
    notes: processedNotes,
    orders: orders,
    activity: sortedActivity
  });
}

// Save Task
function saveTask(task, user) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, 'WS_Tasks', ['id', 'title', 'description', 'status', 'priority', 'assignee', 'created_at', 'updated_at']);
  
  const timestamp = new Date().toISOString();
  let taskId = task.id;
  
  if (!taskId) {
    // Create new
    taskId = generateUniqueId();
    sheet.appendRow([taskId, task.title, task.description, task.status || 'todo', task.priority, task.assignee, timestamp, timestamp]);
    logActivity(user, `Ha creato il task "${task.title}"`, 'check', '#f39c12');
  } else {
    // Update existing
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == taskId) {
        // Update columns based on task object keys
        // This is a simplified update, in production map fields carefully
        const row = i + 1;
        if (task.title) sheet.getRange(row, headers.indexOf('title') + 1).setValue(task.title);
        if (task.description) sheet.getRange(row, headers.indexOf('description') + 1).setValue(task.description);
        if (task.status) sheet.getRange(row, headers.indexOf('status') + 1).setValue(task.status);
        if (task.priority) sheet.getRange(row, headers.indexOf('priority') + 1).setValue(task.priority);
        if (task.assignee) sheet.getRange(row, headers.indexOf('assignee') + 1).setValue(task.assignee);
        sheet.getRange(row, headers.indexOf('updated_at') + 1).setValue(timestamp);
        break;
      }
    }
    logActivity(user, `Ha aggiornato il task "${task.title}"`, 'sync', '#3498db');
  }
  
  return createSuccessResponse({ id: taskId, message: 'Task saved' });
}

// Save Note
function saveNote(note, user) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, 'WS_Notes', ['id', 'content', 'color', 'shared', 'author', 'created_at', 'seen_by']);
  
  const timestamp = new Date().toISOString();
  let noteId = note.id;
  
  if (!noteId) {
    noteId = generateUniqueId();
    sheet.appendRow([noteId, note.content, note.color, note.shared, user, timestamp, '']);
    logActivity(user, `Ha creato una nuova nota`, 'sticky-note', '#9b59b6');
  } else {
    // Update logic similar to task
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == noteId) {
        const row = i + 1;
        if (note.content) sheet.getRange(row, headers.indexOf('content') + 1).setValue(note.content);
        if (note.color) sheet.getRange(row, headers.indexOf('color') + 1).setValue(note.color);
        if (note.shared !== undefined) sheet.getRange(row, headers.indexOf('shared') + 1).setValue(note.shared);
        break;
      }
    }
  }
  
  return createSuccessResponse({ id: noteId, message: 'Note saved' });
}

// Save Order
function saveOrder(order, user) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, 'WS_Orders', ['id', 'product', 'link', 'price', 'status', 'requested_by', 'created_at']);
  
  const timestamp = new Date().toISOString();
  let orderId = order.id;
  
  if (!orderId) {
    orderId = generateUniqueId();
    sheet.appendRow([orderId, order.product, order.link || '', order.price || '', 'requested', user, timestamp]);
    logActivity(user, `Ha richiesto ordine: ${order.product}`, 'shopping-cart', '#e74c3c');
  } else {
    // Update
    // ... implementation for update
  }
  
  return createSuccessResponse({ id: orderId, message: 'Order saved' });
}

// Delete Item
function deleteWorkspaceItem(type, id, user) {
  const ss = getSpreadsheet();
  let sheetName = '';
  
  if (type === 'task') sheetName = 'WS_Tasks';
  else if (type === 'note') sheetName = 'WS_Notes';
  else if (type === 'order') sheetName = 'WS_Orders';
  
  if (!sheetName) return createErrorResponse('Invalid type');
  
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createErrorResponse('Sheet not found');
  
  const data = sheet.getDataRange().getValues();
  const idIndex = data[0].indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      logActivity(user, `Ha eliminato un ${type}`, 'trash', '#7f8c8d');
      return createSuccessResponse({ message: 'Deleted' });
    }
  }
  
  return createErrorResponse('Item not found');
}

// Toggle Note Share
function toggleNoteShare(id, user) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('WS_Notes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  const sharedIndex = headers.indexOf('shared');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      const current = data[i][sharedIndex];
      const newVal = !(current === true || current === 'true');
      sheet.getRange(i + 1, sharedIndex + 1).setValue(newVal);
      return createSuccessResponse({ shared: newVal });
    }
  }
  return createErrorResponse('Note not found');
}

// Mark Note as Seen
function markNoteSeen(id, user) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('WS_Notes');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  const seenByIndex = headers.indexOf('seen_by');
  
  if (seenByIndex === -1) return createErrorResponse('seen_by column missing');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      const currentSeen = data[i][seenByIndex] ? String(data[i][seenByIndex]) : '';
      if (!currentSeen.includes(user)) {
        const newSeen = currentSeen ? currentSeen + ',' + user : user;
        sheet.getRange(i + 1, seenByIndex + 1).setValue(newSeen);
      }
      return createSuccessResponse({ message: 'Marked as seen' });
    }
  }
  return createErrorResponse('Note not found');
}

// Helpers
function getSpreadsheet() {
  const config = getConfig();
  // Use Maintenance Sheet as the main DB for Workspace
  const id = config.MAINTENANCE_SHEET_ID || config.VEHICLE_DATA_SHEET_ID; 
  return SpreadsheetApp.openById(id);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function ensureSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  return sheet;
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function logActivity(user, text, icon, color) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, 'WS_Activity', ['timestamp', 'user', 'text', 'icon', 'color']);
  sheet.appendRow([new Date().toISOString(), user, text, icon, color]);
}

// Response Helpers
function createSuccessResponse(data) {
  return { success: true, data: data };
}

function createErrorResponse(message) {
  return { success: false, error: message };
}
