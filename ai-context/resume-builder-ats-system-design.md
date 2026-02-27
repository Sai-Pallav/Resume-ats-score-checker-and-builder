# Resume Builder & ATS Resume Score Checker — System Design Document

---

## STEP 1: Product Requirement Document (PRD)

### 1.1 Product Overview

| Field | Value |
|---|---|
| Product Name | Resume Builder & ATS Score Checker Module |
| Type | Embeddable module for parent platform |
| Auth Model | External (X-User-ID header / API Key / Parent JWT) |
| MVP Timeline | 3 days |
| Deployment | Single server, monolithic |

### 1.2 User Personas

| Persona | Description |
|---|---|
| Job Seeker | Creates/edits resumes, checks ATS score |
| Parent Platform | Consumes APIs, passes user identity |

### 1.3 Functional Requirements

#### Resume Builder

| ID | Feature | Priority |
|---|---|---|
| RB-01 | Create resume with structured sections (education, experience, skills, projects, certifications) | P0 |
| RB-02 | Update/delete resume sections independently | P0 |
| RB-03 | Multiple templates (minimum 3) sharing same data model | P0 |
| RB-04 | Live preview while editing | P0 |
| RB-05 | Switch templates without data loss | P0 |
| RB-06 | Export ATS-friendly PDF | P0 |
| RB-07 | Save resume drafts (auto-save) | P0 |
| RB-08 | List all resumes for a user | P0 |

#### ATS Resume Checker

| ID | Feature | Priority |
|---|---|---|
| ATS-01 | Upload resume PDF | P0 |
| ATS-02 | Extract text from PDF | P0 |
| ATS-03 | Detect resume sections (education, experience, skills, etc.) | P0 |
| ATS-04 | Match keywords against provided Job Description | P0 |
| ATS-05 | Analyze formatting (fonts, margins, bullet usage) | P0 |
| ATS-06 | Readability scoring (sentence length, complexity) | P0 |
| ATS-07 | Generate improvement suggestions | P0 |
| ATS-08 | Save ATS reports per user | P0 |
| ATS-09 | Retrieve historical ATS reports | P1 |

### 1.4 Non-Functional Requirements

| Requirement | Target |
|---|---|
| API Response Time | < 500ms (CRUD), < 5s (PDF export), < 10s (ATS analysis) |
| Concurrent Users | 100 simultaneous |
| PDF Size Limit | 10 MB |
| Resume Storage | Up to 10 resumes per user |
| Availability | 99.5% uptime |
| Data Retention | Indefinite (user-controlled deletion) |

### 1.5 Out of Scope

- User authentication/registration
- Payment/billing
- Email notifications
- Social sharing
- Resume hosting/public URLs

---

## STEP 2: System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PARENT PLATFORM                        │
│              (React Native App + Backend)                 │
│                                                           │
│  ┌─────────────┐    ┌──────────────────────────────────┐ │
│  │  Mobile App  │───▶│  Parent Backend (Auth + Routing) │ │
│  └─────────────┘    └──────────┬───────────────────────┘ │
└─────────────────────────────────┼─────────────────────────┘
                                  │
                    X-User-ID / API Key / JWT
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────┐
│              RESUME MODULE (This System)                  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │              API Gateway / Middleware              │    │
│  │  (Auth verification, Rate limiting, Validation)   │    │
│  └──────────┬──────────────────────┬─────────────────┘    │
│             │                      │                      │
│  ┌──────────▼──────────┐ ┌────────▼────────────────┐    │
│  │   Resume Service    │ │    ATS Checker Service   │    │
│  │                     │ │                          │    │
│  │ - CRUD Operations   │ │ - PDF Text Extraction    │    │
│  │ - Template Engine   │ │ - Section Detection      │    │
│  │ - PDF Generation    │ │ - Keyword Matching       │    │
│  │ - Draft Management  │ │ - Format Analysis        │    │
│  └──────────┬──────────┘ │ - Readability Scoring    │    │
│             │            │ - Suggestion Engine       │    │
│             │            └────────┬─────────────────┘    │
│             │                     │                       │
│  ┌──────────▼─────────────────────▼─────────────────┐    │
│  │              Data Access Layer (DAL)               │    │
│  └──────────┬─────────────────────┬─────────────────┘    │
│             │                     │                       │
│  ┌──────────▼──────────┐ ┌───────▼──────────────────┐   │
│  │    PostgreSQL DB    │ │   File Storage (Local)    │   │
│  │  (Resumes, Reports) │ │   (Uploaded PDFs, Exports)│   │
│  └─────────────────────┘ └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Authentication Flow

