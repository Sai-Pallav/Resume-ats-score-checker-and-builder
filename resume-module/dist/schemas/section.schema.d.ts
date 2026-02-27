import { z } from 'zod';
export declare const createSectionSchema: z.ZodObject<{
    type: z.ZodString;
    data: z.ZodAny;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateSectionSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodAny>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const reorderSectionsSchema: z.ZodObject<{
    order: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sortOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
//# sourceMappingURL=section.schema.d.ts.map