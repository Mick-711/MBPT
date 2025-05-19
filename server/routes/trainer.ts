// server/routes/trainer.ts
import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Extend Request type to include client and trainer profiles
declare global {
  namespace Express {
    interface Request {
      clientProfile?: any;
      trainerProfile?: any;
    }
  }
}

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
// Helper middleware to check trainer-client relationship
const validateTrainerClientRelationship = async (req: Request, res: Response, next: Function) => {
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

    // Add the client profile to the request object for use in route handlers
    req.clientProfile = clientProfile;
    req.trainerProfile = trainerProfile;
    
    next();
  } catch (error) {
    console.error('Error in validateTrainerClientRelationship middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/trainer/clients/:clientId/workouts - Get workouts for a specific client
router.get('/clients/:clientId/workouts', validateTrainerClientRelationship, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
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
router.get('/clients/:clientId/nutrition', validateTrainerClientRelationship, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
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
router.get('/clients/:clientId/progress', validateTrainerClientRelationship, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const clientProfile = req.clientProfile;
    
    // Get client progress records
    const progressRecords = await storage.getClientProgressRecords(clientId);
    
    // Return progress records with client info
    res.json({
      client: clientProfile,
      progressRecords
    });
  } catch (error) {
    console.error('Error fetching client progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/trainer/clients/:clientId/messages - Get conversation between trainer and client
router.get('/clients/:clientId/messages', validateTrainerClientRelationship, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const clientProfile = req.clientProfile;
    
    // Get conversation between trainer and client
    const messages = await storage.getConversation(user.id, clientProfile.userId);
    
    // Mark messages from client as read
    await storage.markMessagesAsRead(user.id, clientProfile.userId);
    
    // Return messages with client info
    res.json({
      client: clientProfile,
      messages
    });
  } catch (error) {
    console.error('Error fetching client messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;