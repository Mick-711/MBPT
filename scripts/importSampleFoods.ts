// scripts/importSampleFoods.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db';
import { foods } from '../shared/schema';

// Handle ESM module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to import sample food data from JSON into the database
 * This is useful for demonstration and testing purposes
 */
async function importSampleFoods() {
  try {
    // Read sample food data
    const filePath = path.join(__dirname, '../data/nutrient_data/sample_foods.json');
    console.log(`📂 Reading sample food data from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    
    const sampleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ Loaded ${sampleData.length} sample food items`);
    
    // Insert foods in a single batch
    let skipped = 0;
    let inserted = 0;
    
    try {
      // Add a timestamp to each food
      const foodsWithTimestamp = sampleData.map((food: any) => ({
        ...food,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Insert all foods - without using onConflict since we don't have a unique constraint
      const result = await db
        .insert(foods)
        .values(foodsWithTimestamp);
      
      inserted = Number(result.rowCount);
      skipped = sampleData.length - inserted;
    } catch (err) {
      console.error('❌ Error inserting foods:', err);
      process.exit(1);
    }
    
    console.log('\n🎉 Import complete!');
    console.log(`   Total foods: ${sampleData.length}`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped (duplicates): ${skipped}`);
    
    // Exit successfully
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

importSampleFoods();