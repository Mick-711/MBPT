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
const DEFAULT_BATCH_SIZE = 100;

// Create a mapping of lowercase category names to their proper cased values
const validCategoriesMap = Object.values(foodCategoryEnum.enumValues)
  .reduce((map, cat) => ({ 
    ...map, 
    [cat.toLowerCase()]: cat 
  }), {} as Record<string, typeof foodCategoryEnum.enumValues[keyof typeof foodCategoryEnum.enumValues]>);

function normalizeCategory(cat?: string): typeof foodCategoryEnum.enumValues[keyof typeof foodCategoryEnum.enumValues] {
  if (!cat) return 'other';
  const key = cat.toString().toLowerCase();
  return validCategoriesMap[key] || 'other';
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) Main import function - now exported for API use
// ────────────────────────────────────────────────────────────────────────────────
export interface ImportFoodResult {
  success: boolean;
  validCount: number;
  insertedCount: number;
  skippedCount: number;
  errorCount: number;
  durationSeconds: number;
  errorDetails?: Array<{ 
    row: number; 
    issues: z.ZodIssue[] | string | Array<{ message: string; path: string[] }> 
  }>;
  errorMessage?: string;
}

// For tracking job progress
export interface ImportJobStatus extends ImportFoodResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
}

// In-memory store for import jobs
export const importJobs = new Map<string, ImportJobStatus>();

/**
 * Process and import food data from a buffer (XLSX file)
 * Used by both CLI script and API endpoint
 * 
 * @param buffer The Excel file as buffer
 * @param options Options for the import process
 * @returns Import results
 */
export async function importFoodsFromBuffer(
  buffer: Buffer, 
  options: { 
    batchSize?: number; 
    dryRun?: boolean;
    jobId?: string;
    updateProgress?: (progress: number) => void;
  } = {}
): Promise<ImportFoodResult> {
  const startTime = Date.now();
  
  // Destructure options at the top with defaults
  const { 
    batchSize = DEFAULT_BATCH_SIZE, 
    dryRun = false, 
    jobId, 
    updateProgress 
  } = options;
  
  // Create non-shadowed progress reporter
  const reportProgress = (pct: number) => {
    if (jobId && importJobs.has(jobId)) {
      const job = importJobs.get(jobId)!;
      job.progress = pct;
      importJobs.set(jobId, job);
    }
    if (updateProgress) {
      updateProgress(pct);
    }
  };
  
  // Report initial progress
  reportProgress(0);
  
  try {
    // Read workbook from buffer
    reportProgress(10);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<unknown>(sheet);
    
    // Check for existing foods to avoid duplicates
    reportProgress(20);
    const existingFoods = await db.select({ name: foods.name }).from(foods);
    const existingFoodNames = new Set(existingFoods.map(f => f.name.toLowerCase().trim()));
    
    // Validate & transform all rows
    reportProgress(30);
    const validRows: InsertFood[] = [];
    const skippedDuplicates: string[] = [];
    const errors: ImportFoodResult['errorDetails'] = [];
    
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
    
    // If dryRun, don't actually insert the data
    let inserted = 0;
    
    if (!dryRun) {
      reportProgress(50);
      
      // Batch insert in transactions
      const batchCount = Math.ceil(validRows.length / batchSize);
      const totalRows = validRows.length;
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize);
        
        try {
          await db.transaction(async (tx) => {
            const result = await tx
              .insert(foods)
              .values(batch)
              .onConflictDoNothing({ target: foods.name });
            
            // Get actual count of inserted rows if available
            inserted += result.rowCount ?? batch.length;
          });
        } catch (err) {
          console.error(`Error in batch ${batchIndex + 1}:`, err instanceof Error ? err.message : err);
        }
        
        // Update progress after each batch with more granular reporting
        const currentProgress = Math.round(50 + ((i + batch.length) / totalRows * 50));
        reportProgress(Math.min(99, currentProgress)); // Cap at 99% until complete
      }
      
      // Mark as 100% complete after all batches
      reportProgress(100);
    } else {
      // For dry runs, mark as 100% complete
      reportProgress(100);
    }
    
    // Calculate duration
    const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
    
    // Create result object
    const result: ImportFoodResult = {
      success: true,
      validCount: validRows.length,
      insertedCount: inserted,
      skippedCount: skippedDuplicates.length,
      errorCount: errors.length,
      durationSeconds
    };
    
    // Add error details if there are any
    if (errors.length > 0) {
      result.errorDetails = errors;
    }
    
    return result;
    
  } catch (err) {
    return {
      success: false,
      validCount: 0,
      insertedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      durationSeconds: Number(((Date.now() - startTime) / 1000).toFixed(2)),
      errorMessage: err instanceof Error ? err.message : "Unknown error occurred",
      errorDetails: [{ 
        row: 0, 
        issues: [{ message: err instanceof Error ? err.message : "Unknown error", path: [] }] 
      }]
    };
  }
}