/**
 * CSV to Jira Story Converter - Google Apps Script Version (Best Practice)
 * 
 * This script processes selected rows in Google Sheets and converts them
 * to Jira import format based on the configuration below.
 * 
 * USAGE:
 * 1. Select the rows you want to process in your Google Sheet (excluding header row)
 * 2. Run this script
 * 3. CSV file will be downloaded automatically
 */

// ============================================================================
// CONFIGURATION - Edit these settings as needed
// ============================================================================

const CONFIG = {
  // Column mapping: old column name -> new column name
  rename: {
    'Component': 'Summary',
    'Pages': 'Labels', 
    'Impl Est': 'Story Points',
    'Design': 'Description',
    'Prototype': 'Description',
    'Category': 'Description',
    'Phase': 'Epic Link'
  },

  // Columns to append to description
  appendToDescription: [
    'Design',
    'Prototype', 
    'Category'
  ],

  // Multiline text to append to description
  appendMultiline: `----
Checklist:
🔲 prop configuration & exposition
🔲 correct token mapping
🔲 prop change = correct appearance & behavior
🔲 interactive states (desktop & mobile)
🔲 mobile active state
🔲 user input (type & keypress & select)
🔲 edge-cases (empty state & long text)
🔲 ui coherence (textstyle & weight & spacing & color & shadow)
🔲 responsive behavior
🔲 transition behavior (expand/collapse)
🔲 animation follows prototype
🔲 os/browser check: Android Chrome
🔲 os/browser check: iOS Safari/Chrome
🔲 os/browser check: Windows Chrome/Firefox
🔲 os/browser check: macOS Safari/Chrome
🔲 os/browser check: Native Android app
🔲 os/browser check: Native iOS app
🔲 zooming (ios & android) and scaling (windows)`,

  // Static fields to add to each row
  add: {
    'Issue Type': 'Story',
    'Status': 'Planning Web'
  },

  // Phase number to Epic Link mapping
  phaseEpicLinks: {
    '1': 'DDS-1',
    '2': 'DDS-276'
    // Add more phases as needed: '3': 'DDS-XXX'
  },

  // Default epic link for phases not in the mapping
  defaultEpicLink: 'DDS-1'
};

// ============================================================================
// MAIN FUNCTION - Run this to process selected rows
// ============================================================================

function processSelectedRows() {
  try {
    // Get the active sheet and selected range
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getActiveRange();
    
    if (!range) {
      throw new Error('Please select some rows to process (excluding header row)');
    }

    // Always use row 1 as headers, regardless of selection
    const headers = getHeadersFromRow1(sheet);
    
    // Get the data from selected rows (excluding header row)
    const data = range.getValues();
    
    console.log(`Selected range: ${range.getA1Notation()}`);
    console.log(`Processing ${data.length} selected rows...`);
    console.log(`Headers found: ${headers.length}`);
    
    // Process the data
    const processedData = processData(data, headers);
    
    if (processedData.length === 0) {
      throw new Error('No data to process');
    }
    
    console.log(`Original rows: ${data.length}`);
    console.log(`Processed rows (including web/mobile): ${processedData.length}`);
    
    // Download as CSV
    downloadAsCSV(processedData);
    
    console.log(`✅ Successfully processed ${processedData.length} rows`);
    console.log(`📥 CSV download initiated`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get headers from row 1 (always)
 */
function getHeadersFromRow1(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  return headerRange.getValues()[0];
}

/**
 * Process the data according to configuration
 */
function processData(data, headers) {
  const processed = [];
  
  console.log(`Processing ${data.length} rows with ${headers.length} headers`);
  console.log(`Headers: ${headers.join(', ')}`);
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowData = {};
    
    // Create a map of column name to value
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = row[j];
    }
    
    console.log(`Row ${i + 1}: ${Object.keys(rowData).length} columns`);
    
    // Apply column renaming
    const newRow = {};
    for (const [oldCol, newCol] of Object.entries(CONFIG.rename)) {
      if (newCol === 'Description') continue; // Handle description separately
      newRow[newCol] = rowData[oldCol] || '';
    }
    
    // Add static fields
    for (const [col, val] of Object.entries(CONFIG.add)) {
      newRow[col] = val;
    }
    
    // Convert Phase to Epic Link
    const phaseNumber = (rowData['Phase'] || '').toString().trim();
    const epicLink = CONFIG.phaseEpicLinks[phaseNumber] || CONFIG.defaultEpicLink;
    newRow['Epic Link'] = epicLink;
    
    // Compose Description
    const descriptionParts = [];
    for (const col of CONFIG.appendToDescription) {
      if (rowData[col]) {
        descriptionParts.push(`${col}: ${rowData[col]}`);
      }
    }
    descriptionParts.push(CONFIG.appendMultiline);
    newRow['Description'] = descriptionParts.join('\n');
    
    processed.push(newRow);
  }
  
  // Create web and mobile versions
  const finalData = [];
  
  // Web versions (with 🌐)
  for (const row of processed) {
    const webRow = { ...row };
    webRow['Summary'] = `${webRow['Summary']} 🌐`;
    finalData.push(webRow);
  }
  
  // Mobile versions (with 📱)
  for (const row of processed) {
    const mobileRow = { ...row };
    mobileRow['Summary'] = `${mobileRow['Summary']} 📱`;
    mobileRow['Status'] = 'Planning App';
    finalData.push(mobileRow);
  }
  
  return finalData;
}

/**
 * Download processed data as CSV
 */
function downloadAsCSV(data) {
  if (data.length === 0) {
    throw new Error('No data to download');
  }
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escapedValue = value.toString().replace(/"/g, '""');
      if (escapedValue.includes(',') || escapedValue.includes('"') || escapedValue.includes('\n')) {
        return `"${escapedValue}"`;
      }
      return escapedValue;
    });
    csvContent += values.join(',') + '\n';
  }
  
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `jira-import-${timestamp}.csv`;
  
  // Create blob and trigger download
  const blob = Utilities.newBlob(csvContent, 'text/csv', filename);
  
  // Show download dialog with proper download link
  const htmlOutput = HtmlService.createHtmlOutput(`
    <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
      <h3>📥 CSV Ready for Download</h3>
      <p>Your file "${filename}" is ready!</p>
      <br>
      <a href="data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}" 
         download="${filename}" 
         style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
        📥 Download CSV File
      </a>
      <br><br>
      <p style="font-size: 12px; color: #666;">
        If the download doesn't start, right-click the button and select "Save link as..."
      </p>
    </div>
  `);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Download CSV');
}

// ============================================================================
// CUSTOM MENU - Creates menu in Google Sheets toolbar
// ============================================================================

/**
 * Creates custom menu when sheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Jira Exporter')
    .addItem('Process Selected Rows', 'processSelectedRows')
    .addToUi();
}

/**
 * Alternative: More integrated menu name
 */
function onOpenIntegrated() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Jira Exporter')
    .addItem('Export Selected Rows', 'processSelectedRows')
    .addToUi();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test function to validate configuration
 */
function testConfiguration() {
  console.log('Testing configuration...');
  console.log('Rename mappings:', Object.keys(CONFIG.rename).length);
  console.log('Phase epic links:', Object.keys(CONFIG.phaseEpicLinks).length);
  console.log('Static fields:', Object.keys(CONFIG.add).length);
  console.log('✅ Configuration looks good!');
}

/**
 * Show current configuration
 */
function showConfiguration() {
  console.log('Current Configuration:');
  console.log(JSON.stringify(CONFIG, null, 2));
} 