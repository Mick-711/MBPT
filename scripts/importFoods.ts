import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { foods, InsertFood, foodCategoryEnum } from '../shared/schema';
import { db } from '../server/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Script to import food data from an Excel file into the database
 * Usage: npx tsx scripts/importFoods.ts
 */
async function importFoods() {
  // Track import statistics
  const stats = {
    total: 0,
    inserted: 0,
    skipped: 0,
    errors: 0,
    startTime: Date.now()
  };
  
  // Set batch size for bulk inserts
  const BATCH_SIZE = 100;

  try {
    // Load the Excel file from the data directory
    const excelFilePath = path.join(__dirname, '../data/food_items.xlsx');
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found at: ${excelFilePath}`);
    }
    
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json<any>(worksheet);
    console.log(`Found ${rows.length} rows in Excel file`);
    stats.total = rows.length;
    
    // Get all valid food categories
    const validCategories = Object.values(foodCategoryEnum.enumValues);
    
    // Create a Zod schema for validation
    const FoodSchema = z.object({
      name: z.string().min(1, "Name is required"),
      category: z.enum(validCategories as [string, ...string[]]).default('other'),
      servingSize: z.number().positive().default(100),
      servingUnit: z.string().min(1).default('g'),
      calories: z.number().int().nonnegative(),
      protein: z.number().default(0),
      carbs: z.number().default(0),
      fat: z.number().default(0),
      fiber: z.number().default(0),
      sugar: z.number().default(0),
      sodium: z.number().default(0),
      cholesterol: z.number().default(0),
      isPublic: z.boolean().default(true),
      trainerId: z.number().optional().nullable(),
      brand: z.string().optional().nullable(),
      tags: z.array(z.string()).default([])
    });
    
    // Get existing food names to check for duplicates
    console.log("Fetching existing food names to check for duplicates...");
    const existingFoods = await db.select({ name: foods.name }).from(foods);
    const existingFoodNames = new Set(existingFoods.map(f => f.name.toLowerCase()));
    console.log(`Found ${existingFoodNames.size} existing foods`);
    
    // Process rows in batches
    const batches = [];
    const invalidRows = [];
    const currentBatch: InsertFood[] = [];
    
    for (const [index, row] of rows.entries()) {
      try {
        // Map Excel columns to Food model format
        const mappedRow = {
          name: String(row.name || '').trim(),
          category: String(row.category || '').toLowerCase(),
          servingSize: parseFloat(row.servingSize) || 100,
          servingUnit: row.servingUnit || 'g',
          calories: parseInt(row.calories, 10) || 0,
          protein: parseFloat(row.protein) || 0,
          carbs: parseFloat(row.carbs) || 0,
          fat: parseFloat(row.fat) || 0,
          fiber: parseFloat(row.fiber) || 0,
          sugar: parseFloat(row.sugar) || 0,
          sodium: parseFloat(row.sodium) || 0,
          cholesterol: parseFloat(row.cholesterol) || 0,
          isPublic: true,
          brand: row.brand || null,
          tags: row.tags ? String(row.tags).split(',').map((tag: string) => tag.trim()) : []
        };
        
        // Validate the mapped row
        const result = FoodSchema.safeParse(mappedRow);
        
        if (!result.success) {
          throw new Error(`Validation failed: ${result.error.message}`);
        }
        
        // Check for duplicates
        if (existingFoodNames.has(mappedRow.name.toLowerCase())) {
          console.log(`[Row ${index + 1}] Food "${mappedRow.name}" already exists, skipping`);
          stats.skipped++;
          continue;
        }
        
        // Add to current batch
        currentBatch.push(mappedRow);
        
        // If we've reached batch size, or this is the last item, push the batch
        if (currentBatch.length >= BATCH_SIZE || index === rows.length - 1) {
          if (currentBatch.length > 0) {
            batches.push([...currentBatch]);
            currentBatch.length = 0; // Clear the array
          }
        }
        
        // Log progress every 50 rows
        if ((index + 1) % 50 === 0 || index === rows.length - 1) {
          console.log(`Progress: ${index + 1}/${rows.length} (${Math.round((index + 1) / rows.length * 100)}%)`);
        }
      } catch (err) {
        console.error(`[Row ${index + 1}] Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        invalidRows.push({ index: index + 1, row, error: err instanceof Error ? err.message : 'Unknown error' });
        stats.errors++;
      }
    }
    
    // Insert batches within a transaction
    console.log(`\nInserting ${batches.reduce((sum, batch) => sum + batch.length, 0)} foods in ${batches.length} batches...`);
    
    for (const [batchIndex, batch] of batches.entries()) {
      try {
        await db.transaction(async (tx) => {
          // Insert using onConflictDoNothing to handle any race conditions
          const result = await tx.insert(foods).values(batch).onConflictDoNothing({ target: foods.name });
          stats.inserted += batch.length;
          console.log(`Batch ${batchIndex + 1}/${batches.length}: Inserted ${batch.length} foods`);
        });
      } catch (err) {
        console.error(`Error inserting batch ${batchIndex + 1}:`, err);
        stats.errors += batch.length;
        
        // Fallback: try inserting one by one if batch fails
        console.log("Attempting to insert foods one by one...");
        for (const food of batch) {
          try {
            await db.transaction(async (tx) => {
              await tx.insert(foods).values(food).onConflictDoNothing({ target: foods.name });
              stats.inserted++;
              stats.errors--;
            });
          } catch (innerErr) {
            console.error(`Failed to insert food "${food.name}":`, innerErr);
          }
        }
      }
    }
    
    // Calculate duration
    const durationSeconds = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n========================');
    console.log('IMPORT SUMMARY');
    console.log('========================');
    console.log(`Total rows processed: ${stats.total}`);
    console.log(`Successfully inserted: ${stats.inserted}`);
    console.log(`Skipped (duplicates): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Duration: ${durationSeconds} seconds`);
    console.log('========================');
    
    // Write logs to file
    const logData = {
      timestamp: new Date().toISOString(),
      stats,
      invalidRows
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../data/food_import_log.json'),
      JSON.stringify(logData, null, 2)
    );
    
    console.log('Import log written to data/food_import_log.json');
    
  } catch (err) {
    console.error('Failed to import food data:', err);
    process.exit(1);
  }
}

// Run the import function
importFoods()
  .then(() => {
    console.log('Food import completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error during import:', err);
    process.exit(1);
  });