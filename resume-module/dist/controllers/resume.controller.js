"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeController = exports.ResumeController = void 0;
const resume_service_1 = require("../services/resume.service");
class ResumeController {
    async create(req, res, next) {
        try {
            const resume = await resume_service_1.resumeService.create(req.externalUserId, req.body);
            res.status(201).json({ data: resume });
        }
        catch (err) {
            next(err);
        }
    }
    async findAll(req, res, next) {
        try {
            const resumes = await resume_service_1.resumeService.findAllByUser(req.externalUserId);
            res.json({ data: resumes });
        }
        catch (err) {
            next(err);
        }
    }
    async findById(req, res, next) {
        try {
            const resume = await resume_service_1.resumeService.findById(req.params.id, req.externalUserId);
            res.json({ data: resume });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const resume = await resume_service_1.resumeService.update(req.params.id, req.externalUserId, req.body);
            res.json({ data: resume });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await resume_service_1.resumeService.delete(req.params.id, req.externalUserId);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    }
    async switchTemplate(req, res, next) {
        try {
            const resume = await resume_service_1.resumeService.switchTemplate(req.params.id, req.externalUserId, req.body.templateId);
            res.json({ data: resume });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ResumeController = ResumeController;
exports.resumeController = new ResumeController();
//# sourceMappingURL=resume.controller.js.map