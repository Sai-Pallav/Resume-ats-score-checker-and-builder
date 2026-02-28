import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('ATS API Endpoints', () => {
    // We would ideally mock PDF processing and DB here, but for MVP we verify routing and structure
    it('POST /api/v1/ats/extract should reject requests without a file', async () => {
        const res = await request(app)
            .post('/api/v1/ats/extract')
            .set('X-User-ID', 'test-user-123'); // Fake auth

        // Multer handles file checking before the controller, or controller throws
        expect(res.status).toBe(400); // Bad Request
    });

    it('POST /api/v1/ats/analyze should enforce authentication', async () => {
        const res = await request(app)
            .post('/api/v1/ats/analyze');
        // No X-User-ID header provided

        expect(res.status).toBe(401); // Unauthorized
    });
});
