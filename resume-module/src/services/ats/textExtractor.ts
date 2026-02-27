import fs from 'fs';
const pdf = require('pdf-parse');
import { TextExtractionResult } from '../../types/ats.types';
import { AppError } from '../../utils/errors';

export const extractText = async (filePath: string): Promise<TextExtractionResult> => {
    try {
        // Read file asynchronously as requested
        const buffer = await fs.promises.readFile(filePath);

        // Parse PDF content
        const data = await pdf(buffer);

        const rawText = data.text || '';

        // Trim leading/trailing whitespace
        const text = rawText.trim();

        // Evaluate words and lines
        const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
        const lineCount = text.split(/\r\n|\r|\n/).length;

        const isEmpty = text.length < 50;

        if (isEmpty) {
            throw new AppError(422, 'UNPROCESSABLE_ENTITY', 'Scanned or image-based PDF detected. Please upload a text-based PDF.');
        }

        return {
            text,
            pageCount: data.numpages,
            wordCount,
            lineCount,
            isEmpty
        };
    } catch (error: any) {
        // If it's already our custom AppError from the isEmpty check, rethrow it
        if (error instanceof AppError) {
            throw error;
        }

        // Handle pdf-parse failures
        throw new AppError(500, 'EXTRACTION_ERROR', `Failed to extract text from PDF: ${(error as Error).message}`);
    }
};
