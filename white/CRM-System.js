/**
 * NOLEGGIO SEMPLICE - CUSTOMER RELATIONSHIP MANAGEMENT SYSTEM
 * 
 * This script analyzes all Google Calendar events to build a comprehensive customer database
 * Features:
 * - Extract customer data from all calendar events
 * - Identify repeat customers and booking patterns
 * - Generate customer insights and analytics
 * - Export data to Google Sheets for advanced analysis
 * - Track customer lifetime value and preferences
 */

// Configuration
const SPREADSHEET_NAME = 'Noleggio Semplice - Customer CRM Database';
const CUSTOMER_SHEET_NAME = 'Customers';
const BOOKINGS_SHEET_NAME = 'All Bookings';
const ANALYTICS_SHEET_NAME = 'Analytics';

// All calendar IDs for complete data extraction
const ALL_CALENDAR_IDS = [
  'noleggiosemplice23@gmail.com',                                                          // Main calendar
  'nijfu8k23bns6ml5rb0f7hko5o@group.calendar.google.com',                               // Opel Vivaro
  'e48a242e31251e913222eec57efddba56d45e1efaa8346a95aa4c001699f4f5d@group.calendar.google.com', // Renault Master  
  'd4bcd20ca384fcbbf31fc901401281942d8edbaecec4c24604c917c6f71bc43e@group.calendar.google.com', // Fiat Ducato
  '25f71a841f7ac3252fc9f1ced1870596d23a1842ae48ed39ede7f3bc01e819ca@group.calendar.google.com', // Citroen Boxer
  '8c2a425fa75bf5230dd2eee2a5cbedfcfa01279e943b5817efa25dfb359d8920@group.calendar.google.com', // Citroen Jumper
  'aa19b3fbefcdee63ffa1b724e3a2f4c65ed49949db2e6cf3d40e13924daea94b@group.calendar.google.com', // Renault Trafic
  '6e36e87a89e5ef58137cf3c2475226dbb5c5a8aec3a60bce80e63fc72552f4b5@group.calendar.google.com', // Renault Trafic2
  '9535c25ccd3adc5dc5a908aa9055cd8893e547657d6257f0a0232d50214c8c99@group.calendar.google.com', // Renault Trafic3
  'a97fc8429fc9a143475e0244ad922ce0f6dfb025a88dd68baadd116ef4f0b5cc@group.calendar.google.com', // Citroen Jumper2
  '0e9a455f793914439c9ae0e5ef91790038aa8fc295e71cfacbc3b8f128def8fa@group.calendar.google.com'  // Citroen Jumper3
];

const CALENDAR_NAMES = [
  'Main Calendar', 'Opel Vivaro', 'Renault Master', 'Fiat Ducato', 'Citroen Boxer',
  'Citroen Jumper', 'Renault Trafic', 'Renault Trafic2', 'Renault Trafic3', 
  'Citroen Jumper2', 'Citroen Jumper3'
];

/**
 * MAIN FUNCTION: Build complete CRM database from all calendar events
 * This analyzes historical data to create customer profiles
 */
