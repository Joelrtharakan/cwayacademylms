import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Validation Rules
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("role").optional().isIn(["ADMIN", "INSTRUCTOR", "STUDENT"]).withMessage("Invalid role name"),
  body("church").optional().trim(),
  body("location").optional().trim(),
  body("preferredLanguage")
    .optional()
    .isIn(["ENGLISH", "HINDI", "TAMIL", "TELUGU", "KANNADA", "MALAYALAM"])
    .withMessage("Invalid language option"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

// Routes mapping
router.post("/register", registerRules, validate, AuthController.register);
router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/login", loginRules, validate, AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", forgotPasswordRules, validate, AuthController.forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, AuthController.resetPassword);

// Protected routes
router.get("/me", authenticate, AuthController.me);

export default router;
