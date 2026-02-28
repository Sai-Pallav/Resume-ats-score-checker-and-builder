import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { scopedLogger } from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            externalUserId: string;
            requestId: string;
        }
    }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
    const log = scopedLogger(req, 'AUTH');

    // Priority: X-User-ID header (MVP: trust this header)
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId || userId.trim() === '') {
        log.warn({ headers: req.headers }, 'Authentication failed: Missing X-User-ID');
        return next(new UnauthorizedError());
    }

    req.externalUserId = userId.trim();
    log.debug({ externalUserId: req.externalUserId }, 'Authentication successful');
    next();
}
