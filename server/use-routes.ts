import { Express } from 'express';
import foodsRoutes from './routes/foods';

export function useRoutes(app: Express): void {
  // Register all API routes
  app.use('/api/foods', foodsRoutes);
  
  // Add more route registrations as needed
}