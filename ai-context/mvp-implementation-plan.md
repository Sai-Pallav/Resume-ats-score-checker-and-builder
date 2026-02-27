# Resume Builder & ATS Checker — MVP Implementation Plan (Incremental)

> **Goal:** Safe, incremental developer tasks with starter skeletons. NOT full codebase.

---

## STEP 1 — DAY 1: BACKEND FOUNDATION

### 1.1 Folder Creation

```bash
mkdir -p resume-module
cd resume-module

mkdir -p src/config
mkdir -p src/middleware
mkdir -p src/routes
mkdir -p src/controllers
mkdir -p src/services
mkdir -p src/services/ats
mkdir -p src/schemas
mkdir -p src/templates
mkdir -p src/utils
mkdir -p src/types
mkdir -p prisma
mkdir -p uploads
mkdir -p tests
```

### 1.2 Initialize Project

```bash
npm init -y
npm install express @prisma/client zod multer cors helmet dotenv handlebars puppeteer pdf-parse
npm install -D typescript prisma ts-node tsx @types/express @types/multer @types/cors @types/node nodemon vitest
npx tsc --init
npx prisma init
```

### 1.3 Skeleton: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.4 Skeleton: `.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://resume_user:resume_pass@localhost:5432/resume_module
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

### 1.5 Skeleton: `src/config/env.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};
```

### 1.6 Skeleton: `src/utils/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### 1.7 Skeleton: `src/utils/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

export class AuthError extends AppError {
  constructor() {
    super(401, 'UNAUTHORIZED', 'Missing or invalid user identity');
  }
}
```

### 1.8 Skeleton: `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../utils/errors';

// Extend Express Request to carry externalUserId
declare global {
  namespace Express {
    interface Request {
      externalUserId: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  // Priority: X-User-ID header (MVP: trust this header)
  const userId = req.headers['x-user-id'] as string | undefined;

  if (!userId || userId.trim() === '') {
    return next(new AuthError());
  }

  req.externalUserId = userId.trim();
  next();
}
```

### 1.9 Skeleton: `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
```

### 1.10 Skeleton: `src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        name: 'AppError',
      } as any);
    }
    req[source] = result.data;
    next();
  };
}
```

### 1.11 Skeleton: `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
// import routes here as you build them
// import resumeRoutes from './routes/resume.routes';
// import sectionRoutes from './routes/section.routes';
// import templateRoutes from './routes/template.routes';
// import atsRoutes from './routes/ats.routes';

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
// app.use('/api/v1/resumes', resumeRoutes);
// app.use('/api/v1/templates', templateRoutes);
// app.use('/api/v1/ats', atsRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

### 1.12 Skeleton: `src/index.ts`

```typescript
import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`[resume-module] Server running on port ${config.port}`);
  console.log(`[resume-module] Environment: ${config.nodeEnv}`);
});
```

### 1.13 Skeleton: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Resume {
  id              String    @id @default(uuid())
  externalUserId  String    @map("external_user_id")
  title           String    @default("Untitled Resume")
  templateId      String    @default("classic") @map("template_id")
  summary         String?
  contactInfo     Json?     @map("contact_info")
  isDraft         Boolean   @default(true) @map("is_draft")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  sections        ResumeSection[]
  atsReports      AtsReport[]

  @@index([externalUserId])
  @@map("resumes")
}

model ResumeSection {
  id         String   @id @default(uuid())
  resumeId   String   @map("resume_id")
  type       String
  data       Json
  sortOrder  Int      @default(0) @map("sort_order")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  resume     Resume   @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([resumeId])
  @@map("resume_sections")
}

model AtsReport {
  id              String   @id @default(uuid())
  externalUserId  String   @map("external_user_id")
  resumeId        String?  @map("resume_id")
  fileName        String   @map("file_name")
  filePath        String   @map("file_path")
  jobDescription  String?  @map("job_description")
  extractedText   String?  @map("extracted_text")
  overallScore    Float?   @map("overall_score")
  sectionScores   Json?    @map("section_scores")
  keywords        Json?
  formatting      Json?
  readability     Json?
  suggestions     Json?
  createdAt       DateTime @default(now()) @map("created_at")

  resume          Resume?  @relation(fields: [resumeId], references: [id], onDelete: SetNull)

  @@index([externalUserId])
  @@map("ats_reports")
}
```

### 1.14 Skeleton: Resume CRUD Module Structure

**`src/schemas/resume.schema.ts`**

```typescript
import { z } from 'zod';

