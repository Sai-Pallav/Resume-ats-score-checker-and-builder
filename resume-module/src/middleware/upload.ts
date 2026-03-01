import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sanitize from 'sanitize-filename';
import FileType from 'file-type';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { FileUploadError } from '../utils/errors';
import { logger } from '../utils/logger';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (_req, file, cb) => {
        // Sanitize original filename (removes directory traversal payloads, special chars)
        const safeOriginalName = sanitize(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Phase 1: Basic Extension / Header validation
    const mimetypeOk = file.mimetype === 'application/pdf' || file.mimetype.includes('pdf');
    const extensionOk = file.originalname && file.originalname.toLowerCase().endsWith('.pdf');

    if (mimetypeOk || extensionOk) {
        cb(null, true);
    } else {
        cb(new FileUploadError('Only PDF files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

/**
 * Phase 2: Magic Bytes Validation Middleware (Deep File Type Inspection)
 * Runs AFTER multer has persisted the file to disk.
 * Physically checks the hex headers of the binary instead of trusting the user's .pdf extension.
 */
export const validatePdfMagicBytes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
        return next(); // Pass down to schema validation if no file included
    }

    try {
        const fileTypeResult = await FileType.fromFile(req.file.path);

        if (!fileTypeResult || fileTypeResult.ext !== 'pdf' || fileTypeResult.mime !== 'application/pdf') {
            logger.warn({
                originalName: req.file.originalname,
                detectedMime: fileTypeResult?.mime || 'unknown',
            }, 'Spoofed file upload detected and intercepted via Magic Bytes');

            // Nuke the malicious file synchronously
            fs.unlinkSync(req.file.path);

            throw new FileUploadError('Invalid file signature. File is disguised or corrupted. Only real PDFs are permitted.');
        }

        next();
    } catch (error) {
        // Fallback cleanup if anything goes wrong during OS reads
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};
