import { matchKeywords } from './keywordMatcher';
import { AtsReportResult, FormatAnalysisResult, ReadabilityResult, Suggestion, KeywordMatchResult } from '../../types';

// Weights as requested: keyword = 40, format = 30, readability = 30
const WEIGHTS = {
    keyword: 0.40,
    format: 0.30,
    readability: 0.30
};

export class AtsService {
    /**
     * Main entry point to generate an ATS Report based on the provided text
     */
    public generateReport(resumeText: string, jobDescription: string): AtsReportResult {
        const suggestions: Suggestion[] = [];

        // 1. Keyword Score (out of 100)
        let keywordResult: KeywordMatchResult = { matched: [], missing: [], jdKeywords: [], score: 0 };
        if (jobDescription && jobDescription.trim().length > 0) {
            keywordResult = matchKeywords(resumeText, jobDescription);
        } else {
            // If no JD, we can't score keywords, default to a neutral/good score or 0? 
            // We'll give 0 if JD is provided but no match. 
            // For now, if no JD is passed, maybe keyword score is 0. 
        }

        if (keywordResult.score < 50 && jobDescription) {
            suggestions.push({
                category: 'keywords',
                priority: 'HIGH',
                message: 'Your resume is missing several key terms from the job description. Try adding more of the missing keywords.'
            });
        }

        // 2. Format Score (out of 100)
        // Basic heuristics for format based on text content (ideally we'd have the sections JSON but we only have text here, 
        // or we check for common section headers).
        const formatResult = this.analyzeFormat(resumeText);
        if (formatResult.score < 70) {
            suggestions.push({
                category: 'formatting',
                priority: 'MEDIUM',
                message: 'Ensure your resume includes clearly defined sections like Experience, Education, and Skills.'
            });
        }

        // 3. Readability Score (out of 100)
        const readabilityResult = this.analyzeReadability(resumeText);
        if (readabilityResult.score < 60) {
            suggestions.push({
                category: 'readability',
                priority: 'MEDIUM',
                message: 'Consider using more action verbs and quantifying your achievements with numbers to improve impact.'
            });
        }

        // Calculate final weighted score
        const weightedKeywordScore = keywordResult.score * WEIGHTS.keyword;
        const weightedFormatScore = formatResult.score * WEIGHTS.format;
        const weightedReadabilityScore = readabilityResult.score * WEIGHTS.readability;

        const overallScore = Math.round(weightedKeywordScore + weightedFormatScore + weightedReadabilityScore);

        return {
            overallScore,
            sectionScores: {
                keyword: { score: keywordResult.score, weight: WEIGHTS.keyword },
                formatting: { score: formatResult.score, weight: WEIGHTS.format },
                readability: { score: readabilityResult.score, weight: WEIGHTS.readability }
            },
            keywords: keywordResult,
            formatting: formatResult,
            readability: readabilityResult,
            suggestions
        };
    }

    private analyzeFormat(text: string): FormatAnalysisResult {
        const normalizedText = text.toLowerCase();
        const checks = [];
        let score = 100;

        // Check for common sections conceptually in the text (Heuristic approach)
        const hasContact = /email|phone|linkedin|github/i.test(normalizedText);
        checks.push({
            name: 'Contact Information',
            passed: hasContact,
            detail: hasContact ? 'Contact info keywords detected.' : 'Missing clear contact information keywords.'
        });
        if (!hasContact) score -= 20;

        const hasExperience = /experience|employment|work history/i.test(normalizedText);
        checks.push({
            name: 'Experience Section',
            passed: hasExperience,
            detail: hasExperience ? 'Experience section detected.' : 'Missing clear Experience section.'
        });
        if (!hasExperience) score -= 40;

        const hasEducation = /education|university|college|degree/i.test(normalizedText);
        checks.push({
            name: 'Education Section',
            passed: hasEducation,
            detail: hasEducation ? 'Education section detected.' : 'Missing clear Education section.'
        });
        if (!hasEducation) score -= 20;

        const hasSkills = /skills|technologies|tools/i.test(normalizedText);
        checks.push({
            name: 'Skills Section',
            passed: hasSkills,
            detail: hasSkills ? 'Skills section detected.' : 'Missing clear Skills section.'
        });
        if (!hasSkills) score -= 20;

        return {
            checks,
            score: Math.max(0, score) // ensure no negative
        };
    }

    private analyzeReadability(text: string): ReadabilityResult {
        // Simple heuristics
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

        // Action verbs (very basic list)
        const actionVerbRegex = /\b(managed|led|developed|created|designed|implemented|improved|increased|reduced|coordinated)\b/gi;
        const actionVerbMatches = text.match(actionVerbRegex) || [];
        const actionVerbCount = actionVerbMatches.length;

        // Quantification (numbers)
        const numberRegex = /\b\d+(\.\d+)?%?\b/g;
        const numberMatches = text.match(numberRegex) || [];
        const quantificationCount = numberMatches.length;

        let score = 100;

        // Penalize for very long sentences (avg > 20 words)
        if (avgSentenceLength > 20) {
            score -= 15;
        }

        // Penalize for lack of action verbs
        if (actionVerbCount < 5) {
            score -= 20;
        }

        // Penalize for lack of quantification
        if (quantificationCount < 3) {
            score -= 20;
        }

        // Basic length check
        if (wordCount < 100) {
            score -= 30; // Too short
        } else if (wordCount > 1000) {
            score -= 10; // Possibly too long
        }

        return {
            avgSentenceLength,
            actionVerbCount,
            quantificationCount,
            wordCount,
            score: Math.max(0, score)
        };
    }
}

export const atsService = new AtsService();
