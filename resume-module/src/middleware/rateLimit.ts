import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Helper to limit based on user ID first (if authenticated), falling back to IP
const keyGenerator = (req: Request) => {
    return (req as any).externalUserId || req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Limiters have been effectively disabled by setting extremely high max values
 * as requested by the user for "no limit" usage.
 */

export const crudLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000000, // Effectively unlimited
    keyGenerator
});

export const pdfLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000000, // Effectively unlimited
    keyGenerator
});

export const atsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000000, // Effectively unlimited
    keyGenerator
});
