import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { validate } from '../middleware/validate';
import { createResumeSchema, updateResumeSchema } from '../schemas/resume.schema';

const router = Router();

router.post('/', validate(createResumeSchema), resumeController.create);
router.get('/', resumeController.findAll);
router.get('/:id', resumeController.findById);
router.put('/:id', validate(updateResumeSchema), resumeController.update);
router.delete('/:id', resumeController.delete);
router.put('/:id/template', resumeController.switchTemplate);
router.get('/:id/preview', resumeController.preview);
router.get('/:id/pdf', resumeController.exportPdf);

export default router;
