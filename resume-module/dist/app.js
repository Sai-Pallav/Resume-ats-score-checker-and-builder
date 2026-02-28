"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const helmet_1 = __importDefault(require("helmet"));
const requestId_1 = require("./middleware/requestId");
const auth_1 = require("./middleware/auth");
const adminAuth_1 = require("./middleware/adminAuth");
const errorHandler_1 = require("./middleware/errorHandler");
const resume_routes_1 = __importDefault(require("./routes/resume.routes"));
const section_routes_1 = __importDefault(require("./routes/section.routes"));
const template_routes_1 = __importDefault(require("./routes/template.routes"));
const ats_routes_1 = __importDefault(require("./routes/ats.routes"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const response_1 = require("./utils/response");
const cleanup_1 = require("./utils/cleanup");
const pdf_service_1 = require("./services/pdf/pdf.service");
let swaggerDocument;
try {
    swaggerDocument = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../swagger-output.json'), 'utf8'));
}
catch (err) {
    console.warn('swagger-output.json not found, generating empty docs.');
    swaggerDocument = {};
}
const app = (0, express_1.default)();
// Start background cron jobs
(0, cleanup_1.initializeCleanupJob)();
// Global middleware
app.use((0, helmet_1.default)());
app.use(requestId_1.requestIdMiddleware);
// CORS Configuration
app.use((0, cors_1.default)({
    origin: env_1.config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-user-id'] // x-user-id is essential for our auth
}));
app.use(express_1.default.json());
// Health check (no auth required)
app.get('/api/v1/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    let storageStatus = 'unwritable';
    let puppeteerStatus = 'unavailable';
    // 1. Check Database
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        dbStatus = 'connected';
    }
    catch (e) {
        dbStatus = 'error';
    }
    // 2. Check Storage Permissions
    try {
        await fs_1.default.promises.access(env_1.config.uploadDir, fs_1.default.constants.W_OK);
        storageStatus = 'writable';
    }
    catch (e) {
        storageStatus = 'error';
    }
    // 3. Check Puppeteer Availability
    try {
        const isConnected = await (0, pdf_service_1.checkPuppeteerHealth)();
        puppeteerStatus = isConnected ? 'ready' : 'error';
    }
    catch (e) {
        puppeteerStatus = 'error';
    }
    const isHealthy = dbStatus === 'connected' && storageStatus === 'writable' && puppeteerStatus === 'ready';
    (0, response_1.sendSuccess)(res, {
        status: isHealthy ? 'ok' : 'degraded',
        db: dbStatus,
        storage: storageStatus,
        puppeteer: puppeteerStatus,
        serverTime: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Auth middleware for all /api/v1/* routes below
app.use('/api/v1', auth_1.authMiddleware);
// Protected Swagger Docs
app.use('/api/v1/docs', adminAuth_1.adminAuthMiddleware, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Routes
app.use('/api/v1/resumes', resume_routes_1.default);
app.use('/api/v1/resumes/:id/sections', section_routes_1.default);
app.use('/api/v1/templates', template_routes_1.default);
app.use('/api/v1/ats', ats_routes_1.default);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map