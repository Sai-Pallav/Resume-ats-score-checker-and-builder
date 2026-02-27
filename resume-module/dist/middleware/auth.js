"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const errors_1 = require("../utils/errors");
function authMiddleware(req, _res, next) {
    // Priority: X-User-ID header (MVP: trust this header)
    const userId = req.headers['x-user-id'];
    if (!userId || userId.trim() === '') {
        return next(new errors_1.AuthError());
    }
    req.externalUserId = userId.trim();
    next();
}
//# sourceMappingURL=auth.js.map