import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new ValidationError(message));
        }
        req[source] = result.data;
        next();
    };
}