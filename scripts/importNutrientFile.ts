// scripts/importNutrientFile.ts
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { foods, foodCategoryEnum } from '../shared/schema';
import { db } from '../server/db';
import { importFoodsFromBuffer } from './importFoodService';
import { fileURLToPath } from 'url';

// Handle ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to import the nutrient file into the database
 * Maps columns from the provided Excel file to our database schema
 */
async function importNutrientFile() {
  try {
    // Get the file path - you need to place the Excel file in the data directory
    const filePath = path.join(__dirname, '../data/nutrient_file.xlsx');
    console.log(`📑 Looking for Excel file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found at ${filePath}`);
      console.log(`Please save your Excel file to this location and try again.`);
      return;
    }

    console.log(`📊 Found file, processing...`);
    
    // Read file as buffer
    const buffer = fs.readFileSync(filePath);
    
    // Process the workbook to map the columns
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<any>(sheet);
    
    console.log(`📋 Found ${rawData.length} rows in the Excel file`);
    console.log(`🔍 Mapping columns to our database schema...`);
    
    // Create a mapped array that matches our food schema
    const mappedFoods = rawData.map((row: any) => {
      // Try different possible column names for each nutrient
      const name = row['Food Name'] || row['food name'] || row['Name'] || row['name'] || '';
      const calories = parseFloat(row['Calories'] || row['calories'] || row['Energy'] || row['energy'] || 0);
      const carbs = parseFloat(row['Carbohydrates (g)'] || row['carbohydrates'] || row['Carbs (g)'] || row['carbs'] || 0);
      const fiber = parseFloat(row['Fibre (g)'] || row['fiber'] || row['Fibre'] || row['fibre'] || 0);
      const fat = parseFloat(row['Fats (g)'] || row['Fat (g)'] || row['fat'] || row['fats'] || 0);
      const protein = parseFloat(row['Protein (g)'] || row['protein'] || 0);
      
      // Try to determine a category based on the food name
      let category = 'other';
      const nameLower = name.toLowerCase();
      
      if (nameLower.includes('meat') || nameLower.includes('beef') || nameLower.includes('chicken') || 
          nameLower.includes('fish') || nameLower.includes('pork') || nameLower.includes('turkey')) {
        category = 'protein';
      } else if (nameLower.includes('bread') || nameLower.includes('rice') || nameLower.includes('pasta') || 
                nameLower.includes('cereal') || nameLower.includes('grain')) {
        category = 'carbs';
      } else if (nameLower.includes('oil') || nameLower.includes('butter') || nameLower.includes('cream') ||
                nameLower.includes('cheese')) {
        category = 'fat';
      } else if (nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese')) {
        category = 'dairy';
      } else if (nameLower.includes('apple') || nameLower.includes('orange') || nameLower.includes('banana') ||
                nameLower.includes('berry') || nameLower.includes('fruit')) {
        category = 'fruit';
      } else if (nameLower.includes('vegetable') || nameLower.includes('spinach') || nameLower.includes('carrot') ||
                nameLower.includes('lettuce') || nameLower.includes('tomato')) {
        category = 'vegetable';
      } else if (nameLower.includes('water') || nameLower.includes('juice') || nameLower.includes('soda') ||
                nameLower.includes('drink')) {
        category = 'beverage';
      } else if (nameLower.includes('chip') || nameLower.includes('cracker') || nameLower.includes('cookie') ||
                nameLower.includes('bar') || nameLower.includes('snack')) {
        category = 'snack';
      }
      
      return {
        name,
        category,
        servingSize: 100,
        servingUnit: 'g',
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar: 0, // Not provided in the input, default to 0
        sodium: 0, // Not provided in the input, default to 0
        cholesterol: 0, // Not provided in the input, default to 0
        isPublic: true,
        brand: null,
        tags: []
      };
    });
    
    // Filter out invalid entries (no name or all zeros)
    const validFoods = mappedFoods.filter(food => 
      food.name && food.name.trim() !== '' && 
      (food.calories > 0 || food.protein > 0 || food.carbs > 0 || food.fat > 0)
    );
    
    console.log(`✅ Successfully mapped ${validFoods.length} foods, skipped ${mappedFoods.length - validFoods.length} invalid entries`);
    
    // Create a temporary file with the mapped data
    const tempFilePath = path.join(__dirname, '../data/temp_mapped_foods.xlsx');
    const ws = XLSX.utils.json_to_sheet(validFoods);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Foods');
    XLSX.writeFile(wb, tempFilePath);
    
    console.log(`📝 Created temporary file with mapped data at ${tempFilePath}`);
    console.log(`🚀 Importing foods into database...`);
    
    // Read the file again and use our import function
    const mappedBuffer = fs.readFileSync(tempFilePath);
    const result = await importFoodsFromBuffer(mappedBuffer);
    
    console.log('\n🎉 Import complete!');
    console.log(`✅ Valid foods: ${result.validCount}`);
    console.log(`📥 Inserted: ${result.insertedCount}`);
    console.log(`🔄 Skipped duplicates: ${result.skippedCount}`);
    console.log(`❌ Errors: ${result.errorCount}`);
    console.log(`⏱️ Duration: ${result.durationSeconds} seconds`);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    console.log(`🧹 Removed temporary file`);
    
  } catch (err) {
    console.error('❌ Error importing nutrient file:', err);
  }
}

// Run the import function
importNutrientFile()
  .then(() => {
    console.log('Import completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });