import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { config } from '../config/env';
import { scopedLogger } from '../utils/logger';

/**
 * Middleware to protect administrative routes (like Swagger Docs)
 * using an API key provided in the X-Admin-Key header.
 */
export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
    const adminKey = req.headers['x-admin-key'] as string | undefined;
    const log = scopedLogger(req, 'AUTH');

    if (!adminKey || adminKey !== config.adminApiKey) {
        log.warn({
            path: req.path,
            method: req.method,
            hasKey: !!adminKey
        }, 'Admin authentication failed: Invalid or missing X-Admin-Key');

        return next(new UnauthorizedError());
    }

    log.info({ path: req.path }, 'Admin access granted');
    next();
}
