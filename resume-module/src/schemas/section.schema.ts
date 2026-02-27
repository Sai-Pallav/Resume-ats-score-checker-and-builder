import { z } from 'zod';

export const createSectionSchema = z.object({
    type: z.enum(['education', 'experience', 'skills', 'projects', 'certifications', 'custom']),
    data: z.any(),
    sortOrder: z.number().int().optional(),
});

export const updateSectionSchema = z.object({
    data: z.any().optional(),
    sortOrder: z.number().int().optional(),
});

export const reorderSectionItemSchema = z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
});

export const reorderSectionsSchema = z.object({
    order: z.array(reorderSectionItemSchema).min(1),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