export const createResumeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  templateId: z.enum(['classic', 'modern', 'minimal']).optional(),
  summary: z.string().max(2000).optional(),
  contactInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
    location: z.string().optional(),
  }).optional(),
});

export const updateResumeSchema = createResumeSchema.extend({
  isDraft: z.boolean().optional(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
```

**`src/services/resume.service.ts`** (interface only)

```typescript
import prisma from '../utils/prisma';
import { CreateResumeInput, UpdateResumeInput } from '../schemas/resume.schema';
import { NotFoundError } from '../utils/errors';

export class ResumeService {
  async create(externalUserId: string, data: CreateResumeInput) {
    // TODO: prisma.resume.create({ data: { externalUserId, ...data } })
    throw new Error('Not implemented');
  }

  async findAllByUser(externalUserId: string) {
    // TODO: prisma.resume.findMany({ where: { externalUserId } })
    throw new Error('Not implemented');
  }

  async findById(id: string, externalUserId: string) {
    // TODO: prisma.resume.findFirst({ where: { id, externalUserId }, include: { sections: true } })
    // Throw NotFoundError if null
    throw new Error('Not implemented');
  }

  async update(id: string, externalUserId: string, data: UpdateResumeInput) {
    // TODO: verify ownership, then prisma.resume.update()
    throw new Error('Not implemented');
  }

  async delete(id: string, externalUserId: string) {
    // TODO: verify ownership, then prisma.resume.delete()
    throw new Error('Not implemented');
  }

  async switchTemplate(id: string, externalUserId: string, templateId: string) {
    // TODO: update only templateId field — data stays intact
    throw new Error('Not implemented');
  }
}

export const resumeService = new ResumeService();
```

**`src/controllers/resume.controller.ts`** (interface only)

```typescript
import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';

export class ResumeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.create(req.externalUserId, req.body);
      res.status(201).json({ data: resume });
    } catch (err) { next(err); }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeService.findAllByUser(req.externalUserId);
      res.json({ data: resumes });
    } catch (err) { next(err); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.findById(req.params.id, req.externalUserId);
      res.json({ data: resume });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.update(req.params.id, req.externalUserId, req.body);
      res.json({ data: resume });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await resumeService.delete(req.params.id, req.externalUserId);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  async switchTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.switchTemplate(
        req.params.id, req.externalUserId, req.body.templateId
      );
      res.json({ data: resume });
    } catch (err) { next(err); }
  }
}

export const resumeController = new ResumeController();
```

**`src/routes/resume.routes.ts`** (interface only)

```typescript
import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { validate } from '../middleware/validate';
import { createResumeSchema, updateResumeSchema } from '../schemas/resume.schema';

const router = Router();

router.post('/', validate(createResumeSchema), resumeController.create);
router.get('/', resumeController.findAll);
router.get('/:id', resumeController.findById);
router.put('/:id', validate(updateResumeSchema), resumeController.update);
router.delete('/:id', resumeController.delete);
router.put('/:id/template', resumeController.switchTemplate);
// GET /:id/preview  — add in Day 2
// GET /:id/pdf      — add in Day 2

export default router;
```

### 1.15 Skeleton: `package.json` scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "npx prisma migrate dev",
    "db:push": "npx prisma db push",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio",
    "test": "vitest run"
  }
}
```

---

## STEP 2 — DAY 2: ATS MODULE FOUNDATION

### 2.1 File Upload Handler

**`src/middleware/upload.ts`** (Multer config — complete)

```typescript
import multer from 'multer';
import path from 'path';
import { config } from '../config/env';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});
```

### 2.2 ATS Pipeline — Interface Definitions

**`src/types/index.ts`**

