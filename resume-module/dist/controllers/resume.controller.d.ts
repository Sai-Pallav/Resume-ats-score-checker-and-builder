import { Request, Response, NextFunction } from 'express';
export declare class ResumeController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    switchTemplate(req: Request, res: Response, next: NextFunction): Promise<void>;
    preview(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const resumeController: ResumeController;
//# sourceMappingURL=resume.controller.d.ts.map