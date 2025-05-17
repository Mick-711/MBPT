import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods } from '@shared/schema';
import { eq, like } from 'drizzle-orm';

const router = Router();

// Get all foods
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allFoods = await db.select().from(foods).limit(100);
    res.json({ foods: allFoods });
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

// Get food by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await db.select().from(foods).where(eq(foods.id, parseInt(id)));
    
    if (food.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ food: food[0] });
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

// Search foods by name or category
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchResults = await db
      .select()
      .from(foods)
      .where(like(foods.name, `%${query}%`))
      .limit(50);
    
    res.json({ foods: searchResults });
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

// Create a new food
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      category,
      servingSize,
      servingUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      isPublic,
      createdBy
    } = req.body;
    
    // Validate required fields
    if (!name || !servingSize || !servingUnit || calories === undefined || 
        protein === undefined || carbs === undefined || fat === undefined) {
      return res.status(400).json({ error: 'Missing required food information' });
    }
    
    const [newFood] = await db.insert(foods).values({
      name,
      brand,
      category,
      servingSize,
      servingUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      isPublic,
      createdBy
    }).returning();
    
    res.status(201).json({ food: newFood });
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Failed to create food' });
  }
});

// Update a food
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedFood] = await db
      .update(foods)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(foods.id, parseInt(id)))
      .returning();
    
    if (!updatedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ food: updatedFood });
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete a food
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(foods).where(eq(foods.id, parseInt(id)));
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

// Get food suggestions by category
router.get('/suggestions/by-category', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // Handle the category as a string that needs to be parsed as an enum value
    const suggestions = await db
      .select()
      .from(foods)
      .where(eq(foods.category, category as any))
      .limit(20);
    
    res.json({ foods: suggestions });
  } catch (error) {
    console.error('Error fetching food suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch food suggestions' });
  }
});

export default router;