"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function authMiddleware(req, _res, next) {
    const log = (0, logger_1.scopedLogger)(req, 'AUTH');
    // Priority: X-User-ID header (MVP: trust this header)
    const userId = req.headers['x-user-id'];
    if (!userId || userId.trim() === '') {
        log.warn({ headers: req.headers }, 'Authentication failed: Missing X-User-ID');
        return next(new errors_1.UnauthorizedError());
    }
    req.externalUserId = userId.trim();
    log.debug({ externalUserId: req.externalUserId }, 'Authentication successful');
    next();
}
//# sourceMappingURL=auth.js.map