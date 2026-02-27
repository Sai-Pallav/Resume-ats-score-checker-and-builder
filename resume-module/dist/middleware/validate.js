"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const error = result.error;
            return next({
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                message: error.errors?.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed',
                name: 'AppError',
            });
        }
        req[source] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map