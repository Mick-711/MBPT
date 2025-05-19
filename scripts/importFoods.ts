import * as XLSX from 'xlsx';
import * as path from 'path';
import { foods, InsertFood } from '../shared/schema';
import { db } from '../server/db';
import { eq } from 'drizzle-orm';

/**
 * Script to import food data from an Excel file into the database
 * Usage: npx tsx scripts/importFoods.ts
 */
async function importFoods() {
  try {
    // Load the Excel file from the data directory
    const excelFilePath = path.join(__dirname, '../data/food_items.xlsx');
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json<any>(worksheet);
    console.log(`Found ${rows.length} rows in Excel file`);
    
    // Collection to track stats
    let processed = 0;
    let skipped = 0;
    let inserted = 0;
    let errors = 0;
    
    // Process each row
    for (const row of rows) {
      processed++;
      
      try {
        // Skip if required fields are missing
        if (!row.name || !row.calories) {
          console.warn(`[Row ${processed}] Skipping due to missing required fields`);
          skipped++;
          continue;
        }
        
        // Map Excel columns to Food model
        // Adjust field mappings as needed based on your Excel file structure
        const foodData: InsertFood = {
          name: row.name,
          category: mapCategory(row.category),
          servingSize: parseFloat(row.servingSize) || 100,
          servingUnit: row.servingUnit || 'g',
          calories: parseInt(row.calories, 10),
          protein: parseFloat(row.protein) || 0,
          carbs: parseFloat(row.carbs) || 0,
          fat: parseFloat(row.fat) || 0,
          fiber: parseFloat(row.fiber) || 0,
          sugar: parseFloat(row.sugar) || 0,
          sodium: parseFloat(row.sodium) || 0,
          cholesterol: parseFloat(row.cholesterol) || 0,
          isPublic: true,
          brand: row.brand || null,
          tags: row.tags ? String(row.tags).split(',').map(tag => tag.trim()) : [],
        };
        
        // Check if food with the same name already exists
        const existingFood = await db.select({ id: foods.id })
          .from(foods)
          .where(eq(foods.name, foodData.name))
          .limit(1);
        
        if (existingFood.length > 0) {
          console.log(`[Row ${processed}] Food "${foodData.name}" already exists, skipping`);
          skipped++;
          continue;
        }
        
        // Insert the food record
        await db.insert(foods).values(foodData);
        inserted++;
        
        if (processed % 10 === 0) {
          console.log(`Progress: ${processed}/${rows.length}`);
        }
      } catch (err) {
        console.error(`[Row ${processed}] Error processing row:`, err);
        errors++;
      }
    }
    
    // Print summary
    console.log('\nImport Summary:');
    console.log(`Total rows processed: ${processed}`);
    console.log(`Successful inserts: ${inserted}`);
    console.log(`Skipped (duplicates or invalid): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (err) {
    console.error('Failed to import food data:', err);
    process.exit(1);
  }
}

/**
 * Maps a category string to a valid foodCategoryEnum value
 */
function mapCategory(category: string): string {
  if (!category) return 'other';
  
  const lowerCat = String(category).toLowerCase().trim();
  
  // Map to valid enum values
  const categoryMap: Record<string, string> = {
    'protein': 'protein',
    'carbs': 'carbs',
    'carbohydrates': 'carbs',
    'fat': 'fat',
    'vegetable': 'vegetable',
    'vegetables': 'vegetable',
    'fruit': 'fruit',
    'fruits': 'fruit',
    'dairy': 'dairy',
    'beverage': 'beverage',
    'beverages': 'beverage',
    'snack': 'snack',
    'snacks': 'snack',
    'supplement': 'supplement',
    'supplements': 'supplement'
  };
  
  return categoryMap[lowerCat] || 'other';
}

// Run the import function
importFoods()
  .then(() => {
    console.log('Food import completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error during import:', err);
    process.exit(1);
  });