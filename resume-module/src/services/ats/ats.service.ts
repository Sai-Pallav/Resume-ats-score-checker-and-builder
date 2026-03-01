import fs from 'fs';
import prisma from '../../utils/prisma';
import { extractText } from './textExtractor';
import { detectSections } from './sectionDetector';
import { matchKeywords } from './keywordMatcher';
import { analyzeFormat } from './formatAnalyzer';
import { scoreReadability, ACTION_VERBS } from './readabilityScorer';
import { generateSuggestions } from './suggestionEngine';
import { aggregateScore } from './scoreAggregator';
import {
    SectionDetectionResult,
    KeywordMatchResult,
    FormatAnalysisResult,
    ReadabilityResult,
    AtsFinalReport,
    TextExtractionResult,
    AtsExecutionMetrics
} from '../../types/ats.types';
import { resumeService } from '../resume.service';
import { logger } from '../../utils/logger';

const MAX_ANALYSIS_TIME_MS = 12000;

/**
 * Converts a Resume (with sections) into a single plain text string for ATS analysis.
 * Format: Header (Title, Summary, Contact) followed by Sections.
 */
const convertResumeToPlainText = (resume: any): string => {
    const lines: string[] = [];

    // Header
    if (resume.title) lines.push(resume.title.toUpperCase());
    if (resume.summary) lines.push(resume.summary);

    const contact = resume.contactInfo || {};
    const contactParts = [
        contact.fullName,
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.github,
        contact.website
    ].filter(Boolean);

    if (contactParts.length > 0) {
        lines.push(contactParts.join(' | '));
    }

    lines.push(''); // Spacer

    // Sections
    const sections = resume.sections || [];
    for (const section of sections) {
        lines.push(section.type.toUpperCase());

        const data = section.data;
        if (!data) continue;

        if (section.type === 'skills' && data.categories) {
            data.categories.forEach((cat: any) => {
                lines.push(`${cat.name}: ${(cat.items || []).join(', ')}`);
            });
        } else if (typeof data === 'string') {
            lines.push(data);
        } else if (Array.isArray(data)) {
            data.forEach(item => {
                if (typeof item === 'string') {
                    lines.push(`• ${item}`);
                } else if (typeof item === 'object' && item !== null) {
                    const title = item.title || item.degree || item.role || '';
                    const org = item.institution || item.company || item.school || item.university || item.organization || '';
                    const date = item.date || item.duration || `${item.startDate || ''} - ${item.endDate || ''}`;
                    const desc = item.highlights || item.bullets || item.description || '';

                    let line = '';
                    if (title) line += title;
                    if (org) line += (line ? ` at ${org}` : org);
                    if (date) line += (line ? ` (${date})` : date);
                    if (line) lines.push(line);

                    if (Array.isArray(desc)) {
                        desc.forEach(b => lines.push(`• ${b}`));
                    } else if (desc) {
                        lines.push(desc);
                    }
                }
            });
        }
        lines.push(''); // Spacer
    }

    return lines.join('\n');
};

/**
 * Main orchestrator for ATS Resume Analysis.
 * Following the strict execution flow:
 * 1. Extract text
 * 2. Run analyzers using Promise.all (Parallel)
 * 3. Aggregate score
 * 4. Generate suggestions
 * 5. Return Complete Report
 */
