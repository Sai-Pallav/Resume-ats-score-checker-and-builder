# ATS Resume Analysis Engine — Implementation-Ready Design

---

## STEP 1 — ATS MODULE RESPONSIBILITIES

### 1.1 Upload Handler

| Field | Value |
|---|---|
| **Purpose** | Accept multipart PDF upload, validate file type/size, persist to disk |
| **npm libraries** | `multer` |
| **Input** | `multipart/form-data` with `file` (PDF) + `jobDescription` (text, optional) |
| **Output** | `{ filePath: string, fileName: string, fileSize: number }` |

**Validation rules:**
- MIME type must be `application/pdf`
- Max size: 10MB
- Reject if no file attached

---

### 1.2 Text Extraction

| Field | Value |
|---|---|
| **Purpose** | Read PDF binary, extract all text content, count pages/words |
| **npm libraries** | `pdf-parse` |
| **Input** | `{ filePath: string }` |
| **Output** | |

```typescript
{
  text: string;          // full extracted text
  pageCount: number;     // number of pages
  wordCount: number;     // total word count
  lineCount: number;     // total line count
  isEmpty: boolean;      // true if text.length < 50 (likely scanned PDF)
}
```

**Error checkpoint:** If `isEmpty === true`, abort pipeline and return error: "Scanned or image-based PDF detected. Please upload a text-based PDF."

---

### 1.3 Section Detection

| Field | Value |
|---|---|
| **Purpose** | Identify which standard resume sections exist in the extracted text |
| **npm libraries** | None (pure regex) |
| **Input** | `{ text: string }` |
| **Output** | |

```typescript
{
  detected: string[];    // ["contact", "experience", "education", "skills"]
  missing: string[];     // ["summary", "projects", "certifications"]
  details: {
    [section: string]: {
      found: boolean;
      matchedPattern: string | null;  // which regex matched
      position: number;               // char index in text (-1 if not found)
    }
  };
  score: number;         // 0-100 (detected.length / EXPECTED.length * 100)
}
```

**Sections to detect (7 total):**

| Section | Regex Patterns |
|---|---|
| contact | `/\b[\w.-]+@[\w.-]+\.\w{2,}\b/`, `/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/`, `/linkedin\.com/i` |
| summary | `/\b(summary|objective|profile|about\s*me|professional\s*summary)\b/i` |
| experience | `/\b(experience|work\s*history|employment|professional\s*experience)\b/i` |
| education | `/\b(education|academic|university|college|degree|school)\b/i` |
| skills | `/\b(skills|technologies|technical\s*skills|competencies|proficiencies)\b/i` |
| projects | `/\b(projects|personal\s*projects|portfolio|side\s*projects)\b/i` |
| certifications | `/\b(certifications?|licenses?|credentials?|accreditations?)\b/i` |

---

### 1.4 Keyword Matching

| Field | Value |
|---|---|
| **Purpose** | Extract significant keywords from Job Description, match against resume text |
| **npm libraries** | None (pure JS tokenization + stop word removal) |
| **Input** | `{ resumeText: string, jobDescription: string }` |
| **Output** | |

```typescript
{
  jdKeywords: string[];       // all extracted JD keywords (deduplicated)
  matched: string[];          // keywords found in resume
  missing: string[];          // keywords NOT found in resume
  matchRate: number;          // matched.length / jdKeywords.length
  score: number;              // 0-100
  details: {
    keyword: string;
    found: boolean;
    frequency: number;        // how many times it appears in resume
  }[];
}
```

**Algorithm:**

```
1. Tokenize JD → split by whitespace + punctuation
2. Lowercase all tokens
3. Remove stop words (150+ common English words)
4. Remove tokens < 2 chars
5. Deduplicate
6. Group multi-word terms (e.g., "machine learning", "react native")
   → Check for bigrams that appear as common tech terms
7. For each keyword:
   a. Check if lowercase resume text contains keyword
   b. Count frequency
8. Score = (matched / total) * 100
```

