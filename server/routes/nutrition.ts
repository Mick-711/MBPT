import { Router } from 'express';
import { db } from '../db';
import { foods } from '../../shared/schema';
import { sql, eq, ilike, and, desc, asc } from 'drizzle-orm';
import { foodCategoryEnum } from '../../shared/schema';

const router = Router();

// Get paginated foods with optional search and category filter
router.get('/foods', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const sort = req.query.sort as string || 'name';
    const order = req.query.order as string || 'asc';
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    
    if (search) {
      conditions.push(ilike(foods.name, `%${search}%`));
    }
    
    if (category && category !== 'all') {
      // Use as const to ensure type safety
      const categoryValue = category as typeof foodCategoryEnum.enumValues[number];
      conditions.push(eq(foods.category, categoryValue));
    }
    
    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(foods)
      .where(conditions.length ? and(...conditions) : undefined);
    
    const totalItems = totalCountResult[0].count;
    
    // Get foods
    const foodsResult = await db
      .select()
      .from(foods)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(
        sort === 'calories' ? foods.calories : 
        sort === 'protein' ? foods.protein : 
        sort === 'carbs' ? foods.carbs : 
        sort === 'fat' ? foods.fat : 
        foods.name, 
        order === 'desc' ? desc : asc
      );
    
    res.json({
      foods: foodsResult,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit)
    });
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

// Get food by ID
router.get('/foods/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const food = await db.select().from(foods).where(eq(foods.id, id)).limit(1);
    
    if (food.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food[0]);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

// Get unique food categories with counts
router.get('/food-categories', async (req, res) => {
  try {
    const categoryResults = await db
      .select({
        category: foods.category,
        count: sql<number>`count(*)`
      })
      .from(foods)
      .groupBy(foods.category);
    
    res.json(categoryResults);
  } catch (error) {
    console.error('Error fetching food categories:', error);
    res.status(500).json({ error: 'Failed to fetch food categories' });
  }
});

export default router;