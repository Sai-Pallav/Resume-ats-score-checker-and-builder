import prisma from '../utils/prisma';
import { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput } from '../schemas/section.schema';
import { NotFoundError } from '../utils/errors';

export class SectionService {
    async create(resumeId: string, externalUserId: string, data: CreateSectionInput) {
        // Verify resume belongs to user
        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, externalUserId }
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        // Create section
        return prisma.resumeSection.create({
            data: {
                resumeId,
                type: data.type,
                data: data.data ? (data.data as any) : {},
                sortOrder: data.sortOrder ?? 0,
            }
        });
    }

    async update(resumeId: string, sectionId: string, externalUserId: string, data: UpdateSectionInput) {
        // Verify ownership via resume
        const section = await prisma.resumeSection.findFirst({
            where: {
                id: sectionId,
                resumeId: resumeId,
                resume: { externalUserId }
            }
        });

        if (!section) {
            throw new NotFoundError('ResumeSection');
        }

        // Update section
        return prisma.resumeSection.update({
            where: { id: sectionId },
            data: {
                data: data.data ? (data.data as any) : undefined,
                sortOrder: data.sortOrder,
            }
        });
    }

    async delete(resumeId: string, sectionId: string, externalUserId: string) {
        // Verify ownership via resume
        const section = await prisma.resumeSection.findFirst({
            where: {
                id: sectionId,
                resumeId: resumeId,
                resume: { externalUserId }
            }
        });

        if (!section) {
            throw new NotFoundError('ResumeSection');
        }

        // Delete section
        return prisma.resumeSection.delete({
            where: { id: sectionId }
        });
    }

    async reorder(resumeId: string, externalUserId: string, data: ReorderSectionsInput) {
        // Verify resume is owned
        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, externalUserId }
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        // Reorder transaction
        const updatePromises = data.order.map((item) =>
            prisma.resumeSection.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder }
            })
        );

        // Using transaction so all succeed or all fail
        await prisma.$transaction(updatePromises);

        // Return reordered layout
        return prisma.resumeSection.findMany({
            where: { resumeId },
            orderBy: { sortOrder: 'asc' }
        });
    }
}

export const sectionService = new SectionService();
