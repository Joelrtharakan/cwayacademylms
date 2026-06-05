"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const authenticate_1 = require("../middleware/authenticate");
const errors_1 = require("../utils/errors");
const redis_1 = require("../utils/redis");
const prisma_1 = require("../utils/prisma");
const token_service_1 = require("../services/token.service");
const router = (0, express_1.Router)();
// Validation Rules
const registerRules = [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    (0, express_validator_1.body)("role").optional().isIn(["ADMIN", "INSTRUCTOR", "STUDENT"]).withMessage("Invalid role name"),
    (0, express_validator_1.body)("church").optional().trim(),
    (0, express_validator_1.body)("location").optional().trim(),
    (0, express_validator_1.body)("preferredLanguage")
        .optional()
        .isIn(["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"])
        .withMessage("Invalid language option"),
];
const loginRules = [
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid email address"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
const forgotPasswordRules = [
    (0, express_validator_1.body)("email").trim().isEmail().withMessage("Invalid email address"),
];
const resetPasswordRules = [
    (0, express_validator_1.body)("token").notEmpty().withMessage("Token is required"),
    (0, express_validator_1.body)("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];
// Routes mapping
router.post("/register", registerRules, validate_1.validate, auth_controller_1.AuthController.register);
router.get("/verify-email/:token", auth_controller_1.AuthController.verifyEmail);
router.post("/login", loginRules, validate_1.validate, auth_controller_1.AuthController.login);
router.post("/refresh", auth_controller_1.AuthController.refresh);
router.post("/logout", auth_controller_1.AuthController.logout);
router.post("/forgot-password", forgotPasswordRules, validate_1.validate, auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password", resetPasswordRules, validate_1.validate, auth_controller_1.AuthController.resetPassword);
// Protected routes
router.get("/me", authenticate_1.authenticate, auth_controller_1.AuthController.me);
// Impersonation route — used after admin generates an impersonation token
router.get("/impersonate/:token", (0, errors_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const userId = await redis_1.redis.get(`impersonate:${token}`);
    if (!userId)
        throw new errors_1.AppError("Impersonation token is invalid or expired", 401);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user)
        throw new errors_1.AppError("User not found", 404);
    const accessToken = token_service_1.TokenService.generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = token_service_1.TokenService.generateRefreshToken({ userId: user.id, role: user.role });
    await token_service_1.TokenService.storeRefreshToken(user.id, refreshToken);
    await redis_1.redis.del(`impersonate:${token}`);
    res.cookie("cway_refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ status: "success", accessToken, userId: user.id });
}));
exports.default = router;
