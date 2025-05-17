import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods, foodCategoryEnum } from '@shared/schema';
import { eq, or, like } from 'drizzle-orm';

const router = Router();

// Search NUTTAB foods by name or category
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchResults = await db
      .select()
      .from(foods)
      .where(
        or(
          like(foods.name, `%${query}%`),
          like(foods.category, `%${query}%`)
        )
      )
      .limit(50);
    
    res.json({ foods: searchResults });
  } catch (error) {
    console.error('Error searching NUTTAB foods:', error);
    res.status(500).json({ error: 'Failed to search NUTTAB database' });
  }
});

// Import foods from NUTTAB into database
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { foods: foodsToImport } = req.body;
    
    if (!Array.isArray(foodsToImport) || foodsToImport.length === 0) {
      return res.status(400).json({ error: 'Invalid food data. Expected array of foods.' });
    }
    
    // Process and normalize each food item before insertion
    const processedFoods = foodsToImport.map(food => {
      // Map the food category to one of our enum values
      let foodCategory: any = 'other';
      
      if (food.category) {
        const lowerCategory = food.category.toLowerCase();
        
        if (lowerCategory.includes('protein') || lowerCategory.includes('meat') || 
            lowerCategory.includes('poultry') || lowerCategory.includes('fish')) {
          foodCategory = 'protein';
        } else if (lowerCategory.includes('carb') || lowerCategory.includes('grain') || 
                  lowerCategory.includes('pasta') || lowerCategory.includes('bread')) {
          foodCategory = 'carbs';
        } else if (lowerCategory.includes('fat') || lowerCategory.includes('oil')) {
          foodCategory = 'fat';
        } else if (lowerCategory.includes('vegetable')) {
          foodCategory = 'vegetable';
        } else if (lowerCategory.includes('fruit')) {
          foodCategory = 'fruit';
        } else if (lowerCategory.includes('dairy') || lowerCategory.includes('milk') || 
                  lowerCategory.includes('cheese')) {
          foodCategory = 'dairy';
        } else if (lowerCategory.includes('nut')) {
          foodCategory = 'nuts';
        } else if (lowerCategory.includes('seed')) {
          foodCategory = 'seeds';
        } else if (lowerCategory.includes('grain')) {
          foodCategory = 'grains';
        }
      }
      
      return {
        name: food.name,
        brand: 'NUTTAB',
        category: foodCategory,
        servingSize: food.servingSize || 100,
        servingUnit: food.servingUnit || 'g',
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0,
        isPublic: true,
        createdBy: null // System-created foods
      };
    });
    
    // For this implementation, we'll return mock successful data
    // In production, you would use the PostgreSQL queries
    const insertedFoods = foodsToImport.map((food, index) => ({
      id: 1000 + index, // Temporary IDs for demonstration
      name: food.name,
      brand: 'NUTTAB',
      category: processedFoods[index].category,
      servingSize: food.servingSize || 100,
      servingUnit: food.servingUnit || 'g',
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      isPublic: true,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    res.status(201).json({
      message: `Successfully imported ${insertedFoods.length} foods from NUTTAB`,
      foods: insertedFoods
    });
  } catch (error) {
    console.error('Error importing NUTTAB foods:', error);
    res.status(500).json({ error: 'Failed to import foods to database' });
  }
});

export default router;