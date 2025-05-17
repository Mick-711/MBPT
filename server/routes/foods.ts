import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { foods, insertFoodSchema, type InsertFood } from '@shared/schema';
import { eq, like, desc } from 'drizzle-orm';

const router = Router();

// Get all foods
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, limit = '50' } = req.query;
    
    let query = db.select().from(foods);
    
    // Filter by category if provided
    if (category) {
      query = query.where(eq(foods.category, category as string));
    }
    
    // Filter by search term if provided
    if (search) {
      query = query.where(like(foods.name, `%${search}%`));
    }
    
    // Order by recently added
    query = query.orderBy(desc(foods.createdAt));
    
    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum)) {
        query = query.limit(limitNum);
      }
    }
    
    const results = await query;
    
    res.json({ foods: results });
  } catch (error) {
    console.error('Error getting foods:', error);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

// Get food by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ food });
  } catch (error) {
    console.error('Error getting food:', error);
    res.status(500).json({ error: 'Failed to get food' });
  }
});

// Create a new food
router.post('/', async (req: Request, res: Response) => {
  try {
    const foodData = req.body;
    
    // Get user ID from session if available
    const userId = req.session?.userId;
    
    // Validate the food data
    const validatedFood = insertFoodSchema.parse({
      ...foodData,
      createdBy: userId || null
    });
    
    // Insert the food into the database
    const [newFood] = await db.insert(foods).values(validatedFood).returning();
    
    res.status(201).json({ food: newFood });
  } catch (error) {
    console.error('Error creating food:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create food' });
  }
});

// Batch create foods (for NUTTAB import)
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { foods: foodsList } = req.body;
    
    if (!Array.isArray(foodsList) || foodsList.length === 0) {
      return res.status(400).json({ error: 'Invalid foods data. Expected an array of foods.' });
    }
    
    console.log(`Processing batch import of ${foodsList.length} foods`);
    
    // Get user ID from session if available
    const userId = req.session?.userId;
    
    // Prepare the foods data with createdBy field
    const foodsData = foodsList.map(food => ({
      ...food,
      createdBy: userId || null
    }));
    
    // Insert the foods in batches to avoid potential issues with very large imports
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < foodsData.length; i += batchSize) {
      const batch = foodsData.slice(i, i + batchSize);
      const batchResults = await db.insert(foods).values(batch).returning();
      results.push(...batchResults);
      console.log(`Imported batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(foodsData.length / batchSize)}`);
    }
    
    res.status(201).json({ 
      success: true,
      message: `Successfully imported ${results.length} foods`,
      totalProcessed: results.length,
      foods: results.slice(0, 10) // Return just the first 10 to keep response size manageable
    });
  } catch (error) {
    console.error('Error batch creating foods:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to batch create foods' });
  }
});

// Update food
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const foodData = req.body;
    
    // Update the food in the database
    const [updatedFood] = await db.update(foods)
      .set({
        ...foodData,
        updatedAt: new Date()
      })
      .where(eq(foods.id, id))
      .returning();
    
    if (!updatedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ food: updatedFood });
  } catch (error) {
    console.error('Error updating food:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete food
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const [deletedFood] = await db.delete(foods)
      .where(eq(foods.id, id))
      .returning();
    
    if (!deletedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ message: 'Food deleted successfully', food: deletedFood });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

export default router;