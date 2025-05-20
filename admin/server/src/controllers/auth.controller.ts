import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Login a user with email and password
 * @route POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(error.message, 401);
    }

    res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the current user
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError('User not authenticated', 401);
    }

    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}; 