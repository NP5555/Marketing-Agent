import { Router } from 'express';
import authRoutes from './auth.routes';
import offerRoutes from './offers.routes';
import linkRoutes from './links.routes';
import botConfigRoutes from './botConfig.routes';
import projectSettingsRoutes from './projectSettings';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes
router.use('/offers', authMiddleware, offerRoutes);
router.use('/links', authMiddleware, linkRoutes);
router.use('/bot-config', authMiddleware, botConfigRoutes);
router.use('/project-settings', authMiddleware, projectSettingsRoutes);

export default router; 