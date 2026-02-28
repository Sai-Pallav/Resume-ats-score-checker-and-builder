import { Request, Response, NextFunction } from 'express';
import { extractText } from '../services/ats/textExtractor';
import { detectSections } from '../services/ats/sectionDetector';
import { analyzeResume, analyzeSavedResume, quickScanJson, calculateBenchmark } from '../services/ats/ats.service';
import { ValidationError } from '../utils/errors';
import fs from 'fs';
import { sendSuccess } from '../utils/response';
import { scopedLogger } from '../utils/logger';

export class AtsController {
    // Legacy endpoint just for initial MVP testing, optional
    async extractText(req: Request, res: Response, next: NextFunction) {
        let filePath = '';
        try {
            if (!req.file) {
                throw new ValidationError('PDF file is required');
            }

            filePath = req.file.path;
            const extractionResult = await extractText(filePath);

            sendSuccess(res, {
                fileName: req.file.originalname,
                pageCount: extractionResult.pageCount,
                wordCount: extractionResult.wordCount,
                lineCount: extractionResult.lineCount,
                text: extractionResult.text,
            });
        } catch (err) {
            next(err);
        } finally {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    // Fast completeness check (No DB persistence, no Job Description required)
    async checkCompleteness(req: Request, res: Response, next: NextFunction) {
        let filePath = '';
        try {
            if (!req.file) {
                throw new ValidationError('PDF file is required');
            }

            filePath = req.file.path;
            const extractionResult = await extractText(filePath);
            const completeness = detectSections(extractionResult.text);

            sendSuccess(res, {
                completenessPercentage: completeness.score,
                detected: completeness.detected,
                missing: completeness.missing
            });
        } catch (err) {
            next(err);
        } finally {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    // Fast JSON-only ATS deep scan
    async quickScan(req: Request, res: Response, next: NextFunction) {
        try {
            const { resume } = req.body;
            const log = scopedLogger(req, 'ATS');

            if (!resume || typeof resume !== 'object') {
                throw new ValidationError('Resume JSON object is required in the body');
            }

            const scanResult = quickScanJson(resume);
            log.info('Quick scan completed');

            sendSuccess(res, scanResult);
        } catch (err) {
            next(err);
        }
    }

    // Benchmark comparison endpoint
    async getBenchmark(req: Request, res: Response, next: NextFunction) {
        try {
            const scoreParam = req.query.score as string;
            if (!scoreParam) {
                throw new ValidationError('Query parameter "score" is required');
            }

            const score = parseInt(scoreParam, 10);
            if (isNaN(score) || score < 0 || score > 100) {
                throw new ValidationError('Score must be a valid number between 0 and 100');
            }

            const benchmarkResult = await calculateBenchmark(score);

            sendSuccess(res, {
                ...benchmarkResult,
                message: `This score is better than ${benchmarkResult.percentile}% of all analyzed resumes.`
            });
        } catch (err) {
            next(err);
        }
    }

    // Main MVP Logic Node
    async analyze(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new ValidationError('PDF file is required');
            }

            // Auth middleware should guarantee this exists
            const externalUserId = req.externalUserId;
            if (!externalUserId) {
                throw new ValidationError('User ID is required');
            }

            const { jobDescription, resumeId } = req.body;
            const filePath = req.file.path;
            const fileName = req.file.originalname;

            const log = scopedLogger(req, 'ATS');
            log.info({ fileName, resumeId }, 'ATS analysis started');

            const analysisReport = await analyzeResume(
                externalUserId,
                req.requestId,
                filePath,
                fileName,
                jobDescription,
                resumeId
            );

            log.info({ reportId: analysisReport.reportId, overallScore: analysisReport.overallScore }, 'ATS analysis completed');
            sendSuccess(res, analysisReport, 200);

        } catch (err) {
            // Note: DB cleanup / file cleanup is handled by finally blocks or internal services
            // But if multer failed, we want to try catching ghost files.
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, () => { });
            }
            next(err);
        }
    }

    async analyzeSaved(req: Request, res: Response, next: NextFunction) {
        try {
            const externalUserId = req.externalUserId;
            const resumeId = req.params.resumeId as string;
            const { jobDescription } = req.body;

            const log = scopedLogger(req, 'ATS');
            log.info({ resumeId }, 'ATS analysis for saved resume started');

            const analysisReport = await analyzeSavedResume(
                externalUserId,
                req.requestId,
                resumeId,
                jobDescription
            );

            log.info({ reportId: analysisReport.reportId, overallScore: analysisReport.overallScore }, 'ATS analysis for saved resume completed');
            sendSuccess(res, analysisReport, 200);
        } catch (err) {
            next(err);
        }
    }

    async getReport(req: Request, res: Response, next: NextFunction) {
        try {
            const externalUserId = req.externalUserId;
            const reportId = req.params.id as string;
            if (!reportId) {
                throw new ValidationError('Report ID is required');
            }

            // We dynamically import here or use a top-level import to ats.service
            // To keep it clean, let's assume getAtsReport is imported at the top
            const { getAtsReport } = await import('../services/ats/ats.service');
            const report = await getAtsReport(reportId, externalUserId);

            sendSuccess(res, report, 200);
        } catch (err) {
            next(err);
        }
    }
}

export const atsController = new AtsController();
