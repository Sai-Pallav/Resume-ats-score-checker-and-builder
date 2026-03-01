import { Router } from 'express';
import { sectionController } from '../controllers/section.controller';
import { validate } from '../middleware/validate';
import { createSectionSchema, updateSectionSchema, reorderSectionsSchema } from '../schemas/section.schema';
import { crudLimiter } from '../middleware/rateLimit';

const router = Router({ mergeParams: true });

router.get('/', crudLimiter, sectionController.findAll);
router.post('/', crudLimiter, validate(createSectionSchema), sectionController.create);
router.put('/reorder', crudLimiter, validate(reorderSectionsSchema), sectionController.reorder);
router.put('/:sectionId', crudLimiter, validate(updateSectionSchema), sectionController.update);
router.delete('/:sectionId', crudLimiter, sectionController.delete);

export default router;
