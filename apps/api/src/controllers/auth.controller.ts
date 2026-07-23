import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { logger } from "../utils/logger";

const isProduction = process.env.NODE_ENV === "production";

export class AuthController {
  public static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({ status: "success", data: result });
  });

  public static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmail(req.params.token);
    // On success, redirect to login page with verified parameter
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.cwayacademy.com"}/login?verified=true`;
    res.redirect(loginUrl);
  });

  public static login = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(req.body);

      logger.info(`Successful login: ${user.email}`, { userId: user.id, ip: req.ip });

      // Activity log — login success
      // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
      prisma.activityLog.create({
        data: {
          userId: user.id,
          actorEmail: user.email,
          actorName: user.name ?? null,
          actorRole: user.role,
          action: "LOGIN",
          description: `${user.email} logged in`,
          ipAddress: (req.ip ?? "").replace("::ffff:", ""),
          userAgent: req.headers["user-agent"] ?? null,
          status: "SUCCESS",
        },
      }).catch(() => {}); // fire-and-forget

      res.cookie("cway_refresh", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        accessToken,
        user,
      });
    } catch (error: any) {
      logger.warn(`Failed login attempt for ${req.body?.email || "unknown"}`, { ip: req.ip, error: error.message });

      // Activity log — login failure
      // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
      prisma.activityLog.create({
        data: {
          userId: null,
          actorEmail: req.body?.email ?? null,
          action: "LOGIN_FAILED",
          description: `Failed login attempt for ${req.body?.email || "unknown"}`,
          ipAddress: (req.ip ?? "").replace("::ffff:", ""),
          userAgent: req.headers["user-agent"] ?? null,
          status: "FAILED",
        },
      }).catch(() => {});

      throw error;
    }
  });

  public static refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.cway_refresh;
    if (!token) {
      throw new AppError("Authentication credentials not found", 401);
    }

    const { accessToken, refreshToken } = await AuthService.refresh(token);

    res.cookie("cway_refresh", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      accessToken,
    });
  });

  public static logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.cway_refresh;
    let userId = req.user?.id;
    let userEmail = req.user?.email;
    let userRole = req.user?.role;

    if (token) {
      try {
        const { TokenService } = await import("../services/token.service");
        const payload = TokenService.verifyRefreshToken(token);
        if (payload && payload.userId) {
          userId = payload.userId;
          if (!userEmail) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
              userEmail = user.email;
              userRole = user.role;
            }
          }
        }
      } catch (e) {
        // invalid token, ignore
      }
      await AuthService.logout(token);
    }

    // Activity log — logout
    if (userId && userEmail) {
      // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
      prisma.activityLog.create({
        data: {
          userId,
          actorEmail: userEmail,
          actorRole: userRole || "STUDENT",
          action: "LOGOUT",
          description: `${userEmail} logged out`,
          ipAddress: (req.ip ?? "").replace("::ffff:", ""),
          userAgent: req.headers["user-agent"] ?? null,
          status: "SUCCESS",
        },
      }).catch(() => {});
    }

    res.clearCookie("cway_refresh", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({ status: "success", message: "Logged out" });
  });

  public static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body.email);
    res.status(200).json({ status: "success", data: result });
  });

  public static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);
    res.status(200).json({ status: "success", data: result });
  });

  public static updatePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }
    const result = await AuthService.updatePassword(req.user.id, req.body);
    res.status(200).json({ status: "success", data: result });
  });

  public static me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        church: true,
        location: true,
        title: true,
        credentials: true,
        yearsExperience: true,
        expertise: true,
        socialLinks: true,
        notificationPrefs: true,
        preferredLanguage: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json({ status: "success", user });
  });
}
