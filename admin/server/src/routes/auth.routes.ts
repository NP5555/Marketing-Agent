import { Router } from 'express';
import { body } from 'express-validator';
import { loginUser, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginUser
);

// Get current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

export default router; 