"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controller_1 = require("../controllers/resume.controller");
const validate_1 = require("../middleware/validate");
const resume_schema_1 = require("../schemas/resume.schema");
const common_schema_1 = require("../schemas/common.schema");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/', rateLimit_1.crudLimiter, (0, validate_1.validate)(resume_schema_1.createResumeSchema), resume_controller_1.resumeController.create);
router.get('/', rateLimit_1.crudLimiter, (0, validate_1.validate)(common_schema_1.paginationSchema, 'query'), resume_controller_1.resumeController.findAll);
router.get('/:id', rateLimit_1.crudLimiter, resume_controller_1.resumeController.findById);
router.put('/:id', rateLimit_1.crudLimiter, (0, validate_1.validate)(resume_schema_1.updateResumeSchema), resume_controller_1.resumeController.update);
router.delete('/:id', rateLimit_1.crudLimiter, resume_controller_1.resumeController.delete);
router.put('/:id/template', rateLimit_1.crudLimiter, resume_controller_1.resumeController.switchTemplate);
router.get('/:id/preview', rateLimit_1.crudLimiter, resume_controller_1.resumeController.preview);
router.get('/:id/pdf', rateLimit_1.pdfLimiter, resume_controller_1.resumeController.exportPdf);
exports.default = router;
//# sourceMappingURL=resume.routes.js.map