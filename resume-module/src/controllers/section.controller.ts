import { Request, Response, NextFunction } from 'express';
import { sectionService } from '../services/section.service';

export class SectionController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const section = await sectionService.create(resumeId, req.externalUserId, req.body);
            res.status(201).json({ data: section });
        } catch (err) { next(err); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sectionId = req.params.sectionId as string;
            const section = await sectionService.update(resumeId, sectionId, req.externalUserId, req.body);
            res.json({ data: section });
        } catch (err) { next(err); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sectionId = req.params.sectionId as string;
            await sectionService.delete(resumeId, sectionId, req.externalUserId);
            res.status(204).send();
        } catch (err) { next(err); }
    }

    async reorder(req: Request, res: Response, next: NextFunction) {
        try {
            const resumeId = req.params.id as string;
            const sections = await sectionService.reorder(resumeId, req.externalUserId, req.body);
            res.json({ data: sections });
        } catch (err) { next(err); }
    }
}

export const sectionController = new SectionController();
