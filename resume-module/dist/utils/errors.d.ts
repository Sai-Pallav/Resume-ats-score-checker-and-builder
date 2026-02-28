export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, message: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor();
}
export declare class FileUploadError extends AppError {
    constructor(message: string);
}
export declare class ProcessingError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map