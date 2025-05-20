import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getLinks,
  getLinkByCode,
  createLink,
  deleteLink,
  exportLinks,
  importLinks
} from '../controllers/links.controller';
import { authorizeRoles } from '../middleware/auth';

const router = Router();

// Get all links
router.get('/', getLinks);

// Get a specific link by code
router.get('/:code', param('code').isLength({ min: 8, max: 8 }), getLinkByCode);

// Create a new link
router.post(
  '/',
  [
    body('code').optional().isLength({ min: 8, max: 8 }).withMessage('Code must be 8 characters')
  ],
  createLink
);

// Delete a link
router.delete(
  '/:code',
  param('code').isLength({ min: 8, max: 8 }),
  deleteLink
);

// Export links to CSV (admin only)
router.get(
  '/export',
  authorizeRoles(['admin']),
  exportLinks
);

// Import links from CSV (admin only)
router.post(
  '/import',
  authorizeRoles(['admin']),
  importLinks
);

export default router; 