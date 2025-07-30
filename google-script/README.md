# Google Apps Script - CSV to Jira Converter (Best Practice)

This Google Apps Script version uses **inline configuration** - the recommended approach for Google Apps Script projects.

## Why Inline Configuration?

✅ **No file management issues** - Everything in one file  
✅ **Google Apps Script best practice** - Recommended by Google  
✅ **Easier deployment** - Single file to copy/paste  
✅ **No external dependencies** - Self-contained  
✅ **Better performance** - No file loading overhead  

## Setup Instructions

### 1. Create a Google Sheet
- Go to [Google Sheets](https://sheets.google.com)
- Create a new spreadsheet
- Import your CSV data or paste it directly

### 2. Set up Google Apps Script
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default code
3. Copy and paste the entire contents of `csv-to-jira-best-practice.gs` into the editor
4. Save the project (give it a name like "CSV to Jira Converter")

### 3. Configure the Script
Edit the `CONFIG` object at the top of the script to match your needs:

```javascript
const CONFIG = {
  // Column mapping: old column name -> new column name
  rename: {
    'Component': 'Summary',
    'Pages': 'Labels', 
    'Impl Est': 'Story Points',
    // ... add your column mappings
  },

  // Phase number to Epic Link mapping
  phaseEpicLinks: {
    '1': 'DDS-1',
    '2': 'DDS-276'
    // Add more phases as needed
  },

  // Default epic link for phases not in the mapping
  defaultEpicLink: 'DDS-1'
};
```

## How to Use

### 1. Prepare Your Data
- Make sure your Google Sheet has headers in the first row
- Ensure you have a "Phase" column with phase numbers (1, 2, etc.)

### 2. Select Rows to Process
- **Select only the data rows** (excluding the header row)
- Row 1 is automatically used as headers
- You can select multiple rows at once

### 3. Run the Script
1. In the Apps Script editor, select the `processSelectedRows` function from the dropdown
2. Click the **Run** button
3. Grant permissions when prompted

### 4. Get Your Results
- A CSV file will be automatically downloaded
- The filename will include a timestamp (e.g., "jira-import-2024-01-15T10-30-45.csv")
- Each original row will be converted to two rows: one for web (🌐) and one for mobile (📱)
- The CSV file is ready for Jira import

## Configuration Options

All configuration is in the `CONFIG` object at the top of the script. Edit these settings:

### Column Mapping (`rename`)
Map your source column names to Jira field names:
```javascript
rename: {
  'Component': 'Summary',        // Component column → Summary field
  'Pages': 'Labels',            // Pages column → Labels field
  'Impl Est': 'Story Points',   // Impl Est column → Story Points field
  // ... etc
}
```

### Phase to Epic Link Mapping (`phaseEpicLinks`)
Define which epic link to use for each phase:
```javascript
phaseEpicLinks: {
  '1': 'DDS-1',     // Phase 1 → DDS-1 epic
  '2': 'DDS-276',   // Phase 2 → DDS-276 epic
  '3': 'DDS-XXX'    // Add more phases as needed
}
```

### Static Fields (`add`)
Add static values to every row:
```javascript
add: {
  'Issue Type': 'Story',
  'Status': 'Planning Web'
}
```

### Description Fields (`appendToDescription`)
Specify which columns should be included in the description:
```javascript
appendToDescription: [
  'Design',
  'Prototype', 
  'Category'
]
```

## Utility Functions

The script includes these utility functions you can run:

- `testConfiguration()` - Validates your configuration
- `showConfiguration()` - Displays current configuration in console

## Troubleshooting

### Common Issues:
1. **"Please select some rows to process"** - Make sure you've selected rows in your sheet
2. **"No data to process"** - Check that your selected rows contain data
3. **Permission errors** - Grant the necessary permissions when prompted

### Debugging:
- Use `console.log()` statements in the script
- Check the execution log in Apps Script for error messages
- Run `testConfiguration()` to validate your setup

## Output Format

The script creates two versions of each row:
- **Web version**: Summary ends with 🌐, Status = "Planning Web"
- **Mobile version**: Summary ends with 📱, Status = "Planning App"

Both versions include:
- Converted column names according to your mapping
- Epic Link based on the Phase column
- Combined description with checklist
- All static fields from your configuration

## CSV Download

The script automatically downloads a CSV file with:
- **Proper CSV formatting** with escaped quotes and commas
- **Timestamped filename** for easy identification
- **Ready for Jira import** - no additional formatting needed
- **Automatic download dialog** that appears after processing

## Best Practices Summary

✅ **Use this version** for most Google Apps Script projects  
✅ **Single file** - easier to manage and deploy  
✅ **Inline configuration** - Google's recommended approach  
✅ **No external dependencies** - self-contained solution  
✅ **Better performance** - no file loading overhead 