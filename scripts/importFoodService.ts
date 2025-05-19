// scripts/importFoodService.ts
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { db } from '../server/db';
import { foods, foodCategoryEnum } from '../shared/schema';
import { v4 as uuidv4 } from 'uuid';

// ────────────────────────────────────────────────────────────────────────────────
// Food row validation schema
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
    .nullable()
    .transform((str) => str ? str
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean) : []
    ),
});

// Helper function to normalize categories
function normalizeCategory(cat?: string): typeof foodCategoryEnum.enumValues[number] {
  if (!cat) return 'other';
  
  const input = String(cat).toLowerCase().trim();
  
  // Match against common food categories
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
  
  // Check if it's already a valid category
  const validCategories = new Set(Object.values(foodCategoryEnum.enumValues));
  return validCategories.has(input as any) ? input as any : 'other';
}

// Export interfaces for the import process
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

export interface ImportJobStatus extends ImportFoodResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
}

// Map to track import jobs
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
    jobId?: string;
    updateProgress?: (progress: number) => void;
  } = {}
): Promise<ImportFoodResult> {
  const startTime = Date.now();
  const jobId = options.jobId || uuidv4();
  const batchSize = options.batchSize || 50;
  
  // Track job status if a jobId is provided
  if (options.jobId) {
    importJobs.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 0,
      success: false,
      validCount: 0,
      insertedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      durationSeconds: 0
    });
  }
  
  // Update progress function
  const updateProgress = (progress: number) => {
    if (options.updateProgress) {
      options.updateProgress(progress);
    }
    
    if (options.jobId) {
      const job = importJobs.get(jobId);
      if (job) {
        job.progress = progress;
      }
    }
  };
  
  // Initialize result object
  const result: ImportFoodResult = {
    success: false,
    validCount: 0,
    insertedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    durationSeconds: 0,
    errorDetails: []
  };
  
  try {
    // Parse the Excel file
    updateProgress(5);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    
    updateProgress(10);
    
    // Validate rows
    const validRows: any[] = [];
    const errors: { row: number; issues: z.ZodIssue[] }[] = [];
    
    rawRows.forEach((raw, index) => {
      const result = FoodRowSchema.safeParse(raw);
      if (!result.success) {
        errors.push({ row: index + 2, issues: result.error.issues });
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
          brand: row.brand || null,
          tags: row.tags,
        });
      }
      
      // Update progress for validation phase (10% to 40%)
      if (index % 10 === 0) {
        updateProgress(10 + Math.floor((index / rawRows.length) * 30));
      }
    });
    
    updateProgress(40);
    result.validCount = validRows.length;
    result.errorCount = errors.length;
    result.errorDetails = errors;
    
    // Insert valid rows in batches
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      try {
        const insertResult = await db
          .insert(foods)
          .values(batch)
          .onConflictDoNothing({ target: foods.name });
        
        const batchInserted = Number(insertResult.rowCount);
        inserted += batchInserted;
        skipped += batch.length - batchInserted;
        
        // Update progress for insertion phase (40% to 90%)
        updateProgress(40 + Math.floor((i / validRows.length) * 50));
      } catch (err) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, err);
        result.errorDetails?.push({
          row: i + 1,
          issues: `Database error: ${(err as Error).message}`,
        });
      }
    }
    
    // Final result
    result.insertedCount = inserted;
    result.skippedCount = skipped;
    result.success = true;
    result.durationSeconds = (Date.now() - startTime) / 1000;
    
    updateProgress(100);
    
    // Update job status if tracking
    if (options.jobId) {
      const job = importJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.success = result.success;
        job.validCount = result.validCount;
        job.insertedCount = result.insertedCount;
        job.skippedCount = result.skippedCount;
        job.errorCount = result.errorCount;
        job.durationSeconds = result.durationSeconds;
        job.errorDetails = result.errorDetails;
      }
    }
    
    return result;
  } catch (err) {
    const errorMessage = (err as Error).message;
    result.success = false;
    result.errorMessage = errorMessage;
    result.durationSeconds = (Date.now() - startTime) / 1000;
    
    // Update job status if tracking
    if (options.jobId) {
      const job = importJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.success = false;
        job.errorMessage = errorMessage;
        job.durationSeconds = result.durationSeconds;
      }
    }
    
    return result;
  }
}