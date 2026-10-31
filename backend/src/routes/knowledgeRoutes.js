import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, deleteDocument, queryKnowledge, handleTranslateDoc } from '../controllers/knowledgeController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'text/plain' ||
      file.originalname.endsWith('.pdf') ||
      file.originalname.endsWith('.txt')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT documents are allowed.'), false);
    }
  },
});

const router = Router();

router.post('/upload', optionalAuth, upload.single('file'), uploadDocument);
router.post('/translate-doc', optionalAuth, upload.single('file'), handleTranslateDoc);
router.get('/', optionalAuth, getDocuments);
router.delete('/:id', optionalAuth, deleteDocument);
router.post('/query', optionalAuth, queryKnowledge);

export default router;
