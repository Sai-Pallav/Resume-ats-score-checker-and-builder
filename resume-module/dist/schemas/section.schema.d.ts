import { z } from 'zod';
export declare const educationDataSchema: z.ZodObject<{
    institution: z.ZodString;
    degree: z.ZodString;
    field: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    gpa: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const experienceDataSchema: z.ZodObject<{
    company: z.ZodString;
    title: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isCurrent: z.ZodOptional<z.ZodBoolean>;
    bullets: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const skillCategorySchema: z.ZodObject<{
    name: z.ZodString;
    items: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const skillsDataSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        items: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const projectDataSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    description: z.ZodOptional<z.ZodString>;
    technologies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const certificationDataSchema: z.ZodObject<{
    name: z.ZodString;
    issuer: z.ZodString;
    issueDate: z.ZodOptional<z.ZodString>;
    expiryDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    credentialId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strict>;
export declare const customDataSchema: z.ZodObject<{}, z.core.$catchall<z.ZodAny>>;
export declare const sectionDataSchemas: {
    education: z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        field: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        gpa: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    experience: z.ZodObject<{
        company: z.ZodString;
        title: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isCurrent: z.ZodOptional<z.ZodBoolean>;
        bullets: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    skills: z.ZodObject<{
        categories: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            items: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    projects: z.ZodObject<{
        name: z.ZodString;
        url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
        description: z.ZodOptional<z.ZodString>;
        technologies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    certifications: z.ZodObject<{
        name: z.ZodString;
        issuer: z.ZodString;
        issueDate: z.ZodOptional<z.ZodString>;
        expiryDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        credentialId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    }, z.core.$strict>;
    custom: z.ZodObject<{}, z.core.$catchall<z.ZodAny>>;
};
export declare const createSectionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"education">;
    data: z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        field: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        gpa: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"experience">;
    data: z.ZodObject<{
        company: z.ZodString;
        title: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isCurrent: z.ZodOptional<z.ZodBoolean>;
        bullets: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"skills">;
    data: z.ZodObject<{
        categories: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            items: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"projects">;
    data: z.ZodObject<{
        name: z.ZodString;
        url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
        description: z.ZodOptional<z.ZodString>;
        technologies: z.ZodOptional<z.ZodArray<z.ZodString>>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"certifications">;
    data: z.ZodObject<{
        name: z.ZodString;
        issuer: z.ZodString;
        issueDate: z.ZodOptional<z.ZodString>;
        expiryDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        credentialId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    }, z.core.$strict>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"custom">;
    data: z.ZodObject<{}, z.core.$catchall<z.ZodAny>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "type">;
export declare const updateSectionSchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodAny>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const reorderSectionItemSchema: z.ZodObject<{
    id: z.ZodString;
    sortOrder: z.ZodNumber;
}, z.core.$strict>;
export declare const reorderSectionsSchema: z.ZodObject<{
    order: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sortOrder: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
//# sourceMappingURL=section.schema.d.ts.map