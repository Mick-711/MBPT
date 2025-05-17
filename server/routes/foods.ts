import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods, insertFoodSchema } from '@shared/schema';

const router = Router();

// Get all foods
router.get('/', async (req: Request, res: Response) => {
  try {
    const allFoods = await db.select().from(foods);
    res.json(allFoods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

// Search foods
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    const searchTerm = `%${query}%`;
    
    const results = await db.select()
      .from(foods)
      .where(sql => sql`LOWER(${foods.name}) LIKE LOWER(${searchTerm}) OR LOWER(${foods.category}::text) LIKE LOWER(${searchTerm})`);
    
    res.json(results);
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

// Get food by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await db.select().from(foods).where(sql => sql`${foods.id} = ${parseInt(id)}`).limit(1);
    
    if (food.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food[0]);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

// Create new food
router.post('/', async (req: Request, res: Response) => {
  try {
    const foodData = req.body;
    
    // Validate the request body
    const parsed = insertFoodSchema.safeParse(foodData);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid food data', details: parsed.error });
    }
    
    // Set created_by to the current user if authenticated
    if (req.session?.userId) {
      foodData.createdBy = req.session.userId;
    }
    
    const [newFood] = await db.insert(foods).values(foodData).returning();
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Failed to create food' });
  }
});

// Import multiple foods (batch insert)
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { foods: foodsToImport } = req.body;
    
    if (!Array.isArray(foodsToImport) || foodsToImport.length === 0) {
      return res.status(400).json({ error: 'Invalid food data. Expected array of foods.' });
    }

    // Set created_by to the current user if authenticated
    if (req.session?.userId) {
      foodsToImport.forEach(food => {
        food.createdBy = req.session.userId;
      });
    }
    
    const newFoods = await db.insert(foods).values(foodsToImport).returning();
    res.status(201).json(newFoods);
  } catch (error) {
    console.error('Error importing foods:', error);
    res.status(500).json({ error: 'Failed to import foods' });
  }
});

// Update food
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedFood] = await db
      .update(foods)
      .set({ ...updateData, updatedAt: new Date() })
      .where(sql => sql`${foods.id} = ${parseInt(id)}`)
      .returning();
    
    if (!updatedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete food
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [deletedFood] = await db
      .delete(foods)
      .where(sql => sql`${foods.id} = ${parseInt(id)}`)
      .returning();
    
    if (!deletedFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

export default router;