export const analyzeResume = async (
    externalUserId: string,
    requestId: string,
    filePath: string,
    fileName: string,
    jobDescription?: string,
    resumeId?: string
) => {
    const reqLogger = logger.child({ externalUserId, requestId, resumeId, fileName, action: 'ATS_ANALYZE_UPLOAD' });
    reqLogger.info('ATS analysis started (File Upload)');
    const tStartTotal = performance.now();

    // 1. Extract text
    let extractionResult;
    const tStartExtraction = performance.now();
    try {
        extractionResult = await extractText(filePath);
    } catch (error) {
        // Immediate cleanup on extraction error as per design doc Phase 2
        reqLogger.error({ err: error }, 'PDF text extraction failed');
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
    const tEndExtraction = performance.now();
    const { text, pageCount, wordCount } = extractionResult;

    const hasJd = Boolean(jobDescription && jobDescription.trim().length > 0);

    // Helper for fail-safe execution of sub-modules with timing
    const runSafeTimed = async <T>(fn: () => T | Promise<T>, fallback: T, name: string): Promise<{ result: T, timeMs: number, success: boolean }> => {
        const tStart = performance.now();
        try {
            const result = await fn();
            return { result, timeMs: performance.now() - tStart, success: true };
        } catch (error) {
            reqLogger.error({ err: error, submodule: name }, `Submodule analysis error: ${name}`);
            return { result: fallback, timeMs: performance.now() - tStart, success: false };
        }
    };

    // 2. Run analyzers with a strict 12s total budget
    const analysisPromise = Promise.all([
        runSafeTimed<SectionDetectionResult>(
            () => detectSections(text),
            { detected: [], missing: ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'], details: {}, score: 0 },
            'detectSections'
        ),
        runSafeTimed<KeywordMatchResult | null>(
            () => hasJd ? matchKeywords(text, jobDescription!) : null,
            null,
            'matchKeywords'
        ),
        runSafeTimed<FormatAnalysisResult>(
            () => analyzeFormat(text, pageCount, wordCount),
            { checks: [], score: 0 },
            'analyzeFormat'
        ),
        runSafeTimed<ReadabilityResult>(
            () => scoreReadability(text),
            {
                metrics: {
                    avgSentenceLength: 0,
                    avgWordLength: 0,
                    bulletCount: 0,
                    actionVerbCount: 0,
                    actionVerbRatio: 0,
                    quantificationCount: 0,
                    quantificationRatio: 0
                },
                score: 0
            },
            'scoreReadability'
        )
    ]);

    // Race against timeout
    let isTimeout = false;
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), MAX_ANALYSIS_TIME_MS));

    const analysisResults = await Promise.race([analysisPromise, timeoutPromise]);

    let sectionsData, keywordsData, formattingData, readabilityData;

    if (analysisResults === null) {
        reqLogger.warn('ATS analysis timed out, returning partial results');
        isTimeout = true;
        // Fallbacks for all sub-modules
        const fallbackBase = { timeMs: MAX_ANALYSIS_TIME_MS, success: false };
        sectionsData = { ...fallbackBase, result: { detected: [], missing: ['timeout'], details: {}, score: 0 } } as any;
        keywordsData = { ...fallbackBase, result: null } as any;
        formattingData = { ...fallbackBase, result: { checks: [], score: 0 } } as any;
        readabilityData = { ...fallbackBase, result: { metrics: { avgSentenceLength: 0, avgWordLength: 0, bulletCount: 0, actionVerbCount: 0, actionVerbRatio: 0, quantificationCount: 0, quantificationRatio: 0 }, score: 0 } } as any;
    } else {
        [sectionsData, keywordsData, formattingData, readabilityData] = analysisResults;
    }

    const sections = sectionsData.result;
    const keywords = keywordsData.result;
    const formatting = formattingData.result;
    const readability = readabilityData.result;

    const tEndTotal = performance.now();

    const executionMetrics: AtsExecutionMetrics = {
        extractionTimeMs: tEndExtraction - tStartExtraction,
        sectionDetectionTimeMs: sectionsData.timeMs,
        keywordMatchTimeMs: keywordsData.timeMs,
        formatAnalysisTimeMs: formattingData.timeMs,
        readabilityTimeMs: readabilityData.timeMs,
        totalAnalysisTimeMs: tEndTotal - tStartTotal
    };

    // 3. Aggregate score (Calculating weighted final result, parsing success flags for proportional recalculations)
    const finalReport: AtsFinalReport = aggregateScore(
        sections, keywords, formatting, readability, hasJd,
        {
            sectionsSuccess: sectionsData.success,
            keywordsSuccess: keywordsData.success,
            formattingSuccess: formattingData.success,
            readabilitySuccess: readabilityData.success,
            isTimeout
        }
    );

    // 4. Generate suggestions based on all analysis results
    const suggestionResult = generateSuggestions(
        sections,
        keywords,
        formatting,
        readability,
        wordCount,
        pageCount
    );

    // 4.5 Create Resume Snapshot if resumeId is provided
    let resumeSnapshot = null;
    if (resumeId) {
        try {
            resumeSnapshot = await resumeService.findById(resumeId, externalUserId);
        } catch (snapshotError) {
            reqLogger.warn({ err: snapshotError }, 'Failed to fetch resume for snapshotting');
        }
    }

    // Persist results to Database (Background task from service perspective, but we wait for it to return ID)
    let reportId: string | null = null;
    try {
        const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;

        // Use a transaction ensures atomicity if we ever add related saves (e.g. usage logging)
        const [savedReport] = await prisma.$transaction([
            prisma.atsReport.create({
                data: {
                    externalUserId,
                    resumeId: resumeId || null,
                    fileName,
                    filePath,
                    jobDescription: jobDescription || null,
                    extractedText: truncatedText,
                    overallScore: finalReport.overallScore,
                    sectionScores: finalReport.breakdown as any,
                    keywords: keywords as any,
                    formatting: formatting as any,
                    readability: readability as any,
                    suggestions: { ...suggestionResult, metrics: executionMetrics } as any,
                    resumeSnapshot: resumeSnapshot as any
                } as any
            })
        ]);
        reportId = savedReport.id;
    } catch (saveError) {
        // We log the error but swallow it so the user still gets their analysis report
        reqLogger.error({ err: saveError }, 'Failed to save ATS report to DB in transaction');
    }

    // File Cleanup: Schedule temporary file for deletion
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete temp file ${filePath}:`, err);
        });
    }, 60_000);

    // 5. Return Results
    reqLogger.info({ durationMs: executionMetrics.totalAnalysisTimeMs, overallScore: finalReport.overallScore }, 'ATS analysis completed (File Upload)');

    // We return a "Complete Report" which includes the AtsFinalReport (score summary)
    // plus all the detailed breakdowns for the frontend to render.
    return {
        reportId,
        ...finalReport, // contains overallScore, label, color, breakdown
        keywords,
        formatting,
        readability,
        sections,
        suggestions: suggestionResult,
        metadata: {
            fileName,
            pageCount,
            wordCount,
            analyzedAt: new Date(),
            metrics: executionMetrics
        }
    };
};

/**
 * Analyzes a resume already saved in the database.
 * 1. Fetches resume from DB
 * 2. Converts JSON to plain text
 * 3. Runs the same parallel analysis pipeline
 */
export const analyzeSavedResume = async (
    externalUserId: string,
    requestId: string,
    resumeId: string,
    jobDescription?: string
) => {
    const reqLogger = logger.child({ externalUserId, requestId, resumeId, action: 'ATS_ANALYZE_SAVED' });
    reqLogger.info('ATS analysis started (Saved Resume)');
    const tStartTotal = performance.now();

    // 1. Fetch Resume
    const tStartExtraction = performance.now();
    const resume = await resumeService.findById(resumeId, externalUserId);

    // 2. Convert to Plain Text
    const text = convertResumeToPlainText(resume);
    const tEndExtraction = performance.now();

    // 3. Prepare Analysis Inputs
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const pageCount = Math.ceil(wordCount / 400); // Heuristic: ~400 words per page
    const hasJd = Boolean(jobDescription && jobDescription.trim().length > 0);

    // Helper for fail-safe execution of sub-modules
    const runSafeTimed = async <T>(fn: () => T | Promise<T>, fallback: T, name: string): Promise<{ result: T, timeMs: number, success: boolean }> => {
        const tStart = performance.now();
        try {
            const result = await fn();
            return { result, timeMs: performance.now() - tStart, success: true };
        } catch (error) {
            reqLogger.error({ err: error, submodule: name }, `Submodule analysis error: ${name}`);
            return { result: fallback, timeMs: performance.now() - tStart, success: false };
        }
    };

    // 4. Run analyzers with a strict 12s total budget
    const analysisPromise = Promise.all([
        runSafeTimed<SectionDetectionResult>(
            () => detectSections(text),
            { detected: [], missing: ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'], details: {}, score: 0 },
            'detectSections'
        ),
        runSafeTimed<KeywordMatchResult | null>(
            () => hasJd ? matchKeywords(text, jobDescription!) : null,
            null,
            'matchKeywords'
        ),
        runSafeTimed<FormatAnalysisResult>(
            () => analyzeFormat(text, pageCount, wordCount),
            { checks: [], score: 0 },
            'analyzeFormat'
        ),
        runSafeTimed<ReadabilityResult>(
            () => scoreReadability(text),
            {
                metrics: {
                    avgSentenceLength: 0,
                    avgWordLength: 0,
                    bulletCount: 0,
                    actionVerbCount: 0,
                    actionVerbRatio: 0,
                    quantificationCount: 0,
                    quantificationRatio: 0
                },
                score: 0
            },
            'scoreReadability'
        )
    ]);

    // Race against timeout
    let isTimeout = false;
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), MAX_ANALYSIS_TIME_MS));

    const analysisResults = await Promise.race([analysisPromise, timeoutPromise]);

    let sectionsData, keywordsData, formattingData, readabilityData;

    if (analysisResults === null) {
        reqLogger.warn('ATS analysis timed out, returning partial results');
        isTimeout = true;
        // Fallbacks for all sub-modules
        const fallbackBase = { timeMs: MAX_ANALYSIS_TIME_MS, success: false };
        sectionsData = { ...fallbackBase, result: { detected: [], missing: ['timeout'], details: {}, score: 0 } } as any;
        keywordsData = { ...fallbackBase, result: null } as any;
        formattingData = { ...fallbackBase, result: { checks: [], score: 0 } } as any;
        readabilityData = { ...fallbackBase, result: { metrics: { avgSentenceLength: 0, avgWordLength: 0, bulletCount: 0, actionVerbCount: 0, actionVerbRatio: 0, quantificationCount: 0, quantificationRatio: 0 }, score: 0 } } as any;
    } else {
        [sectionsData, keywordsData, formattingData, readabilityData] = analysisResults;
    }

    const sections = sectionsData.result;
    const keywords = keywordsData.result;
    const formatting = formattingData.result;
    const readability = readabilityData.result;

    const tEndTotal = performance.now();

    const executionMetrics: AtsExecutionMetrics = {
        extractionTimeMs: tEndExtraction - tStartExtraction,
        sectionDetectionTimeMs: sectionsData.timeMs,
        keywordMatchTimeMs: keywordsData.timeMs,
        formatAnalysisTimeMs: formattingData.timeMs,
        readabilityTimeMs: readabilityData.timeMs,
        totalAnalysisTimeMs: tEndTotal - tStartTotal
    };

    // 5. Aggregate score (Pass success flags for fail-safe proportional weight)
    const finalReport: AtsFinalReport = aggregateScore(
        sections, keywords, formatting, readability, hasJd,
        {
            sectionsSuccess: sectionsData.success,
            keywordsSuccess: keywordsData.success,
            formattingSuccess: formattingData.success,
            readabilitySuccess: readabilityData.success,
            isTimeout
        }
    );

    // 6. Generate suggestions
    const suggestionResult = generateSuggestions(
        sections,
        keywords,
        formatting,
        readability,
        wordCount,
        pageCount
    );

    // 7. Persist results
    let reportId: string | null = null;
    try {
        const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;

        // Transaction for future-proofing and atomic writes
        const [savedReport] = await prisma.$transaction([
            prisma.atsReport.create({
                data: {
                    externalUserId,
                    resumeId,
                    fileName: resume.title || 'Saved Resume',
                    filePath: 'DB_STORED', // Indicator that no file exists on disk
                    jobDescription: jobDescription || null,
                    extractedText: truncatedText,
                    overallScore: finalReport.overallScore,
                    sectionScores: finalReport.breakdown as any,
                    keywords: keywords as any,
                    formatting: formatting as any,
                    readability: readability as any,
                    suggestions: { ...suggestionResult, metrics: executionMetrics } as any,
                    resumeSnapshot: resume as any
                } as any
            })
        ]);
        reportId = savedReport.id;
    } catch (saveError) {
        // Swallow error to guarantee analysis reaches the user
        reqLogger.error({ err: saveError }, 'Failed to save ATS report to DB in transaction');
    }

    return {
        reportId,
        ...finalReport,
        keywords,
        formatting,
        readability,
        sections,
        suggestions: suggestionResult,
        metadata: {
            fileName: resume.title || 'Saved Resume',
            pageCount,
            wordCount,
            analyzedAt: new Date(),
            metrics: executionMetrics
        }
    };
};

/**
 * Fetches a specific ATS Report by ID, enforcing strict tenant ownership verification
 * to prevent horizontal privilege escalation.
 */
export const getAtsReport = async (id: string, externalUserId: string) => {
    const report = await prisma.atsReport.findFirst({
        where: { id, externalUserId },
        // No longer including the live 'resume' relation to ensure we use the immutable snapshot
    });

    if (!report) {
        throw new Error('Report not found');
    }

    // Map the snapshot to the 'resume' field so any existing frontend code continues to work
    // but now uses the immutable historical data instead of live DB state.
    return {
        ...report,
        resume: (report as any).resumeSnapshot
    };
};

/**
 * Fast endpoint specifically for JSON parsing (No PDF required).
 * Instantly identifies missing sections and specifically pinpoints exact
 * bullets lacking action verbs or quantification.
 */
export const quickScanJson = (resume: any) => {
    // 1. Missing Sections check via text conversion
    const text = convertResumeToPlainText(resume);
    const sectionResult = detectSections(text);

    // 2. Identify weak bullets by harvesting the JSON structure directly
    const weakBullets: { section: string; bullet: string; reason: string[] }[] = [];
    let actionVerbsMissingCount = 0;

    const sections = resume.sections || [];
    for (const section of sections) {
        // We primarily care about Experience and Project bullets
        if (['experience', 'projects'].includes(section.type.toLowerCase())) {
            const data = section.data;
            if (Array.isArray(data)) {
                data.forEach((item: any) => {
                    const desc = item.highlights || item.bullets || item.description || [];
                    const bulletsArray = Array.isArray(desc) ? desc : (typeof desc === 'string' ? desc.split('\n') : []);

                    bulletsArray.forEach((bullet: string) => {
                        const trimmed = bullet.trim().replace(/^[\s]*[•\-\*▪►●‣⁃]/, '').trim();
                        if (trimmed.length < 10) return; // Skip tiny invalid strings

                        const reasons: string[] = [];

                        // Lack of Quantification check
                        const hasNumber = /\b\d+(\.\d+)?%?\b/.test(trimmed);
                        if (!hasNumber) {
                            reasons.push('Lacks quantification (metrics, %, $, etc)');
                        }

                        // Has Action Verb Check
                        const firstWordMatch = trimmed.match(/^[a-zA-Z]+/);
                        if (firstWordMatch) {
                            const firstWord = firstWordMatch[0].toLowerCase();
                            if (!ACTION_VERBS.has(firstWord)) {
                                reasons.push(`Missing strong action verb (starts with "${firstWord}")`);
                                actionVerbsMissingCount++;
                            }
                        } else {
                            reasons.push('Invalid sentence structure');
                            actionVerbsMissingCount++;
                        }

                        // If reasons exist, flag as a weak bullet
                        if (reasons.length > 0) {
                            weakBullets.push({
                                section: item.title || item.role || section.type.toUpperCase(),
                                bullet: trimmed,
                                reason: reasons
                            });
                        }
                    });
                });
            }
        }
    }

    return {
        missingSections: sectionResult.missing,
        weakBullets,
        actionVerbsMissing: actionVerbsMissingCount
    };
};

/**
 * Calculates the percentile ranking of a given score against all historical ATS reports.
 */
export const calculateBenchmark = async (score: number) => {
    // Total reports that have a score
    const totalCount = await prisma.atsReport.count({
        where: { overallScore: { not: null } }
    });

    if (totalCount === 0) {
        return { score, percentile: 100, totalEvaluated: 0 };
    }

    // Reports that scored *strictly less* than the given score
    const lowerCount = await prisma.atsReport.count({
        where: {
            overallScore: {
                not: null,
                lt: score
            }
        }
    });

    const percentile = Math.round((lowerCount / totalCount) * 100);

    return {
        score,
        percentile,
        totalEvaluated: totalCount
    };
};
