# Vehicle Maintenance Tracker - Spreadsheet Setup

## Spreadsheet Structure

To use the maintenance tracking system, you need to set up a Google Spreadsheet with the following structure:

1. Open the Google Sheet with ID: `1e4jz3L_hV5nAic6QwxW2D9BZZYggvAPeLH9tcGpHAYA`
2. Create a sheet named "Maintenance" (if it doesn't already exist)
3. Add the following columns in the first row:

| id | timestamp | vehicle | serviceType | dueDate | status | odometer | cost | assignedTo | completedDate | notes | partsReplaced | isDeleted |
|----|-----------|---------|-------------|---------|--------|----------|------|------------|---------------|-------|--------------|-----------|
| maint_123 | 6/11/2025 | Van 1 | Oil Change | 6/15/2025 | scheduled | 50000 | 150 | John Mechanic | | Regular service | Oil filter | false |

## Column Descriptions

- **id**: Unique identifier for each maintenance record (automatically generated)
- **timestamp**: Date and time when the record was created (automatically generated)
- **vehicle**: Name/ID of the vehicle
- **serviceType**: Type of maintenance service (Oil Change, Tire Rotation, etc.)
- **dueDate**: Date when the service is due
- **status**: Current status (scheduled, completed, overdue, due-soon)
- **odometer**: Vehicle odometer reading at the time of service
- **cost**: Cost of the maintenance service in CHF
- **assignedTo**: Person responsible for the maintenance
- **completedDate**: Date when the service was completed
- **notes**: Additional notes about the service
- **partsReplaced**: List of parts that were replaced
- **isDeleted**: Flag to mark deleted records (true/false)

## Sample Data

You can add the following sample data to your spreadsheet to test the functionality:

| id | timestamp | vehicle | serviceType | dueDate | status | odometer | cost | assignedTo | completedDate | notes | partsReplaced | isDeleted |
|----|-----------|---------|-------------|---------|--------|----------|------|------------|---------------|-------|--------------|-----------|
| maint_001 | 6/1/2025 | Van 1 | Oil Change | 6/15/2025 | scheduled | 50000 | 150 | John Mechanic | | Regular 10,000 km service | Oil filter | false |
| maint_002 | 5/15/2025 | Van 2 | Tire Rotation | 5/10/2025 | overdue | 45000 | 80 | Auto Shop | | | | false |
| maint_003 | 6/5/2025 | Van 3 | Brake Service | 6/20/2025 | due-soon | 62000 | 350 | Maintenance Dept | | Front brakes need urgent attention | Brake pads, rotors | false |
| maint_004 | 5/1/2025 | Van 1 | Inspection | 5/5/2025 | completed | 48000 | 200 | Auto Shop | 5/4/2025 | Annual inspection | | false |
| maint_005 | 4/15/2025 | Van 4 | Engine Service | 4/20/2025 | completed | 75000 | 520 | John Mechanic | 4/18/2025 | Major engine service | Spark plugs, air filter | false |

## Google Apps Script Integration

The maintenance tracker integrates with your existing Google Apps Script project. You'll need to add the following functions to your script:

1. `getMaintenanceData`: Retrieves maintenance records from the spreadsheet
2. `saveMaintenanceRecord`: Saves new records and updates existing ones
3. `getCleaningData`: Retrieves cleaning records from the spreadsheet
4. `saveCleaningRecord`: Saves new cleaning records and updates existing ones
5. Update your main `doGet` function to handle these new functions

The code for these functions is provided in the `maintenance-script-code.js` file.

## Van Cleaning Setup

The system also includes a van cleaning tracking feature. To use this feature:

1. Create a sheet named "Cleaning" in the same spreadsheet with the following columns:

| id | timestamp | vehicle | cleaningType | date | time | assignedTo | status | completedDate | notes | isDeleted |
|----|-----------|---------|--------------|------|------|------------|--------|---------------|-------|-----------|
| clean_001 | 6/11/2025 | Van 1 | Standard | 6/15/2025 | 09:00 | Cleaning Crew A | scheduled | | Regular weekly cleaning | false |

### Cleaning Column Descriptions

- **id**: Unique identifier for each cleaning record (automatically generated)
- **timestamp**: Date and time when the record was created (automatically generated)
- **vehicle**: Name/ID of the vehicle to be cleaned
- **cleaningType**: Type of cleaning service (Standard, Deep Clean, Express, etc.)
- **date**: Date when the cleaning is scheduled
- **time**: Time when the cleaning is scheduled
- **assignedTo**: Person or team assigned to the cleaning task
- **status**: Current status (scheduled, completed, in-progress, cancelled)
- **completedDate**: Date when the cleaning was completed
- **notes**: Additional notes or special instructions
- **isDeleted**: Flag to mark deleted records (true/false)

### Sample Cleaning Data

You can add the following sample data to test the cleaning functionality:

| id | timestamp | vehicle | cleaningType | date | time | assignedTo | status | completedDate | notes | isDeleted |
|----|-----------|---------|--------------|------|------|------------|--------|---------------|-------|-----------|
| clean_001 | 6/10/2025 | Van 1 | Standard | 6/11/2025 | 09:00 | Cleaning Crew A | completed | 6/11/2025 | Regular weekly cleaning | false |
| clean_002 | 6/8/2025 | Van 2 | Deep Clean | 6/15/2025 | 14:00 | Cleaning Crew B | scheduled | | Monthly deep cleaning | false |
| clean_003 | 6/9/2025 | Van 3 | Express | 6/12/2025 | 10:30 | Cleaning Crew A | scheduled | | Quick clean before customer pickup | false |
| clean_004 | 6/5/2025 | Van 4 | Disinfection | 6/18/2025 | 16:00 | Cleaning Crew C | scheduled | | Special disinfection service | false |
