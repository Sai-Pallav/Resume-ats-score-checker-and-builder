"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const section_controller_1 = require("../controllers/section.controller");
const validate_1 = require("../middleware/validate");
const section_schema_1 = require("../schemas/section.schema");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/', (0, validate_1.validate)(section_schema_1.createSectionSchema), section_controller_1.sectionController.create);
router.put('/reorder', (0, validate_1.validate)(section_schema_1.reorderSectionsSchema), section_controller_1.sectionController.reorder);
router.put('/:sectionId', (0, validate_1.validate)(section_schema_1.updateSectionSchema), section_controller_1.sectionController.update);
router.delete('/:sectionId', section_controller_1.sectionController.delete);
exports.default = router;
//# sourceMappingURL=section.routes.js.map