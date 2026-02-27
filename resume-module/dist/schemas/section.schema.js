"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSectionsSchema = exports.updateSectionSchema = exports.createSectionSchema = void 0;
const zod_1 = require("zod");
exports.createSectionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1).max(100),
    data: zod_1.z.any(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.updateSectionSchema = zod_1.z.object({
    data: zod_1.z.any().optional(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.reorderSectionsSchema = zod_1.z.object({
    order: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        sortOrder: zod_1.z.number().int(),
    })).min(1),
});
//# sourceMappingURL=section.schema.js.map