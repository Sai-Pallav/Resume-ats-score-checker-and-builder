import { z } from 'zod';
export declare const createResumeSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        modern: "modern";
        minimal: "minimal";
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    contactInfo: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        linkedin: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateResumeSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        modern: "modern";
        minimal: "minimal";
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    contactInfo: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        linkedin: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    isDraft: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
//# sourceMappingURL=resume.schema.d.ts.map