```typescript
// --- ATS Pipeline Types ---

export interface ExtractionResult {
  text: string;
  pageCount: number;
}

export interface SectionDetectionResult {
  detected: string[];     // ["contact", "experience", "education", "skills"]
  missing: string[];      // ["summary", "projects", "certifications"]
  score: number;          // 0-100
}

export interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  jdKeywords: string[];
  score: number;          // 0-100
}

export interface FormatCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface FormatAnalysisResult {
  checks: FormatCheck[];
  score: number;          // 0-100
}

export interface ReadabilityResult {
  avgSentenceLength: number;
  actionVerbCount: number;
  quantificationCount: number;
  wordCount: number;
  score: number;          // 0-100
}

export interface Suggestion {
  category: 'keywords' | 'sections' | 'formatting' | 'readability' | 'content';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface AtsReportResult {
  overallScore: number;
  sectionScores: {
    keyword: { score: number; weight: number };
    sections: { score: number; weight: number };
    formatting: { score: number; weight: number };
    readability: { score: number; weight: number };
  };
  keywords: KeywordMatchResult;
  formatting: FormatAnalysisResult;
  readability: ReadabilityResult;
  sectionsDetected: SectionDetectionResult;
  suggestions: Suggestion[];
}
```

### 2.3 ATS Pipeline — Starter Skeletons

**`src/services/ats/textExtractor.ts`**

```typescript
import fs from 'fs';
import pdf from 'pdf-parse';
import { ExtractionResult } from '../../types';

export async function extractText(filePath: string): Promise<ExtractionResult> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  return {
    text: data.text.trim(),
    pageCount: data.numpages,
  };
}
```

**`src/services/ats/sectionDetector.ts`**

```typescript
import { SectionDetectionResult } from '../../types';

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  contact:        [/email|phone|linkedin|github/i],
  summary:        [/summary|objective|profile|about\s*me/i],
  experience:     [/experience|work\s*history|employment/i],
  education:      [/education|academic|university|degree/i],
  skills:         [/skills|technologies|technical|competencies/i],
  projects:       [/projects|portfolio/i],
  certifications: [/certifications?|licenses?|credentials?/i],
};

const EXPECTED_SECTIONS = Object.keys(SECTION_PATTERNS);

export function detectSections(text: string): SectionDetectionResult {
  // TODO: iterate SECTION_PATTERNS, test against text
  // Return detected[], missing[], score
  throw new Error('Not implemented');
}
```

**`src/services/ats/keywordMatcher.ts`**

```typescript
import { KeywordMatchResult } from '../../types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'through', 'during',
  'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
  'of', 'into', 'that', 'this', 'these', 'those', 'not', 'no',
  'we', 'you', 'they', 'he', 'she', 'it', 'i', 'me', 'my',
]);

export function matchKeywords(resumeText: string, jobDescription: string): KeywordMatchResult {
  // TODO:
  // 1. Tokenize JD → words
  // 2. Remove stop words
  // 3. Deduplicate
  // 4. Check each keyword against lowercase resumeText
  // 5. Return matched[], missing[], score
  throw new Error('Not implemented');
}
```

**`src/services/ats/formatAnalyzer.ts`**

```typescript
import { FormatAnalysisResult } from '../../types';

export function analyzeFormat(text: string, pageCount: number): FormatAnalysisResult {
  // TODO: Run checks:
  // - Email present (regex: /[\w.-]+@[\w.-]+\.\w+/)
  // - Phone present (regex: /[\+]?[\d\s\-\(\)]{10,}/)
  // - Bullet points used (detect •, -, ▪, ►, ●)
  // - Page count 1-2
  // - Word count 300-1000
  // - Section headers detected
  // Return checks[], score
  throw new Error('Not implemented');
}
```

**`src/services/ats/readabilityScorer.ts`**

```typescript
import { ReadabilityResult } from '../../types';

const ACTION_VERBS = [
  'led', 'built', 'designed', 'developed', 'managed', 'created',
  'implemented', 'improved', 'increased', 'reduced', 'achieved',
  'delivered', 'launched', 'optimized', 'automated', 'established',
  'analyzed', 'coordinated', 'executed', 'generated', 'maintained',
  'negotiated', 'organized', 'resolved', 'streamlined', 'supervised',
];

export function scoreReadability(text: string): ReadabilityResult {
  // TODO:
  // 1. Split into sentences (by . ! ?)
  // 2. Calculate avg sentence length
  // 3. Count action verbs at start of lines
  // 4. Count quantifications (numbers, %, $)
  // 5. Word count
  // 6. Composite score
  throw new Error('Not implemented');
}
```

**`src/services/ats/suggestionEngine.ts`**

