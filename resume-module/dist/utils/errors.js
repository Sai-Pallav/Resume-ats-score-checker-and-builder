"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
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
class AuthError extends AppError {
    constructor() {
        super(401, 'UNAUTHORIZED', 'Missing or invalid user identity');
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=errors.js.map