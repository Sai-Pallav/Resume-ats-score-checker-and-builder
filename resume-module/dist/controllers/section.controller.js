"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionController = exports.SectionController = void 0;
const section_service_1 = require("../services/section.service");
class SectionController {
    async create(req, res, next) {
        try {
            const section = await section_service_1.sectionService.create(req.params.resumeId, req.externalUserId, req.body);
            res.status(201).json({ data: section });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const section = await section_service_1.sectionService.update(req.params.resumeId, req.params.sectionId, req.externalUserId, req.body);
            res.json({ data: section });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await section_service_1.sectionService.delete(req.params.resumeId, req.params.sectionId, req.externalUserId);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    }
    async reorder(req, res, next) {
        try {
            const sections = await section_service_1.sectionService.reorder(req.params.resumeId, req.externalUserId, req.body);
            res.json({ data: sections });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SectionController = SectionController;
exports.sectionController = new SectionController();
//# sourceMappingURL=section.controller.js.map