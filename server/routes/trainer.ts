// server/routes/trainer.ts
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// GET /api/trainer/clients - Get all clients for a trainer
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    // Get trainer profile to get the trainer ID
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Get all clients for this trainer
    const clients = await storage.getTrainerClients(trainerProfile.id);
    
    // Format response
    res.json(clients);
  } catch (error) {
    console.error('Error fetching trainer clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId - Get specific client details
router.get('/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Get trainer profile
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Get client profile
    const clientProfile = await storage.getClientProfileById(clientId);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify this client belongs to the trainer
    if (clientProfile.trainerId !== trainerProfile.id) {
      return res.status(403).json({ message: 'Forbidden. This client is not assigned to you.' });
    }

    // Return client details
    res.json(clientProfile);
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId/workouts - Get workouts for a specific client
router.get('/clients/:clientId/workouts', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Get trainer profile
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Get client profile
    const clientProfile = await storage.getClientProfileById(clientId);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify this client belongs to the trainer
    if (clientProfile.trainerId !== trainerProfile.id) {
      return res.status(403).json({ message: 'Forbidden. This client is not assigned to you.' });
    }

    // Get client workout plans
    const workoutPlans = await storage.getClientWorkoutPlans(clientId);
    
    // Return workout plans
    res.json(workoutPlans);
  } catch (error) {
    console.error('Error fetching client workouts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId/nutrition - Get nutrition plans for a specific client
router.get('/clients/:clientId/nutrition', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Get trainer profile
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Get client profile
    const clientProfile = await storage.getClientProfileById(clientId);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify this client belongs to the trainer
    if (clientProfile.trainerId !== trainerProfile.id) {
      return res.status(403).json({ message: 'Forbidden. This client is not assigned to you.' });
    }

    // Get client nutrition plans
    const nutritionPlans = await storage.getClientNutritionPlans(clientId);
    
    // Return nutrition plans
    res.json(nutritionPlans);
  } catch (error) {
    console.error('Error fetching client nutrition plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId/progress - Get progress records for a specific client
router.get('/clients/:clientId/progress', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Get trainer profile
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Get client profile
    const clientProfile = await storage.getClientProfileById(clientId);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify this client belongs to the trainer
    if (clientProfile.trainerId !== trainerProfile.id) {
      return res.status(403).json({ message: 'Forbidden. This client is not assigned to you.' });
    }

    // Get client progress records
    const progressRecords = await storage.getClientProgressRecords(clientId);
    
    // Return progress records
    res.json(progressRecords);
  } catch (error) {
    console.error('Error fetching client progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId/messages - Get conversation between trainer and client
router.get('/clients/:clientId/messages', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden. Only trainers can access this endpoint.' });
    }

    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Get client profile
    const clientProfile = await storage.getClientProfileById(clientId);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get trainer profile
    const trainerProfile = await storage.getTrainerProfile(user.id);
    if (!trainerProfile) {
      return res.status(404).json({ message: 'Trainer profile not found' });
    }

    // Verify this client belongs to the trainer
    if (clientProfile.trainerId !== trainerProfile.id) {
      return res.status(403).json({ message: 'Forbidden. This client is not assigned to you.' });
    }

    // Get conversation between trainer and client
    const messages = await storage.getConversation(user.id, clientProfile.userId);
    
    // Return messages
    res.json(messages);
  } catch (error) {
    console.error('Error fetching client messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;