```typescript
import {
  Suggestion,
  SectionDetectionResult,
  KeywordMatchResult,
  FormatAnalysisResult,
  ReadabilityResult,
} from '../../types';

export function generateSuggestions(
  sections: SectionDetectionResult,
  keywords: KeywordMatchResult | null,
  formatting: FormatAnalysisResult,
  readability: ReadabilityResult,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // TODO: Rule-based suggestion generation
  // - Missing keywords → HIGH priority
  // - Missing sections → MEDIUM priority
  // - Failed format checks → MEDIUM priority
  // - Readability issues → LOW priority

  return suggestions;
}
```

**`src/services/ats/ats.service.ts`** (orchestrator skeleton)

```typescript
import { extractText } from './textExtractor';
import { detectSections } from './sectionDetector';
import { matchKeywords } from './keywordMatcher';
import { analyzeFormat } from './formatAnalyzer';
import { scoreReadability } from './readabilityScorer';
import { generateSuggestions } from './suggestionEngine';
import { AtsReportResult } from '../../types';
import prisma from '../../utils/prisma';

export class AtsService {
  async analyze(
    filePath: string,
    fileName: string,
    externalUserId: string,
    jobDescription?: string,
    resumeId?: string,
  ): Promise<AtsReportResult> {
    // STEP 1: Extract text
    const { text, pageCount } = await extractText(filePath);

    // STEP 2: Detect sections
    const sections = detectSections(text);

    // STEP 3: Keyword matching (only if JD provided)
    const keywords = jobDescription ? matchKeywords(text, jobDescription) : null;

    // STEP 4: Format analysis
    const formatting = analyzeFormat(text, pageCount);

    // STEP 5: Readability
    const readability = scoreReadability(text);

    // STEP 6: Calculate overall score
    // TODO: weighted average calculation

    // STEP 7: Generate suggestions
    const suggestions = generateSuggestions(sections, keywords, formatting, readability);

    // STEP 8: Save to database
    // TODO: prisma.atsReport.create(...)

    // STEP 9: Return report
    throw new Error('Not implemented');
  }
}

export const atsService = new AtsService();
```

### 2.4 ATS Routes Skeleton

**`src/schemas/ats.schema.ts`**

```typescript
import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  jobDescription: z.string().min(10).max(10000).optional(),
});
```

**`src/routes/ats.routes.ts`**

```typescript
import { Router } from 'express';
import { upload } from '../middleware/upload';
// import { atsController } from '../controllers/ats.controller';

const router = Router();

// POST /api/v1/ats/analyze — upload PDF + optional JD
router.post('/analyze', upload.single('file'), /* atsController.analyze */);

// POST /api/v1/ats/analyze-resume/:resumeId — analyze saved resume
router.post('/analyze-resume/:resumeId', /* atsController.analyzeResume */);

// GET /api/v1/ats/reports — list reports
router.get('/reports', /* atsController.listReports */);

// GET /api/v1/ats/reports/:id — get report
router.get('/reports/:id', /* atsController.getReport */);

// DELETE /api/v1/ats/reports/:id — delete report
router.delete('/reports/:id', /* atsController.deleteReport */);

export default router;
```

---

## STEP 3 — PDF EXPORT FOUNDATION

### 3.1 Template Renderer Skeleton

**`src/services/template.service.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

// Cache compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

export class TemplateService {
  getAvailableTemplates() {
    return [
      { id: 'classic', name: 'Classic', description: 'Traditional single-column layout' },
      { id: 'modern', name: 'Modern', description: 'Two-column with accent colors' },
      { id: 'minimal', name: 'Minimal', description: 'Clean whitespace-focused design' },
    ];
  }

  renderToHtml(templateId: string, resumeData: any): string {
    // TODO:
    // 1. Load .hbs file from templates/ directory
    // 2. Compile with Handlebars (use cache)
    // 3. Pass resumeData to template
    // 4. Return HTML string
    throw new Error('Not implemented');
  }
}

export const templateService = new TemplateService();
```

### 3.2 Puppeteer PDF Service Skeleton

**`src/services/pdf.service.ts`**

```typescript
import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;
let pdfCount = 0;
const MAX_PDFS_BEFORE_RESTART = 50;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected() || pdfCount >= MAX_PDFS_BEFORE_RESTART) {
    if (browser) await browser.close().catch(() => {});
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    pdfCount = 0;
  }
  return browser;
}

export class PdfService {
  async generatePdf(html: string): Promise<Buffer> {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
        printBackground: true,
      });

      pdfCount++;
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}

export const pdfService = new PdfService();

// Cleanup on process exit
process.on('exit', () => { browser?.close().catch(() => {}); });
process.on('SIGINT', () => { browser?.close().catch(() => {}); process.exit(); });
```

