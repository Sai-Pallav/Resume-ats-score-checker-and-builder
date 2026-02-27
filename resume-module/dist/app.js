"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const resume_routes_1 = __importDefault(require("./routes/resume.routes"));
// import sectionRoutes from './routes/section.routes';
// import templateRoutes from './routes/template.routes';
// import atsRoutes from './routes/ats.routes';
const app = (0, express_1.default)();
// Global middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check (no auth required)
app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Auth middleware for all /api/v1/* routes below
app.use('/api/v1', auth_1.authMiddleware);
app.use('/api/v1/resumes', resume_routes_1.default);
// app.use('/api/v1/templates', templateRoutes);
// app.use('/api/v1/ats', atsRoutes);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map