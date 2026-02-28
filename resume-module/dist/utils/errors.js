"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingError = exports.FileUploadError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(404, 'NOT_FOUND', `${resource} not found`);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, 'VALIDATION_ERROR', message);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor() {
        super(401, 'UNAUTHORIZED', 'Missing or invalid user identity');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class FileUploadError extends AppError {
    constructor(message) {
        super(400, 'FILE_UPLOAD_ERROR', message);
    }
}
exports.FileUploadError = FileUploadError;
class ProcessingError extends AppError {
    constructor(message) {
        super(500, 'PROCESSING_ERROR', message);
    }
}
exports.ProcessingError = ProcessingError;
//# sourceMappingURL=errors.js.map