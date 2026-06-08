import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler, AppError } from "../utils/errors";
import { redis } from "../utils/redis";
import { prisma } from "../utils/prisma";
import { TokenService } from "../services/token.service";

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
router.put("/update-password", authenticate, AuthController.updatePassword);

import { Request, Response } from "express";

// Impersonation route — used after admin generates an impersonation token
router.get("/impersonate/:token", asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const userId = await redis.get(`impersonate:${token}`);
  if (!userId) throw new AppError("Impersonation token is invalid or expired", 401);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) throw new AppError("User not found", 404);

  const accessToken = TokenService.generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = TokenService.generateRefreshToken({ userId: user.id, role: user.role });
  await TokenService.storeRefreshToken(user.id, refreshToken);
  await redis.del(`impersonate:${token}`);

  res.cookie("cway_refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ status: "success", accessToken, userId: user.id });
}));

export default router;
