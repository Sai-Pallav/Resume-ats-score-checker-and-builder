import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import resumeRoutes from './routes/resume.routes';
import sectionRoutes from './routes/section.routes';
// import templateRoutes from './routes/template.routes';
import atsRoutes from './routes/ats.routes';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth middleware for all /api/v1/* routes below
app.use('/api/v1', authMiddleware);

// Routes — uncomment as you implement
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/resumes/:id/sections', sectionRoutes);
// app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/ats', atsRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
