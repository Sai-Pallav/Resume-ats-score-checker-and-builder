import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';
import { templateService } from '../services/template.service';
import { pdfService } from '../services/pdf/pdf.service';
import { logger, scopedLogger } from '../utils/logger';
import { sendSuccess } from '../utils/response';
import { generateResumeHash } from '../utils/hash';

export class ResumeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const log = scopedLogger(req, 'RESUME');
            const resume = await resumeService.create(req.externalUserId, req.body);
            log.info({ resumeId: resume.id }, 'Resume created');
            sendSuccess(res, resume, 201);
        } catch (err) { next(err); }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            // Zod middleware guarantees these are numbers
            const page = req.query.page as unknown as number;
            const limit = req.query.limit as unknown as number;

            const resumes = await resumeService.findAllByUser(req.externalUserId, page, limit);
            sendSuccess(res, resumes);
        } catch (err) { next(err); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const resume = await resumeService.findById(id, req.externalUserId);
            sendSuccess(res, resume);
        } catch (err) { next(err); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const log = scopedLogger(req, 'RESUME');
            const id = req.params.id as string;
            const resume = await resumeService.update(id, req.externalUserId, req.body);
            log.info({ resumeId: id }, 'Resume updated');
            sendSuccess(res, resume);
        } catch (err) { next(err); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const log = scopedLogger(req, 'RESUME');
            const id = req.params.id as string;
            await resumeService.delete(id, req.externalUserId);
            log.info({ resumeId: id }, 'Resume deleted');
            sendSuccess(res, null, 200); // Replacing 204 to strictly comply with {success:true, data} contract
        } catch (err) { next(err); }
    }

    async switchTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const resume = await resumeService.switchTemplate(
                id, req.externalUserId, req.body.templateId
            );
            sendSuccess(res, resume);
        } catch (err) { next(err); }
    }

    async livePreview(req: Request, res: Response, next: NextFunction) {
        try {
            const templateId = (req.query.template as string) || 'classic';
            const resumeData = req.body;

            const html = templateService.renderToHtml(templateId, resumeData);
            res.send(html);
        } catch (err) { next(err); }
    }

    async preview(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const templateId = (req.query.template as string) || 'classic';
            const resume = await resumeService.findById(id, req.externalUserId);

            const html = templateService.renderToHtml(templateId, resume);
            res.send(html);
        } catch (err) { next(err); }
    }

    async exportPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const log = scopedLogger(req, 'PDF');
            log.info('PDF export started');
            const startTime = Date.now();

            const id = req.params.id as string;
            const templateId = (req.query.template as string) || 'classic';
            const resume = await resumeService.findById(id, req.externalUserId);

            // 1. Generate unique hash for this content + template combo
            const hash = generateResumeHash(resume, templateId);

            // 2. Check Cache
            const cachedPdf = await pdfService.getCachedPdf(hash);
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
            const html = templateService.renderToHtml(templateId, resume);
            const pdfBuffer = await pdfService.generatePdf(html);

            // 4. Update cache
            await pdfService.cachePdf(hash, pdfBuffer);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
                'X-Cache': 'MISS'
            });
            res.send(pdfBuffer);

            log.info({ durationMs: Date.now() - startTime, templateId, resumeId: id, hash }, 'PDF export completed (Cache MISS)');
        } catch (err) { next(err); }
    }
}

export const resumeController = new ResumeController();
