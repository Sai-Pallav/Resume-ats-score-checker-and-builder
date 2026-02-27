import { Request, Response, NextFunction } from 'express';
export declare class SectionController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reorder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const sectionController: SectionController;
//# sourceMappingURL=section.controller.d.ts.map