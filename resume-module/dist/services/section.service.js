"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionService = exports.SectionService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const section_schema_1 = require("../schemas/section.schema");
const errors_1 = require("../utils/errors");
class SectionService {
    async create(resumeId, externalUserId, data) {
        // Verify resume belongs to user
        const resume = await prisma_1.default.resume.findFirst({
            where: { id: resumeId, externalUserId }
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume');
        }
        // Create section
        return prisma_1.default.resumeSection.create({
            data: {
                resumeId,
                type: data.type,
                data: data.data ? data.data : {},
                sortOrder: data.sortOrder ?? 0,
            }
        });
    }
    async update(resumeId, sectionId, externalUserId, data) {
        // Verify ownership via resume
        const section = await prisma_1.default.resumeSection.findFirst({
            where: {
                id: sectionId,
                resumeId: resumeId,
                resume: { externalUserId }
            }
        });
        if (!section) {
            throw new errors_1.NotFoundError('ResumeSection');
        }
        // Programmatic validation since PUT body lacks type to hit MW union
        if (data.data) {
            const schema = section_schema_1.sectionDataSchemas[section.type];
            if (schema) {
                const result = schema.safeParse(data.data);
                if (!result.success) {
                    const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                    throw new errors_1.ValidationError(`Invalid data for section type ${section.type}: ${message}`);
                }
                data.data = result.data; // Reassign mapped/stripped data
            }
        }
        // Update section
        return prisma_1.default.resumeSection.update({
            where: { id: sectionId },
            data: {
                data: data.data ? data.data : undefined,
                sortOrder: data.sortOrder,
            }
        });
    }
    async delete(resumeId, sectionId, externalUserId) {
        // Verify ownership via resume
        const section = await prisma_1.default.resumeSection.findFirst({
            where: {
                id: sectionId,
                resumeId: resumeId,
                resume: { externalUserId }
            }
        });
        if (!section) {
            throw new errors_1.NotFoundError('ResumeSection');
        }
        // Delete section
        return prisma_1.default.resumeSection.delete({
            where: { id: sectionId }
        });
    }
    async reorder(resumeId, externalUserId, data) {
        // Verify resume is owned
        const resume = await prisma_1.default.resume.findFirst({
            where: { id: resumeId, externalUserId }
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume');
        }
        // Validate all section IDs belong to this resume
        const sectionIds = data.order.map(item => item.id);
        const validSections = await prisma_1.default.resumeSection.count({
            where: {
                id: { in: sectionIds },
                resumeId: resumeId
            }
        });
        if (validSections !== sectionIds.length) {
            throw new errors_1.ValidationError('One or more section IDs do not belong to this resume');
        }
        // Reorder transaction
        const updatePromises = data.order.map((item) => prisma_1.default.resumeSection.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder }
        }));
        // Using transaction so all succeed or all fail
        await prisma_1.default.$transaction(updatePromises);
        // Return reordered layout
        return prisma_1.default.resumeSection.findMany({
            where: { resumeId },
            orderBy: { sortOrder: 'asc' }
        });
    }
}
exports.SectionService = SectionService;
exports.sectionService = new SectionService();
//# sourceMappingURL=section.service.js.map