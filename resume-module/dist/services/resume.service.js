"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeService = exports.ResumeService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
class ResumeService {
    async create(externalUserId, data) {
        return prisma_1.default.resume.create({
            data: {
                externalUserId,
                title: data.title,
                templateId: data.templateId,
                summary: data.summary,
                contactInfo: data.contactInfo ? data.contactInfo : undefined,
            },
        });
    }
    async findAllByUser(externalUserId) {
        return prisma_1.default.resume.findMany({
            where: { externalUserId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findById(id, externalUserId) {
        const resume = await prisma_1.default.resume.findFirst({
            where: { id, externalUserId },
            include: {
                sections: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        if (!resume)
            throw new errors_1.NotFoundError('Resume');
        return resume;
    }
    async update(id, externalUserId, data) {
        const existing = await prisma_1.default.resume.findFirst({ where: { id, externalUserId } });
        if (!existing)
            throw new errors_1.NotFoundError('Resume');
        return prisma_1.default.resume.update({
            where: { id },
            data: {
                title: data.title,
                templateId: data.templateId,
                summary: data.summary,
                contactInfo: data.contactInfo ? data.contactInfo : undefined,
                isDraft: data.isDraft,
            },
        });
    }
    async delete(id, externalUserId) {
        const existing = await prisma_1.default.resume.findFirst({ where: { id, externalUserId } });
        if (!existing)
            throw new errors_1.NotFoundError('Resume');
        return prisma_1.default.resume.delete({ where: { id } });
    }
    async switchTemplate(id, externalUserId, templateId) {
        const existing = await prisma_1.default.resume.findFirst({ where: { id, externalUserId } });
        if (!existing)
            throw new errors_1.NotFoundError('Resume');
        return prisma_1.default.resume.update({
            where: { id },
            data: { templateId },
        });
    }
}
exports.ResumeService = ResumeService;
exports.resumeService = new ResumeService();
//# sourceMappingURL=resume.service.js.map