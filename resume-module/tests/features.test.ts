import { config } from 'dotenv';
config();
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import fs from 'fs';
import path from 'path';

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        resume: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
        atsReport: {
            create: vi.fn(),
        },
        $transaction: vi.fn((cb) => typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb)),
    }
}));

vi.mock('../src/utils/prisma', () => ({
    default: mockPrisma,
    __esModule: true,
}));

import prisma from '../src/utils/prisma';

// Mock other services
vi.mock('../src/services/pdf/pdf.service', async () => {
    const actual = await vi.importActual('../src/services/pdf/pdf.service') as any;
    return {
        ...actual,
        pdfService: {
            ...actual.pdfService,
            generatePdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock content')),
            getCachedPdf: vi.fn().mockResolvedValue(null),
            cachePdf: vi.fn().mockResolvedValue(undefined)
        }
    };
});

vi.mock('../src/services/ats/textExtractor', () => ({
    extractText: vi.fn().mockResolvedValue({
        text: 'This is a mocked resume content for ATS testing. It contains sections like experience and education. Senior Developer at Tech Corp.',
        pageCount: 1,
        wordCount: 20,
        lineCount: 5,
        isEmpty: false
    })
}));

describe('Feature Integration Tests (Mocked DB)', () => {
    const userId = 'feature-test-user';
    const mockResumeId = 'resume-456';

    beforeEach(async () => {
        (prisma.resume.create as any).mockResolvedValue({ id: mockResumeId });
        (prisma.resume.findFirst as any).mockResolvedValue({ id: mockResumeId, title: 'Saved Resume' });
        (prisma.atsReport.create as any).mockResolvedValue({ id: 'report-789', overallScore: 90 });
    });

    it('should export a PDF for a resume (Mocked)', async () => {
        const res = await request(app)
            .get(`/api/v1/resumes/${mockResumeId}/pdf`)
            .set('X-User-ID', userId);

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('application/pdf');
        expect(res.body).toBeDefined();
    });

    it('should analyze an uploaded PDF (Mocked Extraction)', async () => {
        // Create a dummy file for upload
        const dummyPath = path.join(__dirname, 'dummy.pdf');
        fs.writeFileSync(dummyPath, '%PDF-1.4 dummy file');

        const res = await request(app)
            .post('/api/v1/ats/analyze')
            .set('X-User-ID', userId)
            .attach('file', dummyPath)
            .field('jobDescription', 'Looking for a Senior Developer with Node.js experience');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('overallScore');
        expect(res.body).toHaveProperty('reportId');

        fs.unlinkSync(dummyPath);
    });

    it('should analyze a saved resume from DB', async () => {
        const res = await request(app)
            .post(`/api/v1/ats/analyze-resume/${mockResumeId}`)
            .set('X-User-ID', userId)
            .send({
                jobDescription: 'Seeking backend experts'
            });

        expect(res.status).toBe(200);
        expect(res.body.overallScore).toBeGreaterThanOrEqual(0);
        expect(res.body.overallScore).toBeLessThanOrEqual(100);
    });

    it('should perform a quick scan of resume JSON', async () => {
        const res = await request(app)
            .post('/api/v1/ats/quick-scan')
            .set('X-User-ID', userId)
            .send({
                resume: {
                    sections: [
                        { type: 'experience', data: [{ title: 'Dev', description: ['Built apps'] }] }
                    ]
                }
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('weakBullets');
    });
});
