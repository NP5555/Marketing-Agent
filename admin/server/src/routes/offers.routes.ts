import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getOffers, 
  getOfferById, 
  createOffer, 
  updateOffer, 
  deleteOffer,
  toggleOfferStatus
} from '../controllers/offers.controller';
import { authorizeRoles } from '../middleware/auth';

const router = Router();

// Get all offers
router.get('/', getOffers);

// Get a specific offer
router.get('/:id', param('id').isUUID(), getOfferById);

// Create a new offer (admin only)
router.post(
  '/',
  authorizeRoles(['admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('reward_amount').isNumeric().withMessage('Reward amount must be a number'),
    body('expiry_date').isISO8601().withMessage('Expiry date must be valid ISO date')
  ],
  createOffer
);

// Update an offer (admin only)
router.put(
  '/:id',
  authorizeRoles(['admin']),
  param('id').isUUID(),
  [
    body('title').optional(),
    body('description').optional(),
    body('reward_amount').optional().isNumeric().withMessage('Reward amount must be a number'),
    body('expiry_date').optional().isISO8601().withMessage('Expiry date must be valid ISO date')
  ],
  updateOffer
);

// Delete an offer (admin only)
router.delete(
  '/:id',
  authorizeRoles(['admin']),
  param('id').isUUID(),
  deleteOffer
);

// Toggle offer status (active/inactive)
router.patch(
  '/:id/toggle',
  authorizeRoles(['admin', 'moderator']),
  param('id').isUUID(),
  toggleOfferStatus
);

export default router; 