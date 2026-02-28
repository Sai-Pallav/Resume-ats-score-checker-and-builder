import { z } from 'zod';

export const analyzeResumeSchema = z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters').optional(),
    resumeId: z.string().uuid('Invalid resumeId format').optional(),
}).strict();

export const quickScanSchema = z.object({
    resume: z.object({}).passthrough(), // We let the engine naturally handle the complex resume structure
}).strict();

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
