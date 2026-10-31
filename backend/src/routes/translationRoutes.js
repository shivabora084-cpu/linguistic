import { Router } from 'express';
import { handleTranslate, handleExplain, handleGetCacheStats } from '../controllers/translationController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { translationSchema, explainSchema } from '../validators/schemas.js';

const router = Router();

router.post('/translate', optionalAuth, validate(translationSchema), handleTranslate);
router.post('/explain', optionalAuth, validate(explainSchema), handleExplain);
router.get('/cache/stats', handleGetCacheStats);

export default router;
