import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  toggleSaveConversation,
} from '../controllers/conversationController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createConversationSchema } from '../validators/schemas.js';

const router = Router();

router.use(optionalAuth);

router.post('/', validate(createConversationSchema), createConversation);
router.get('/', getConversations);
router.get('/:id', getConversationById);
router.delete('/:id', deleteConversation);
router.put('/:id/save', toggleSaveConversation);

export default router;
