import { Router } from 'express';
import {
  getAnalytics,
  getAllUsers,
  getAllConversations,
  getSystemHealth,
} from '../controllers/adminController.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/system-health', optionalAuth, getSystemHealth);
router.get('/analytics', optionalAuth, getAnalytics);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/conversations', authenticateToken, requireAdmin, getAllConversations);

export default router;
