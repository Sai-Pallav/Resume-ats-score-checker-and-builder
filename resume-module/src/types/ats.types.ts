export interface TextExtractionResult {
    text: string;          // full extracted text
    pageCount: number;     // number of pages
    wordCount: number;     // total word count
    lineCount: number;     // total line count
    isEmpty: boolean;      // true if text.length < 50 (likely scanned PDF)
}

export interface SectionDetectionResult {
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

export interface KeywordMatchResult {
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

export interface FormatAnalysisResult {
    checks: {
        name: string;
        passed: boolean;
        detail: string;
        weight: number;      // importance: 1-3 (3 = critical)
    }[];
    score: number;         // 0-100 (weighted)
}

export interface ReadabilityResult {
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

export interface Suggestion {
    id: string;                    // unique suggestion ID (e.g., "KW-001")
    category: 'keywords' | 'sections' | 'formatting' | 'readability' | 'content';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;                 // short summary
    message: string;               // detailed actionable advice
    section?: string;              // which resume section this applies to
}

export interface SuggestionResult {
    suggestions: Suggestion[];
    totalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
}

export interface ScoreBreakdown {
    keyword: { score: number; weight: number; weighted: number };
    sections: { score: number; weight: number; weighted: number };
    formatting: { score: number; weight: number; weighted: number };
    readability: { score: number; weight: number; weighted: number };
}

export interface AtsFinalReport {
    overallScore: number;           // 0-100
    label: string;                  // "Excellent" | "Good" | "Fair" | "Needs Work" | "Poor"
    color: string;                  // hex color for UI
    breakdown: ScoreBreakdown;
}
