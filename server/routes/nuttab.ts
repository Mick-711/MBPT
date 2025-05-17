import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods, insertFoodSchema } from '@shared/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// This is our simplified NUTTAB database API endpoint
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Mock NUTTAB food data for demonstration
    const mockNuttabFoods = [
      {
        id: 1001,
        name: "Beef, ground, lean",
        category: "protein",
        servingSize: 100,
        servingUnit: "g",
        calories: 250,
        protein: 26.1,
        carbs: 0,
        fat: 17.2,
        fiber: 0
      },
      {
        id: 1002,
        name: "Chicken breast, skinless",
        category: "protein",
        servingSize: 100,
        servingUnit: "g",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0
      },
      {
        id: 1003,
        name: "Salmon, Atlantic, raw",
        category: "protein",
        servingSize: 100,
        servingUnit: "g",
        calories: 206,
        protein: 22.1,
        carbs: 0,
        fat: 13.4,
        fiber: 0
      },
      {
        id: 2001,
        name: "Rice, brown, cooked",
        category: "carbs",
        servingSize: 100,
        servingUnit: "g",
        calories: 112,
        protein: 2.6,
        carbs: 24,
        fat: 0.9,
        fiber: 1.8
      },
      {
        id: 2002,
        name: "Sweet potato, baked",
        category: "carbs",
        servingSize: 100,
        servingUnit: "g",
        calories: 90,
        protein: 2,
        carbs: 20.7,
        fat: 0.2,
        fiber: 3.3
      },
      {
        id: 3001,
        name: "Broccoli, raw",
        category: "vegetable",
        servingSize: 100,
        servingUnit: "g",
        calories: 34,
        protein: 2.8,
        carbs: 6.6,
        fat: 0.4,
        fiber: 2.6
      },
      {
        id: 4001,
        name: "Apple, with skin",
        category: "fruit",
        servingSize: 100,
        servingUnit: "g",
        calories: 52,
        protein: 0.3,
        carbs: 13.8,
        fat: 0.2,
        fiber: 2.4
      },
      {
        id: 6001,
        name: "Almonds, raw",
        category: "nuts",
        servingSize: 28,
        servingUnit: "g",
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14,
        fiber: 3.5
      }
    ];
    
    // Filter foods based on search query
    const lowercaseQuery = query.toLowerCase();
    const searchResults = mockNuttabFoods.filter(food => 
      food.name.toLowerCase().includes(lowercaseQuery) || 
      food.category.toLowerCase().includes(lowercaseQuery)
    );
    
    res.json({ foods: searchResults });
  } catch (error) {
    console.error('Error searching NUTTAB database:', error);
    res.status(500).json({ error: 'Failed to search NUTTAB database' });
  }
});

// Import NUTTAB foods into our database
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { foods: foodsToImport } = req.body;
    
    if (!Array.isArray(foodsToImport) || foodsToImport.length === 0) {
      return res.status(400).json({ error: 'Invalid food data. Expected array of foods.' });
    }

    // Transform to match our database schema
    const transformedFoods = foodsToImport.map(food => ({
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      isPublic: true,
      createdBy: req.session?.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert foods into database
    const newFoods = await db.insert(foods).values(transformedFoods).returning();
    
    res.status(201).json({ 
      message: `Successfully imported ${newFoods.length} foods`, 
      foods: newFoods 
    });
  } catch (error) {
    console.error('Error importing NUTTAB foods:', error);
    res.status(500).json({ error: 'Failed to import foods to database' });
  }
});

export default router;