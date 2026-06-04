"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const errors_1 = require("../utils/errors");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            next(new errors_1.AppError("User context not found in request", 401));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errors_1.AppError("You do not have permission to perform this action", 403));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