**Stop words list (subset):**
```
the, a, an, is, are, was, were, be, been, being, have, has, had,
do, does, did, will, would, could, should, may, might, shall, can,
and, or, but, if, then, else, when, at, by, for, with, about,
against, between, through, during, before, after, above, below,
to, from, up, down, in, out, on, off, over, under, again, further,
of, into, that, this, these, those, not, no, we, you, they, he,
she, it, i, me, my, your, our, their, its, who, whom, which, what,
where, how, all, each, every, both, few, more, most, other, some,
such, than, too, very, just, also, only, own, same, so, as, well,
looking, seeking, required, preferred, must, ability, strong,
excellent, good, work, working, team, role, position, company,
candidate, ideal, responsible, responsibilities, qualifications,
minimum, years, experience, including, using, etc, e.g, i.e
```

---

### 1.5 Format Analyzer

| Field | Value |
|---|---|
| **Purpose** | Check resume formatting best practices for ATS compatibility |
| **npm libraries** | None (pure regex + text analysis) |
| **Input** | `{ text: string, pageCount: number, wordCount: number }` |
| **Output** | |

```typescript
{
  checks: {
    name: string;
    passed: boolean;
    detail: string;
    weight: number;      // importance: 1-3 (3 = critical)
  }[];
  score: number;         // 0-100 (weighted)
}
```

**Checks to implement (8 total):**

| # | Check Name | Logic | Weight | Pass Condition |
|---|---|---|---|---|
| 1 | `email_present` | Regex: `/[\w.-]+@[\w.-]+\.\w{2,}/` | 3 | At least 1 email found |
| 2 | `phone_present` | Regex: `/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/` | 3 | At least 1 phone found |
| 3 | `appropriate_length` | Word count check | 2 | 200 ≤ wordCount ≤ 1200 |
| 4 | `page_count` | Page count check | 2 | 1 ≤ pageCount ≤ 2 |
| 5 | `has_bullet_points` | Regex: `/^[\s]*[•\-\*▪►●‣⁃]/m` | 2 | At least 3 bullet lines found |
| 6 | `no_personal_pronouns` | Regex: `/\b(I|me|my|myself)\b/gi` count | 1 | Fewer than 5 occurrences |
| 7 | `consistent_date_format` | Regex: detect date patterns, check consistency | 1 | ≥ 80% dates use same format |
| 8 | `has_section_headers` | Check for ALL-CAPS or Title Case lines | 2 | At least 3 section headers detected |

**Weighted score calculation:**
```
totalWeight = sum of all check weights
passedWeight = sum of weights for passed checks
score = Math.round((passedWeight / totalWeight) * 100)
```

---

### 1.6 Readability Scorer

| Field | Value |
|---|---|
| **Purpose** | Measure how readable and impactful the resume content is |
| **npm libraries** | None (pure JS text analysis) |
| **Input** | `{ text: string }` |
| **Output** | |

```typescript
{
  metrics: {
    avgSentenceLength: number;     // words per sentence
    avgWordLength: number;         // chars per word
    bulletCount: number;           // total bullet points
    actionVerbCount: number;       // bullets starting with action verbs
    actionVerbRatio: number;       // actionVerbCount / bulletCount
    quantificationCount: number;   // lines containing numbers/percentages
    quantificationRatio: number;   // quantificationCount / bulletCount
  };
  score: number;                   // 0-100 (composite)
}
```

**Scoring rubric:**

| Metric | Ideal Range | Points (max 25 each) |
|---|---|---|
| avgSentenceLength | 10-25 words | 25 if in range, -5 per 5 words outside |
| actionVerbRatio | ≥ 0.5 | `ratio * 50` (capped at 25) |
| quantificationRatio | ≥ 0.3 | `ratio * 83` (capped at 25) |
| bulletCount | ≥ 6 | `min(bulletCount / 6, 1) * 25` |

**Action verbs list (50 verbs):**
```
achieved, administered, analyzed, architected, automated,
built, collaborated, configured, coordinated, created,
decreased, delivered, deployed, designed, developed,
directed, drove, eliminated, engineered, established,
executed, expanded, generated, grew, implemented,
improved, increased, integrated, launched, led,
maintained, managed, mentored, migrated, negotiated,
operated, optimized, orchestrated, organized, pioneered,
planned, produced, reduced, refactored, resolved,
scaled, simplified, spearheaded, streamlined, supervised
```

