// scripts/importFoods.ts
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { db } from '../server/db';
import { foods, InsertFood, foodCategoryEnum } from '../shared/schema';
import { eq } from 'drizzle-orm';

// ────────────────────────────────────────────────────────────────────────────────
// 1) Zod schema for a single row
// ────────────────────────────────────────────────────────────────────────────────
const FoodRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  servingSize: z.preprocess(
    (val) => Number(val ?? 100),
    z.number().positive()
  ),
  servingUnit: z.string().optional().default('g'),
  calories: z.preprocess(Number, z.number().nonnegative()),
  protein: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  carbs: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  fat: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  fiber: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  sugar: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  sodium: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  cholesterol: z.preprocess(Number, z.number().nonnegative()).optional().default(0),
  brand: z.string().optional().nullable(),
  tags: z
    .string()
    .optional()
    .transform((str) => 
      str 
        ? str.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    ),
  isPublic: z.boolean().optional().default(true),
});

// ────────────────────────────────────────────────────────────────────────────────
// 2) Helpers & constants
// ────────────────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 100;
const validCategories = new Set(
  Object.values(foodCategoryEnum.enumValues)
);

function normalizeCategory(cat?: string): typeof foodCategoryEnum.enumValues[keyof typeof foodCategoryEnum.enumValues] {
  if (!cat) return 'other';
  const key = cat.toString().toLowerCase();
  return validCategories.has(key) ? key as any : 'other';
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) Main import function
// ────────────────────────────────────────────────────────────────────────────────
async function importFoods() {
  const startTime = Date.now();
  const filePath = path.join(__dirname, '../data/food_items.xlsx');
  
  console.log(`📥 Loading Excel file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<unknown>(sheet);
  
  console.log(`📊 Processing ${rawRows.length} rows from Excel file`);

  // Check for existing foods to avoid duplicates
  console.log(`🔍 Checking for existing foods in database`);
  const existingFoods = await db.select({ name: foods.name }).from(foods);
  const existingFoodNames = new Set(existingFoods.map(f => f.name.toLowerCase().trim()));
  console.log(`ℹ️ Found ${existingFoodNames.size} existing foods`);

  // Validate & transform all rows
  const validRows: InsertFood[] = [];
  const skippedDuplicates: string[] = [];
  const errors: { row: number; issues: z.ZodIssue[] | string }[] = [];

  console.log(`🔄 Validating and processing rows...`);
  rawRows.forEach((raw: any, i) => {
    try {
      const result = FoodRowSchema.safeParse(raw);
      
      if (!result.success) {
        errors.push({ row: i + 2, issues: result.error.issues });
        return;
      }
      
      const row = result.data;
      const foodName = row.name.trim();
      
      // Skip existing foods
      if (existingFoodNames.has(foodName.toLowerCase())) {
        skippedDuplicates.push(foodName);
        return;
      }
      
      validRows.push({
        name: foodName,
        category: normalizeCategory(row.category),
        servingSize: row.servingSize,
        servingUnit: row.servingUnit,
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        fiber: row.fiber,
        sugar: row.sugar,
        sodium: row.sodium,
        cholesterol: row.cholesterol,
        isPublic: true,
        brand: row.brand ?? null,
        tags: row.tags,
      });
    } catch (err) {
      errors.push({ 
        row: i + 2, 
        issues: err instanceof Error ? err.message : "Unknown error" 
      });
    }
  });

  console.log(`✅ ${validRows.length} rows valid, ${errors.length} rows invalid, ${skippedDuplicates.length} duplicates skipped`);
  
  // Write error details to file if any errors occurred
  if (errors.length > 0) {
    const logDir = path.join(__dirname, '../data');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const errorLogPath = path.join(logDir, 'food-import-errors.json');
    console.warn(`⚠️ Invalid row details written to ${errorLogPath}`);
    fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
  }

  // Batch insert in transactions
  let inserted = 0;
  const batchCount = Math.ceil(validRows.length / BATCH_SIZE);
  
  console.log(`\n📦 Inserting food data in ${batchCount} batches of up to ${BATCH_SIZE} items each`);
  
  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    try {
      await db.transaction(async (tx) => {
        await tx
          .insert(foods)
          .values(batch)
          .onConflictDoNothing({ target: foods.name });
        
        inserted += batch.length;
        console.log(`➡️ Batch ${batchNum}/${batchCount}: inserted ${batch.length} foods (${inserted}/${validRows.length} total)`);
      });
    } catch (err) {
      console.error(`❌ Error in batch ${batchNum}:`, err instanceof Error ? err.message : err);
    }
  }

  // Calculate duration
  const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n🎉 Import complete!');
  console.log(`⏱️ Total time       : ${durationSeconds} seconds`);
  console.log(`📋 Total rows       : ${rawRows.length}`);
  console.log(`✅ Valid rows       : ${validRows.length}`);
  console.log(`📥 Inserted         : ${inserted}`);
  console.log(`🔄 Skipped duplicates: ${skippedDuplicates.length}`);
  console.log(`❌ Errors           : ${errors.length}`);
  
  // Generate detailed log
  const importLog = {
    timestamp: new Date().toISOString(),
    stats: {
      total: rawRows.length,
      valid: validRows.length,
      inserted,
      skipped: skippedDuplicates.length,
      errors: errors.length,
      durationSeconds
    },
    skippedItems: skippedDuplicates
  };
  
  const logPath = path.join(__dirname, '../data/food-import-log.json');
  fs.writeFileSync(logPath, JSON.stringify(importLog, null, 2));
  console.log(`📝 Detailed log saved to ${logPath}`);
}

// Run the import function
importFoods()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal import error:', err);
    process.exit(1);
  });