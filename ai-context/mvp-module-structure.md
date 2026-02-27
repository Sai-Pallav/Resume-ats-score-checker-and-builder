# Resume Builder & ATS Checker — MVP Module Structure (3-Day Build)

---

## STEP 1: Simplified Module Structure

```
resume-module/
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── index.ts
│   ├── app.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   │
│   ├── routes/
│   │   ├── resume.routes.ts
│   │   ├── section.routes.ts
│   │   ├── ats.routes.ts
│   │   └── template.routes.ts
│   │
│   ├── controllers/
│   │   ├── resume.controller.ts
│   │   ├── section.controller.ts
│   │   ├── ats.controller.ts
│   │   └── template.controller.ts
│   │
│   ├── services/
│   │   ├── resume.service.ts
│   │   ├── section.service.ts
│   │   ├── template.service.ts
│   │   ├── pdf.service.ts
│   │   └── ats/
│   │       ├── ats.service.ts
│   │       ├── textExtractor.ts
│   │       ├── sectionDetector.ts
│   │       ├── keywordMatcher.ts
│   │       ├── formatAnalyzer.ts
│   │       ├── readabilityScorer.ts
│   │       └── suggestionEngine.ts
│   │
│   ├── schemas/
│   │   ├── resume.schema.ts
│   │   ├── section.schema.ts
│   │   └── ats.schema.ts
│   │
│   ├── templates/
│   │   ├── classic.hbs
│   │   ├── modern.hbs
│   │   └── minimal.hbs
│   │
│   ├── utils/
│   │   ├── prisma.ts
│   │   └── errors.ts
│   │
│   └── types/
│       └── index.ts
│
├── uploads/
│
└── tests/
    ├── resume.test.ts
    └── ats.test.ts
```

**Total files to create: ~35**
**Total source files (src/): ~28**

---

## STEP 2: Required npm Dependencies ONLY

### Production Dependencies

- [ ] `express` — HTTP framework
- [ ] `@prisma/client` — Database ORM client
- [ ] `zod` — Request validation
- [ ] `multer` — File upload handling
- [ ] `pdf-parse` — PDF text extraction
- [ ] `puppeteer` — HTML-to-PDF generation
- [ ] `handlebars` — Resume HTML templates
- [ ] `cors` — Cross-origin requests
- [ ] `helmet` — Basic security headers
- [ ] `dotenv` — Environment variables
- [ ] `uuid` — ID generation (if not using Prisma default)

### Dev Dependencies

- [ ] `typescript` — Language
- [ ] `prisma` — ORM CLI + migrations
- [ ] `ts-node` — Run TS directly
- [ ] `tsx` — Fast TS execution (dev)
- [ ] `@types/express` — Express types
- [ ] `@types/multer` — Multer types
- [ ] `@types/cors` — CORS types
- [ ] `nodemon` — Dev auto-restart
- [ ] `vitest` — Testing

### NOT needed for MVP

- ~~winston / pino~~ → use `console.log` with timestamps
- ~~express-rate-limit~~ → add post-MVP
- ~~jsonwebtoken~~ → trust X-User-ID header for MVP
- ~~compromise / natural~~ → basic regex for NLP
- ~~swagger-ui-express~~ → add post-MVP
- ~~pm2~~ → use `node` directly in Docker

---

## STEP 3: Minimal Middleware Required

### Must Have (3 total)

- [ ] **auth.ts** — Extract `X-User-ID` from header, reject if missing. No JWT/API-key verification for MVP.
- [ ] **errorHandler.ts** — Catch all errors, return structured JSON `{ error: { code, message } }`.
- [ ] **validate.ts** — Zod schema validation wrapper for request body/params/query.

### Built-in (no custom code)

- [ ] `express.json()` — Parse JSON body
- [ ] `cors()` — Allow cross-origin
- [ ] `helmet()` — Basic security headers
- [ ] `multer` — File upload (configured inline in ATS routes)

### NOT needed for MVP

- ~~requestLogger.ts~~ → use Express built-in or skip
- ~~rateLimiter.ts~~ → add post-MVP
- ~~JWT verification middleware~~ → trust header for MVP

---

## STEP 4: ATS Pipeline MVP Components

### Text Extraction

- [ ] `textExtractor.ts`
  - Input: PDF file path
  - Process: `pdf-parse` → raw text string
  - Output: `{ text: string, pageCount: number }`

### Section Detection

- [ ] `sectionDetector.ts`
  - Input: raw text
  - Process: Regex matching for section headers
  - Detect: contact, summary, experience, education, skills, projects, certifications
  - Output: `{ detected: string[], missing: string[], score: number }`

### Keyword Matching

- [ ] `keywordMatcher.ts`
  - Input: resume text + job description text
  - Process:
    - Tokenize JD → extract significant words (remove stop words)
    - Lowercase comparison against resume text
    - Basic stemming (manual suffix stripping: -ing, -ed, -s, -tion)
  - Output: `{ matched: string[], missing: string[], score: number }`

### Format Analysis

- [ ] `formatAnalyzer.ts`
  - Input: raw text + page count
  - Checks:
    - [ ] Email present (regex)
    - [ ] Phone present (regex)
    - [ ] Bullet points used (•, -, ▪ detection)
    - [ ] Page count (1-2 ideal)
    - [ ] Word count (300-1000 ideal)
    - [ ] Section headers present
  - Output: `{ checks: { name, passed, detail }[], score: number }`

### Readability Scoring

- [ ] `readabilityScorer.ts`
  - Input: raw text
  - Metrics:
    - [ ] Average sentence length (split by . ! ?)
    - [ ] Action verb detection (starts with: Led, Built, Designed, Managed, etc.)
    - [ ] Quantification detection (regex for numbers, %, $)
  - Output: `{ metrics: object, score: number }`

