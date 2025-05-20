import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Generate a random 8-character code
const generateCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Get all referral links
 * @route GET /api/links
 */
export const getLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a link by code
 * @route GET /api/links/:code
 */
export const getLinkByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('Link not found', 404);
      }
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new referral link
 * @route POST /api/links
 */
export const createLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      throw new ApiError('User not authenticated', 401);
    }

    const { code: providedCode } = req.body;
    const code = providedCode || generateCode();

    // Check if code already exists
    if (providedCode) {
      const { data: existingLink } = await supabase
        .from('referral_links')
        .select('code')
        .eq('code', code)
        .single();

      if (existingLink) {
        throw new ApiError('Code already in use', 400);
      }
    }

    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        code,
        creator_id: req.user.id,
        click_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a referral link
 * @route DELETE /api/links/:code
 */
export const deleteLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    const { error } = await supabase
      .from('referral_links')
      .delete()
      .eq('code', code);

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Export links to CSV
 * @route GET /api/links/export
 */
export const exportLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 500);
    }

    // Convert to CSV format
    const headers = ['code', 'creator_id', 'click_count', 'created_at'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const item of data) {
      const values = headers.map(header => {
        const val = item[header];
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=referral_links.csv');
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * Import links from CSV
 * @route POST /api/links/import
 */
export const importLinks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError('User not authenticated', 401);
    }

    // This is a stub implementation - in a real app, you would:
    // 1. Parse the uploaded CSV file
    // 2. Validate the data
    // 3. Insert the records into the database

    res.status(200).json({
      message: 'Import functionality is not fully implemented',
      info: 'In a complete implementation, this would parse a CSV file and import the links'
    });
  } catch (error) {
    next(error);
  }
}; 