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

        // 1. Evaluate Word Count (Requirement: min 50)
        const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;

        // 2. Evaluate Alphabet Ratio (Requirement: min 30%)
        // Helps detect scanned PDFs or garbled OCR text
        const totalChars = text.length;
        const alphaChars = (text.match(/[a-zA-Z]/g) || []).length;
        const alphaRatio = totalChars > 0 ? alphaChars / totalChars : 0;

        // 3. Evaluate Repeating Characters (Requirement: Filter noise like ".......")
        // Excessive sequences of identical non-alphanumeric characters often indicate extraction noise
        const hasExcessiveRepetition = /(.)\1{10,}/.test(text);

        // Validation Logic
        const isTooShort = wordCount < 50;
        const isNotAlphaEnough = alphaRatio < 0.3;
        const isGarbled = hasExcessiveRepetition;

        if (isTooShort || isNotAlphaEnough || isGarbled) {
            throw new AppError(422, 'UNPROCESSABLE_ENTITY', 'Resume text extraction failed. Please upload text based PDF.');
        }

        return {
            text,
            pageCount: data.numpages,
            wordCount,
            lineCount: text.split(/\r\n|\r|\n/).length,
            isEmpty: false
        };
    } catch (error: any) {
        // If it's already our custom AppError from the isEmpty check, rethrow it
        if (error instanceof AppError) {
            throw error;
        }

        // Handle pdf-parse failures - per design table at line 468, use 422
        throw new AppError(422, 'EXTRACTION_ERROR', `Failed to extract text from PDF: ${(error as Error).message}`);
    }
};