```
Request ──▶ Auth Middleware
               │
               ├── Check X-Api-Key header ──▶ Validate against stored API keys
               │
               ├── Check Authorization: Bearer <JWT> ──▶ Verify with parent's public key
               │
               └── Check X-User-ID header ──▶ Trust if request from internal network
               │
               ▼
         Extract external_user_id ──▶ Attach to request context
```

### 2.3 PDF Generation Flow

```
Resume Data ──▶ Template Selection ──▶ HTML Rendering (Handlebars/React-PDF)
                                              │
                                              ▼
                                       Puppeteer/Playwright
                                              │
                                              ▼
                                         PDF Output
                                              │
                                              ▼
                                    Return PDF binary / URL
```

### 2.4 ATS Analysis Flow

```
Upload PDF ──▶ Text Extraction (pdf-parse)
                    │
                    ▼
            Section Detection (regex + NLP heuristics)
                    │
                    ▼
         ┌──────────┼──────────────┐
         │          │              │
         ▼          ▼              ▼
   Keyword      Formatting    Readability
   Matching     Analysis      Scoring
         │          │              │
         └──────────┼──────────────┘
                    │
                    ▼
           Score Aggregation
                    │
                    ▼
         Suggestion Generation
                    │
                    ▼
            Save Report + Return
```

---

## STEP 3: Tech Stack Recommendation

### 3.1 Backend

| Layer | Technology | Reasoning |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Fast I/O, large ecosystem, same language as frontend templates |
| Framework | **Express.js** | Minimal, well-understood, fast MVP development |
| Language | **TypeScript** | Type safety, better maintainability, IDE support |
| Validation | **Zod** | Runtime schema validation, TypeScript-native |
| ORM | **Prisma** | Type-safe DB access, migrations, excellent DX |
| Database | **PostgreSQL 16** | JSONB for flexible resume data, robust, production-proven |
| PDF Generation | **Puppeteer** | Headless Chrome, pixel-perfect PDF from HTML templates |
| PDF Parsing | **pdf-parse** | Lightweight, reliable text extraction from PDFs |
| File Upload | **Multer** | Standard Express file upload middleware |
| Template Engine | **Handlebars** | Simple, logic-less templates for resume HTML rendering |
| Testing | **Vitest** | Fast, TypeScript-native, compatible with Jest API |
| Logging | **Pino** | High-performance structured logging |
| Rate Limiting | **express-rate-limit** | Simple, in-memory rate limiting |

### 3.2 Infrastructure

| Component | Technology | Reasoning |
|---|---|---|
| Process Manager | **PM2** | Zero-downtime restarts, clustering, log management |
| Reverse Proxy | **Nginx** | SSL termination, static file serving, load balancing |
| File Storage | **Local disk + Nginx** | MVP simplicity; migrate to S3 later |
| Containerization | **Docker + Docker Compose** | Reproducible builds, single-command deployment |
| CI/CD | **GitHub Actions** | Simple pipeline, free for small teams |

### 3.3 Why NOT These Alternatives

| Rejected | Reason |
|---|---|
| NestJS | Over-engineered for 3-day MVP |
| MongoDB | Resume data is relational; PostgreSQL JSONB covers flexibility |
| wkhtmltopdf | Poor CSS support, inconsistent rendering |
| React-PDF | Limited template flexibility vs HTML+Puppeteer |
| Redis | Not needed for MVP; in-memory rate limiting suffices |
| GraphQL | REST is simpler for CRUD-heavy module |

---

## STEP 4: Database Schema

