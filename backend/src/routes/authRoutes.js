import { Router } from 'express';
import { register, login, getMe, updatePreferences } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updatePreferencesSchema } from '../validators/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.put('/preferences', authenticateToken, validate(updatePreferencesSchema), updatePreferences);

export default router;
