// scripts/importFoods.ts
import * as fs from 'fs';
import * as path from 'path';
import { importFoodsFromBuffer } from './importFoodService';

/**
 * Script to import food data from an Excel file into the database
 * Usage: npx tsx scripts/importFoods.ts
 */
async function importFoods() {
  try {
    // Get the file path
    const filePath = path.join(__dirname, '../data/food_items.xlsx');
    console.log(`📥 Loading Excel file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file buffer and pass to the service
    const buffer = fs.readFileSync(filePath);
    const result = await importFoodsFromBuffer(buffer);
    
    // Display results
    console.log('\n🎉 Import complete!');
    console.log(`⏱️ Total time       : ${result.summary.durationSeconds} seconds`);
    console.log(`📋 Total rows       : ${result.summary.total}`);
    console.log(`✅ Valid rows       : ${result.summary.valid}`);
    console.log(`📥 Inserted         : ${result.summary.inserted}`);
    console.log(`🔄 Skipped duplicates: ${result.summary.skipped}`);
    console.log(`❌ Errors           : ${result.summary.errors}`);
    
    // Write logs to file
    const logPath = path.join(__dirname, '../data/food-import-log.json');
    fs.writeFileSync(logPath, JSON.stringify(result, null, 2));
    console.log(`📝 Detailed log saved to ${logPath}`);
    
    if (result.errorDetails && result.errorDetails.length > 0) {
      const errorLogPath = path.join(__dirname, '../data/food-import-errors.json');
      fs.writeFileSync(errorLogPath, JSON.stringify(result.errorDetails, null, 2));
      console.warn(`⚠️ Error details written to ${errorLogPath}`);
    }
    
  } catch (err) {
    console.error('❌ Fatal import error:', err);
    process.exit(1);
  }
}

// Run the import function
importFoods()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error during import:', err);
    process.exit(1);
  });