### 4.1 ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   resumes    │       │  resume_sections  │       │   ats_reports    │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)          │       │ id (PK)          │
│ external_    │  │    │ resume_id (FK)   │───┐   │ external_        │
│   user_id    │  └───▶│ type             │   │   │   user_id        │
│ title        │       │ data (JSONB)     │   │   │ resume_id (FK?)  │
│ template_id  │       │ sort_order       │   │   │ file_name        │
│ summary      │       │ created_at       │   │   │ file_path        │
│ contact_info │       │ updated_at       │   │   │ job_description  │
│   (JSONB)    │       └──────────────────┘   │   │ extracted_text   │
│ is_draft     │                              │   │ overall_score    │
│ created_at   │       ┌──────────────────┐   │   │ section_scores   │
│ updated_at   │       │   api_keys       │   │   │   (JSONB)        │
└──────────────┘       ├──────────────────┤   │   │ suggestions      │
                       │ id (PK)          │   │   │   (JSONB)        │
                       │ key_hash         │   │   │ created_at       │
                       │ name             │   │   └──────────────────┘
                       │ is_active        │
                       │ created_at       │
                       └──────────────────┘
```

### 4.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Resume {
  id              String           @id @default(uuid())
  externalUserId  String           @map("external_user_id")
  title           String           @default("Untitled Resume")
  templateId      String           @default("classic") @map("template_id")
  summary         String?
  contactInfo     Json?            @map("contact_info")
  isDraft         Boolean          @default(true) @map("is_draft")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  sections        ResumeSection[]
  atsReports      AtsReport[]

  @@index([externalUserId])
  @@map("resumes")
}

model ResumeSection {
  id         String   @id @default(uuid())
  resumeId   String   @map("resume_id")
  type       String   // education, experience, skills, projects, certifications, custom
  data       Json     // flexible JSONB for section-specific data
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
  jobDescription  String?  @map("job_description") @db.Text
  extractedText   String?  @map("extracted_text") @db.Text
  overallScore    Float?   @map("overall_score")
  sectionScores   Json?    @map("section_scores")
  keywords        Json?    // { matched: [], missing: [], jd_keywords: [] }
  formatting      Json?    // { font_consistency, bullet_usage, margin_check, ... }
  readability     Json?    // { avg_sentence_length, complexity_score, ... }
  suggestions     Json?    // [{ category, severity, message, detail }]
  createdAt       DateTime @default(now()) @map("created_at")

  resume          Resume?  @relation(fields: [resumeId], references: [id], onDelete: SetNull)

  @@index([externalUserId])
  @@map("ats_reports")
}

model ApiKey {
  id        String   @id @default(uuid())
  keyHash   String   @unique @map("key_hash")
  name      String
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("api_keys")
}
```

### 4.3 Section Data JSONB Structures

```typescript
// Education
{
  "institution": "MIT",
  "degree": "B.S. Computer Science",
  "field": "Computer Science",
  "startDate": "2018-09",
  "endDate": "2022-06",
  "gpa": "3.8",
  "highlights": ["Dean's List", "Thesis: ML in Healthcare"]
}

// Experience
{
  "company": "Google",
  "title": "Software Engineer",
  "location": "Mountain View, CA",
  "startDate": "2022-07",
  "endDate": null, // null = present
  "isCurrent": true,
  "bullets": [
    "Led migration of 3 microservices to Kubernetes, reducing deployment time by 40%",
    "Designed real-time data pipeline processing 1M events/day"
  ]
}

// Skills
{
  "categories": [
    { "name": "Languages", "items": ["TypeScript", "Python", "Go"] },
    { "name": "Frameworks", "items": ["React", "Node.js", "Django"] },
    { "name": "Tools", "items": ["Docker", "AWS", "PostgreSQL"] }
  ]
}

// Projects
{
  "name": "Open Source CLI Tool",
  "url": "https://github.com/user/project",
  "description": "A CLI tool for automating deployment workflows",
  "technologies": ["Go", "Docker", "GitHub Actions"],
  "highlights": ["500+ GitHub stars", "Used by 50+ companies"]
}

// Certifications
{
  "name": "AWS Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2023-01",
  "expiryDate": "2026-01",
  "credentialId": "ABC123",
  "url": "https://verify.aws/ABC123"
}
```

---

## STEP 5: API Endpoints

### 5.1 Authentication Headers (All Requests)

```
X-Api-Key: <api_key>           # Option 1: API Key
Authorization: Bearer <jwt>     # Option 2: Parent JWT
X-User-ID: <external_user_id>  # Option 3: Trusted internal
```

