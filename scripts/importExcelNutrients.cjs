// scripts/importExcelNutrients.cjs
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Function to categorize food based on name
function categorizeFood(name) {
  const nameLower = name.toLowerCase();
  
  if (/meat|fish|chicken|beef|pork|lamb|poultry|turkey|protein|egg/i.test(nameLower)) {
    return 'protein';
  } else if (/bread|rice|pasta|cereal|grain|wheat|corn|oat|carb/i.test(nameLower)) {
    return 'carbs';
  } else if (/oil|butter|fat|cream|lard|ghee|margarine/i.test(nameLower)) {
    return 'fat';
  } else if (/milk|yogurt|yoghurt|cheese|dairy/i.test(nameLower)) {
    return 'dairy';
  } else if (/apple|orange|banana|berry|fruit|pear|grape|melon|cherry/i.test(nameLower)) {
    return 'fruit';
  } else if (/vegetable|veg|carrot|broccoli|spinach|lettuce|cabbage|pepper/i.test(nameLower)) {
    return 'vegetable';
  } else if (/juice|water|tea|coffee|drink|beverage|soda|wine|beer|alcohol/i.test(nameLower)) {
    return 'beverage';
  } else if (/snack|chip|crisp|cracker|popcorn|pretzel|cookie|biscuit/i.test(nameLower)) {
    return 'snack';
  } else if (/vitamin|supplement|mineral|protein powder|amino/i.test(nameLower)) {
    return 'supplement';
  }
  
  return 'other';
}

// Main import function
async function importNutrients() {
  console.log('🔄 Starting nutrient data import...');
  
  try {
    // Load the Excel file
    const filePath = path.join(__dirname, '../data/nutrient_file.xlsx');
    console.log(`📑 Reading Excel file from: ${filePath}`);
    
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
      const calories = Math.round(parseFloat(row["Calories"] || 0));
      const protein = parseFloat(row["Protein (g)"] || 0);
      const fat = parseFloat(row["Fat (g)"] || 0); 
      const fiber = parseFloat(row["Fibre (g)"] || 0);
      const carbs = parseFloat(row["Carbohydrates (g)"] || 0);
      
      // Determine food category
      const category = categorizeFood(name);
      
      return {
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        fiber
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
    
    // Insert foods in batches
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
              protein, carbs, fat, fiber, is_public
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `;
          
          const result = await client.query(insertQuery, [
            food.name, 
            food.category, 
            100,  // default serving size
            'g',  // default serving unit
            food.calories,
            food.protein,
            food.carbs,
            food.fat,
            food.fiber,
            true   // is_public
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