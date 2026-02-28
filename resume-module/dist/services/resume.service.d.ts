import { CreateResumeInput, UpdateResumeInput } from '../schemas/resume.schema';
export declare class ResumeService {
    create(externalUserId: string, data: CreateResumeInput): Promise<{
        externalUserId: string;
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllByUser(externalUserId: string, page?: number, limit?: number): Promise<{
        resumes: {
            externalUserId: string;
            title: string;
            templateId: string;
            summary: string | null;
            contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
            isDraft: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, externalUserId: string): Promise<{
        sections: {
            type: string;
            data: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            resumeId: string;
        }[];
    } & {
        externalUserId: string;
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, externalUserId: string, data: UpdateResumeInput): Promise<{
        externalUserId: string;
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, externalUserId: string): Promise<{
        externalUserId: string;
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    switchTemplate(id: string, externalUserId: string, templateId: string): Promise<{
        externalUserId: string;
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const resumeService: ResumeService;
//# sourceMappingURL=resume.service.d.ts.map