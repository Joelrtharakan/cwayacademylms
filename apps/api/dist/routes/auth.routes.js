"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const authenticate_1 = require("../middleware/authenticate");
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
exports.default = router;
