"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionService = exports.SectionService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
class SectionService {
    async verifyResumeOwnership(resumeId, externalUserId) {
        const resume = await prisma_1.default.resume.findFirst({
            where: { id: resumeId, externalUserId },
        });
        if (!resume)
            throw new errors_1.NotFoundError('Resume');
    }
    async create(resumeId, externalUserId, data) {
        await this.verifyResumeOwnership(resumeId, externalUserId);
        return prisma_1.default.resumeSection.create({
            data: {
                resumeId,
                type: data.type,
                data: data.data,
                sortOrder: data.sortOrder || 0,
            },
        });
    }
    async update(resumeId, sectionId, externalUserId, data) {
        await this.verifyResumeOwnership(resumeId, externalUserId);
        const section = await prisma_1.default.resumeSection.findFirst({
            where: { id: sectionId, resumeId },
        });
        if (!section)
            throw new errors_1.NotFoundError('Section');
        return prisma_1.default.resumeSection.update({
            where: { id: sectionId },
            data: {
                data: data.data !== undefined ? data.data : undefined,
                sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
            },
        });
    }
    async delete(resumeId, sectionId, externalUserId) {
        await this.verifyResumeOwnership(resumeId, externalUserId);
        const section = await prisma_1.default.resumeSection.findFirst({
            where: { id: sectionId, resumeId },
        });
        if (!section)
            throw new errors_1.NotFoundError('Section');
        return prisma_1.default.resumeSection.delete({ where: { id: sectionId } });
    }
    async reorder(resumeId, externalUserId, data) {
        await this.verifyResumeOwnership(resumeId, externalUserId);
        const queries = data.order.map((item) => prisma_1.default.resumeSection.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
        }));
        await prisma_1.default.$transaction(queries);
        return prisma_1.default.resumeSection.findMany({
            where: { resumeId },
            orderBy: { sortOrder: 'asc' },
        });
    }
}
exports.SectionService = SectionService;
exports.sectionService = new SectionService();
//# sourceMappingURL=section.service.js.map