import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { supabase } from '../utils/supabase';

// Extended Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware that validates JWT tokens from Supabase
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Unauthorized - No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Use Supabase to verify the token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw new ApiError('Unauthorized - Invalid token', 401);
    }
    
    // Get user role from custom claims or user metadata
    const role = data.user.app_metadata?.role || 'user';
    
    // Attach user info to the request
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      role
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError('Unauthorized - User not authenticated', 401);
      }
      
      const { role } = req.user;
      
      if (!allowedRoles.includes(role)) {
        throw new ApiError('Forbidden - Insufficient permissions', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}; 