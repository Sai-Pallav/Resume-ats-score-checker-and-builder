export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(404, 'NOT_FOUND', `${resource} not found`);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, 'VALIDATION_ERROR', message);
    }
}

export class UnauthorizedError extends AppError {
    constructor() {
        super(401, 'UNAUTHORIZED', 'Missing or invalid user identity');
    }
}

export class FileUploadError extends AppError {
    constructor(message: string) {
        super(400, 'FILE_UPLOAD_ERROR', message);
    }
}

export class ProcessingError extends AppError {
    constructor(message: string) {
        super(500, 'PROCESSING_ERROR', message);
    }
}
