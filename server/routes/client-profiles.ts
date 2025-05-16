import { Request, Response } from "express";
import { storage } from "../storage";
import { insertClientProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function setupClientProfileRoutes(app: any) {
  // Get all client profiles with their user info
  app.get("/api/client-profiles", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error getting client profiles:", error);
      res.status(500).json({ message: "Failed to fetch client profiles" });
    }
  });

  // Get client profile by user ID
  app.get("/api/client-profiles/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getClientProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error getting client profile:", error);
      res.status(500).json({ message: "Failed to fetch client profile" });
    }
  });

  // Get client profile by profile ID
  app.get("/api/client-profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getClientProfileById(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Client profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error getting client profile:", error);
      res.status(500).json({ message: "Failed to fetch client profile" });
    }
  });

  // Create client profile
  app.post("/api/client-profiles", async (req: Request, res: Response) => {
    try {
      const result = insertClientProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid client profile data", 
          errors: result.error.errors 
        });
      }
      
      const newProfile = await storage.createClientProfile(result.data);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error("Error creating client profile:", error);
      
      // Check for duplicate key error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(400).json({ message: "Client profile already exists for this user" });
      }
      
      res.status(500).json({ message: "Failed to create client profile" });
    }
  });

  // Update client profile
  app.patch("/api/client-profiles/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Define partial client profile schema for updates
      const updateClientProfileSchema = z.object({
        height: z.number().optional(),
        weight: z.number().optional(),
        goals: z.string().optional(),
        healthInfo: z.string().optional(),
        notes: z.string().optional(),
        dateOfBirth: z.date().optional(),
        trainerId: z.number().optional().nullable(),
      });
      
      const result = updateClientProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: result.error.errors 
        });
      }
      
      const updatedProfile = await storage.updateClientProfile(userId, result.data);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating client profile:", error);
      res.status(500).json({ message: "Failed to update client profile" });
    }
  });

  // Assign client to trainer
  app.post("/api/client-profiles/:clientId/assign", async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const { trainerId } = req.body;
      
      if (!trainerId || isNaN(Number(trainerId))) {
        return res.status(400).json({ message: "Invalid trainer ID" });
      }
      
      const updatedProfile = await storage.assignClientToTrainer(clientId, Number(trainerId));
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error assigning client to trainer:", error);
      res.status(500).json({ message: "Failed to assign client to trainer" });
    }
  });
}