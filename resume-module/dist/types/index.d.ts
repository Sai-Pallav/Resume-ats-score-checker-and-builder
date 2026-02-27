export interface ExtractionResult {
    text: string;
    pageCount: number;
}
export interface SectionDetectionResult {
    detected: string[];
    missing: string[];
    score: number;
}
export interface KeywordMatchResult {
    matched: string[];
    missing: string[];
    jdKeywords: string[];
    score: number;
}
export interface FormatCheck {
    name: string;
    passed: boolean;
    detail: string;
}
export interface FormatAnalysisResult {
    checks: FormatCheck[];
    score: number;
}
export interface ReadabilityResult {
    avgSentenceLength: number;
    actionVerbCount: number;
    quantificationCount: number;
    wordCount: number;
    score: number;
}
export interface Suggestion {
    category: 'keywords' | 'sections' | 'formatting' | 'readability' | 'content';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
}
export interface AtsReportResult {
    overallScore: number;
    sectionScores: {
        keyword: {
            score: number;
            weight: number;
        };
        sections: {
            score: number;
            weight: number;
        };
        formatting: {
            score: number;
            weight: number;
        };
        readability: {
            score: number;
            weight: number;
        };
    };
    keywords: KeywordMatchResult;
    formatting: FormatAnalysisResult;
    readability: ReadabilityResult;
    sectionsDetected: SectionDetectionResult;
    suggestions: Suggestion[];
}
//# sourceMappingURL=index.d.ts.map