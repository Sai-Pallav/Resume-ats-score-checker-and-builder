"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
function errorHandler(err, req, res, _next) {
    if (err instanceof multer_1.default.MulterError) {
        err = new errors_1.FileUploadError(err.message);
    }
    const log = (0, logger_1.scopedLogger)(req, 'ERROR');
    if (err instanceof errors_1.AppError) {
        log.warn({ err, path: req.path, method: req.method }, `AppError: ${err.message}`);
        return res.status(err.statusCode).json((0, response_1.formatError)({ code: err.code, message: err.message }, req.requestId));
    }
    log.error({
        err,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.method !== 'GET' ? req.body : undefined // Be careful with PII in production
    }, 'Unhandled Server Error');
    res.status(500).json((0, response_1.formatError)({ code: 'INTERNAL_ERROR', message: 'Something went wrong' }, req.requestId));
}
//# sourceMappingURL=errorHandler.js.map