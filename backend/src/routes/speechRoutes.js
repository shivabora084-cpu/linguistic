import { Router } from 'express';
import multer from 'multer';
import { handleGetCapabilities, handleTranscribe, handleSynthesize } from '../controllers/speechController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.get('/capabilities', handleGetCapabilities);
router.post('/transcribe', upload.single('audio'), handleTranscribe);
router.post('/synthesize', handleSynthesize);

export default router;
