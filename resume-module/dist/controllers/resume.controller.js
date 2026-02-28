"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeController = exports.ResumeController = void 0;
const resume_service_1 = require("../services/resume.service");
const template_service_1 = require("../services/template.service");
const pdf_service_1 = require("../services/pdf/pdf.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const hash_1 = require("../utils/hash");
class ResumeController {
    async create(req, res, next) {
        try {
            const log = (0, logger_1.scopedLogger)(req, 'RESUME');
            const resume = await resume_service_1.resumeService.create(req.externalUserId, req.body);
            log.info({ resumeId: resume.id }, 'Resume created');
            (0, response_1.sendSuccess)(res, resume, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async findAll(req, res, next) {
        try {
            // Zod middleware guarantees these are numbers
            const page = req.query.page;
            const limit = req.query.limit;
            const resumes = await resume_service_1.resumeService.findAllByUser(req.externalUserId, page, limit);
            (0, response_1.sendSuccess)(res, resumes);
        }
        catch (err) {
            next(err);
        }
    }
    async findById(req, res, next) {
        try {
            const id = req.params.id;
            const resume = await resume_service_1.resumeService.findById(id, req.externalUserId);
            (0, response_1.sendSuccess)(res, resume);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const log = (0, logger_1.scopedLogger)(req, 'RESUME');
            const id = req.params.id;
            const resume = await resume_service_1.resumeService.update(id, req.externalUserId, req.body);
            log.info({ resumeId: id }, 'Resume updated');
            (0, response_1.sendSuccess)(res, resume);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const log = (0, logger_1.scopedLogger)(req, 'RESUME');
            const id = req.params.id;
            await resume_service_1.resumeService.delete(id, req.externalUserId);
            log.info({ resumeId: id }, 'Resume deleted');
            (0, response_1.sendSuccess)(res, null, 200); // Replacing 204 to strictly comply with {success:true, data} contract
        }
        catch (err) {
            next(err);
        }
    }
    async switchTemplate(req, res, next) {
        try {
            const id = req.params.id;
            const resume = await resume_service_1.resumeService.switchTemplate(id, req.externalUserId, req.body.templateId);
            (0, response_1.sendSuccess)(res, resume);
        }
        catch (err) {
            next(err);
        }
    }
    async preview(req, res, next) {
        try {
            const id = req.params.id;
            const templateId = req.query.template || 'classic';
            const resume = await resume_service_1.resumeService.findById(id, req.externalUserId);
            const html = template_service_1.templateService.renderToHtml(templateId, resume);
            res.send(html);
        }
        catch (err) {
            next(err);
        }
    }
    async exportPdf(req, res, next) {
        try {
            const log = (0, logger_1.scopedLogger)(req, 'PDF');
            log.info('PDF export started');
            const startTime = Date.now();
            const id = req.params.id;
            const templateId = req.query.template || 'classic';
            const resume = await resume_service_1.resumeService.findById(id, req.externalUserId);
            // 1. Generate unique hash for this content + template combo
            const hash = (0, hash_1.generateResumeHash)(resume, templateId);
            // 2. Check Cache
            const cachedPdf = await pdf_service_1.pdfService.getCachedPdf(hash);
            if (cachedPdf) {
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
                    'X-Cache': 'HIT'
                });
                res.send(cachedPdf);
                log.info({ hash, templateId, resumeId: id }, 'Served PDF from cache');
                return;
            }
            // 3. Generate if cache miss
            const html = template_service_1.templateService.renderToHtml(templateId, resume);
            const pdfBuffer = await pdf_service_1.pdfService.generatePdf(html);
            // 4. Update cache
            await pdf_service_1.pdfService.cachePdf(hash, pdfBuffer);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
                'X-Cache': 'MISS'
            });
            res.send(pdfBuffer);
            log.info({ durationMs: Date.now() - startTime, templateId, resumeId: id, hash }, 'PDF export completed (Cache MISS)');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ResumeController = ResumeController;
exports.resumeController = new ResumeController();
//# sourceMappingURL=resume.controller.js.map