---

### 1.7 Suggestion Engine

| Field | Value |
|---|---|
| **Purpose** | Generate actionable improvement suggestions based on all analysis results |
| **npm libraries** | None (rule-based logic) |
| **Input** | All analysis results from modules 1.3–1.6 |
| **Output** | |

```typescript
{
  suggestions: {
    id: string;                    // unique suggestion ID (e.g., "KW-001")
    category: 'keywords' | 'sections' | 'formatting' | 'readability' | 'content';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;                 // short summary
    message: string;               // detailed actionable advice
    section?: string;              // which resume section this applies to
  }[];
  totalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}
```

**Rules (18 total):**

| ID | Condition | Priority | Title |
|---|---|---|---|
| KW-001 | `keywords.missing.length > 5` | HIGH | "Many missing keywords from job description" |
| KW-002 | `keywords.missing.length > 0 && <= 5` | MEDIUM | "Some keywords missing from job description" |
| KW-003 | `keywords.score < 30` | HIGH | "Very low keyword match rate" |
| SC-001 | `sections.missing includes 'summary'` | MEDIUM | "Add a Professional Summary section" |
| SC-002 | `sections.missing includes 'skills'` | HIGH | "Add a Skills section" |
| SC-003 | `sections.missing includes 'education'` | MEDIUM | "Add an Education section" |
| SC-004 | `sections.missing includes 'experience'` | HIGH | "Add a Work Experience section" |
| SC-005 | `sections.detected.length < 4` | HIGH | "Resume has too few sections" |
| FM-001 | `!formatting.email_present` | HIGH | "Add a professional email address" |
| FM-002 | `!formatting.phone_present` | MEDIUM | "Add a phone number" |
| FM-003 | `wordCount < 200` | HIGH | "Resume is too short" |
| FM-004 | `wordCount > 1200` | MEDIUM | "Resume may be too long" |
| FM-005 | `pageCount > 2` | MEDIUM | "Condense resume to 1-2 pages" |
| FM-006 | `!formatting.has_bullet_points` | HIGH | "Use bullet points for achievements" |
| RD-001 | `readability.actionVerbRatio < 0.3` | MEDIUM | "Start more bullets with action verbs" |
| RD-002 | `readability.quantificationRatio < 0.2` | MEDIUM | "Add more metrics and numbers" |
| RD-003 | `readability.avgSentenceLength > 30` | LOW | "Shorten your sentences" |
| RD-004 | `readability.bulletCount < 4` | MEDIUM | "Add more bullet points to describe achievements" |

---

### 1.8 Score Aggregator

| Field | Value |
|---|---|
| **Purpose** | Combine all sub-scores into a single overall ATS score |
| **npm libraries** | None |
| **Input** | All sub-scores from modules 1.3–1.6 |
| **Output** | |

```typescript
{
  overallScore: number;           // 0-100
  label: string;                  // "Excellent" | "Good" | "Fair" | "Needs Work" | "Poor"
  color: string;                  // hex color for UI
  breakdown: {
    keyword:     { score: number; weight: number; weighted: number };
    sections:    { score: number; weight: number; weighted: number };
    formatting:  { score: number; weight: number; weighted: number };
    readability: { score: number; weight: number; weighted: number };
  };
}
```

**Weighting:**

| Mode | Keyword | Sections | Formatting | Readability |
|---|---|---|---|---|
| With JD provided | 0.40 | 0.15 | 0.25 | 0.20 |
| Without JD | 0.00 | 0.25 | 0.40 | 0.35 |

**Label mapping:**

| Score | Label | Color |
|---|---|---|
| 90-100 | Excellent | `#22c55e` |
| 75-89 | Good | `#84cc16` |
| 60-74 | Fair | `#eab308` |
| 40-59 | Needs Work | `#f97316` |
| 0-39 | Poor | `#ef4444` |

