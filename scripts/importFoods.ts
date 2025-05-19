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
    const filePath = process.argv[2] || path.join(__dirname, '../data/nutrient_file.xlsx');
    
    console.log(`📂 Looking for file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      console.log('');
      console.log('Usage: npx tsx scripts/importFoods.ts [path-to-excel-file]');
      console.log('');
      console.log('Example: npx tsx scripts/importFoods.ts ./data/food_data.xlsx');
      process.exit(1);
    }
    
    console.log(`📊 Reading file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    
    // Set up progress updates for console
    console.log('🔄 Starting import process...');
    
    const result = await importFoodsFromBuffer(buffer, {
      updateProgress: (progress) => {
        process.stdout.write(`\r⏳ Progress: ${progress.toFixed(0)}%`);
      }
    });
    
    // Clear progress line
    process.stdout.write('\r                      \r');
    
    if (result.success) {
      console.log('✅ Import completed successfully!');
      console.log(`   Valid items: ${result.validCount}`);
      console.log(`   Inserted: ${result.insertedCount}`);
      console.log(`   Skipped (duplicates): ${result.skippedCount}`);
      console.log(`   Errors: ${result.errorCount}`);
      console.log(`   Duration: ${result.durationSeconds.toFixed(2)}s`);
      
      if (result.errorCount > 0 && result.errorDetails) {
        console.log('');
        console.log('⚠️ There were some errors during import');
        console.log('Writing error details to import-errors.json');
        fs.writeFileSync('import-errors.json', JSON.stringify(result.errorDetails, null, 2));
      }
    } else {
      console.error('❌ Import failed');
      console.error(`Error: ${result.errorMessage}`);
      
      if (result.errorDetails && result.errorDetails.length > 0) {
        console.log('');
        console.log('Error details written to import-errors.json');
        fs.writeFileSync('import-errors.json', JSON.stringify(result.errorDetails, null, 2));
      }
      
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

// Run the import process
importFoods();