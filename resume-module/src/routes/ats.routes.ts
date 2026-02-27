import { Router } from 'express';
import { atsController } from '../controllers/ats.controller';
import { upload } from '../middleware/upload';

const router = Router();

// Test endpoint to verify PDF text extraction is working
router.post('/extract', upload.single('file'), atsController.extractText);

export default router;
