import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  public static async register(data: any): Promise<{ message: string }> {
    const { name, email, password, role, church, location, preferredLanguage } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("Email already taken", 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "STUDENT",
        church,
        location,
        preferredLanguage: preferredLanguage || "ENGLISH",
        isVerified: true,
        emailVerifyToken: null,
      },
    });

    // Send welcome email directly
    await EmailService.sendWelcomeEmail({ name: user.name, email: user.email });

    return { message: "Account created successfully" };
  }

  public static async verifyEmail(token: string): Promise<{ message: string }> {
    const hashedToken = this.hashToken(token);

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: hashedToken },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerifyToken: null,
      },
    });

    // Send Welcome Email
    await EmailService.sendWelcomeEmail({ name: user.name, email: user.email });

    return { message: "Email verified" };
  }

  public static async login(credentials: any): Promise<{ accessToken: string; user: any; refreshToken: string }> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isBanned) {
      throw new AppError("Your account has been suspended", 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    await TokenService.storeRefreshToken(user.id, refreshToken);

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

  public static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = TokenService.verifyRefreshToken(token);

    const storedToken = await TokenService.getRefreshToken(payload.userId);
    if (!storedToken || storedToken !== token) {
      throw new AppError("Session expired or token revoked", 401);
    }

    // User lookup to ensure they are active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.isBanned) {
      throw new AppError("User not found or suspended", 401);
    }

    const newPayload = { userId: user.id, role: user.role };
    const accessToken = TokenService.generateAccessToken(newPayload);
    const newRefreshToken = TokenService.generateRefreshToken(newPayload);

    await TokenService.storeRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public static async logout(token: string): Promise<{ message: string }> {
    try {
      const payload = TokenService.verifyRefreshToken(token);
      await TokenService.revokeRefreshToken(payload.userId);
    } catch (e) {}

    return { message: "Logged out" };
  }

  public static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent enumeration
    if (!user) {
      return { message: "If that email exists, a reset link was sent" };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetToken = this.hashToken(rawToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await EmailService.sendPasswordResetEmail({ name: user.name, email: user.email }, rawToken);

    return { message: "If that email exists, a reset link was sent" };
  }

  public static async resetPassword(data: any): Promise<{ message: string }> {
    const { token, newPassword } = data;
    const hashedToken = this.hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Revoke refresh tokens (force sign out everywhere)
    await TokenService.revokeRefreshToken(user.id);

    return { message: "Password updated" };
  }

  public static async updatePassword(userId: string, data: any): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Incorrect current password", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: "Password updated successfully" };
  }
}
