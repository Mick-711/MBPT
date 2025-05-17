import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { foods, insertFoodSchema } from '@shared/schema';
import { db } from '../db';

const router = Router();

// Get all foods
router.get('/', async (req, res) => {
  try {
    const { category, query, public: isPublic } = req.query;
    const userId = req.session.userId;
    
    let foodsList = await storage.getFoods({ 
      category: category as string, 
      query: query as string,
      isPublic: isPublic === 'true',
      userId
    });
    
    res.json(foodsList);
  } catch (error) {
    console.error('Error getting foods:', error);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

// Get a specific food
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    const food = await storage.getFood(id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    res.json(food);
  } catch (error) {
    console.error('Error getting food:', error);
    res.status(500).json({ error: 'Failed to get food' });
  }
});

// Create a new food
router.post('/', async (req, res) => {
  try {
    const foodData = insertFoodSchema.parse({
      ...req.body,
      createdBy: req.session.userId || null
    });
    
    const food = await storage.createFood(foodData);
    res.status(201).json(food);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating food:', error);
    res.status(500).json({ error: 'Failed to create food' });
  }
});

// Batch create foods
router.post('/batch', async (req, res) => {
  try {
    const { foods: foodsData } = req.body;
    
    if (!Array.isArray(foodsData) || foodsData.length === 0) {
      return res.status(400).json({ error: 'Invalid foods data format. Expected array of foods.' });
    }
    
    // Add createdBy to each food
    const foodsWithUser = foodsData.map(food => ({
      ...food,
      createdBy: req.session.userId || null
    }));
    
    const insertedFoods = await storage.createFoodsBatch(foodsWithUser);
    
    res.status(201).json({ 
      success: true, 
      count: insertedFoods.length,
      message: `Successfully imported ${insertedFoods.length} foods`
    });
  } catch (error) {
    console.error('Error batch creating foods:', error);
    res.status(500).json({ error: 'Failed to batch create foods' });
  }
});

// Update a food
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    // Get the food to check ownership
    const existingFood = await storage.getFood(id);
    if (!existingFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    // Only allow updates if the food is owned by the user or admin
    if (existingFood.createdBy && existingFood.createdBy !== req.session.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this food' });
    }
    
    const foodData = req.body;
    const food = await storage.updateFood(id, foodData);
    res.json(food);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete a food
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid food ID' });
    }
    
    // Get the food to check ownership
    const existingFood = await storage.getFood(id);
    if (!existingFood) {
      return res.status(404).json({ error: 'Food not found' });
    }
    
    // Only allow deletion if the food is owned by the user or admin
    if (existingFood.createdBy && existingFood.createdBy !== req.session.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this food' });
    }
    
    await storage.deleteFood(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

export default router;