### 5.2 Resume Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/resumes` | Create resume | `{ title, templateId?, summary?, contactInfo? }` | `201: { resume }` |
| GET | `/api/v1/resumes` | List user's resumes | — | `200: { resumes[] }` |
| GET | `/api/v1/resumes/:id` | Get resume with sections | — | `200: { resume, sections[] }` |
| PUT | `/api/v1/resumes/:id` | Update resume metadata | `{ title?, templateId?, summary?, contactInfo?, isDraft? }` | `200: { resume }` |
| DELETE | `/api/v1/resumes/:id` | Delete resume + sections | — | `204` |
| PUT | `/api/v1/resumes/:id/template` | Switch template | `{ templateId }` | `200: { resume }` |
| GET | `/api/v1/resumes/:id/preview` | Get HTML preview | `?template=classic` | `200: text/html` |
| GET | `/api/v1/resumes/:id/pdf` | Export PDF | `?template=classic` | `200: application/pdf` |

### 5.3 Resume Section Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/resumes/:id/sections` | Add section | `{ type, data, sortOrder? }` | `201: { section }` |
| PUT | `/api/v1/resumes/:id/sections/:sectionId` | Update section | `{ data?, sortOrder? }` | `200: { section }` |
| DELETE | `/api/v1/resumes/:id/sections/:sectionId` | Delete section | — | `204` |
| PUT | `/api/v1/resumes/:id/sections/reorder` | Reorder sections | `{ order: [{ id, sortOrder }] }` | `200: { sections[] }` |

### 5.4 Template Endpoints

| Method | Endpoint | Description | Response |
|---|---|---|---|
| GET | `/api/v1/templates` | List available templates | `200: { templates[] }` |
| GET | `/api/v1/templates/:id/preview` | Preview template with sample data | `200: text/html` |

### 5.5 ATS Checker Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/ats/analyze` | Analyze uploaded PDF | `multipart: file + jobDescription?` | `200: { report }` |
| POST | `/api/v1/ats/analyze-resume/:resumeId` | Analyze existing resume | `{ jobDescription? }` | `200: { report }` |
| GET | `/api/v1/ats/reports` | List user's ATS reports | — | `200: { reports[] }` |
| GET | `/api/v1/ats/reports/:id` | Get specific report | — | `200: { report }` |
| DELETE | `/api/v1/ats/reports/:id` | Delete report | — | `204` |

### 5.6 Health & Meta Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/meta/version` | API version info |

