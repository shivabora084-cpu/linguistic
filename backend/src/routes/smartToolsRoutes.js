import express from 'express';
import { handleSmartToolAction } from '../controllers/smartToolsController.js';

const router = express.Router();

router.post('/execute', handleSmartToolAction);

export default router;
