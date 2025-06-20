// ——— CONFIG ———
const CONFIG_SHEET_ID = '1S4n57yAg1f3oHmZJ0wwQfJduAPRBv_qKWuvjsKOmz4E';
const MASTER_CAL_ID   = 'bdbf69ca9db01424f867de8ff09f2598468ca8149ba4ab7bda77fb076580117b@group.calendar.google.com';
const MASTER_SEARCH   = '🚗';  // marker in your master-event titles

/**
 * Read your spreadsheet and return an array of vehicles:
 *  • num: the vehicle number (string)
 *  • calId: its calendar ID
 * Excludes vehicles 2 and 5.
 */
function getCalendarConfig() {
  const rows = SpreadsheetApp
    .openById(CONFIG_SHEET_ID)
    .getSheets()[0]
    .getDataRange()
    .getValues();

  const cfg = rows
    .slice(1)                     // skip header
    .filter(r => r[2])            // must have a calendar ID
    .map(r => {
      const label = r[0].toString().trim();
      const calId = r[2].toString().trim();
      const match = label.match(/\d+/);
      const num   = match ? String(parseInt(match[0], 10)) : null;
      return { num, calId };
    })
    .filter(({ num }) => num && num !== '2' && num !== '5');

  Logger.log('Loaded config (%d vehicles): %s', cfg.length, JSON.stringify(cfg));
  return cfg;
}

/**
 * Update (or create) the master all-day event for a single date.
 * Builds a title “🚗 [list of free vehicle-numbers with symbols]”.
 */
function updateAvailabilityForDay(dayDate) {
  Logger.log('===== updateAvailabilityForDay: %s =====', dayDate);
  const cfg      = getCalendarConfig();
  const freeList = [];

  // Day start/end
  const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  const dayEnd   = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);

  // Define core-hour windows:
  const MORNING_START   = new Date(dayStart).setHours( 7,  0,  0);
  const MORNING_END     = new Date(dayStart).setHours(12,  0,  0);
  const AFTERNOON_START = new Date(dayStart).setHours(13,  0,  0);
  const AFTERNOON_END   = new Date(dayStart).setHours(19,  0,  0);

  cfg.forEach(({ num, calId }) => {
    Logger.log('-- Vehicle %s (calendar %s)', num, calId);

    // fetch all events that at least touch this day
    const rawEvents = CalendarApp
      .getCalendarById(calId)
      .getEventsForDay(dayDate);
    Logger.log('   ↳ %d raw events', rawEvents.length);

    // Clip each event into [dayStart, dayEnd]
    const clipped = rawEvents.map(e => {
      const s = e.getStartTime() < dayStart ? dayStart : e.getStartTime();
      const t = e.getEndTime()   > dayEnd   ? dayEnd   : e.getEndTime();
      return { start: s, end: t };
    });

    // 🔵 if any clipped segment starts at or after 19:00
    const hasEvening = clipped.some(ev => ev.start.getHours() >= 19);
    Logger.log('   ↳ hasEvening: %s', hasEvening);

    // No bookings at all → fully free
    if (clipped.length === 0) {
      Logger.log('   ↳ no bookings → fully free');
      freeList.push((hasEvening ? '🔵' : '') + num);
      return;
    }

    // Full-day busy if any clipped segment covers 10:00–14:00
    const hasMidday = clipped.some(ev =>
      ev.start.getHours() <= 10 && ev.end.getHours() >= 14
    );
    Logger.log('   ↳ hasMidday(full-day): %s', hasMidday);
    if (hasMidday) {
      Logger.log('   ↳ skipping (full-day busy)');
      return;
    }

    // Precise core-hours busy checks:
    const morningBusy   = clipped.some(ev =>
      ev.start.getTime() < MORNING_END && ev.end.getTime() > MORNING_START
    );
    const afternoonBusy = clipped.some(ev =>
      ev.start.getTime() < AFTERNOON_END && ev.end.getTime() > AFTERNOON_START
    );
    Logger.log('   ↳ morningBusy=%s, afternoonBusy=%s', morningBusy, afternoonBusy);

    // Build the single-symbol prefix:
    let prefix = hasEvening ? '🔵' : '';

    if (!morningBusy && afternoonBusy) {
      // free from 7–12
      prefix += '🟢';
      Logger.log('   ↳ free morning only → %s', prefix);
      freeList.push(prefix + num);
    }
    else if (morningBusy && !afternoonBusy) {
      // free from 13–19
      prefix += '🟠';
      Logger.log('   ↳ free afternoon only → %s', prefix);
      freeList.push(prefix + num);
    }
    else if (!morningBusy && !afternoonBusy) {
      // no core-hours bookings at all → fully free core hours
      Logger.log('   ↳ fully free core hours → %s', prefix);
      freeList.push(prefix + num);
    }
    else {
      // busy entire 7–19 window
      Logger.log('   ↳ busy all core hours → skip');
    }
  });

  Logger.log('→ Computed freeList: [%s]', freeList.join(', '));

  // Fetch or create the all-day master event on the master calendar
  const masterCal = CalendarApp.getCalendarById(MASTER_CAL_ID);
  let [masterEvent] = masterCal.getEventsForDay(dayDate)
    .filter(e => e.isAllDayEvent() && e.getTitle().includes(MASTER_SEARCH));

  if (!masterEvent) {
    Logger.log('→ creating new master event placeholder');
    masterEvent = masterCal.createAllDayEvent('🚗 placeholder', dayDate);
  } else {
    Logger.log('→ reusing existing master event: %s', masterEvent.getTitle());
  }

  // Set the consolidated title
  const newTitle = freeList.length
    ? `🚗 ${freeList.join(' – ')}`
    : '🚗 None Available';
  Logger.log('→ setting master title to: "%s"', newTitle);
  masterEvent.setTitle(newTitle);
}

/**
 * Run for today + the next six days.
 */
function updateNext90Days() {
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    updateAvailabilityForDay(d);
  }
}
