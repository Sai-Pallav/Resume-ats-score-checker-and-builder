import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import helmet from 'helmet';
import { requestIdMiddleware } from './middleware/requestId';
import { authMiddleware } from './middleware/auth';
import { adminAuthMiddleware } from './middleware/adminAuth';
import { errorHandler } from './middleware/errorHandler';
import resumeRoutes from './routes/resume.routes';
import sectionRoutes from './routes/section.routes';
import templateRoutes from './routes/template.routes';
import atsRoutes from './routes/ats.routes';
import prisma from './utils/prisma';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { sendSuccess } from './utils/response';
import { initializeCleanupJob } from './utils/cleanup';
import { checkPuppeteerHealth } from './services/pdf/pdf.service';

let swaggerDocument: any;
try {
    swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../swagger-output.json'), 'utf8'));
} catch (err) {
    console.warn('swagger-output.json not found, generating empty docs.');
    swaggerDocument = {};
}

const app = express();

// Start background cron jobs
initializeCleanupJob();

// Global middleware
app.use(helmet());
app.use(requestIdMiddleware);

// CORS Configuration
app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-user-id'] // x-user-id is essential for our auth
}));

app.use(express.json());

// Health check (no auth required)
app.get('/api/v1/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    let storageStatus = 'unwritable';
    let puppeteerStatus = 'unavailable';

    // 1. Check Database
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error';
    }

    // 2. Check Storage Permissions
    try {
        await fs.promises.access(config.uploadDir, fs.constants.W_OK);
        storageStatus = 'writable';
    } catch (e) {
        storageStatus = 'error';
    }

    // 3. Check Puppeteer Availability
    try {
        const isConnected = await checkPuppeteerHealth();
        puppeteerStatus = isConnected ? 'ready' : 'error';
    } catch (e) {
        puppeteerStatus = 'error';
    }

    const isHealthy = dbStatus === 'connected' && storageStatus === 'writable' && puppeteerStatus === 'ready';

    sendSuccess(res, {
        status: isHealthy ? 'ok' : 'degraded',
        db: dbStatus,
        storage: storageStatus,
        puppeteer: puppeteerStatus,
        serverTime: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Auth middleware for all /api/v1/* routes below
app.use('/api/v1', authMiddleware);

// Protected Swagger Docs
app.use('/api/v1/docs', adminAuthMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/resumes/:id/sections', sectionRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/ats', atsRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
