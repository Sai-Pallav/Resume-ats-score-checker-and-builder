import pino from 'pino';
import { config } from '../config/env';
import { Request } from 'express';

export type LogCategory = 'AUTH' | 'RESUME' | 'ATS' | 'PDF' | 'ERROR' | 'SYSTEM';

export const logger = pino({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    transport: config.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});

/**
 * Creates a scoped child logger with request context and category.
 */
export const scopedLogger = (req: Request, category: LogCategory) => {
    return logger.child({
        category,
        requestId: req.requestId,
        externalUserId: req.externalUserId || 'anonymous'
    });
};
