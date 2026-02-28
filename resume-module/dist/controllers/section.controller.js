"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionController = exports.SectionController = void 0;
const section_service_1 = require("../services/section.service");
const response_1 = require("../utils/response");
class SectionController {
    async create(req, res, next) {
        try {
            const resumeId = req.params.id;
            const section = await section_service_1.sectionService.create(resumeId, req.externalUserId, req.body);
            (0, response_1.sendSuccess)(res, section, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const resumeId = req.params.id;
            const sectionId = req.params.sectionId;
            const section = await section_service_1.sectionService.update(resumeId, sectionId, req.externalUserId, req.body);
            (0, response_1.sendSuccess)(res, section);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const resumeId = req.params.id;
            const sectionId = req.params.sectionId;
            await section_service_1.sectionService.delete(resumeId, sectionId, req.externalUserId);
            (0, response_1.sendSuccess)(res, null, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async reorder(req, res, next) {
        try {
            const resumeId = req.params.id;
            const sections = await section_service_1.sectionService.reorder(resumeId, req.externalUserId, req.body);
            (0, response_1.sendSuccess)(res, sections);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SectionController = SectionController;
exports.sectionController = new SectionController();
//# sourceMappingURL=section.controller.js.map