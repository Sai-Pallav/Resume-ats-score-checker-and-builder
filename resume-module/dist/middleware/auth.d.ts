import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            externalUserId: string;
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map