---

## STEP 2 — ATS EXECUTION FLOW

### Request: `POST /api/v1/ats/analyze`

```
Headers:
  X-User-ID: usr_abc123
  Content-Type: multipart/form-data

Body:
  file: <resume.pdf>                    (required)
  jobDescription: <string>              (optional)
  resumeId: <uuid>                      (optional, link to saved resume)
```

### Execution Sequence

```
REQUEST ARRIVES
    │
    ▼
┌─────────────────────────────────────────────┐
│  PHASE 1: REQUEST VALIDATION                 │
│                                              │
│  1. Auth middleware extracts X-User-ID       │
│     → reject 401 if missing                 │
│                                              │
│  2. Multer processes file upload             │
│     → reject 400 if no file                 │
│     → reject 400 if not PDF (MIME check)    │
│     → reject 413 if > 10MB                  │
│                                              │
│  3. Zod validates body fields               │
│     → reject 400 if jobDescription < 10     │
│       chars (when provided)                 │
│                                              │
│  OUTPUT: { filePath, fileName, fileSize,     │
│           externalUserId, jobDescription? }  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PHASE 2: TEXT EXTRACTION                    │
│                                              │
│  4. Read PDF from disk → pdf-parse           │
│     → ERROR CHECKPOINT: if text < 50 chars   │
│       return 422 "Scanned PDF not supported" │
│       + delete uploaded file                 │
│                                              │
│  OUTPUT: { text, pageCount, wordCount }      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PHASE 3: PARALLEL ANALYSIS                  │
│  (all 4 run concurrently via Promise.all)    │
│                                              │
│  5a. sectionDetector(text)                   │
│  5b. keywordMatcher(text, jd)  [if JD given] │
│  5c. formatAnalyzer(text, pageCount, words)  │
│  5d. readabilityScorer(text)                 │
│                                              │
│  → ERROR CHECKPOINT: if any throws,          │
│    catch individually, use fallback score 0  │
│    + log error, continue pipeline            │
│                                              │
│  OUTPUT: 4 analysis result objects           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PHASE 4: AGGREGATION                        │
│                                              │
│  6. scoreAggregator(allResults, hasJd)       │
│     → weighted overall score                 │
│     → label + color                          │
│                                              │
│  7. suggestionEngine(allResults)             │
│     → actionable suggestions list            │
│                                              │
│  OUTPUT: { overallScore, breakdown,          │
│           suggestions }                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PHASE 5: DATABASE SAVE                      │
│                                              │
│  8. prisma.atsReport.create({                │
│       externalUserId,                        │
│       resumeId (if provided),                │
│       fileName,                              │
│       filePath,                              │
│       jobDescription,                        │
│       extractedText: text.substring(0,5000), │
│       overallScore,                          │
│       sectionScores: breakdown,              │
│       keywords: keywordResult,               │
│       formatting: formatResult,              │
│       readability: readabilityResult,        │
│       suggestions: suggestions               │
│     })                                       │
│                                              │
│  → ERROR CHECKPOINT: if DB save fails,       │
│    still return analysis (log DB error)      │
│    set reportId = null in response           │
│                                              │
│  OUTPUT: saved report with ID                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  PHASE 6: RESPONSE                           │
│                                              │
│  9. Return 200 JSON:                         │
│     {                                        │
│       data: {                                │
│         reportId,                            │
│         overallScore,                        │
│         label,                               │
│         color,                               │
│         breakdown,                           │
│         keywords,                            │
│         formatting,                          │
│         readability,                         │
│         sections,                            │
│         suggestions,                         │
│         metadata: {                          │
│           fileName,                          │
│           pageCount,                         │
│           wordCount,                         │
│           analyzedAt                         │
│         }                                    │
│       }                                      │
│     }                                        │
└─────────────────────────────────────────────┘
```

### Error Handling Summary

