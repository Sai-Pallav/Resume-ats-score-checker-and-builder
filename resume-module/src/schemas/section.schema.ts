import { z } from 'zod';

export const educationDataSchema = z.strictObject({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullable().optional(),
    gpa: z.string().optional(),
    highlights: z.array(z.string()).optional()
});

export const experienceDataSchema = z.strictObject({
    company: z.string().min(1, 'Company is required'),
    title: z.string().min(1, 'Title is required'),
    location: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullable().optional(),
    isCurrent: z.boolean().optional(),
    bullets: z.array(z.string()).optional()
});

export const skillCategorySchema = z.strictObject({
    name: z.string().min(1, 'Category name is required'),
    items: z.array(z.string())
});

export const skillsDataSchema = z.strictObject({
    categories: z.array(skillCategorySchema)
});

export const projectDataSchema = z.strictObject({
    name: z.string().min(1, 'Project name is required'),
    url: z.string().url().or(z.literal('')).optional(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional()
});

export const certificationDataSchema = z.strictObject({
    name: z.string().min(1, 'Certification name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    issueDate: z.string().optional(),
    expiryDate: z.string().nullable().optional(),
    credentialId: z.string().optional(),
    url: z.string().url().or(z.literal('')).optional()
});

export const customDataSchema = z.object({}).catchall(z.any());

export const sectionDataSchemas = {
    education: educationDataSchema,
    experience: experienceDataSchema,
    skills: skillsDataSchema,
    projects: projectDataSchema,
    certifications: certificationDataSchema,
    custom: customDataSchema
};

export const createSectionSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('education'), data: z.array(educationDataSchema), sortOrder: z.number().int().optional() }),
    z.object({ type: z.literal('experience'), data: z.array(experienceDataSchema), sortOrder: z.number().int().optional() }),
    z.object({ type: z.literal('skills'), data: skillsDataSchema, sortOrder: z.number().int().optional() }),
    z.object({ type: z.literal('projects'), data: z.array(projectDataSchema), sortOrder: z.number().int().optional() }),
    z.object({ type: z.literal('certifications'), data: z.array(certificationDataSchema), sortOrder: z.number().int().optional() }),
    z.object({ type: z.literal('custom'), data: customDataSchema, sortOrder: z.number().int().optional() })
]);

export const updateSectionSchema = z.object({
    data: z.any().optional(),
    sortOrder: z.number().int().optional(),
}).strict();

export const reorderSectionItemSchema = z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
}).strict();

export const reorderSectionsSchema = z.object({
    order: z.array(reorderSectionItemSchema).min(1),
}).strict();

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