### 5.7 Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid template ID",
    "details": [
      { "field": "templateId", "message": "Must be one of: classic, modern, minimal" }
    ]
  }
}
```

### 5.8 Standard Pagination (GET list endpoints)

```
?page=1&limit=20&sort=createdAt&order=desc
```

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## STEP 6: Production Folder Structure

```
resume-ats-module/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── index.ts                          # Entry point
│   ├── app.ts                            # Express app setup
│   ├── config/
│   │   ├── index.ts                      # Environment config
│   │   └── constants.ts                  # App constants
│   │
│   ├── middleware/
│   │   ├── auth.ts                       # Auth middleware (API key / JWT / X-User-ID)
│   │   ├── errorHandler.ts               # Global error handler
│   │   ├── rateLimiter.ts                # Rate limiting
│   │   ├── validate.ts                   # Zod validation middleware
│   │   └── upload.ts                     # Multer file upload config
│   │
│   ├── routes/
│   │   ├── index.ts                      # Route aggregator
│   │   ├── resume.routes.ts              # Resume CRUD routes
│   │   ├── section.routes.ts             # Resume section routes
│   │   ├── template.routes.ts            # Template routes
│   │   ├── ats.routes.ts                 # ATS checker routes
│   │   └── health.routes.ts              # Health check routes
│   │
│   ├── controllers/
│   │   ├── resume.controller.ts
│   │   ├── section.controller.ts
│   │   ├── template.controller.ts
│   │   └── ats.controller.ts
│   │
│   ├── services/
│   │   ├── resume.service.ts             # Resume business logic
│   │   ├── section.service.ts            # Section CRUD logic
│   │   ├── template.service.ts           # Template management
│   │   ├── pdf.service.ts                # PDF generation (Puppeteer)
│   │   └── ats/
│   │       ├── ats.service.ts            # ATS orchestrator
│   │       ├── textExtractor.ts          # PDF text extraction
│   │       ├── sectionDetector.ts        # Resume section detection
│   │       ├── keywordMatcher.ts         # JD keyword matching
│   │       ├── formatAnalyzer.ts         # Formatting analysis
│   │       ├── readabilityScorer.ts      # Readability scoring
│   │       └── suggestionEngine.ts       # Suggestion generation
│   │
│   ├── schemas/
│   │   ├── resume.schema.ts              # Zod schemas for resume
│   │   ├── section.schema.ts             # Zod schemas for sections
│   │   └── ats.schema.ts                 # Zod schemas for ATS
│   │
│   ├── templates/
│   │   ├── classic/
│   │   │   ├── template.hbs              # Handlebars template
│   │   │   ├── styles.css                # Template-specific CSS
│   │   │   └── meta.json                 # Template metadata
│   │   ├── modern/
│   │   │   ├── template.hbs
│   │   │   ├── styles.css
│   │   │   └── meta.json
│   │   └── minimal/
│   │       ├── template.hbs
│   │       ├── styles.css
│   │       └── meta.json
│   │
│   ├── utils/
│   │   ├── logger.ts                     # Pino logger setup
│   │   ├── errors.ts                     # Custom error classes
│   │   ├── pagination.ts                 # Pagination helper
│   │   └── helpers.ts                    # Misc utilities
│   │
│   └── types/
│       ├── express.d.ts                  # Express type extensions
│       ├── resume.types.ts
│       └── ats.types.ts
│
├── storage/
│   ├── uploads/                          # Uploaded PDFs
│   └── exports/                          # Generated PDFs
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── resume.service.test.ts
│   │   │   └── ats.service.test.ts
│   │   └── utils/
│   ├── integration/
│   │   ├── resume.api.test.ts
│   │   └── ats.api.test.ts
│   └── fixtures/
│       ├── sample-resume.json
│       └── sample-jd.txt
│
├── scripts/
│   ├── generate-api-key.ts               # CLI to generate API keys
│   └── seed-templates.ts                 # Seed template metadata
│
└── nginx/
    └── resume-module.conf                # Nginx config
```

---

## STEP 7: ATS Scoring Workflow

### 7.1 Scoring Pipeline

```
INPUT: PDF File + Job Description (optional)
                │
                ▼
┌─────────────────────────────┐
│  STAGE 1: Text Extraction   │
│  ─────────────────────────  │
│  • pdf-parse extracts text  │
│  • Clean whitespace/chars   │
│  • Preserve line structure   │
│  Output: raw_text           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  STAGE 2: Section Detection │
│  ─────────────────────────  │
│  • Regex patterns for       │
│    section headers          │
│  • Heuristic classification │
│  • Sections: contact, summ, │
│    experience, education,   │
│    skills, projects, certs  │
│  Output: detected_sections  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 3: Parallel Analysis (3 sub-scores)          │
│                                                      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │  Keyword     │ │  Formatting  │ │ Readability  │ │
│  │  Matching    │ │  Analysis    │ │ Scoring      │ │
│  │  (40%)       │ │  (30%)       │ │ (30%)        │ │
│  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘ │
│         │               │                │          │
└─────────┼───────────────┼────────────────┼──────────┘
          │               │                │
          ▼               ▼                ▼
┌─────────────────────────────────────────────────────┐
│  STAGE 4: Score Aggregation                          │
│  Overall = (keyword * 0.4) + (format * 0.3)         │
│          + (readability * 0.3)                        │
│  If no JD provided: reweight format=50%, read=50%    │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│  STAGE 5: Suggestions       │
│  ─────────────────────────  │
│  • Per-category suggestions │
│  • Severity: high/med/low   │
│  • Actionable advice        │
└──────────────┬──────────────┘
               │
               ▼
