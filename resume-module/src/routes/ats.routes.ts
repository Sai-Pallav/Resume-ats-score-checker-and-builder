import { Router } from 'express';
import { atsController } from '../controllers/ats.controller';
import { upload, validatePdfMagicBytes } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { analyzeResumeSchema, quickScanSchema } from '../schemas/ats.schema';
import { atsLimiter } from '../middleware/rateLimit';

const router = Router();

// Test endpoint to verify PDF text extraction is working
router.post('/extract', atsLimiter, upload.single('file'), validatePdfMagicBytes, atsController.extractText);

// Fast Completeness Check (PDF Text parsing, no DB)
router.post('/completeness', atsLimiter, upload.single('file'), validatePdfMagicBytes, atsController.checkCompleteness);

// Fast ATS Quick Scan (JSON only, no PDF parsing)
router.post('/quick-scan', atsLimiter, validate(quickScanSchema), atsController.quickScan);

// Benchmark percentile check
router.get('/benchmark', atsLimiter, atsController.getBenchmark);

// Main Analysis Endpoint
router.post(
    '/analyze',
    atsLimiter,
    upload.single('file'),
    validatePdfMagicBytes,
    validate(analyzeResumeSchema),
    atsController.analyze
);

router.post(
    '/analyze-resume/:resumeId',
    atsLimiter,
    validate(analyzeResumeSchema),
    atsController.analyzeSaved
);

// Fetch existing ATS Report
router.get('/report/:id', atsLimiter, atsController.getReport);

export default router;
