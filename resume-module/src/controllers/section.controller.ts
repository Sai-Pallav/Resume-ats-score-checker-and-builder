import { Request, Response, NextFunction } from 'express';
import { sectionService } from '../services/section.service';
import { sendSuccess } from '../utils/response';

export class SectionController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const section = await sectionService.create(resumeId, req.externalUserId, req.body);
            sendSuccess(res, section, 201);
        } catch (err) { next(err); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sectionId = req.params.sectionId as string;
            const section = await sectionService.update(resumeId, sectionId, req.externalUserId, req.body);
            sendSuccess(res, section);
        } catch (err) { next(err); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sectionId = req.params.sectionId as string;
            await sectionService.delete(resumeId, sectionId, req.externalUserId);
            sendSuccess(res, null, 200);
        } catch (err) { next(err); }
    }

    async reorder(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sections = await sectionService.reorder(resumeId, req.externalUserId, req.body);
            sendSuccess(res, sections);
        } catch (err) { next(err); }
    }
}

export const sectionController = new SectionController();
