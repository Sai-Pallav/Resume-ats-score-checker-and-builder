import { CreateSectionInput, UpdateSectionInput, ReorderSectionsInput } from '../schemas/section.schema';
export declare class SectionService {
    private verifyResumeOwnership;
    create(resumeId: string, externalUserId: string, data: CreateSectionInput): Promise<{
        type: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        resumeId: string;
    }>;
    update(resumeId: string, sectionId: string, externalUserId: string, data: UpdateSectionInput): Promise<{
        type: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        resumeId: string;
    }>;
    delete(resumeId: string, sectionId: string, externalUserId: string): Promise<{
        type: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        resumeId: string;
    }>;
    reorder(resumeId: string, externalUserId: string, data: ReorderSectionsInput): Promise<{
        type: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        resumeId: string;
    }[]>;
}
export declare const sectionService: SectionService;
//# sourceMappingURL=section.service.d.ts.map