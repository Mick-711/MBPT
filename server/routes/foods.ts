import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods, insertFoodSchema } from '@shared/schema';
import { eq, like, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all foods (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    
    let query = db.select().from(foods);
    
    if (search && typeof search === 'string') {
      query = query.where(like(foods.name, `%${search}%`));
    }
    
    if (category && typeof category === 'string') {
      query = query.where(eq(foods.category, category));
    }
    
    const allFoods = await query;
    res.json(allFoods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

// Get a single food by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [food] = await db.select().from(foods).where(eq(foods.id, parseInt(id)));
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

// Create a new food
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = insertFoodSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid food data', details: result.error.format() });
    }
    
    const newFood = {
      ...result.data,
      createdBy: req.session?.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [createdFood] = await db.insert(foods).values(newFood).returning();
    res.status(201).json(createdFood);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Failed to create food' });
  }
});

// Update a food
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foodId = parseInt(id);
    
    // Check if food exists
    const [existingFood] = await db.select().from(foods).where(eq(foods.id, foodId));
    
    if (!existingFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    // Validate input data
    const updateFoodSchema = z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      servingSize: z.number().positive().optional(),
      servingUnit: z.string().optional(),
      calories: z.number().nonnegative().optional(),
      protein: z.number().nonnegative().optional(),
      carbs: z.number().nonnegative().optional(),
      fat: z.number().nonnegative().optional(),
      fiber: z.number().nonnegative().optional(),
      isPublic: z.boolean().optional()
    });
    
    const result = updateFoodSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid food data', details: result.error.format() });
    }
    
    const [updatedFood] = await db.update(foods)
      .set({
        ...result.data,
        updatedAt: new Date()
      })
      .where(eq(foods.id, foodId))
      .returning();
    
    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete a food
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foodId = parseInt(id);
    
    // Check if food exists
    const [existingFood] = await db.select().from(foods).where(eq(foods.id, foodId));
    
    if (!existingFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    await db.delete(foods).where(eq(foods.id, foodId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

// Get food suggestions by category
router.get('/suggestions/by-category', async (req: Request, res: Response) => {
  try {
    // Get popular foods by category
    const proteinFoods = await db
      .select()
      .from(foods)
      .where(eq(foods.category, 'protein'))
      .limit(5);
    
    const carbFoods = await db
      .select()
      .from(foods)
      .where(eq(foods.category, 'carbs'))
      .limit(5);
    
    const fatFoods = await db
      .select()
      .from(foods)
      .where(eq(foods.category, 'fat'))
      .limit(5);
    
    res.json({
      protein: proteinFoods,
      carbs: carbFoods,
      fat: fatFoods
    });
  } catch (error) {
    console.error('Error getting food suggestions:', error);
    res.status(500).json({ error: 'Failed to get food suggestions' });
  }
});

export default router;