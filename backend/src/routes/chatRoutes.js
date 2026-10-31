import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatMessageSchema } from '../validators/schemas.js';

const router = Router();

router.post('/message', optionalAuth, validate(chatMessageSchema), handleChatMessage);
router.post('/voice', optionalAuth, validate(chatMessageSchema), handleChatMessage);

export default router;