| Phase | Error | HTTP Status | Action |
|---|---|---|---|
| 1 | No X-User-ID | 401 | Reject immediately |
| 1 | No file | 400 | Reject immediately |
| 1 | Not PDF | 400 | Reject immediately |
| 1 | File > 10MB | 413 | Reject immediately |
| 1 | Invalid JD (< 10 chars) | 400 | Reject immediately |
| 2 | pdf-parse fails | 422 | Delete file, return error |
| 2 | Scanned PDF (text < 50 chars) | 422 | Delete file, return error |
| 3 | Individual analyzer throws | — | Catch, use score=0, continue |
| 5 | DB save fails | — | Log error, return analysis with `reportId: null` |

---

## STEP 3 — PERFORMANCE STRATEGY

### 3.1 Puppeteer Reuse Strategy

**Note:** Puppeteer is used for PDF *generation* (resume export), NOT for ATS analysis. ATS uses `pdf-parse` which is pure JS and lightweight. However, if both features run on the same server:

```
Strategy: Lazy Singleton with Auto-Restart

┌─────────────────────────────────────────┐
│  Browser Instance Pool (size: 1)         │
│                                          │
│  - Launch on first PDF request           │
│  - Reuse for subsequent requests         │
│  - Track generation count                │
│  - Auto-close + relaunch after 50 PDFs   │
│  - Force-close if idle > 5 minutes       │
│  - Timeout per page: 15 seconds          │
│  - On crash: set browser = null,         │
│    next request triggers relaunch        │
└─────────────────────────────────────────┘
```

**Implementation pattern:**

```typescript
let browser: Browser | null = null;
let genCount = 0;
const MAX_GENS = 50;
const PAGE_TIMEOUT = 15000;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected || genCount >= MAX_GENS) {
    if (browser) await browser.close().catch(() => {});
    browser = await puppeteer.launch({ headless: true, args: [...] });
    genCount = 0;
  }
  return browser;
}
```

**Why not a pool of multiple browsers:**
- MVP single server, limited RAM
- One browser handles ~3 concurrent pages safely
- Queuing via simple semaphore if needed

### 3.2 Avoid Blocking NodeJS Event Loop

| Concern | Solution |
|---|---|
| `pdf-parse` reads file synchronously | Use `fs.promises.readFile` instead of `fs.readFileSync` |
| Regex matching on large text | All regex operations are O(n), fast for resume-sized text (< 50KB). No concern. |
| Keyword tokenization | Pure string operations, sub-millisecond for typical JD (< 5KB) |
| Score calculation | Simple arithmetic, negligible |
| Puppeteer PDF generation | Already async (page.pdf returns Promise) |
| Database queries | Prisma is async by default |

**Key rule:** Every I/O operation (file read, DB query, Puppeteer) uses `await`. No synchronous file reads in production code.

**Worst-case timeline for single ATS request:**

| Step | Expected Time |
|---|---|
| File upload (Multer) | 50-200ms |
| Text extraction (pdf-parse) | 100-500ms |
| Section detection (regex) | < 5ms |
| Keyword matching (tokenize + match) | < 10ms |
| Format analysis (regex) | < 5ms |
| Readability scoring (text analysis) | < 5ms |
| Suggestion generation (rules) | < 2ms |
| DB save (Prisma) | 20-50ms |
| **Total** | **200ms - 800ms** |

### 3.3 File Cleanup Strategy

```
Strategy: Immediate + Scheduled Cleanup

┌─────────────────────────────────────────────┐
│  Immediate Cleanup (per request):            │
│                                              │
│  - After text extraction succeeds:           │
│    Schedule file deletion in 60 seconds      │
│    (allows retry if needed)                  │
│                                              │
│  - On extraction error:                      │
│    Delete file immediately                   │
│                                              │
│  Implementation:                             │
│    setTimeout(() => {                        │
│      fs.unlink(filePath).catch(() => {});    │
│    }, 60_000);                               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Scheduled Cleanup (background):             │
│                                              │
│  - setInterval every 1 hour:                 │
│    Scan uploads/ directory                   │
│    Delete files older than 1 hour            │
│                                              │
│  Implementation:                             │
│    setInterval(async () => {                 │
│      const files = await fs.readdir(dir);    │
│      for (const file of files) {             │
│        const stat = await fs.stat(path);     │
│        if (Date.now() - stat.mtimeMs > 3.6e6)│
│          await fs.unlink(path);              │
│      }                                       │
│    }, 3_600_000);                            │
└─────────────────────────────────────────────┘
```

