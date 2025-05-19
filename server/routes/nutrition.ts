// server/routes/nutrition.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods } from '../../shared/schema';
import { sql, eq, ilike, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { importFoodsFromBuffer, importJobs } from '../../scripts/importFoodService';
import { foodCategoryEnum } from '../../shared/schema';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/nutrition/foods - Get foods with filtering, sorting, and pagination
// Public access endpoint - no authentication required
router.get('/foods', (req: Request, res: Response, next) => {
  // Skip authentication for this public endpoint
  if (!req.isAuthenticated()) {
    // Continue even if not authenticated - public access
    return next();
  }
  return next();
}, async (req: Request, res: Response) => {
  try {
    // parse & normalize query-params
    const {
      category = 'all',
      search   = '',
      sortBy   = 'name',
      sortDir  = 'asc',
      page     = '1',
      pageSize = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit   = Math.min(100, parseInt(pageSize, 10) || 20);
    const offset  = (pageNum - 1) * limit;

    // build filter conditions
    const conditions: any[] = [];
    if (category !== 'all' && foodCategoryEnum.enumValues.includes(category as any)) {
      conditions.push(eq(foods.category, category as any));
    }
    if (search.trim()) {
      conditions.push(ilike(foods.name, `%${search.trim()}%`));
    }

    // total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(foods)
      .where(conditions.length ? and(...conditions) : undefined);
    
    const count = Number(totalResult[0].count);

    // sorting
    const orderCol = sortBy === 'calories'
      ? foods.calories
      : foods.name;
    const orderDir = sortDir.toLowerCase() === 'desc'
      ? desc(orderCol)
      : asc(orderCol);

    // fetch page
    const items = await db
      .select()
      .from(foods)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderDir)
      .limit(limit)
      .offset(offset);

    return res.json({
      total:  Number(count),
      page:   pageNum,
      pageSize: limit,
      items,
    });
  } catch (err: any) {
    console.error('Error in GET /api/nutrition/foods:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/foods/categories - Get all food categories
router.get('/foods/categories', async (_req: Request, res: Response) => {
  try {
    const categories = foodCategoryEnum.enumValues;
    res.json({ categories });
  } catch (err: any) {
    console.error('Error in GET /api/nutrition/foods/categories:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/nutrition/foods/import - Import foods from Excel file
router.post('/foods/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Check file type
    if (!req.file.mimetype.includes('spreadsheet') && 
        !req.file.mimetype.includes('excel') && 
        !req.file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.' 
      });
    }
    
    // Create a job ID for tracking
    const jobId = uuidv4();
    
    // Start the import process in the background
    setTimeout(async () => {
      try {
        await importFoodsFromBuffer(req.file!.buffer, { jobId });
      } catch (err) {
        console.error('Background import error:', err);
        const job = importJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.success = false;
          job.errorMessage = (err as Error).message;
        }
      }
    }, 0);
    
    // Return the job ID immediately
    res.status(202).json({ 
      message: 'Import started',
      jobId
    });
  } catch (err: any) {
    console.error('Error in POST /api/nutrition/foods/import:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/foods/import/:jobId - Get import job status
router.get('/foods/import/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const job = importJobs.get(jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Import job not found' });
    }
    
    res.json(job);
  } catch (err: any) {
    console.error('Error in GET /api/nutrition/foods/import/:jobId:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/foods/:id - Get a specific food item by ID
router.get('/foods/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const foodItem = await db
      .select()
      .from(foods)
      .where(eq(foods.id, id))
      .limit(1);
      
    if (!foodItem || foodItem.length === 0) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    res.json(foodItem[0]);
  } catch (err: any) {
    console.error('Error in GET /api/nutrition/foods/:id:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;