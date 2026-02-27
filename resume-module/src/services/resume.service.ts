import prisma from '../utils/prisma';
import { CreateResumeInput, UpdateResumeInput } from '../schemas/resume.schema';
import { NotFoundError } from '../utils/errors';

export class ResumeService {
    async create(externalUserId: string, data: CreateResumeInput) {
        return prisma.resume.create({
            data: {
                externalUserId,
                title: data.title,
                templateId: data.templateId,
                summary: data.summary,
                // Since contactInfo is typed generically in the DB, any casting handles it
                contactInfo: data.contactInfo ? (data.contactInfo as any) : undefined,
            },
        });
    }

    async findAllByUser(externalUserId: string) {
        return prisma.resume.findMany({
            where: { externalUserId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findById(id: string, externalUserId: string) {
        const resume = await prisma.resume.findFirst({
            where: { id, externalUserId },
            include: {
                sections: {
                    orderBy: { sortOrder: 'asc' }
                },
            },
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        return resume;
    }

    async update(id: string, externalUserId: string, data: UpdateResumeInput) {
        // verify ownership
        const existing = await prisma.resume.findFirst({
            where: { id, externalUserId },
        });

        if (!existing) {
            throw new NotFoundError('Resume');
        }

        return prisma.resume.update({
            where: { id },
            data: {
                title: data.title,
                templateId: data.templateId,
                summary: data.summary,
                contactInfo: data.contactInfo ? (data.contactInfo as any) : undefined,
                isDraft: data.isDraft,
            },
        });
    }

    async delete(id: string, externalUserId: string) {
        // verify ownership
        const existing = await prisma.resume.findFirst({
            where: { id, externalUserId },
        });

        if (!existing) {
            throw new NotFoundError('Resume');
        }

        return prisma.resume.delete({
            where: { id },
        });
    }

    async switchTemplate(id: string, externalUserId: string, templateId: string) {
        // verify ownership
        const existing = await prisma.resume.findFirst({
            where: { id, externalUserId },
        });

        if (!existing) {
            throw new NotFoundError('Resume');
        }

        return prisma.resume.update({
            where: { id },
            data: { templateId },
        });
    }
}

export const resumeService = new ResumeService();