OUTPUT: ATS Report (saved to DB)
```

### 7.2 Keyword Matching Algorithm

```typescript
// Pseudocode
function matchKeywords(resumeText: string, jobDescription: string) {
  // 1. Extract keywords from JD
  const jdKeywords = extractKeywords(jobDescription); // TF-IDF or frequency-based

  // 2. Normalize both texts
  const normalizedResume = normalize(resumeText); // lowercase, stem, remove stop words

  // 3. Match
  const matched = jdKeywords.filter(kw => normalizedResume.includes(kw));
  const missing = jdKeywords.filter(kw => !normalizedResume.includes(kw));

  // 4. Score
  const score = (matched.length / jdKeywords.length) * 100;

  return { score, matched, missing, jdKeywords };
}
```

### 7.3 Section Detection Rules

| Section | Detection Patterns |
|---|---|
| Contact | Email regex, phone regex, LinkedIn URL, top of document |
| Summary | "summary", "objective", "profile", "about" headers |
| Experience | "experience", "work history", "employment" headers |
| Education | "education", "academic", "university", "degree" headers |
| Skills | "skills", "technologies", "technical skills", "competencies" |
| Projects | "projects", "portfolio", "personal projects" |
| Certifications | "certifications", "licenses", "credentials" |

### 7.4 Formatting Analysis Checks

| Check | What It Measures | Scoring |
|---|---|---|
| Section Presence | Are standard sections present? | -10 per missing critical section |
| Bullet Points | Are achievements bulleted? | +10 if bullets detected in experience |
| Consistent Dates | Date format consistency | -5 per inconsistent date |
| Length | 1-2 pages ideal | -10 if < 200 words or > 1500 words |
| Contact Info | Email + phone present? | -15 if missing |
| Action Verbs | Bullets start with action verbs | +5 per section with action verbs |
| Quantification | Numbers/metrics in bullets | +5 per quantified achievement |

### 7.5 Readability Scoring

| Metric | Formula | Ideal Range |
|---|---|---|
| Avg Sentence Length | total_words / total_sentences | 15-25 words |
| Flesch Reading Ease | 206.835 - 1.015(words/sentences) - 84.6(syllables/words) | 40-60 (professional) |
| Bullet Density | bullets / total_lines | 0.3-0.6 |
| Jargon Ratio | technical_terms / total_words | 0.05-0.15 |

### 7.6 Suggestion Categories

| Category | Example Suggestions |
|---|---|
| `keyword_gap` | "Add 'Kubernetes' — mentioned 3x in job description" |
| `missing_section` | "Add a Skills section to improve ATS parsing" |
| `weak_bullet` | "Quantify: 'Improved performance' → 'Improved performance by 40%'" |
| `formatting` | "Use consistent date format (MM/YYYY) throughout" |
| `readability` | "Shorten sentences in Experience section (avg: 32 words, target: <25)" |
| `length` | "Resume is 3 pages. Condense to 1-2 pages for better ATS compatibility" |
| `contact` | "Add a professional email address to contact section" |

### 7.7 Score Interpretation

| Score Range | Label | Color |
|---|---|---|
| 90-100 | Excellent | Green |
| 75-89 | Good | Light Green |
| 60-74 | Fair | Yellow |
| 40-59 | Needs Work | Orange |
| 0-39 | Poor | Red |

---

## STEP 8: 3-Day MVP Roadmap

### Day 1: Foundation + Resume CRUD

| Time | Task | Deliverable |
|---|---|---|
| 0-2h | Project setup: TypeScript, Express, Prisma, Docker Compose (Postgres) | Running server + DB |
| 2-3h | Auth middleware (X-User-ID, API Key, JWT verification) | Protected routes |
| 3-4h | Resume CRUD endpoints + Zod validation | POST/GET/PUT/DELETE /resumes |
| 4-5h | Section CRUD endpoints (education, experience, skills, projects, certs) | Section management API |
| 5-6h | Database seeding + Postman/Thunder Client collection | Testable API |
| 6-7h | Error handling, logging (Pino), rate limiting | Production middleware |
| 7-8h | Unit tests for resume + section services | Test coverage |

**Day 1 Milestone:** Full Resume CRUD API working with auth.

### Day 2: Templates + PDF + ATS Core

| Time | Task | Deliverable |
|---|---|---|
| 0-2h | 3 Handlebars templates (classic, modern, minimal) + CSS | Resume templates |
| 2-3h | Template engine: data → HTML rendering | HTML preview endpoint |
| 3-4h | Puppeteer PDF generation service | PDF export endpoint |
| 4-5h | Template switching endpoint (no data loss) | Template swap API |
| 5-6h | ATS: PDF upload + text extraction (pdf-parse) | Text extraction working |
| 6-7h | ATS: Section detection + keyword matching | Core ATS analysis |
| 7-8h | ATS: Formatting analysis + readability scoring | Full scoring pipeline |

**Day 2 Milestone:** PDF export working. ATS analysis returning scores.

### Day 3: Polish + Deploy

| Time | Task | Deliverable |
|---|---|---|
| 0-1h | ATS: Suggestion engine | Actionable suggestions |
| 1-2h | ATS: Save/retrieve reports endpoints | Report persistence |
| 2-3h | Integration tests (resume flow, ATS flow) | Test suite |
| 3-4h | Dockerfile + Docker Compose (app + postgres) | Containerized app |
| 4-5h | Nginx config, PM2 ecosystem file | Production-ready server |
| 5-6h | API documentation (OpenAPI/Swagger) | API docs |
| 6-7h | Security audit: input sanitization, file validation, size limits | Hardened app |
| 7-8h | Load testing (autocannon), bug fixes, README | Deployed MVP |

**Day 3 Milestone:** Deployed, documented, tested MVP.

### Post-MVP Backlog (Week 2+)

| Priority | Feature |
|---|---|
| P1 | S3 file storage migration |
| P1 | Webhook notifications to parent platform |
| P1 | Redis caching for template rendering |
| P2 | AI-powered bullet point suggestions (OpenAI) |
| P2 | Additional templates (5+) |
| P2 | Resume versioning/history |
| P2 | Batch ATS analysis |
| P3 | Resume comparison (before/after) |
| P3 | Industry-specific keyword databases |

---

## STEP 9: Technical Risks & Mitigations

### 9.1 Risk Matrix

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Puppeteer memory leaks** in long-running process | High | High | Use browser pool with max 3 instances; restart browser every 50 PDF generations; PM2 memory limit restart at 512MB |
| 2 | **PDF text extraction fails** on scanned/image PDFs | Medium | High | Detect image-only PDFs (text length < 50 chars); return clear error message "Scanned PDFs not supported"; add OCR (Tesseract) in post-MVP |
| 3 | **Large PDF uploads** cause memory spikes | Medium | Medium | Enforce 10MB file size limit in Multer; stream processing where possible; reject files > limit with 413 error |
| 4 | **Inconsistent section detection** across resume formats | High | Medium | Use multiple regex patterns per section; fallback to position-based heuristics; allow manual section tagging in post-MVP |
| 5 | **JWT verification** requires parent platform's public key | Low | High | Support multiple auth methods; document key rotation procedure; cache JWKS with 1h TTL |
| 6 | **Puppeteer Chrome binary** not available in container | Medium | High | Use `puppeteer` with bundled Chromium; test Docker build early on Day 1; pin Puppeteer version |
| 7 | **Database connection pool exhaustion** under load | Low | High | Prisma connection pool: min=2, max=10; implement request queuing; health check monitors pool |
| 8 | **Template CSS conflicts** between templates | Medium | Low | Scope all CSS with template-specific class prefix (`.tpl-classic`, `.tpl-modern`); use Shadow DOM if needed |
| 9 | **File storage fills disk** on single server | Medium | Medium | Implement cleanup cron: delete exports > 24h old; monitor disk usage; alert at 80% capacity |
| 10 | **Keyword matching too simplistic** (no semantic understanding) | High | Medium | Use stemming (Porter Stemmer) + synonym mapping for MVP; add embeddings-based matching in post-MVP |
| 11 | **Rate limiting bypass** via multiple API keys | Low | Low | Rate limit per external_user_id, not per API key; implement daily quota per user |
| 12 | **Handlebars template injection** (XSS in PDF) | Low | High | Escape all user input with Handlebars default escaping; sanitize HTML in contact/summary fields; CSP headers |

### 9.2 Operational Risks

| Risk | Mitigation |
|---|---|
| No monitoring in MVP | Add `/health` endpoint with DB ping; PM2 built-in monitoring; structured logs for post-hoc analysis |
| No backup strategy | Daily pg_dump cron to separate volume; document restore procedure |
| Single point of failure | PM2 cluster mode (2 instances); Nginx upstream failover; document manual failover steps |
| No staging environment | Docker Compose profiles: `dev`, `prod`; test against local before deploy |

### 9.3 Security Considerations

| Area | Implementation |
|---|---|
| Input Validation | Zod schemas on all endpoints; reject unknown fields |
| File Upload | Whitelist: PDF only; validate MIME type + magic bytes; 10MB limit |
| SQL Injection | Prisma parameterized queries (built-in) |
| XSS | Handlebars auto-escaping; no raw HTML in user fields |
| Rate Limiting | 100 req/min per user (CRUD); 10 req/min per user (PDF/ATS) |
| CORS | Configurable allowed origins via env var |
| Headers | Helmet.js for security headers |
| Secrets | Environment variables only; no secrets in code/logs |
| File Access | Uploads served through Nginx with auth check; no direct path exposure |

---

## Appendix A: Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resume_module

# Auth
AUTH_MODE=api_key|jwt|header  # comma-separated allowed modes
JWT_PUBLIC_KEY_URL=https://parent-platform.com/.well-known/jwks.json
TRUSTED_API_KEYS=key1_hash,key2_hash

# File Storage
UPLOAD_DIR=./storage/uploads
EXPORT_DIR=./storage/exports
MAX_FILE_SIZE_MB=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_PDF_MAX=10

# CORS
ALLOWED_ORIGINS=https://parent-platform.com

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
BROWSER_POOL_SIZE=3
```

