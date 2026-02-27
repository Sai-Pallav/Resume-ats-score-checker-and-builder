import { Request, Response, NextFunction } from 'express';
import { extractText } from '../services/ats/textExtractor';
import { ValidationError } from '../utils/errors';
import fs from 'fs';

export class AtsController {
    async extractText(req: Request, res: Response, next: NextFunction) {
        let filePath = '';
        try {
            if (!req.file) {
                throw new ValidationError('PDF file is required');
            }

            filePath = req.file.path;

            // Parse PDF using textExtractor service
            const extractionResult = await extractText(filePath);

            res.json({
                data: {
                    fileName: req.file.originalname,
                    pageCount: extractionResult.pageCount,
                    wordCount: extractionResult.wordCount,
                    lineCount: extractionResult.lineCount,
                    text: extractionResult.text,
                }
            });
        } catch (err) {
            next(err);
        } finally {
            // Cleanup uploaded file immediately to prevent disk bloating
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}

export const atsController = new AtsController();
