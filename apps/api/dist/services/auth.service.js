"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const token_service_1 = require("./token.service");
const email_service_1 = require("./email.service");
class AuthService {
    static hashToken(token) {
        return crypto_1.default.createHash("sha256").update(token).digest("hex");
    }
    static async register(data) {
        const { name, email, password, role, church, location, preferredLanguage } = data;
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errors_1.AppError("Email already taken", 400);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Verification token
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const emailVerifyToken = this.hashToken(rawToken);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || "STUDENT",
                church,
                location,
                preferredLanguage: preferredLanguage || "ENGLISH",
                isVerified: false,
                emailVerifyToken,
            },
        });
        // Send email
        await email_service_1.EmailService.sendVerificationEmail({ name: user.name, email: user.email }, rawToken);
        return { message: "Verification email sent" };
    }
    static async verifyEmail(token) {
        const hashedToken = this.hashToken(token);
        const user = await prisma_1.prisma.user.findFirst({
            where: { emailVerifyToken: hashedToken },
        });
        if (!user) {
            throw new errors_1.AppError("Invalid or expired verification token", 400);
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                emailVerifyToken: null,
            },
        });
        // Send Welcome Email
        await email_service_1.EmailService.sendWelcomeEmail({ name: user.name, email: user.email });
        return { message: "Email verified" };
    }
    static async login(credentials) {
        const { email, password } = credentials;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            throw new errors_1.AppError("Invalid email or password", 401);
        }
        if (!user.isVerified) {
            throw new errors_1.AppError("Please verify your email first", 403);
        }
        if (user.isBanned) {
            throw new errors_1.AppError("Your account has been suspended", 403);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errors_1.AppError("Invalid email or password", 401);
        }
        const payload = { userId: user.id, role: user.role };
        const accessToken = token_service_1.TokenService.generateAccessToken(payload);
        const refreshToken = token_service_1.TokenService.generateRefreshToken(payload);
        await token_service_1.TokenService.storeRefreshToken(user.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        };
    }
    static async refresh(token) {
        const payload = token_service_1.TokenService.verifyRefreshToken(token);
        const storedToken = await token_service_1.TokenService.getRefreshToken(payload.userId);
        if (!storedToken || storedToken !== token) {
            throw new errors_1.AppError("Session expired or token revoked", 401);
        }
        // User lookup to ensure they are active
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.isBanned) {
            throw new errors_1.AppError("User not found or suspended", 401);
        }
        const newPayload = { userId: user.id, role: user.role };
        const accessToken = token_service_1.TokenService.generateAccessToken(newPayload);
        const newRefreshToken = token_service_1.TokenService.generateRefreshToken(newPayload);
        await token_service_1.TokenService.storeRefreshToken(user.id, newRefreshToken);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    static async logout(token) {
        try {
            const payload = token_service_1.TokenService.verifyRefreshToken(token);
            await token_service_1.TokenService.revokeRefreshToken(payload.userId);
        }
        catch (e) { }
        return { message: "Logged out" };
    }
    static async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        // Always return success to prevent enumeration
        if (!user) {
            return { message: "If that email exists, a reset link was sent" };
        }
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetToken = this.hashToken(rawToken);
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        await email_service_1.EmailService.sendPasswordResetEmail({ name: user.name, email: user.email }, rawToken);
        return { message: "If that email exists, a reset link was sent" };
    }
    static async resetPassword(data) {
        const { token, newPassword } = data;
        const hashedToken = this.hashToken(token);
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            throw new errors_1.AppError("Invalid or expired reset token", 400);
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        // Revoke refresh tokens (force sign out everywhere)
        await token_service_1.TokenService.revokeRefreshToken(user.id);
        return { message: "Password updated" };
    }
}
exports.AuthService = AuthService;
