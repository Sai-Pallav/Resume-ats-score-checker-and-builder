"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controller_1 = require("../controllers/resume.controller");
const validate_1 = require("../middleware/validate");
const resume_schema_1 = require("../schemas/resume.schema");
const section_routes_1 = __importDefault(require("./section.routes"));
const router = (0, express_1.Router)();
router.post('/', (0, validate_1.validate)(resume_schema_1.createResumeSchema), resume_controller_1.resumeController.create);
router.get('/', resume_controller_1.resumeController.findAll);
router.get('/:id', resume_controller_1.resumeController.findById);
router.put('/:id', (0, validate_1.validate)(resume_schema_1.updateResumeSchema), resume_controller_1.resumeController.update);
router.delete('/:id', resume_controller_1.resumeController.delete);
router.put('/:id/template', resume_controller_1.resumeController.switchTemplate);
router.use('/:resumeId/sections', section_routes_1.default);
exports.default = router;
//# sourceMappingURL=resume.routes.js.map