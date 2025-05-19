// server/routes/publicNutrition.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { foods } from '../../shared/schema';
import { sql, eq, ilike, and, desc, asc } from 'drizzle-orm';
import { foodCategoryEnum } from '../../shared/schema';

const router = Router();

// GET /api/public/nutrition/foods - Public endpoint for food database
router.get('/foods', async (req: Request, res: Response) => {
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
    const orderCol = sortBy === 'calories'
      ? foods.calories
      : foods.name;
    const orderDir = sortDir.toLowerCase() === 'desc'
      ? desc(orderCol)
      : asc(orderCol);

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
    console.error('Error in GET /api/public/nutrition/foods:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/nutrition/foods/categories - Get all food categories
router.get('/foods/categories', async (_req: Request, res: Response) => {
  try {
    const categories = foodCategoryEnum.enumValues;
    res.json({ categories });
  } catch (err: any) {
    console.error('Error in GET /api/public/nutrition/foods/categories:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;