import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods } from '@shared/schema';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const acceptedFileTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (acceptedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${acceptedFileTypes.join(', ')} files are allowed.`));
  }
};

// Configure multer with error handling
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Function to map NUTTAB category to our food categories
function mapToFoodCategory(nuttabCategory: string): string {
  if (!nuttabCategory) return 'other';
  
  const categoryMap: Record<string, string> = {
    'meat': 'protein',
    'poultry': 'protein', 
    'fish': 'protein',
    'seafood': 'protein',
    'egg': 'protein',
    'legume': 'protein',
    'grain': 'carbs',
    'bread': 'carbs',
    'cereal': 'carbs',
    'rice': 'carbs',
    'pasta': 'carbs',
    'fruit': 'fruit',
    'vegetable': 'vegetable',
    'dairy': 'dairy',
    'milk': 'dairy',
    'cheese': 'dairy',
    'yoghurt': 'dairy',
    'yogurt': 'dairy',
    'nut': 'nuts',
    'seed': 'seeds',
    'oil': 'fat',
    'butter': 'fat',
    'margarine': 'fat'
  };
  
  // Try to find a match by substring
  const lowerCategory = nuttabCategory.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  
  return 'other';
}

// NUTTAB Excel file upload endpoint
router.post('/', (req: any, res: any) => {
  upload(req, res, async function(err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    
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
      
      // Process the data and map to our food schema
      const processedFoods = data.map((row: any, index: number) => {
        // Extract fields based on common NUTTAB column names (flexible matching)
        const name = row['Food Name'] || row['Name'] || row['FOOD_NAME'] || row['Food_Name'] || row['food_name'] || `NUTTAB Food ${index}`;
        const category = row['Food Group'] || row['Category'] || row['FOOD_GROUP'] || row['Food_Group'] || row['food_group'] || 'other';
        const servingSize = parseFloat(row['Serving Size'] || row['SERVE_SIZE'] || row['Serve_Size'] || row['serving_size'] || '100') || 100;
        const servingUnit = row['Serving Unit'] || row['SERVE_UNIT'] || row['Serve_Unit'] || row['serving_unit'] || 'g';
        
        // Convert kJ to kcal if energy is in kJ
        let calories = 0;
        if (row['Energy (kJ)'] || row['ENERGY (kJ)'] || row['Energy']) {
          const energyValue = parseFloat(row['Energy (kJ)'] || row['ENERGY (kJ)'] || row['Energy'] || '0');
          calories = energyValue / 4.184; // Convert kJ to kcal
        } else if (row['Calories'] || row['CALORIES'] || row['calories']) {
          calories = parseFloat(row['Calories'] || row['CALORIES'] || row['calories'] || '0');
        }
        
        // Extract macronutrients
        const protein = parseFloat(row['Protein (g)'] || row['Protein'] || row['PROTEIN'] || row['protein'] || '0') || 0;
        const carbs = parseFloat(row['Carbohydrate (g)'] || row['Carbs'] || row['CARBOHYDRATE'] || row['carbs'] || row['carbohydrate'] || '0') || 0;
        const fat = parseFloat(row['Fat, total (g)'] || row['Fat'] || row['FAT'] || row['fat'] || '0') || 0;
        const fiber = parseFloat(row['Fibre (g)'] || row['Fiber (g)'] || row['Fiber'] || row['FIBRE'] || row['fibre'] || row['fiber'] || '0') || 0;
        const sugar = parseFloat(row['Sugars (g)'] || row['Sugar (g)'] || row['Sugar'] || row['SUGARS'] || row['sugar'] || row['sugars'] || '0') || 0;
        const sodium = parseFloat(row['Sodium (mg)'] || row['SODIUM'] || row['sodium'] || '0') || 0;
        
        return {
          name: name,
          brand: 'NUTTAB',
          category: mapToFoodCategory(category),
          servingSize,
          servingUnit,
          calories: Math.round(calories * 10) / 10, // Round to 1 decimal place
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          sugar: Math.round(sugar * 10) / 10,
          sodium: Math.round(sodium),
          isPublic: true,
          createdBy: req.user?.id || null
        };
      });
      
      // Insert the foods in batches
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < processedFoods.length; i += batchSize) {
        const batch = processedFoods.slice(i, i + batchSize);
        const insertResult = await db.insert(foods).values(batch).returning();
        results.push(...insertResult);
        console.log(`Imported batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(processedFoods.length / batchSize)}`);
      }
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({ 
        success: true,
        message: `Successfully imported ${results.length} foods from NUTTAB data`,
        foods: results.slice(0, 10) // Return just a sample to keep response size reasonable
      });
    } catch (error) {
      console.error('Error processing NUTTAB file:', error);
      res.status(500).json({ error: 'Failed to process NUTTAB file', details: error.message });
    }
  });
});

export default router;