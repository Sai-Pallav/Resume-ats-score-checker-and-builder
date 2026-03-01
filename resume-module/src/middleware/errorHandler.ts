import { Request, Response, NextFunction } from 'express';
import { AppError, FileUploadError } from '../utils/errors';
import multer from 'multer';
import { logger, scopedLogger } from '../utils/logger';
import { formatError } from '../utils/response';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof multer.MulterError) {
        err = new FileUploadError(err.message);
    }

    const log = scopedLogger(req, 'ERROR');

    if (err instanceof AppError) {
        log.warn({ err, path: req.path, method: req.method }, `AppError: ${err.message}`);
        return res.status(err.statusCode).json(formatError({ code: err.code, message: err.message }, req.requestId));
    }

    log.error({
        err,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.method !== 'GET' ? req.body : undefined // Be careful with PII in production
    }, 'Unhandled Server Error');

    res.status(500).json(formatError({ code: 'INTERNAL_ERROR', message: 'Something went wrong: ' + (err.message || String(err)) }, req.requestId));
}