**Disk usage estimate:**
- Average resume PDF: 100-500KB
- 100 uploads/day × 500KB = 50MB/day
- Cleanup every hour → max disk usage: ~5MB at any time

---

## STEP 4 — DATABASE INTERACTION

### 4.1 Create ATS Report

```typescript
// Called in Phase 5 of execution flow
const report = await prisma.atsReport.create({
  data: {
    externalUserId: req.externalUserId,
    resumeId: body.resumeId || null,
    fileName: file.originalname,
    filePath: file.path,
    jobDescription: body.jobDescription || null,
    extractedText: extraction.text.substring(0, 5000),  // truncate to save space
    overallScore: aggregated.overallScore,
    sectionScores: aggregated.breakdown,
    keywords: keywordResult,
    formatting: formatResult,
    readability: readabilityResult,
    suggestions: suggestionResult.suggestions,
  },
});
```

### 4.2 List User's ATS Reports

```typescript
// GET /api/v1/ats/reports
const reports = await prisma.atsReport.findMany({
  where: { externalUserId: req.externalUserId },
  orderBy: { createdAt: 'desc' },
  take: 20,                    // default page size
  skip: (page - 1) * 20,
  select: {
    id: true,
    fileName: true,
    overallScore: true,
    createdAt: true,
    resumeId: true,
    // Exclude heavy fields: extractedText, keywords, formatting, etc.
  },
});
```

### 4.3 Get Single ATS Report

```typescript
// GET /api/v1/ats/reports/:id
const report = await prisma.atsReport.findFirst({
  where: {
    id: req.params.id,
    externalUserId: req.externalUserId,  // ownership check
  },
});

if (!report) throw new NotFoundError('ATS Report');
```

### 4.4 Delete ATS Report

```typescript
// DELETE /api/v1/ats/reports/:id
const report = await prisma.atsReport.findFirst({
  where: {
    id: req.params.id,
    externalUserId: req.externalUserId,
  },
});

if (!report) throw new NotFoundError('ATS Report');

// Delete file from disk if it still exists
if (report.filePath) {
  fs.unlink(report.filePath).catch(() => {});
}

await prisma.atsReport.delete({
  where: { id: req.params.id },
});
```

### 4.5 Analyze Saved Resume (No File Upload)

```typescript
// POST /api/v1/ats/analyze-resume/:resumeId
// Fetch resume data, render to HTML, convert to text, then run ATS pipeline

const resume = await prisma.resume.findFirst({
  where: {
    id: req.params.resumeId,
    externalUserId: req.externalUserId,
  },
  include: {
    sections: { orderBy: { sortOrder: 'asc' } },
  },
});

if (!resume) throw new NotFoundError('Resume');

// Convert resume data to plain text for ATS analysis
const plainText = convertResumeToPlainText(resume);
// Then run pipeline with plainText instead of PDF extraction
```

### 4.6 Count Reports Per User (Optional — for rate limiting)

```typescript
const count = await prisma.atsReport.count({
  where: {
    externalUserId: req.externalUserId,
    createdAt: { gte: new Date(Date.now() - 86_400_000) },  // last 24h
  },
});

if (count >= 20) {
  throw new AppError(429, 'RATE_LIMIT', 'Maximum 20 ATS analyses per day');
}
```

---

## STEP 5 — MVP SIMPLIFICATIONS

### 5.1 Intentionally Simplified

