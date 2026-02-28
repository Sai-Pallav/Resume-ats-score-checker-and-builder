import { config } from 'dotenv';
config();
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        resume: {
            create: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn((cb) => typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb)),
    }
}));

vi.mock('../src/utils/prisma', () => ({
    default: mockPrisma,
    __esModule: true,
}));

import prisma from '../src/utils/prisma';

describe('Resume Integration Tests (Mocked DB)', () => {
    const userA = 'user-alpha';
    const userB = 'user-beta';
    const mockResumeId = 'resume-123';

    it('should create a new resume for User A', async () => {
        (prisma.resume.create as any).mockResolvedValue({ id: mockResumeId, title: 'Fullstack Engineer Resume' });

        const res = await request(app)
            .post('/api/v1/resumes')
            .set('X-User-ID', userA)
            .send({
                title: 'Fullstack Engineer Resume',
                templateId: 'modern-dark'
            });

        expect(res.status).toBe(201);
        expect(res.body.data.id).toBe(mockResumeId);
    });

    it('should allow User A to read their own resume', async () => {
        (prisma.resume.findFirst as any).mockResolvedValue({ id: mockResumeId, externalUserId: userA });

        const res = await request(app)
            .get(`/api/v1/resumes/${mockResumeId}`)
            .set('X-User-ID', userA);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(mockResumeId);
    });

    it('should REJECT User B trying to read User A\'s resume', async () => {
        (prisma.resume.findFirst as any).mockResolvedValue(null); // Simulated: not found due to ownership check

        const res = await request(app)
            .get(`/api/v1/resumes/${mockResumeId}`)
            .set('X-User-ID', userB);

        expect(res.status).toBe(404);
    });

    it('should allow User A to update their resume', async () => {
        (prisma.resume.findFirst as any).mockResolvedValue({ id: mockResumeId, externalUserId: userA });
        (prisma.resume.update as any).mockResolvedValue({ id: mockResumeId, title: 'Updated Title' });

        const res = await request(app)
            .put(`/api/v1/resumes/${mockResumeId}`)
            .set('X-User-ID', userA)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Title');
    });

    it('should allow User A to delete their resume', async () => {
        (prisma.resume.findFirst as any).mockResolvedValue({ id: mockResumeId, externalUserId: userA });
        (prisma.resume.delete as any).mockResolvedValue({ id: mockResumeId });

        const res = await request(app)
            .delete(`/api/v1/resumes/${mockResumeId}`)
            .set('X-User-ID', userA);

        expect(res.status).toBe(200);
    });
});
