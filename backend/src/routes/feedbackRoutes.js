import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { feedbackSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', optionalAuth, validate(feedbackSchema), submitFeedback);

export default router;
