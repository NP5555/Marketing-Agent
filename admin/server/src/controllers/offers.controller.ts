import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all offers
 * @route GET /api/offers
 */
export const getOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('offers')
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
 * Get offer by ID
 * @route GET /api/offers/:id
 */
export const getOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('Offer not found', 404);
      }
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new offer
 * @route POST /api/offers
 */
export const createOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, reward_amount, expiry_date, is_active = true } = req.body;

    const { data, error } = await supabase
      .from('offers')
      .insert({
        title,
        description,
        reward_amount,
        expiry_date,
        is_active,
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
 * Update an offer
 * @route PUT /api/offers/:id
 */
export const updateOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, reward_amount, expiry_date, is_active } = req.body;

    const { data, error } = await supabase
      .from('offers')
      .update({
        title,
        description,
        reward_amount,
        expiry_date,
        is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('Offer not found', 404);
      }
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an offer
 * @route DELETE /api/offers/:id
 */
export const deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle offer status (active/inactive)
 * @route PATCH /api/offers/:id/toggle
 */
export const toggleOfferStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // First get the current status
    const { data: offer, error: fetchError } = await supabase
      .from('offers')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new ApiError('Offer not found', 404);
      }
      throw new ApiError(fetchError.message, 500);
    }

    // Toggle the status
    const { data, error } = await supabase
      .from('offers')
      .update({ is_active: !offer.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}; 