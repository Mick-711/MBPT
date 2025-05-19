// scripts/importNutrientData.cjs
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Main import function
async function importNutrients() {
  console.log('🔄 Starting nutrient data import...');
  
  try {
    // Load the Excel file
    const filePath = path.join(__dirname, '../data/nutrient_file.xlsx');
    console.log(`📑 Reading from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found. Please ensure the file exists in the data directory.');
      return;
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`📋 Found ${data.length} food items in the Excel file`);
    console.log('📊 Sample row:', JSON.stringify(data[0], null, 2));
    
    // Get existing food names to avoid duplicates
    const existingFoodsResult = await pool.query('SELECT name FROM foods');
    const existingFoodNames = new Set(
      existingFoodsResult.rows.map(row => row.name.toLowerCase().trim())
    );
    console.log(`🔍 Found ${existingFoodNames.size} existing foods in database`);
    
    // Prepare data for import
    const mappedFoods = data.map(row => {
      // Use the column names as seen in the sample output
      const name = row["Food Name"] || '';
      const calories = parseFloat(row["Calories"] || 0);
      const protein = parseFloat(row["Protein (g)"] || 0);
      const fat = parseFloat(row["Fat (g)"] || 0); 
      const fiber = parseFloat(row["Fibre (g)"] || 0);
      const carbs = parseFloat(row["Carbohydrates (g)"] || 0);
      
      // Determine food category based on name
      let category = 'other';
      const nameLower = name.toLowerCase();
      
      if (/meat|fish|chicken|beef|pork|lamb|poultry|turkey/i.test(nameLower)) {
        category = 'protein';
      } else if (/bread|rice|pasta|cereal|grain|wheat|corn|oat/i.test(nameLower)) {
        category = 'carbs';
      } else if (/oil|butter|fat|cream|lard/i.test(nameLower)) {
        category = 'fat';
      } else if (/milk|yogurt|yoghurt|cheese|dairy/i.test(nameLower)) {
        category = 'dairy';
      } else if (/apple|orange|banana|berry|fruit|pear|grape|melon/i.test(nameLower)) {
        category = 'fruit';
      } else if (/vegetable|veg|carrot|broccoli|spinach|lettuce|cabbage/i.test(nameLower)) {
        category = 'vegetable';
      } else if (/juice|water|tea|coffee|drink|beverage/i.test(nameLower)) {
        category = 'beverage';
      } else if (/snack|chip|crisp|cracker|popcorn|pretzel/i.test(nameLower)) {
        category = 'snack';
      } else if (/vitamin|supplement|mineral|protein powder/i.test(nameLower)) {
        category = 'supplement';
      }
      
      return {
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        servingSize: 100,  // Default to 100g serving
        servingUnit: 'g',
        sugar: 0,          // Default values for required fields
        sodium: 0,
        cholesterol: 0,
        isPublic: true
      };
    });
    
    // Filter out invalid entries
    const validFoods = mappedFoods.filter(food => 
      food.name && food.name.trim() !== '' && 
      (food.calories > 0 || food.protein > 0 || food.carbs > 0 || food.fat > 0)
    );
    
    console.log(`✅ Found ${validFoods.length} valid foods to import`);
    
    // Process in batches
    const BATCH_SIZE = 50;
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < validFoods.length; i += BATCH_SIZE) {
      const batch = validFoods.slice(i, i + BATCH_SIZE);
      console.log(`⏳ Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(validFoods.length/BATCH_SIZE)}`);
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const food of batch) {
          // Skip if name already exists in database (case-insensitive)
          if (existingFoodNames.has(food.name.toLowerCase().trim())) {
            skipped++;
            continue;
          }
          
          // Insert the food item
          const insertQuery = `
            INSERT INTO foods (
              name, category, serving_size, serving_unit, calories, 
              protein, carbs, fat, fiber, sugar, sodium, cholesterol, is_public
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
          `;
          
          const result = await client.query(insertQuery, [
            food.name, food.category, food.servingSize, food.servingUnit, food.calories,
            food.protein, food.carbs, food.fat, food.fiber, food.sugar, 
            food.sodium, food.cholesterol, food.isPublic
          ]);
          
          if (result.rowCount > 0) {
            inserted++;
            // Add the food name to our set to avoid duplicates in subsequent batches
            existingFoodNames.add(food.name.toLowerCase().trim());
          }
        }
        
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error in batch:', err);
        errors += batch.length;
      } finally {
        client.release();
      }
      
      // Show progress
      const progress = Math.min(100, Math.round((i + batch.length) / validFoods.length * 100));
      console.log(`📊 Progress: ${progress}% (Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors})`);
    }
    
    // Final summary
    console.log('\n🎉 Import complete!');
    console.log('📊 Summary:');
    console.log(`Total foods in file: ${data.length}`);
    console.log(`Valid foods: ${validFoods.length}`);
    console.log(`Successfully inserted: ${inserted}`);
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (err) {
    console.error('❌ Fatal error during import:', err);
  } finally {
    await pool.end();
  }
}

// Run the import
importNutrients().then(() => {
  console.log('Import process finished');
  process.exit(0);
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});