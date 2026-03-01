import prisma from '../utils/prisma';
import { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput, sectionDataSchemas } from '../schemas/section.schema';
import { NotFoundError, ValidationError } from '../utils/errors';

export class SectionService {
    async findAll(resumeId: string, externalUserId: string) {
        // Verify resume belongs to user
        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, externalUserId }
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        return prisma.resumeSection.findMany({
            where: { resumeId },
            orderBy: { sortOrder: 'asc' }
        });
    }

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

        // Programmatic validation since PUT body lacks type to hit MW union
        if (data.data) {
            const schema = sectionDataSchemas[section.type as keyof typeof sectionDataSchemas];
            if (schema) {
                const result = schema.safeParse(data.data);
                if (!result.success) {
                    const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                    throw new ValidationError(`Invalid data for section type ${section.type}: ${message}`);
                }
                data.data = result.data; // Reassign mapped/stripped data
            }
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

        // Validate all section IDs belong to this resume
        const sectionIds = data.order.map(item => item.id);
        const validSections = await prisma.resumeSection.count({
            where: {
                id: { in: sectionIds },
                resumeId: resumeId
            }
        });

        if (validSections !== sectionIds.length) {
            throw new ValidationError('One or more section IDs do not belong to this resume');
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