### Suggestion Engine

- [ ] `suggestionEngine.ts`
  - Input: all scores + analysis results
  - Rules:
    - [ ] Missing keywords → "Add these keywords: X, Y, Z"
    - [ ] Missing sections → "Add a [section] section"
    - [ ] No bullets → "Use bullet points for achievements"
    - [ ] No numbers → "Quantify your achievements"
    - [ ] Too long/short → "Adjust resume length"
    - [ ] No action verbs → "Start bullets with action verbs"
    - [ ] Missing contact → "Add email/phone"
  - Output: `{ suggestions: { category, priority, message }[] }`

### Orchestrator

- [ ] `ats.service.ts`
  - Calls all 5 analyzers in sequence
  - Calculates weighted overall score:
    - Keyword: 40%
    - Sections: 15%
    - Formatting: 25%
    - Readability: 20%
  - Saves report to database
  - Returns complete report

---

## STEP 5: Components to Postpone After MVP

### Authentication (Post-MVP Week 1)

- [ ] JWT verification with parent platform public key
- [ ] API Key hashing + validation
- [ ] Per-user rate limiting
- [ ] Request signing verification

### Infrastructure (Post-MVP Week 1)

- [ ] PM2 process management
- [ ] Nginx reverse proxy config
- [ ] SSL/TLS certificate setup
- [ ] Health check endpoint with DB ping
- [ ] Graceful shutdown handling

### Monitoring & Logging (Post-MVP Week 2)

- [ ] Structured logging (Pino/Winston)
- [ ] Request/response logging middleware
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Disk usage monitoring for uploads

### API Documentation (Post-MVP Week 1)

- [ ] OpenAPI/Swagger spec
- [ ] Swagger UI endpoint
- [ ] Postman collection export

### ATS Enhancements (Post-MVP Week 2)

- [ ] Semantic keyword matching (embeddings)
- [ ] NLP library integration (compromise/natural)
- [ ] Industry-specific keyword databases
- [ ] OCR for scanned PDFs (Tesseract)
- [ ] Resume comparison (before/after)

### Storage (Post-MVP Week 2)

- [ ] S3/cloud file storage migration
- [ ] File cleanup cron job
- [ ] Upload virus scanning
- [ ] CDN for PDF serving

### Templates (Post-MVP Week 2)

- [ ] Additional templates (5+)
- [ ] Custom template builder
- [ ] Template thumbnail generation
- [ ] CSS-in-JS template rendering

### Testing (Post-MVP Week 1)

- [ ] Full integration test suite
- [ ] Load testing (autocannon)
- [ ] E2E API testing
- [ ] CI/CD pipeline (GitHub Actions)

### Features (Post-MVP Week 3)

- [ ] Resume versioning/history
- [ ] Batch ATS analysis
- [ ] Webhook notifications to parent platform
- [ ] Redis caching for template rendering
- [ ] AI-powered bullet point suggestions

---

## Quick Reference: MVP Build Order

### Day 1 Checklist

- [ ] `docker-compose.yml` (PostgreSQL only)
- [ ] `package.json` + install deps
- [ ] `tsconfig.json`
- [ ] `prisma/schema.prisma` + migrate
- [ ] `src/config/env.ts`
- [ ] `src/utils/prisma.ts`
- [ ] `src/utils/errors.ts`
- [ ] `src/middleware/auth.ts`
- [ ] `src/middleware/errorHandler.ts`
- [ ] `src/middleware/validate.ts`
- [ ] `src/app.ts`
- [ ] `src/index.ts`
- [ ] `src/schemas/resume.schema.ts`
- [ ] `src/schemas/section.schema.ts`
- [ ] `src/services/resume.service.ts`
- [ ] `src/services/section.service.ts`
- [ ] `src/controllers/resume.controller.ts`
- [ ] `src/controllers/section.controller.ts`
- [ ] `src/routes/resume.routes.ts`
- [ ] `src/routes/section.routes.ts`
- [ ] Test all CRUD endpoints manually

### Day 2 Checklist

- [ ] `src/templates/classic.hbs`
- [ ] `src/templates/modern.hbs`
- [ ] `src/templates/minimal.hbs`
- [ ] `src/services/template.service.ts`
- [ ] `src/services/pdf.service.ts`
- [ ] `src/controllers/template.controller.ts`
- [ ] `src/routes/template.routes.ts`
- [ ] Preview + PDF export endpoints
- [ ] `src/schemas/ats.schema.ts`
- [ ] `src/services/ats/textExtractor.ts`
- [ ] `src/services/ats/sectionDetector.ts`
- [ ] `src/services/ats/keywordMatcher.ts`
- [ ] `src/services/ats/formatAnalyzer.ts`
- [ ] `src/services/ats/readabilityScorer.ts`
- [ ] `src/services/ats/suggestionEngine.ts`
- [ ] `src/services/ats/ats.service.ts`

### Day 3 Checklist

- [ ] `src/controllers/ats.controller.ts`
- [ ] `src/routes/ats.routes.ts`
- [ ] Template switching endpoint
- [ ] Score saved resume endpoint
- [ ] `Dockerfile`
- [ ] Update `docker-compose.yml` (app + db)
- [ ] `tests/resume.test.ts`
- [ ] `tests/ats.test.ts`
- [ ] Full flow smoke test
- [ ] Bug fixes
- [ ] `.env.example` + README

---

*MVP Scope: 35 files | 11 npm packages | 3 middleware | 7 ATS components | 3 days*