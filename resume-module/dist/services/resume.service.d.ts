import { CreateResumeInput, UpdateResumeInput } from '../schemas/resume.schema';
export declare class ResumeService {
    create(externalUserId: string, data: CreateResumeInput): Promise<{
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllByUser(externalUserId: string): Promise<{
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
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
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, externalUserId: string, data: UpdateResumeInput): Promise<{
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, externalUserId: string): Promise<{
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    switchTemplate(id: string, externalUserId: string, templateId: string): Promise<{
        title: string;
        templateId: string;
        summary: string | null;
        contactInfo: import("@prisma/client/runtime/library").JsonValue | null;
        isDraft: boolean;
        id: string;
        externalUserId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const resumeService: ResumeService;
//# sourceMappingURL=resume.service.d.ts.map