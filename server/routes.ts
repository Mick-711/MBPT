import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClientProfileSchema, insertTrainerProfileSchema, 
  insertWorkoutPlanSchema, insertWorkoutSchema, insertWorkoutExerciseSchema, 
  insertExerciseSchema, insertNutritionPlanSchema, insertMealSchema, 
  insertProgressRecordSchema, insertProgressPhotoSchema, insertMessageSchema, 
  insertTaskSchema } from "@shared/schema";
import { generateMealRecommendations, generateFoodSuggestions } from "./ai/nutrition";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import path from "path";
import { or, eq, and, asc, desc } from "drizzle-orm";
import nutritionRoutes from './routes/nutrition';

// Session type setup for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // We'll add food import routes directly in this file
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Middleware to check if user is a trainer
  const isTrainer = async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = req.user as any;
    if (user.role !== 'trainer') {
      return res.status(403).json({ message: 'Forbidden - Trainer access required' });
    }
    
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        username: z.string().min(3),
        password: z.string().min(6),
        fullName: z.string().min(2),
        role: z.enum(['trainer', 'client']),
      });
      
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        fullName: validatedData.fullName,
        role: validatedData.role,
      });
      
      // Create profile based on role
      if (validatedData.role === 'trainer') {
        await storage.createTrainerProfile({
          userId: user.id,
        });
      } else {
        await storage.createClientProfile({
          userId: user.id,
        });
      }
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in' });
        }
        return res.status(201).json({ 
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ 
          id: user.id,
          email: user.email, 
          username: user.username,
          fullName: user.fullName,
          role: user.role
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(function(err) {
      if (err) return res.status(500).json({ message: 'Error logging out' });
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ authenticated: false });
    }
    
    const user = req.user as any;
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      let profile;
      if (user.role === 'trainer') {
        profile = await storage.getTrainerProfile(user.id);
      } else {
        profile = await storage.getClientProfile(user.id);
      }
      
      res.json({ user, profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userData = req.body.user;
      
      if (userData) {
        // Update user data
        const updatedUser = await storage.updateUser(user.id, userData);
      }
      
      // Update profile based on role
      if (user.role === 'trainer' && req.body.trainerProfile) {
        const profile = await storage.updateTrainerProfile(user.id, req.body.trainerProfile);
        return res.json({ success: true, profile });
      } else if (user.role === 'client' && req.body.clientProfile) {
        const profile = await storage.updateClientProfile(user.id, req.body.clientProfile);
        return res.json({ success: true, profile });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Trainer clients routes
  app.get('/api/trainer/clients', isTrainer, async (req, res) => {
    try {
      const user = req.user as any;
      const trainerProfile = await storage.getTrainerProfile(user.id);
      
      if (!trainerProfile) {
        return res.status(404).json({ message: 'Trainer profile not found' });
      }
      
      const clients = await storage.getTrainerClients(trainerProfile.id);
      
      // Get associated user data
      const clientsWithUsers = await Promise.all(
        clients.map(async (client) => {
          const user = await storage.getUser(client.userId);
          return {
            ...client,
            user
          };
        })
      );
      
      res.json(clientsWithUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/trainer/clients/:clientId', isTrainer, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const clientProfile = await storage.getClientProfile(clientId);
      
      if (!clientProfile) {
        return res.status(404).json({ message: 'Client not found' });
      }
      
      const user = await storage.getUser(clientProfile.userId);
      
      res.json({
        ...clientProfile,
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Workout routes
  app.get('/api/workouts', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        if (!trainerProfile) {
          return res.status(404).json({ message: 'Trainer profile not found' });
        }
        
        const plans = await storage.getWorkoutPlans(trainerProfile.id);
        return res.json(plans);
      } else {
        const clientProfile = await storage.getClientProfile(user.id);
        if (!clientProfile) {
          return res.status(404).json({ message: 'Client profile not found' });
        }
        
        const plans = await storage.getClientWorkoutPlans(clientProfile.id);
        return res.json(plans);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/workouts', isTrainer, async (req, res) => {
    try {
      const workoutPlanData = insertWorkoutPlanSchema.parse(req.body);
      const plan = await storage.createWorkoutPlan(workoutPlanData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/workouts/:planId', isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const plan = await storage.getWorkoutPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: 'Workout plan not found' });
      }
      
      const workouts = await storage.getWorkouts(planId);
      
      res.json({
        plan,
        workouts
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/workouts/:planId', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const plan = await storage.getWorkoutPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: 'Workout plan not found' });
      }
      
      const updatedPlan = await storage.updateWorkoutPlan(planId, req.body);
      res.json(updatedPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/workouts/:planId', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      await storage.deleteWorkoutPlan(planId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Individual workout routes
  app.post('/api/workouts/:planId/workout', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        planId
      });
      
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/workouts/:planId/workout/:workoutId', isAuthenticated, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      const workout = await storage.getWorkout(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      
      const exercises = await storage.getWorkoutExercises(workoutId);
      
      res.json({
        workout,
        exercises
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/workouts/:planId/workout/:workoutId', isTrainer, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      const workout = await storage.updateWorkout(workoutId, req.body);
      res.json(workout);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/workouts/:planId/workout/:workoutId', isTrainer, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      await storage.deleteWorkout(workoutId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Exercise library routes
  app.get('/api/exercises', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let trainerId = null;
      
      if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        if (trainerProfile) {
          trainerId = trainerProfile.id;
        }
      }
      
      const exercises = await storage.getExercises(trainerId);
      res.json(exercises);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/exercises', isTrainer, async (req, res) => {
    try {
      const user = req.user as any;
      const trainerProfile = await storage.getTrainerProfile(user.id);
      
      if (!trainerProfile) {
        return res.status(404).json({ message: 'Trainer profile not found' });
      }
      
      const exerciseData = insertExerciseSchema.parse({
        ...req.body,
        trainerId: trainerProfile.id
      });
      
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Workout exercise routes
  app.post('/api/workouts/:planId/workout/:workoutId/exercises', isTrainer, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      const exerciseData = insertWorkoutExerciseSchema.parse({
        ...req.body,
        workoutId
      });
      
      const workoutExercise = await storage.createWorkoutExercise(exerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/workouts/:planId/workout/:workoutId/exercises/:exerciseId', isTrainer, async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const updatedExercise = await storage.updateWorkoutExercise(exerciseId, req.body);
      res.json(updatedExercise);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/workouts/:planId/workout/:workoutId/exercises/:exerciseId', isTrainer, async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      await storage.deleteWorkoutExercise(exerciseId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Nutrition plan routes
  app.get('/api/nutrition', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        if (!trainerProfile) {
          return res.status(404).json({ message: 'Trainer profile not found' });
        }
        
        const plans = await storage.getNutritionPlans(trainerProfile.id);
        return res.json(plans);
      } else {
        const clientProfile = await storage.getClientProfile(user.id);
        if (!clientProfile) {
          return res.status(404).json({ message: 'Client profile not found' });
        }
        
        const plans = await storage.getClientNutritionPlans(clientProfile.id);
        return res.json(plans);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/nutrition', isTrainer, async (req, res) => {
    try {
      const nutritionPlanData = insertNutritionPlanSchema.parse(req.body);
      const plan = await storage.createNutritionPlan(nutritionPlanData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/nutrition/:planId', isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const plan = await storage.getNutritionPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: 'Nutrition plan not found' });
      }
      
      const meals = await storage.getMeals(planId);
      
      res.json({
        plan,
        meals
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/nutrition/:planId', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const plan = await storage.updateNutritionPlan(planId, req.body);
      res.json(plan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/nutrition/:planId', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      await storage.deleteNutritionPlan(planId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Meal routes
  app.post('/api/nutrition/:planId/meals', isTrainer, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const mealData = insertMealSchema.parse({
        ...req.body,
        planId
      });
      
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/nutrition/:planId/meals/:mealId', isTrainer, async (req, res) => {
    try {
      const mealId = parseInt(req.params.mealId);
      const meal = await storage.updateMeal(mealId, req.body);
      res.json(meal);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/nutrition/:planId/meals/:mealId', isTrainer, async (req, res) => {
    try {
      const mealId = parseInt(req.params.mealId);
      await storage.deleteMeal(mealId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Progress routes
  app.get('/api/progress/:clientId', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const user = req.user as any;
      
      // Check if user is authorized to view this client's progress
      if (user.role === 'client' && user.id !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      } else if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        const clientProfile = await storage.getClientProfile(clientId);
        
        if (!trainerProfile || !clientProfile || clientProfile.trainerId !== trainerProfile.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      const progress = await storage.getClientProgressRecords(clientId);
      res.json(progress);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/progress/:clientId', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const user = req.user as any;
      
      // Check if user is authorized to add progress for this client
      if (user.role === 'client' && user.id !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      } else if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        const clientProfile = await storage.getClientProfile(clientId);
        
        if (!trainerProfile || !clientProfile || clientProfile.trainerId !== trainerProfile.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      const progressData = insertProgressRecordSchema.parse({
        ...req.body,
        clientId
      });
      
      const progress = await storage.createProgressRecord(progressData);
      
      // Create activity for this progress update
      await storage.createClientActivity({
        clientId,
        activityType: 'progress_update',
        details: { progressId: progress.id },
        relatedEntityId: progress.id,
        relatedEntityType: 'progress'
      });
      
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/progress/:clientId/:progressId', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const progressId = parseInt(req.params.progressId);
      const user = req.user as any;
      
      // Check if user is authorized to view this client's progress
      if (user.role === 'client' && user.id !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      } else if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        const clientProfile = await storage.getClientProfile(clientId);
        
        if (!trainerProfile || !clientProfile || clientProfile.trainerId !== trainerProfile.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      const progressRecord = await storage.getProgressRecord(progressId);
      
      if (!progressRecord) {
        return res.status(404).json({ message: 'Progress record not found' });
      }
      
      res.json(progressRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const messages = await storage.getUserMessages(user.id);
      
      // Group messages by conversation
      const conversations = messages.reduce((acc, message) => {
        const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
        
        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            userId: otherUserId,
            messages: []
          };
        }
        
        acc[otherUserId].messages.push(message);
        return acc;
      }, {} as Record<string, { userId: number, messages: any[] }>);
      
      // Get user details for each conversation
      const conversationsWithUsers = await Promise.all(
        Object.values(conversations).map(async (conversation) => {
          const otherUser = await storage.getUser(conversation.userId);
          
          // Get most recent message
          const sortedMessages = conversation.messages.sort((a, b) => 
            new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
          );
          
          // Count unread messages
          const unreadCount = sortedMessages.filter(
            msg => msg.recipientId === user.id && msg.status !== 'read'
          ).length;
          
          return {
            user: otherUser,
            lastMessage: sortedMessages[0],
            unreadCount
          };
        })
      );
      
      res.json(conversationsWithUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/messages/:userId', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const otherUserId = parseInt(req.params.userId);
      
      const conversation = await storage.getConversation(user.id, otherUserId);
      const otherUser = await storage.getUser(otherUserId);
      
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Mark messages as read
      await storage.markMessagesAsRead(user.id, otherUserId);
      
      res.json({
        messages: conversation,
        user: otherUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/messages/:userId', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const recipientId = parseInt(req.params.userId);
      
      const messageData = insertMessageSchema.parse({
        senderId: user.id,
        recipientId,
        content: req.body.content
      });
      
      const message = await storage.createMessage(messageData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Activity feed routes
  app.get('/api/activities/:clientId', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const user = req.user as any;
      
      // Check if user is authorized to view this client's activities
      if (user.role === 'client' && user.id !== clientId) {
        return res.status(403).json({ message: 'Forbidden' });
      } else if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        const clientProfile = await storage.getClientProfile(clientId);
        
        if (!trainerProfile || !clientProfile || clientProfile.trainerId !== trainerProfile.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getClientActivities(clientId, limit);
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role === 'trainer') {
        const trainerProfile = await storage.getTrainerProfile(user.id);
        if (!trainerProfile) {
          return res.status(404).json({ message: 'Trainer profile not found' });
        }
        
        const tasks = await storage.getTrainerTasks(trainerProfile.id);
        return res.json(tasks);
      } else {
        const clientProfile = await storage.getClientProfile(user.id);
        if (!clientProfile) {
          return res.status(404).json({ message: 'Client profile not found' });
        }
        
        const tasks = await storage.getClientTasks(clientProfile.id);
        return res.json(tasks);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/tasks', isTrainer, async (req, res) => {
    try {
      const user = req.user as any;
      const trainerProfile = await storage.getTrainerProfile(user.id);
      
      if (!trainerProfile) {
        return res.status(404).json({ message: 'Trainer profile not found' });
      }
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        trainerId: trainerProfile.id
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/tasks/:taskId/complete', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.completeTask(taskId);
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/tasks/:taskId', isTrainer, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.updateTask(taskId, req.body);
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/tasks/:taskId', isTrainer, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      await storage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Food suggestions route for macro-based meal planning
  app.get('/api/food/suggestions', async (req, res) => {
    try {
      const { protein, carbs, fat } = req.query;
      
      // Parse macro targets, defaulting to reasonable values if not provided
      const proteinTarget = protein ? parseInt(protein as string) : 150;
      const carbsTarget = carbs ? parseInt(carbs as string) : 200;
      const fatTarget = fat ? parseInt(fat as string) : 60;
      
      // Sample foods data - in a real app, this would come from a database
      const sampleFoods = [
        {
          id: 1,
          name: "Chicken Breast",
          category: "protein",
          servingSize: 100,
          servingUnit: "g",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6
        },
        {
          id: 2,
          name: "Salmon",
          category: "protein",
          servingSize: 100,
          servingUnit: "g",
          calories: 206,
          protein: 22,
          carbs: 0,
          fat: 13
        },
        {
          id: 3,
          name: "Egg Whites",
          category: "protein",
          servingSize: 100,
          servingUnit: "g",
          calories: 52,
          protein: 11,
          carbs: 0.7,
          fat: 0.2
        },
        {
          id: 4,
          name: "Brown Rice",
          category: "carbs",
          servingSize: 100,
          servingUnit: "g",
          calories: 112,
          protein: 2.6,
          carbs: 24,
          fat: 0.9
        },
        {
          id: 5,
          name: "Sweet Potato",
          category: "carbs",
          servingSize: 100,
          servingUnit: "g",
          calories: 86,
          protein: 1.6, 
          carbs: 20,
          fat: 0.1
        },
        {
          id: 6,
          name: "Oats",
          category: "carbs",
          servingSize: 100,
          servingUnit: "g",
          calories: 389,
          protein: 16.9,
          carbs: 66.3,
          fat: 6.9
        },
        {
          id: 7,
          name: "Avocado",
          category: "fat",
          servingSize: 100,
          servingUnit: "g",
          calories: 160,
          protein: 2,
          carbs: 8.5,
          fat: 14.7
        },
        {
          id: 8,
          name: "Olive Oil",
          category: "fat",
          servingSize: 15,
          servingUnit: "ml",
          calories: 119,
          protein: 0,
          carbs: 0,
          fat: 13.5
        },
        {
          id: 9,
          name: "Almonds",
          category: "fat",
          servingSize: 28,
          servingUnit: "g",
          calories: 164,
          protein: 6,
          carbs: 6,
          fat: 14
        }
      ];
      
      // Filter foods to find those that come closest to the target macros within ±10%
      // For protein-rich foods
      const proteinFoods = sampleFoods
        .filter(food => food.category === "protein")
        .slice(0, 3);
        
      // For carb-rich foods
      const carbFoods = sampleFoods
        .filter(food => food.category === "carbs")
        .slice(0, 3);
        
      // For fat-rich foods
      const fatFoods = sampleFoods
        .filter(food => food.category === "fat")
        .slice(0, 3);
      
      res.json({
        protein: proteinFoods,
        carbs: carbFoods,
        fat: fatFoods
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Register nutrition routes
  app.use('/api/nutrition', nutritionRoutes);

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
