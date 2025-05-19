// scripts/importFoodService.ts
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { db } from '../server/db';
import { foods, InsertFood, foodCategoryEnum } from '../shared/schema';

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
  // First check if the key exists directly
  if (validCategories.has(key)) {
    return key as typeof foodCategoryEnum.enumValues[keyof typeof foodCategoryEnum.enumValues];
  }
  // If not, return 'other' as a fallback
  return 'other';
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) Main import function - now exported for API use
// ────────────────────────────────────────────────────────────────────────────────
export interface ImportFoodResult {
  success: boolean;
  summary: {
    total: number;
    valid: number;
    inserted: number;
    skipped: number;
    errors: number;
    durationSeconds: number;
  };
  errorDetails?: any[];
  errorMessage?: string;
}

/**
 * Process and import food data from a buffer (XLSX file)
 * Used by both CLI script and API endpoint
 */
export async function importFoodsFromBuffer(buffer: Buffer): Promise<ImportFoodResult> {
  const startTime = Date.now();
  
  try {
    // Read workbook from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<unknown>(sheet);
    
    // Check for existing foods to avoid duplicates
    const existingFoods = await db.select({ name: foods.name }).from(foods);
    const existingFoodNames = new Set(existingFoods.map(f => f.name.toLowerCase().trim()));
    
    // Validate & transform all rows
    const validRows: InsertFood[] = [];
    const skippedDuplicates: string[] = [];
    const errors: { row: number; issues: z.ZodIssue[] | string }[] = [];
    
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
    
    // Batch insert in transactions
    let inserted = 0;
    const batchCount = Math.ceil(validRows.length / BATCH_SIZE);
    
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      
      try {
        await db.transaction(async (tx) => {
          await tx
            .insert(foods)
            .values(batch)
            .onConflictDoNothing({ target: foods.name });
          
          inserted += batch.length;
        });
      } catch (err) {
        // Continue with next batch if one fails
        console.error(`Error in batch:`, err instanceof Error ? err.message : err);
      }
    }
    
    // Calculate duration
    const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
    
    // Create result object
    const result: ImportFoodResult = {
      success: true,
      summary: {
        total: rawRows.length,
        valid: validRows.length,
        inserted,
        skipped: skippedDuplicates.length,
        errors: errors.length,
        durationSeconds
      }
    };
    
    // Add error details if there are any
    if (errors.length > 0) {
      result.errorDetails = errors;
    }
    
    return result;
    
  } catch (err) {
    return {
      success: false,
      summary: {
        total: 0,
        valid: 0,
        inserted: 0,
        skipped: 0,
        errors: 1,
        durationSeconds: Number(((Date.now() - startTime) / 1000).toFixed(2))
      },
      errorMessage: err instanceof Error ? err.message : "Unknown error occurred"
    };
  }
}