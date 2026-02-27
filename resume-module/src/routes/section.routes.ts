import { Router } from 'express';
import { sectionController } from '../controllers/section.controller';
import { validate } from '../middleware/validate';
import { createSectionSchema, updateSectionSchema, reorderSectionsSchema } from '../schemas/section.schema';

const router = Router({ mergeParams: true });

router.post('/', validate(createSectionSchema), sectionController.create);
router.put('/reorder', validate(reorderSectionsSchema), sectionController.reorder);
router.put('/:sectionId', validate(updateSectionSchema), sectionController.update);
router.delete('/:sectionId', sectionController.delete);

export default router;
