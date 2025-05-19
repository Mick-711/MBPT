import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';

const router = Router();

// Validation schema for creating a user
const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['trainer', 'client', 'admin']),
  profileImage: z.string().optional().nullable()
});

// POST /api/users - Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid user data', 
        errors: validationResult.error.errors 
      });
    }
    
    const userData = validationResult.data;
    
    // Check if user with email already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Check if user with username already exists
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'User with this username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      profileImage: userData.profileImage || null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Remove password from response
    const { password, ...userResponse } = newUser;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    // Only admin can get all users
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Only administrators can access this endpoint.' });
    }
    
    const role = req.query.role as string | undefined;
    const users = await storage.getUsers(role);
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/:id - Get a specific user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const requestingUser = req.user as any;
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Users can only access their own data, trainers can access their clients, admins can access all
    if (!requestingUser || 
        (requestingUser.id !== userId && 
         requestingUser.role !== 'admin' && 
         !(requestingUser.role === 'trainer' && await isClientOfTrainer(userId, requestingUser.id)))) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to access this user.' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper to check if a client belongs to a trainer
async function isClientOfTrainer(clientUserId: number, trainerUserId: number): Promise<boolean> {
  try {
    const trainerProfile = await storage.getTrainerProfile(trainerUserId);
    if (!trainerProfile) return false;
    
    const clientProfile = await storage.getClientProfile(clientUserId);
    if (!clientProfile) return false;
    
    return clientProfile.trainerId === trainerProfile.id;
  } catch (error) {
    console.error('Error checking trainer-client relationship:', error);
    return false;
  }
}

export default router;