"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSectionsSchema = exports.reorderSectionItemSchema = exports.updateSectionSchema = exports.createSectionSchema = exports.sectionDataSchemas = exports.customDataSchema = exports.certificationDataSchema = exports.projectDataSchema = exports.skillsDataSchema = exports.skillCategorySchema = exports.experienceDataSchema = exports.educationDataSchema = void 0;
const zod_1 = require("zod");
exports.educationDataSchema = zod_1.z.strictObject({
    institution: zod_1.z.string().min(1, 'Institution is required'),
    degree: zod_1.z.string().min(1, 'Degree is required'),
    field: zod_1.z.string().optional(),
    startDate: zod_1.z.string().min(1, 'Start date is required'),
    endDate: zod_1.z.string().nullable().optional(),
    gpa: zod_1.z.string().optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional()
});
exports.experienceDataSchema = zod_1.z.strictObject({
    company: zod_1.z.string().min(1, 'Company is required'),
    title: zod_1.z.string().min(1, 'Title is required'),
    location: zod_1.z.string().optional(),
    startDate: zod_1.z.string().min(1, 'Start date is required'),
    endDate: zod_1.z.string().nullable().optional(),
    isCurrent: zod_1.z.boolean().optional(),
    bullets: zod_1.z.array(zod_1.z.string()).optional()
});
exports.skillCategorySchema = zod_1.z.strictObject({
    name: zod_1.z.string().min(1, 'Category name is required'),
    items: zod_1.z.array(zod_1.z.string())
});
exports.skillsDataSchema = zod_1.z.strictObject({
    categories: zod_1.z.array(exports.skillCategorySchema)
});
exports.projectDataSchema = zod_1.z.strictObject({
    name: zod_1.z.string().min(1, 'Project name is required'),
    url: zod_1.z.string().url().or(zod_1.z.literal('')).optional(),
    description: zod_1.z.string().optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional()
});
exports.certificationDataSchema = zod_1.z.strictObject({
    name: zod_1.z.string().min(1, 'Certification name is required'),
    issuer: zod_1.z.string().min(1, 'Issuer is required'),
    issueDate: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().nullable().optional(),
    credentialId: zod_1.z.string().optional(),
    url: zod_1.z.string().url().or(zod_1.z.literal('')).optional()
});
exports.customDataSchema = zod_1.z.object({}).catchall(zod_1.z.any());
exports.sectionDataSchemas = {
    education: exports.educationDataSchema,
    experience: exports.experienceDataSchema,
    skills: exports.skillsDataSchema,
    projects: exports.projectDataSchema,
    certifications: exports.certificationDataSchema,
    custom: exports.customDataSchema
};
exports.createSectionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('education'), data: exports.educationDataSchema, sortOrder: zod_1.z.number().int().optional() }),
    zod_1.z.object({ type: zod_1.z.literal('experience'), data: exports.experienceDataSchema, sortOrder: zod_1.z.number().int().optional() }),
    zod_1.z.object({ type: zod_1.z.literal('skills'), data: exports.skillsDataSchema, sortOrder: zod_1.z.number().int().optional() }),
    zod_1.z.object({ type: zod_1.z.literal('projects'), data: exports.projectDataSchema, sortOrder: zod_1.z.number().int().optional() }),
    zod_1.z.object({ type: zod_1.z.literal('certifications'), data: exports.certificationDataSchema, sortOrder: zod_1.z.number().int().optional() }),
    zod_1.z.object({ type: zod_1.z.literal('custom'), data: exports.customDataSchema, sortOrder: zod_1.z.number().int().optional() })
]);
exports.updateSectionSchema = zod_1.z.object({
    data: zod_1.z.any().optional(),
    sortOrder: zod_1.z.number().int().optional(),
}).strict();
exports.reorderSectionItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sortOrder: zod_1.z.number().int(),
}).strict();
exports.reorderSectionsSchema = zod_1.z.object({
    order: zod_1.z.array(exports.reorderSectionItemSchema).min(1),
}).strict();
//# sourceMappingURL=section.schema.js.map