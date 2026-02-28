"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("../utils/errors");
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const message = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new errors_1.ValidationError(message));
        }
        req[source] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map