## Appendix B: Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://resume_user:resume_pass@db:5432/resume_module
      - NODE_ENV=production
    volumes:
      - ./storage:/app/storage
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: resume_user
      POSTGRES_PASSWORD: resume_pass
      POSTGRES_DB: resume_module
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U resume_user -d resume_module"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/resume-module.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  pgdata:
```

## Appendix C: API Response Examples

### Create Resume Response
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "externalUserId": "usr_abc123",
    "title": "Software Engineer Resume",
    "templateId": "modern",
    "summary": null,
    "contactInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "linkedin": "linkedin.com/in/johndoe",
      "location": "San Francisco, CA"
    },
    "isDraft": true,
    "createdAt": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:00:00.000Z"
  }
}
```

### ATS Report Response
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "overallScore": 72.5,
    "label": "Fair",
    "sectionScores": {
      "keyword": { "score": 65, "weight": 0.4 },
      "formatting": { "score": 80, "weight": 0.3 },
      "readability": { "score": 75, "weight": 0.3 }
    },
    "keywords": {
      "matched": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"],
      "missing": ["Kubernetes", "GraphQL", "Terraform", "CI/CD"],
      "jdKeywords": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Kubernetes", "GraphQL", "Terraform", "CI/CD"]
    },
    "formatting": {
      "sectionsDetected": ["contact", "summary", "experience", "education", "skills"],
      "missingSections": ["projects"],
      "hasBullets": true,
      "hasActionVerbs": true,
      "hasQuantification": false,
      "dateConsistency": true,
      "estimatedPages": 1.5
    },
    "readability": {
      "avgSentenceLength": 22,
      "fleschScore": 48,
      "bulletDensity": 0.42,
      "jargonRatio": 0.08
    },
    "suggestions": [
      {
        "category": "keyword_gap",
        "severity": "high",
        "message": "Add 'Kubernetes' to your skills — mentioned 3 times in the job description",
        "detail": "The job description emphasizes container orchestration. Add relevant experience or skills."
      },
      {
        "category": "weak_bullet",
        "severity": "medium",
        "message": "Quantify achievements in your experience section",
        "detail": "3 of 8 bullet points lack metrics. Example: 'Improved API response time' → 'Improved API response time by 60% (from 500ms to 200ms)'"
      },
      {
        "category": "missing_section",
        "severity": "low",
        "message": "Consider adding a Projects section",
        "detail": "A projects section can showcase hands-on experience with technologies mentioned in the JD."
      }
    ],
    "createdAt": "2026-02-26T10:05:00.000Z"
  }
}
```

---

*Document Version: 1.0 | Generated: 2026-02-26 | Author: System Architecture Team*