import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods } from '../../shared/schema';
import { sql, eq, ilike, and, desc, asc } from 'drizzle-orm';
import { foodCategoryEnum } from '../../shared/schema';

const router = Router();

// GET /api/nutrition/foods
router.get('/foods', async (req, res) => {
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
    const orderCol = (sortBy === 'calories' ? foods.calories : foods.name) as any;
    const orderDir = sortDir.toLowerCase() === 'desc' ? desc(orderCol) : asc(orderCol);

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