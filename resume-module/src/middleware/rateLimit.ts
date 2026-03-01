import { Request, Response, NextFunction } from 'express';

// Limiters have been completely disabled as requested by the user
const dummyLimiter = (req: Request, res: Response, next: NextFunction) => next();

export const crudLimiter = dummyLimiter;
export const pdfLimiter = dummyLimiter;
export const atsLimiter = dummyLimiter;
