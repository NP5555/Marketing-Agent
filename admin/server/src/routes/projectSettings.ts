import express from 'express';
import { getProjectSettings, updateProjectSettings } from '../controllers/projectSettingsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get project settings
router.get('/', authMiddleware, getProjectSettings);

// Update project settings
router.post('/', authMiddleware, updateProjectSettings);

export default router; 