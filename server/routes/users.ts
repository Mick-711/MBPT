import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function setupUserRoutes(app: any) {
  // Get all users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers(req.query.role?.toString());
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create new user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(result.data.password, salt);
      
      const userData = {
        ...result.data,
        password: hashedPassword
      };
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Check for duplicate key error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        if (error.message.includes("email")) {
          return res.status(400).json({ message: "Email already in use" });
        }
        if (error.message.includes("username")) {
          return res.status(400).json({ message: "Username already in use" });
        }
      }
      
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Define partial user schema for updates
      const updateUserSchema = z.object({
        email: z.string().email().optional(),
        username: z.string().min(3).optional(),
        fullName: z.string().min(2).optional(),
        role: z.enum(["trainer", "client", "admin"]).optional(),
        profileImage: z.string().optional().nullable(),
        password: z.string().min(6).optional(),
      });
      
      const result = updateUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: result.error.errors 
        });
      }
      
      // If updating password, hash it
      let userData = { ...result.data };
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
}