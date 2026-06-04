"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const token_service_1 = require("../services/token.service");
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
exports.authenticate = (0, errors_1.asyncHandler)(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new errors_1.AppError("Missing or invalid authorization token", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = token_service_1.TokenService.verifyAccessToken(token);
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isBanned: true },
    });
    if (!user) {
        throw new errors_1.AppError("The user belonging to this token no longer exists", 401);
    }
    if (user.isBanned) {
        throw new errors_1.AppError("Your account has been suspended", 403);
    }
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    next();
});
