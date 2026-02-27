import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../utils/errors';

// Extend Express Request to carry externalUserId
declare global {
    namespace Express {
        interface Request {
            externalUserId: string;
        }
    }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    // Priority: X-User-ID header (MVP: trust this header)
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId || userId.trim() === '') {
        return next(new AuthError());
    }

    req.externalUserId = userId.trim();
    next();
}