### 3.3 Minimal Template Placeholder

**`src/templates/classic.hbs`**

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* TODO: Add template-specific CSS */
    body { font-family: 'Georgia', serif; margin: 0; padding: 40px; color: #333; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 4px; margin-top: 20px; }
    .contact { font-size: 12px; color: #666; }
    .entry { margin-bottom: 12px; }
    .entry-header { display: flex; justify-content: space-between; }
    ul { margin: 4px 0; padding-left: 20px; }
  </style>
</head>
<body>
  {{!-- TODO: Build out full template with resume data --}}
  <h1>{{contact.fullName}}</h1>
  <div class="contact">
    {{contact.email}} | {{contact.phone}} | {{contact.location}}
  </div>

  {{#if summary}}
  <h2>Summary</h2>
  <p>{{summary}}</p>
  {{/if}}

  {{!-- TODO: experience, education, skills, projects, certifications sections --}}
</body>
</html>
```

---

## STEP 4 — LOCAL DEVELOPMENT SETUP

### 4.1 Docker Compose

**`docker-compose.yml`**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: resume_user
      POSTGRES_PASSWORD: resume_pass
      POSTGRES_DB: resume_module
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U resume_user -d resume_module"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 4.2 Setup Commands (Run in Order)

```bash
# 1. Start PostgreSQL
docker compose up -d db

# 2. Verify DB is running
docker compose ps
docker compose logs db

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migration
npx prisma migrate dev --name init

# 6. Verify tables created
npx prisma studio
# → Opens browser at localhost:5555, verify tables exist

# 7. Start dev server
npm run dev
# → Server running on http://localhost:3000

# 8. Test health endpoint
curl http://localhost:3000/api/v1/health
# → {"status":"ok","timestamp":"..."}
```

### 4.3 Database Seed (Optional)

```bash
# Create seed file
# prisma/seed.ts — insert sample template metadata
npx tsx prisma/seed.ts
```

---

## STEP 5 — TEST CHECKPOINTS

### ✅ Checkpoint 1: Project Boots (End of Day 1, Hour 2)

- [ ] `docker compose up -d db` → PostgreSQL running on port 5432
- [ ] `npx prisma migrate dev --name init` → Tables created without errors
- [ ] `npx prisma studio` → Can see `resumes`, `resume_sections`, `ats_reports` tables
- [ ] `npm run dev` → Server starts on port 3000
- [ ] `curl http://localhost:3000/api/v1/health` → Returns `{"status":"ok"}`
- [ ] `curl http://localhost:3000/api/v1/resumes` → Returns `401` (no X-User-ID)
- [ ] `curl -H "X-User-ID: test-user" http://localhost:3000/api/v1/resumes` → Returns `200` (empty array or route hit)

### ✅ Checkpoint 2: Resume CRUD Works (End of Day 1)

- [ ] POST `/api/v1/resumes` with `X-User-ID` header → Creates resume, returns 201
- [ ] GET `/api/v1/resumes` → Returns list of user's resumes
- [ ] GET `/api/v1/resumes/:id` → Returns resume with sections
- [ ] PUT `/api/v1/resumes/:id` → Updates title/summary/contact
- [ ] DELETE `/api/v1/resumes/:id` → Returns 204
- [ ] POST `/api/v1/resumes/:id/sections` with `type: "experience"` → Adds section
- [ ] PUT `/api/v1/resumes/:id/sections/:sectionId` → Updates section data
- [ ] DELETE `/api/v1/resumes/:id/sections/:sectionId` → Removes section
- [ ] PUT `/api/v1/resumes/:id/template` with `templateId: "modern"` → Switches template, data intact
- [ ] Verify: User A cannot see User B's resumes (different X-User-ID)

### ✅ Checkpoint 3: Templates & PDF Work (End of Day 2, Hour 5)

- [ ] GET `/api/v1/templates` → Returns list of 3 templates
- [ ] GET `/api/v1/resumes/:id/preview` → Returns HTML string
- [ ] GET `/api/v1/resumes/:id/pdf` → Downloads valid PDF file
- [ ] PDF opens in browser/reader without errors
- [ ] PDF contains resume data (name, experience, etc.)
- [ ] Switching template and re-exporting PDF → Different layout, same data

### ✅ Checkpoint 4: ATS Text Extraction Works (End of Day 2, Hour 6)

- [ ] POST `/api/v1/ats/analyze` with PDF file upload → File saved to `uploads/`
- [ ] Text extraction returns non-empty text
- [ ] Non-PDF file upload → Returns 400 error
- [ ] File > 10MB → Returns 413 error

### ✅ Checkpoint 5: ATS Full Pipeline Works (End of Day 2)

- [ ] POST `/api/v1/ats/analyze` with PDF + jobDescription → Returns full report
- [ ] Report contains: `overallScore` (0-100)
- [ ] Report contains: `sectionScores` with 4 sub-scores
- [ ] Report contains: `keywords.matched[]` and `keywords.missing[]`
- [ ] Report contains: `formatting.checks[]` with pass/fail
- [ ] Report contains: `readability` metrics
- [ ] Report contains: `suggestions[]` with category + priority + message
- [ ] POST without jobDescription → Still returns report (keywords section skipped, reweighted)
- [ ] Report saved to database
- [ ] GET `/api/v1/ats/reports` → Returns list of reports
- [ ] GET `/api/v1/ats/reports/:id` → Returns specific report

### ✅ Checkpoint 6: Full Integration (End of Day 3)

- [ ] Create resume → Add sections → Preview → Export PDF → Upload PDF to ATS → Get score
- [ ] Score saved resume directly: POST `/api/v1/ats/analyze-resume/:resumeId` with JD
- [ ] Delete resume → Cascades sections, ATS report `resume_id` set to null
- [ ] Docker build: `docker build -t resume-module .` → Builds without errors
- [ ] Docker run: Full app + DB via `docker compose up` → All endpoints work
- [ ] `.env.example` contains all required variables
- [ ] README has setup instructions

### ✅ Checkpoint 7: Edge Cases (End of Day 3)

- [ ] Empty resume (no sections) → Preview/PDF still renders
- [ ] Resume with all section types → Preview/PDF renders correctly
- [ ] Very long resume text → PDF generates (may be multi-page)
- [ ] Scanned/image PDF → ATS returns meaningful error (not crash)
- [ ] Empty job description → ATS skips keyword matching gracefully
- [ ] Invalid resume ID → Returns 404
- [ ] Missing X-User-ID header → Returns 401
- [ ] Malformed JSON body → Returns 400 with Zod error details

---

## Quick Reference: File Implementation Order

```
Day 1 (implement in this order):
  1.  .env + config/env.ts
  2.  docker-compose.yml → start DB
  3.  prisma/schema.prisma → migrate
  4.  utils/prisma.ts
  5.  utils/errors.ts
  6.  middleware/auth.ts
  7.  middleware/errorHandler.ts
  8.  middleware/validate.ts
  9.  app.ts + index.ts → verify server boots
  10. schemas/resume.schema.ts + section.schema.ts
  11. services/resume.service.ts (implement CRUD)
  12. services/section.service.ts (implement CRUD)
  13. controllers/resume.controller.ts
  14. controllers/section.controller.ts
  15. routes/resume.routes.ts + section.routes.ts
  16. Wire routes into app.ts → test all CRUD

Day 2 (implement in this order):
  17. templates/classic.hbs (full template)
  18. templates/modern.hbs
  19. templates/minimal.hbs
  20. services/template.service.ts (implement render)
  21. services/pdf.service.ts (already mostly done)
  22. controllers/template.controller.ts
  23. routes/template.routes.ts
  24. Add preview + PDF routes to resume.routes.ts
  25. middleware/upload.ts
  26. services/ats/textExtractor.ts (already done)
  27. services/ats/sectionDetector.ts (implement)
  28. services/ats/keywordMatcher.ts (implement)
  29. services/ats/formatAnalyzer.ts (implement)
  30. services/ats/readabilityScorer.ts (implement)
  31. services/ats/suggestionEngine.ts (implement)
  32. services/ats/ats.service.ts (implement orchestrator)

Day 3 (implement in this order):
  33. controllers/ats.controller.ts
  34. routes/ats.routes.ts (wire up)
  35. schemas/ats.schema.ts
  36. Dockerfile
  37. Update docker-compose.yml (add app service)
  38. tests/resume.test.ts
  39. tests/ats.test.ts
  40. README.md
  41. .env.example
  42. Full flow smoke test
```

---

*Implementation Plan v1.0 | Generated: 2026-02-26*