import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { db } from '../db';
import { foods, foodCategoryEnum } from '@shared/schema';
import path from 'path';
import { promises as fs } from 'fs';
import { and, eq, sql } from 'drizzle-orm';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err, uploadDir));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for Excel files only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel and CSV files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Helper to map NUTTAB category to our food categories
function mapToFoodCategory(nuttabCategory: string): typeof foodCategoryEnum.enumValues[number] {
  const categoryMap: Record<string, typeof foodCategoryEnum.enumValues[number]> = {
    // Map common NUTTAB food groups to our categories
    'Meat': 'protein',
    'Poultry': 'protein',
    'Fish': 'protein',
    'Seafood': 'protein',
    'Egg': 'protein',
    'Legumes': 'protein',
    'Grain': 'carbs',
    'Bread': 'carbs',
    'Cereal': 'carbs',
    'Rice': 'carbs',
    'Pasta': 'carbs',
    'Fruit': 'fruit',
    'Vegetable': 'vegetable',
    'Dairy': 'dairy',
    'Milk': 'dairy',
    'Cheese': 'dairy',
    'Yoghurt': 'dairy',
    'Nuts': 'nuts',
    'Seeds': 'seeds',
    'Oil': 'fat',
    'Butter': 'fat',
    'Margarine': 'fat'
  };
  
  // Search for partial matches in the category
  for (const [key, value] of Object.entries(categoryMap)) {
    if (nuttabCategory.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'other';
}

// Upload endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log(`Processing file: ${req.file.path}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows of data`);
    
    // Verify the data structure
    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file contains no data' });
    }
    
    // Process the data
    const processedFoods = [];
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as any;
        
        // Extract fields (adjust field names based on your Excel structure)
        const name = row['Food Name'] || row['Name'] || row['FOOD_NAME'];
        const category = row['Food Group'] || row['Category'] || row['FOOD_GROUP'] || 'Other';
        const servingSize = parseFloat(row['Serving Size'] || row['SERVE_SIZE'] || '100') || 100;
        const servingUnit = row['Serving Unit'] || row['SERVE_UNIT'] || 'g';
        const calories = parseFloat(row['Energy (kJ)'] || row['Energy'] || row['ENERGY']) / 4.184 || 0; // Convert kJ to kcal
        const protein = parseFloat(row['Protein (g)'] || row['Protein'] || row['PROTEIN']) || 0;
        const carbs = parseFloat(row['Carbohydrate (g)'] || row['Carbs'] || row['CARBOHYDRATE']) || 0;
        const fat = parseFloat(row['Fat, total (g)'] || row['Fat'] || row['FAT']) || 0;
        const fiber = parseFloat(row['Fibre (g)'] || row['Fiber'] || row['FIBRE']) || 0;
        const sugar = parseFloat(row['Sugars (g)'] || row['Sugar'] || row['SUGARS']) || 0;
        const sodium = parseFloat(row['Sodium (mg)'] || row['Sodium'] || row['SODIUM']) || 0;
        
        if (!name) {
          throw new Error(`Row ${i + 1}: Food name is required`);
        }
        
        processedFoods.push({
          name,
          brand: 'NUTTAB',
          category: mapToFoodCategory(category) as any,
          servingSize,
          servingUnit,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium,
          isPublic: true,
          createdBy: null
        });
      } catch (error) {
        errors.push(`Error in row ${i + 1}: ${(error as Error).message}`);
      }
    }
    
    console.log(`Processed ${processedFoods.length} foods with ${errors.length} errors`);
    
    if (processedFoods.length === 0) {
      return res.status(400).json({ 
        error: 'No valid food data could be processed',
        details: errors
      });
    }
    
    // Insert the foods into database
    const insertedFoods = [];
    const insertErrors = [];
    
    // Bulk insert is faster but we'll handle individual errors too
    try {
      const result = await db.insert(foods)
        .values(processedFoods)
        .returning();
      
      insertedFoods.push(...result);
      console.log(`Bulk inserted ${result.length} foods`);
    } catch (error) {
      console.error('Bulk insert failed, trying individually:', error);
      
      // If bulk insert fails, try one by one
      for (const food of processedFoods) {
        try {
          // Check if food already exists with same name and brand
          const existingFoods = await db.select()
            .from(foods)
            .where(
              and(
                eq(foods.name, food.name),
                eq(foods.brand, 'NUTTAB')
              )
            );
          
          if (existingFoods.length > 0) {
            console.log(`Food "${food.name}" already exists, skipping`);
            continue;
          }
          
          const [insertedFood] = await db.insert(foods)
            .values(food)
            .returning();
            
          if (insertedFood) {
            insertedFoods.push(insertedFood);
          }
        } catch (insertError) {
          insertErrors.push(`Error inserting "${food.name}": ${(insertError as Error).message}`);
        }
      }
    }
    
    // Clean up the temporary file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
    
    res.status(201).json({
      message: `Successfully imported ${insertedFoods.length} foods from NUTTAB`,
      totalProcessed: processedFoods.length,
      success: insertedFoods.length,
      errors: insertErrors.length,
      errorDetails: insertErrors.length > 0 ? insertErrors : undefined
    });
    
  } catch (error) {
    console.error('Error processing file upload:', error);
    
    // Clean up if there was an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process the uploaded file',
      message: (error as Error).message 
    });
  }
});

export default router;