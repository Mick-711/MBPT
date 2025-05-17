import { Router } from 'express';
import foodRoutes from './foods';
import nuttabRoutes from './nuttab';

const router = Router();

// Register all API routes
router.use('/foods', foodRoutes);
router.use('/nuttab', nuttabRoutes);

export default router;