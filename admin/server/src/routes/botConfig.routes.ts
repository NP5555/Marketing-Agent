import { Router } from 'express';
import { body, param } from 'express-validator';
import { 
  getBotConfigs,
  getBotConfigByKey,
  updateBotConfig,
  getMessageTemplates,
  updateMessageTemplate,
} from '../controllers/botConfig.controller';
import { authorizeRoles } from '../middleware/auth';

const router = Router();

// Get all bot configs
router.get('/', getBotConfigs);

// Get a specific config by key
router.get('/:key', param('key').notEmpty(), getBotConfigByKey);

// Update a config (admin only)
router.put(
  '/:key',
  authorizeRoles(['admin']),
  param('key').notEmpty(),
  body('value').notEmpty().withMessage('Value is required'),
  updateBotConfig
);

// Get message templates
router.get('/messages/templates', getMessageTemplates);

// Update message template (admin only)
router.put(
  '/messages/templates/:id',
  authorizeRoles(['admin']),
  param('id').notEmpty(),
  [
    body('text').notEmpty().withMessage('Template text is required'),
    body('variables').optional().isArray().withMessage('Variables must be an array')
  ],
  updateMessageTemplate
);

export default router; 