import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
        const dataToValidate = req[source] || {};
        const result = schema.safeParse(dataToValidate);
        if (!result.success) {
            const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new ValidationError(message));
        }

        // Express 5+ has getter-only definitions for some properties like req.query
        Object.defineProperty(req, source, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    };
}