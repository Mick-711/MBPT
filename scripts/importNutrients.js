// scripts/importNutrients.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { foods, foodCategoryEnum } = require('../shared/schema');
const { db } = require('../server/db');

/**
 * Script to import the nutrient file into the database
 * Maps columns from the provided Excel file to our database schema
 */
async function importNutrientFile() {
  try {
    // Get the file path
    const filePath = path.join(__dirname, '../data/nutrient_file.xlsx');
    console.log(`📑 Looking for Excel file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found at ${filePath}`);
      console.log(`Please save your Excel file to this location and try again.`);
      return;
    }

    console.log(`📊 Found file, processing...`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`📋 Found ${rawData.length} rows in the Excel file`);
    
    // Look at sample data to debug column names
    console.log("Sample row:", JSON.stringify(rawData[0], null, 2));
    
    // Map the data to our schema format
    const mappedFoods = rawData.map(row => {
      // Assuming columns match the provided requirements
      const name = row['Food Name'] || '';
      const calories = parseFloat(row['Calories'] || 0);
      const carbs = parseFloat(row['Carbohydrates (g)'] || 0);
      const fiber = parseFloat(row['Fibre (g)'] || 0);
      const fat = parseFloat(row['Fats (g)'] || 0);
      const protein = parseFloat(row['Protein (g)'] || 0);
      
      // Determine category based on food name
      let category = 'other';
      const nameLower = name.toLowerCase();
      
      if (nameLower.includes('meat') || nameLower.includes('beef') || nameLower.includes('chicken')) {
        category = 'protein';
      } else if (nameLower.includes('bread') || nameLower.includes('rice') || nameLower.includes('pasta')) {
        category = 'carbs';
      } else if (nameLower.includes('oil') || nameLower.includes('butter')) {
        category = 'fat';
      } else if (nameLower.includes('milk') || nameLower.includes('cheese')) {
        category = 'dairy';
      } else if (nameLower.includes('apple') || nameLower.includes('fruit')) {
        category = 'fruit';
      } else if (nameLower.includes('vegetable') || nameLower.includes('lettuce')) {
        category = 'vegetable';
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
        sugar: 0, // Default to 0 if not provided
        sodium: 0, // Default to 0 if not provided
        cholesterol: 0, // Default to 0 if not provided
        isPublic: true,
        brand: null,
        tags: []
      };
    });
    
    // Filter out invalid data
    const validFoods = mappedFoods.filter(food => 
      food.name && food.name.trim() !== '' && 
      (food.calories > 0 || food.protein > 0 || food.carbs > 0 || food.fat > 0)
    );
    
    console.log(`✅ Valid foods to import: ${validFoods.length}`);
    
    // Insert the foods into the database
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log(`🔄 Beginning database import...`);
    
    // Get existing food names to avoid duplicates
    const existingFoods = await db.select({ name: foods.name }).from(foods);
    const existingFoodNames = new Set(existingFoods.map(f => f.name.toLowerCase().trim()));
    
    // Insert in batches
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < validFoods.length; i += BATCH_SIZE) {
      const batch = validFoods.slice(i, i + BATCH_SIZE);
      const batchToInsert = batch.filter(food => 
        !existingFoodNames.has(food.name.toLowerCase().trim())
      );
      
      skipped += (batch.length - batchToInsert.length);
      
      if (batchToInsert.length > 0) {
        try {
          await db.transaction(async (tx) => {
            await tx.insert(foods).values(batchToInsert).onConflictDoNothing();
          });
          inserted += batchToInsert.length;
        } catch (err) {
          console.error(`Error in batch ${i}-${i+BATCH_SIZE}:`, err);
          errors += batchToInsert.length;
        }
      }
      
      console.log(`Progress: ${Math.min(100, Math.round((i + batch.length) / validFoods.length * 100))}%`);
    }
    
    console.log('\n🎉 Import complete!');
    console.log(`📊 Summary:`);
    console.log(`Total foods in file: ${rawData.length}`);
    console.log(`Valid foods: ${validFoods.length}`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (err) {
    console.error('❌ Error importing nutrient file:', err);
  }
}

// Run the import function
importNutrientFile()
  .then(() => {
    console.log('Import completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });