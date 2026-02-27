import { z } from 'zod';

export const createResumeSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    templateId: z.enum(['classic', 'modern', 'minimal']).optional(),
    summary: z.string().max(2000).optional(),
    contactInfo: z.object({
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        website: z.string().url().optional(),
        location: z.string().optional(),
    }).optional(),
});

export const updateResumeSchema = createResumeSchema.extend({
    isDraft: z.boolean().optional(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