function buildCustomerCRMDatabase() {
  try {
    Logger.log('🚀 Starting CRM database creation...');
    
    // Step 1: Extract all events from all calendars (last 2 years)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2); // Go back 2 years
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Include 3 months future
    
    Logger.log(`📅 Analyzing events from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const allEvents = extractAllCalendarEvents(startDate, endDate);
    Logger.log(`📊 Total events found: ${allEvents.length}`);
    
    // Step 2: Parse customer data from events
    const customerDatabase = parseCustomerDataFromEvents(allEvents);
    Logger.log(`👥 Unique customers identified: ${Object.keys(customerDatabase).length}`);
    
    // Step 3: Create or update Google Sheet with CRM data
    const spreadsheet = createOrUpdateCRMSpreadsheet();
    
    // Step 4: Populate customer data
    populateCustomerSheet(spreadsheet, customerDatabase);
    
    // Step 5: Populate all bookings data
    populateBookingsSheet(spreadsheet, allEvents);
    
    // Step 6: Generate analytics and insights
    generateAnalyticsSheet(spreadsheet, customerDatabase, allEvents);
    
    Logger.log('✅ CRM Database created successfully!');
    Logger.log(`📋 Spreadsheet URL: ${spreadsheet.getUrl()}`);
    
    return {
      success: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      totalCustomers: Object.keys(customerDatabase).length,
      totalBookings: allEvents.length,
      message: 'CRM Database built successfully!'
    };
    
  } catch (error) {
    Logger.log('❌ Error building CRM database: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Extract all events from all calendars within date range
 */
function extractAllCalendarEvents(startDate, endDate) {
  const allEvents = [];
  
  for (let i = 0; i < ALL_CALENDAR_IDS.length; i++) {
    const calendarId = ALL_CALENDAR_IDS[i];
    const calendarName = CALENDAR_NAMES[i];
    
    try {
      Logger.log(`📋 Processing calendar: ${calendarName}`);
      
      const calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) {
        Logger.log(`⚠️ Calendar not found: ${calendarId}`);
        continue;
      }
      
      const events = calendar.getEvents(startDate, endDate);
      Logger.log(`📊 Found ${events.length} events in ${calendarName}`);
      
      for (const event of events) {
        allEvents.push({
          id: event.getId(),
          title: event.getTitle(),
          description: event.getDescription() || '',
          location: event.getLocation() || '',
          startTime: event.getStartTime(),
          endTime: event.getEndTime(),
          calendarId: calendarId,
          calendarName: calendarName,
          isAllDay: event.isAllDayEvent(),
          guests: event.getGuestList().map(guest => guest.getEmail()),
          createdDate: event.getDateCreated(),
          lastUpdated: event.getLastUpdated()
        });
      }
      
    } catch (error) {
      Logger.log(`❌ Error processing calendar ${calendarName}: ${error.toString()}`);
    }
  }
  
  return allEvents;
}

/**
 * Parse customer data from events using various extraction methods
 */
function parseCustomerDataFromEvents(events) {
  const customerDatabase = {};
  
  for (const event of events) {
    const customerData = extractCustomerFromEvent(event);
    
    if (customerData && customerData.identifier) {
      const customerId = customerData.identifier;
      
      if (!customerDatabase[customerId]) {
        customerDatabase[customerId] = {
          id: customerId,
          name: customerData.name || 'Unknown',
          phone: customerData.phone || '',
          email: customerData.email || '',
          firstBooking: event.startTime,
          lastBooking: event.startTime,
          totalBookings: 0,
          totalDays: 0,
          preferredVans: {},
          bookingHistory: [],
          totalRevenue: 0,
          averageBookingDuration: 0,
          seasonalPattern: { spring: 0, summer: 0, autumn: 0, winter: 0 },
          notes: []
        };
      }
      
      const customer = customerDatabase[customerId];
      
      // Update customer data
      customer.totalBookings++;
      customer.lastBooking = event.startTime > customer.lastBooking ? event.startTime : customer.lastBooking;
      customer.firstBooking = event.startTime < customer.firstBooking ? event.startTime : customer.firstBooking;
      
      // Calculate booking duration
      const durationDays = Math.ceil((event.endTime - event.startTime) / (1000 * 60 * 60 * 24));
      customer.totalDays += durationDays;
      
      // Track preferred vans
      const van = extractVanFromEvent(event);
      if (van) {
        customer.preferredVans[van] = (customer.preferredVans[van] || 0) + 1;
      }
      
      // Track seasonal patterns
      const month = event.startTime.getMonth();
      if (month >= 2 && month <= 4) customer.seasonalPattern.spring++;
      else if (month >= 5 && month <= 7) customer.seasonalPattern.summer++;
      else if (month >= 8 && month <= 10) customer.seasonalPattern.autumn++;
      else customer.seasonalPattern.winter++;
      
      // Add booking to history
      customer.bookingHistory.push({
        date: event.startTime,
        van: van,
        duration: durationDays,
        calendar: event.calendarName,
        title: event.title
      });
      
      // Update averages
      customer.averageBookingDuration = customer.totalDays / customer.totalBookings;
    }
  }
  
  return customerDatabase;
}

/**
 * Extract customer information from a single event
 */
function extractCustomerFromEvent(event) {
  const title = event.title || '';
  const description = event.description || '';
  const location = event.location || '';
  const allText = `${title} ${description} ${location}`.toLowerCase();
  
  // Extract phone number (Swiss mobile patterns)
  const phonePatterns = [
    /(?:\+41|0041)\s*7[5-9]\s*\d{3}\s*\d{2}\s*\d{2}/g,
    /07[5-9]\s*\d{3}\s*\d{2}\s*\d{2}/g,
    /\+\d{10,15}/g,
    /\d{10,15}/g
  ];
  
  let phone = '';
  for (const pattern of phonePatterns) {
    const matches = allText.match(pattern);
    if (matches && matches[0]) {
      phone = matches[0].replace(/\s/g, '');
      break;
    }
  }
  
  // Extract email
  const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';
  
  // Extract name (common patterns)
  let name = '';
  const namePatterns = [
    /nome:\s*([a-zA-Z\s]+)/i,
    /name:\s*([a-zA-Z\s]+)/i,
    /cliente:\s*([a-zA-Z\s]+)/i,
    /customer:\s*([a-zA-Z\s]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }
  
  // If no explicit name found, try to extract from title
  if (!name && title) {
    const titleWords = title.split(/[\s-]+/);
    if (titleWords.length >= 2) {
      name = titleWords.slice(0, 2).join(' ');
    }
  }
  
  // Create identifier (prefer phone, fallback to email, then name)
  let identifier = phone || email || name;
  if (!identifier) return null;
  
  // Clean identifier
  identifier = identifier.replace(/\+41/, '0').replace(/\s/g, '');
  
  return {
    identifier: identifier,
    name: name,
    phone: phone,
    email: email
  };
}

/**
 * Extract van information from event
 */
function extractVanFromEvent(event) {
  const allText = `${event.title} ${event.description} ${event.calendarName}`.toLowerCase();
  
  // Van patterns
  const vanPatterns = [
    /n0[1-9]|n1[0-1]/g,
    /van\s*(\w+)/g,
    /furgone\s*(\w+)/g
  ];
  
  for (const pattern of vanPatterns) {
    const matches = allText.match(pattern);
    if (matches && matches[0]) {
      return matches[0].toUpperCase();
    }
  }
  
  // Try to infer from calendar name
  const calendarVanMap = {
    'opel vivaro': 'N01',
    'peugeot boxer': 'N03', 
    'renault master': 'N02',
    'fiat ducato': 'N04',
    'citroen boxer': 'N05',
    'citroen jumper': 'N06',
    'renault trafic': 'N07'
  };
  
  for (const [key, van] of Object.entries(calendarVanMap)) {
    if (event.calendarName.toLowerCase().includes(key)) {
      return van;
    }
  }
  
  return '';
}

/**
 * Create or get existing CRM spreadsheet
 */
function createOrUpdateCRMSpreadsheet() {
  // Try to find existing spreadsheet
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  let spreadsheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
    Logger.log('📄 Using existing CRM spreadsheet');
  } else {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
    Logger.log('📄 Created new CRM spreadsheet');
  }
  
  return spreadsheet;
}

/**
 * Populate customer sheet with customer data
 */
function populateCustomerSheet(spreadsheet, customerDatabase) {
  let sheet = spreadsheet.getSheetByName(CUSTOMER_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CUSTOMER_SHEET_NAME);
  } else {
    sheet.clear();
  }
  
  // Headers
  const headers = [
    'Customer ID', 'Name', 'Phone', 'Email', 'First Booking', 'Last Booking',
    'Total Bookings', 'Total Days', 'Average Duration', 'Preferred Van',
    'Spring Bookings', 'Summer Bookings', 'Autumn Bookings', 'Winter Bookings',
    'Customer Segment', 'Last Activity Days', 'Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Data rows
  const customers = Object.values(customerDatabase);
  const data = customers.map(customer => {
    const preferredVan = Object.keys(customer.preferredVans).reduce((a, b) => 
      customer.preferredVans[a] > customer.preferredVans[b] ? a : b, '');
    
    const daysSinceLastBooking = Math.floor((new Date() - customer.lastBooking) / (1000 * 60 * 60 * 24));
    
    let segment = 'New';
    if (customer.totalBookings >= 5) segment = 'VIP';
    else if (customer.totalBookings >= 3) segment = 'Loyal';
    else if (customer.totalBookings >= 2) segment = 'Repeat';
    
    return [
      customer.id,
      customer.name,
      customer.phone,
      customer.email,
      customer.firstBooking,
      customer.lastBooking,
      customer.totalBookings,
      customer.totalDays,
      Math.round(customer.averageBookingDuration * 10) / 10,
      preferredVan,
      customer.seasonalPattern.spring,
      customer.seasonalPattern.summer,
      customer.seasonalPattern.autumn,
      customer.seasonalPattern.winter,
      segment,
      daysSinceLastBooking,
      ''
    ];
  });
  
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Format sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Populate bookings sheet with all booking data
 */
function populateBookingsSheet(spreadsheet, events) {
  let sheet = spreadsheet.getSheetByName(BOOKINGS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(BOOKINGS_SHEET_NAME);
  } else {
    sheet.clear();
  }
  
  // Headers
  const headers = [
    'Booking Date', 'Event Title', 'Start Date', 'End Date', 'Duration (Days)',
    'Van', 'Calendar', 'Customer Phone', 'Customer Name', 'Location', 'Description'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#34a853').setFontColor('white');
  
  // Data rows
  const data = events.map(event => {
    const customer = extractCustomerFromEvent(event);
    const van = extractVanFromEvent(event);
    const duration = Math.ceil((event.endTime - event.startTime) / (1000 * 60 * 60 * 24));
    
    return [
      event.createdDate,
      event.title,
      event.startTime,
      event.endTime,
      duration,
      van,
      event.calendarName,
      customer ? customer.phone : '',
      customer ? customer.name : '',
      event.location,
      event.description
    ];
  });
  
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Format sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
}

/**
 * Generate analytics and insights
 */
function generateAnalyticsSheet(spreadsheet, customerDatabase, events) {
  let sheet = spreadsheet.getSheetByName(ANALYTICS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ANALYTICS_SHEET_NAME);
  } else {
    sheet.clear();
  }
  
  const customers = Object.values(customerDatabase);
  
  // Analytics data
  const analytics = [
    ['CUSTOMER ANALYTICS', ''],
    ['Total Customers', customers.length],
    ['VIP Customers (5+ bookings)', customers.filter(c => c.totalBookings >= 5).length],
    ['Loyal Customers (3-4 bookings)', customers.filter(c => c.totalBookings >= 3 && c.totalBookings < 5).length],
    ['Repeat Customers (2 bookings)', customers.filter(c => c.totalBookings === 2).length],
    ['New Customers (1 booking)', customers.filter(c => c.totalBookings === 1).length],
    ['', ''],
    ['BOOKING ANALYTICS', ''],
    ['Total Bookings', events.length],
    ['Average Booking Duration', Math.round(customers.reduce((sum, c) => sum + c.averageBookingDuration, 0) / customers.length * 10) / 10],
    ['Most Active Customer', customers.reduce((max, c) => c.totalBookings > max.totalBookings ? c : max, customers[0])?.name || 'N/A'],
    ['', ''],
    ['SEASONAL PATTERNS', ''],
    ['Spring Bookings', customers.reduce((sum, c) => sum + c.seasonalPattern.spring, 0)],
    ['Summer Bookings', customers.reduce((sum, c) => sum + c.seasonalPattern.summer, 0)],
    ['Autumn Bookings', customers.reduce((sum, c) => sum + c.seasonalPattern.autumn, 0)],
    ['Winter Bookings', customers.reduce((sum, c) => sum + c.seasonalPattern.winter, 0)]
  ];
  
  sheet.getRange(1, 1, analytics.length, 2).setValues(analytics);
  
  // Format headers
  sheet.getRange(1, 1).setFontWeight('bold').setBackground('#ff9900').setFontColor('white');
  sheet.getRange(8, 1).setFontWeight('bold').setBackground('#ff9900').setFontColor('white');
  sheet.getRange(13, 1).setFontWeight('bold').setBackground('#ff9900').setFontColor('white');
  
  sheet.autoResizeColumns(1, 2);
}

/**
 * Quick test function to run a sample analysis
 */
function testCRMSystem() {
  Logger.log('🧪 Testing CRM system with sample data...');
  
  const result = buildCustomerCRMDatabase();
  
  if (result.success) {
    Logger.log('✅ CRM Test successful!');
    Logger.log(`📊 Found ${result.totalCustomers} customers and ${result.totalBookings} bookings`);
    Logger.log(`📋 View results: ${result.spreadsheetUrl}`);
  } else {
    Logger.log('❌ CRM Test failed: ' + result.error);
  }
  
  return result;
}
