"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResumeSchema = exports.createResumeSchema = void 0;
const zod_1 = require("zod");
exports.createResumeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    templateId: zod_1.z.enum(['classic', 'modern', 'minimal']).optional(),
    summary: zod_1.z.string().max(2000).optional(),
    contactInfo: zod_1.z.object({
        fullName: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        linkedin: zod_1.z.string().url().optional(),
        github: zod_1.z.string().url().optional(),
        website: zod_1.z.string().url().optional(),
        location: zod_1.z.string().optional(),
    }).strict().optional(),
}).strict();
exports.updateResumeSchema = exports.createResumeSchema.extend({
    isDraft: zod_1.z.boolean().optional(),
}).strict();
//# sourceMappingURL=resume.schema.js.map