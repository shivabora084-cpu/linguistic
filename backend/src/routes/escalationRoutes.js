import { Router } from 'express';
import {
  createEscalation,
  getEscalations,
  updateEscalationStatus,
} from '../controllers/escalationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { escalationSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', authenticateToken, validate(escalationSchema), createEscalation);
router.get('/', authenticateToken, requireRole('admin', 'support'), getEscalations);
router.put('/:id/status', authenticateToken, requireRole('admin', 'support'), updateEscalationStatus);

export default router;
