// scripts/importNutritionData.ts
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { db } from '../server/db';
import { foods, foodCategoryEnum } from '../shared/schema';

// ────────────────────────────────────────────────────────────────────────────────
// 1) Zod schema for a single food row
// ────────────────────────────────────────────────────────────────────────────────
const FoodRowSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  servingSize: z.preprocess(
    (val) => Number(val ?? 100),
    z.number().positive()
  ),
  servingUnit: z.string().optional().default('g'),
  calories: z.preprocess(val => Number(val), z.number().nonnegative()),
  protein: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  carbs: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  fat: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  fiber: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  sugar: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  sodium: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  cholesterol: z.preprocess(val => Number(val), z.number().nonnegative()).optional().default(0),
  brand: z.string().optional().nullable(),
  tags: z
    .string()
    .optional()
    .transform((str) => str ? str
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean) : []
    ),
});

// ────────────────────────────────────────────────────────────────────────────────
// 2) Helpers & constants
// ────────────────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 50;
const validCategories = new Set(
  Object.values(foodCategoryEnum.enumValues)
);

function normalizeCategory(cat?: string) {
  if (!cat) return 'other';
  
  // Basic category mapping
  const input = cat.toString().toLowerCase().trim();
  
  // Match against common categories
  if (/meat|fish|chicken|beef|pork|lamb|poultry|turkey|egg/i.test(input)) {
    return 'protein';
  } else if (/bread|rice|pasta|cereal|grain|wheat|corn|oat/i.test(input)) {
    return 'carbs';
  } else if (/oil|butter|margarine|lard|cream|fat/i.test(input)) {
    return 'fat';
  } else if (/milk|yogurt|cheese|cream|dairy/i.test(input)) {
    return 'dairy';
  } else if (/apple|orange|banana|berry|fruit|pear|grape|melon/i.test(input)) {
    return 'fruit';
  } else if (/vegetable|veg|carrot|broccoli|spinach|lettuce|cabbage/i.test(input)) {
    return 'vegetable';
  } else if (/juice|water|tea|coffee|drink|beverage|soda|wine|beer/i.test(input)) {
    return 'beverage';
  } else if (/snack|chip|crisp|cracker|cookie|biscuit/i.test(input)) {
    return 'snack';
  } else if (/vitamin|supplement|mineral|protein powder/i.test(input)) {
    return 'supplement';
  }
  
  // Default fallback
  return validCategories.has(input) ? input : 'other';
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) Main import function
// ────────────────────────────────────────────────────────────────────────────────
async function importNutritionData() {
  const filePath = path.join(__dirname, '../data/nutrient_file.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('Creating data directory...');
    
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
      fs.mkdirSync(path.join(__dirname, '../data'));
    }
    
    console.log('Please place the nutrient file at:', filePath);
    return;
  }
  
  console.log(`📥 Loading Excel file: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  console.log(`📊 Processing ${rawRows.length} rows from Excel file...`);

  // Validate & transform all rows
  const validRows: any[] = [];
  const errors: { row: number; issues: z.ZodIssue[] }[] = [];

  rawRows.forEach((raw, i) => {
    const result = FoodRowSchema.safeParse(raw);
    if (!result.success) {
      errors.push({ row: i + 2, issues: result.error.issues });
    } else {
      const row = result.data;
      validRows.push({
        name: row.name.trim(),
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
    }
  });

  console.log(`✔️  ${validRows.length} rows valid, ${errors.length} rows invalid`);
  if (errors.length > 0) {
    console.warn('Invalid row details written to errors.json');
    fs.writeFileSync('import-errors.json', JSON.stringify(errors, null, 2));
  }

  // Batch insert in transactions
  let inserted = 0;
  let skipped = 0;
  
  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    try {
      const result = await db
        .insert(foods)
        .values(batch)
        .onConflictDoNothing({ target: foods.name });
      
      const batchInserted = Number(result.rowCount);
      inserted += batchInserted;
      skipped += batch.length - batchInserted;
      
      console.log(`➡️  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${batchInserted}/${batch.length} items`);
    } catch (err) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, err);
    }
  }

  console.log('\n🎉 Import complete!');
  console.log(`   Total valid rows  : ${validRows.length}`);
  console.log(`   Total inserted    : ${inserted}`);
  console.log(`   Total skipped     : ${skipped}`);
  console.log(`   Total errors      : ${errors.length}`);
}

// Run the script
importNutritionData().catch((err) => {
  console.error('❌ Fatal import error:', err);
  process.exit(1);
});