import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const zodErr = result.error as any;
            return next({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: zodErr.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                name: 'AppError',
            } as any);
        }
        req[source] = result.data;
        next();
    };
}