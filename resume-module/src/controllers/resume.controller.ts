import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';
import { templateService } from '../services/template.service';
import { pdfService } from '../services/pdf/pdf.service';

export class ResumeController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const resume = await resumeService.create(req.externalUserId, req.body);
            res.status(201).json({ data: resume });
        } catch (err) { next(err); }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const resumes = await resumeService.findAllByUser(req.externalUserId);
            res.json({ data: resumes });
        } catch (err) { next(err); }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const resume = await resumeService.findById(id, req.externalUserId);
            res.json({ data: resume });
        } catch (err) { next(err); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const resume = await resumeService.update(id, req.externalUserId, req.body);
            res.json({ data: resume });
        } catch (err) { next(err); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await resumeService.delete(id, req.externalUserId);
            res.status(204).send();
        } catch (err) { next(err); }
    }

    async switchTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const resume = await resumeService.switchTemplate(
                id, req.externalUserId, req.body.templateId
            );
            res.json({ data: resume });
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
            const id = req.params.id as string;
            const templateId = (req.query.template as string) || 'classic';
            const resume = await resumeService.findById(id, req.externalUserId);

            const html = templateService.renderToHtml(templateId, resume);
            const pdfBuffer = await pdfService.generatePdf(html);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
            });
            res.send(pdfBuffer);
        } catch (err) { next(err); }
    }
}

export const resumeController = new ResumeController();
