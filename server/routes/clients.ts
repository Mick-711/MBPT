import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Validation schema for creating a client profile
const createClientProfileSchema = z.object({
  userId: z.number(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  healthInfo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  joinedDate: z.string()
});

// POST /api/clients - Create a client profile
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createClientProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid client profile data', 
        errors: validationResult.error.errors 
      });
    }
    
    const clientData = validationResult.data;
    
    // Check if user exists
    const user = await storage.getUser(clientData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is a client
    if (user.role !== 'client') {
      return res.status(400).json({ message: 'User is not a client' });
    }
    
    // Check if client profile already exists
    const existingProfile = await storage.getClientProfile(clientData.userId);
    if (existingProfile) {
      return res.status(409).json({ message: 'Client profile already exists for this user' });
    }
    
    // Create client profile
    const newClientProfile = await storage.createClientProfile({
      userId: clientData.userId,
      trainerId: null, // Initially no trainer assigned
      height: clientData.height || null,
      weight: clientData.weight || null,
      dateOfBirth: clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : null,
      goals: clientData.goals || null,
      healthInfo: clientData.healthInfo || null,
      notes: clientData.notes || null,
      joinedDate: new Date(clientData.joinedDate),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newClientProfile);
  } catch (error) {
    console.error('Error creating client profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/clients - Get all clients (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    // Only admin can get all clients
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Only administrators can access this endpoint.' });
    }
    
    const clients = await storage.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/clients/:id - Get a specific client profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    
    const clientProfile = await storage.getClientProfileById(clientId);
    
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    
    // Check permissions - clients can only access their own profiles,
    // trainers can access their clients' profiles, admins can access all
    if (!user || 
        (user.role === 'client' && clientProfile.user.id !== user.id) ||
        (user.role === 'trainer' && clientProfile.trainerId !== user.id)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to access this client profile.' });
    }
    
    res.json(clientProfile);
  } catch (error) {
    console.error('Error getting client profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/clients/:id - Update a client profile
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    
    const clientProfile = await storage.getClientProfileById(clientId);
    
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    
    // Check permissions - clients can only update their own profiles,
    // trainers can update their clients' profiles, admins can update all
    if (!user || 
        (user.role === 'client' && clientProfile.user.id !== user.id) ||
        (user.role === 'trainer' && clientProfile.trainerId !== user.id)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to update this client profile.' });
    }
    
    // Update client profile
    const updatedClientProfile = await storage.updateClientProfile(clientProfile.userId, req.body);
    
    res.json(updatedClientProfile);
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/clients/:id/assign - Assign a client to a trainer
router.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const clientId = parseInt(req.params.id);
    const trainerId = req.body.trainerId;
    
    if (isNaN(clientId) || !trainerId) {
      return res.status(400).json({ message: 'Invalid client ID or trainer ID' });
    }
    
    // Only trainers and admins can assign clients
    if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden. Only trainers and administrators can assign clients.' });
    }
    
    // Trainers can only assign clients to themselves
    if (user.role === 'trainer' && trainerId !== user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only assign clients to yourself.' });
    }
    
    const clientProfile = await storage.getClientProfileById(clientId);
    
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    
    // Assign client to trainer
    const updatedClientProfile = await storage.assignClientToTrainer(clientId, trainerId);
    
    res.json(updatedClientProfile);
  } catch (error) {
    console.error('Error assigning client to trainer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;