| Area | MVP Approach | Production Approach (Post-MVP) |
|---|---|---|
| **Keyword extraction** | Simple tokenization + stop word removal | TF-IDF weighting, n-gram extraction, synonym mapping |
| **Keyword matching** | Exact lowercase string match | Stemming (Porter), lemmatization, semantic similarity via embeddings |
| **Section detection** | Regex pattern matching only | NLP-based classification, ML model for section boundaries |
| **Readability scoring** | Simple metrics (sentence length, action verbs, numbers) | Flesch-Kincaid, Gunning Fog, SMOG index, full NLP analysis |
| **Multi-word keywords** | Not supported in MVP | Bigram/trigram extraction for "machine learning", "react native" |
| **Scanned PDFs** | Reject with error message | OCR via Tesseract.js |
| **File storage** | Local disk | S3/cloud storage with signed URLs |
| **File cleanup** | setTimeout + hourly interval | Dedicated cron job, disk monitoring |
| **Rate limiting** | None in MVP | Per-user daily quota (DB count check) |
| **Caching** | None | Redis cache for repeated JD analysis |
| **Concurrent analysis** | No limit | Semaphore limiting to 5 concurrent analyses |
| **Suggestion quality** | Static rule-based (18 rules) | AI-powered suggestions via LLM |
| **Date format detection** | Basic regex | NLP date parser |
| **Industry keywords** | Generic stop words only | Industry-specific keyword databases |
| **Score calibration** | Fixed weights | A/B tested weights, user feedback loop |
| **Error recovery** | Individual analyzer fallback to score=0 | Retry logic, partial result caching |
| **Extracted text storage** | Truncated to 5000 chars | Full text, compressed |
| **Report comparison** | Not supported | Before/after score comparison |

### 5.2 What to Skip Entirely in MVP

- [ ] ~~JWT verification~~ → trust X-User-ID header
- [ ] ~~API key management~~ → no API keys table needed
- [ ] ~~Rate limiting middleware~~ → add post-MVP
- [ ] ~~Structured logging~~ → use console.log
- [ ] ~~OpenAPI/Swagger docs~~ → document in README
- [ ] ~~Webhook notifications~~ → parent platform polls
- [ ] ~~Resume comparison~~ → single analysis only
- [ ] ~~Batch analysis~~ → one PDF at a time
- [ ] ~~Score history trends~~ → just list reports
- [ ] ~~PDF page-by-page analysis~~ → full text only
- [ ] ~~Custom scoring weights~~ → fixed weights
- [ ] ~~Template-specific formatting checks~~ → generic checks only

### 5.3 Known MVP Limitations to Document

```markdown
## Known Limitations (MVP)

1. **Keyword matching is exact-match only.** "JavaScript" won't match "JS".
   Workaround: Users should include both forms in their resume.

2. **Scanned/image PDFs are not supported.** Only text-based PDFs can be analyzed.
   Workaround: Users should export their resume from a word processor, not scan it.

3. **Multi-word technical terms may not be detected as single keywords.**
   "machine learning" may be split into "machine" and "learning".
   Impact: Slightly inflated keyword match rates.

4. **Section detection relies on header text.** Resumes without clear section
   headers may score lower on section detection.

5. **Scoring weights are fixed.** The 40/15/25/20 weighting may not perfectly
   reflect all ATS systems. Scores should be treated as estimates.

6. **Maximum 10MB PDF file size.** Larger files are rejected.

7. **Uploaded PDFs are stored temporarily (max 1 hour) then deleted.**
   Reports persist in the database but the original file does not.
```

### 5.4 MVP Definition of Done

- [ ] `POST /api/v1/ats/analyze` accepts PDF + optional JD, returns full report
- [ ] `POST /api/v1/ats/analyze-resume/:id` analyzes saved resume against JD
- [ ] `GET /api/v1/ats/reports` lists user's reports (paginated)
- [ ] `GET /api/v1/ats/reports/:id` returns full report
- [ ] `DELETE /api/v1/ats/reports/:id` deletes report + file
- [ ] Overall score is 0-100 with label
- [ ] At least 4 sub-scores returned (keyword, sections, formatting, readability)
- [ ] At least 5 unique suggestion types generated
- [ ] Scanned PDFs return clear error (not crash)
- [ ] Files cleaned up within 1 hour
- [ ] Report saved to PostgreSQL
- [ ] Ownership enforced (user can only see own reports)

---

*ATS Analysis Engine Design v1.0 | Generated: 2026-02-26*