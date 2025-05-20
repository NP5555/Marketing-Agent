import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabase } from '../utils/supabase';
import { ApiError } from '../middleware/errorHandler';

/**
 * Get all bot configurations
 * @route GET /api/bot-config
 */
export const getBotConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('bot_config')
      .select('*')
      .order('key');

    if (error) {
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bot configuration by key
 * @route GET /api/bot-config/:key
 */
export const getBotConfigByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const { data, error } = await supabase
      .from('bot_config')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('Configuration not found', 404);
      }
      throw new ApiError(error.message, 500);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Update bot configuration
 * @route PUT /api/bot-config/:key
 */
export const updateBotConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value } = req.body;

    // Check if config exists
    const { data: existingConfig, error: fetchError } = await supabase
      .from('bot_config')
      .select('key')
      .eq('key', key)
      .single();

    // If config doesn't exist, create it
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data, error } = await supabase
        .from('bot_config')
        .insert({
          key,
          value,
          last_modified: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return res.status(201).json(data);
    }

    // Otherwise update existing config
    const { data, error } = await supabase
      .from('bot_config')
      .update({
        value,
        last_modified: new Date().toISOString(),
      })
      .eq('key', key)
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

/**
 * Get message templates
 * @route GET /api/bot-config/messages/templates
 */
export const getMessageTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app, these would be stored in the database
    // For this example, we'll return mock data
    const templates = [
      {
        id: 'welcome',
        text: 'Welcome to our marketing bot, {{username}}!',
        variables: ['username'],
      },
      {
        id: 'offer',
        text: 'Check out our latest offer: {{offerTitle}} - {{offerDescription}}',
        variables: ['offerTitle', 'offerDescription'],
      },
      {
        id: 'referral',
        text: 'Share this link with your friends: {{referralLink}}',
        variables: ['referralLink'],
      },
    ];

    res.status(200).json(templates);
  } catch (error) {
    next(error);
  }
};

/**
 * Update message template
 * @route PUT /api/bot-config/messages/templates/:id
 */
export const updateMessageTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { text, variables } = req.body;

    // In a real app, you would update the template in the database
    // For this example, we'll just return the updated template
    const updatedTemplate = {
      id,
      text,
      variables,
    };

    res.status(200).json(updatedTemplate);
  } catch (error) {
    next(error);
  }
}; 