import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { validate } from '../middleware/validate';
import { createResumeSchema, updateResumeSchema } from '../schemas/resume.schema';
import { paginationSchema } from '../schemas/common.schema';
import { crudLimiter, pdfLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', crudLimiter, validate(createResumeSchema), resumeController.create);
router.get('/', crudLimiter, validate(paginationSchema, 'query'), resumeController.findAll);
router.get('/:id', crudLimiter, resumeController.findById);
router.put('/:id', crudLimiter, validate(updateResumeSchema), resumeController.update);
router.delete('/:id', crudLimiter, resumeController.delete);
router.post('/preview', crudLimiter, resumeController.livePreview);
router.put('/:id/template', crudLimiter, resumeController.switchTemplate);
router.get('/:id/preview', crudLimiter, resumeController.preview);
router.get('/:id/pdf', pdfLimiter, resumeController.exportPdf);

export default router;
