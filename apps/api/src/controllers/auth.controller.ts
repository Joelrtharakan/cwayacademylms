import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";

const isProduction = process.env.NODE_ENV === "production";

export class AuthController {
  public static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({ status: "success", data: result });
  });

  public static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmail(req.params.token);
    // On success, redirect to login page with verified parameter
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?verified=true`;
    res.redirect(loginUrl);
  });

  public static login = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await AuthService.login(req.body);

    res.cookie("cway_refresh", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      accessToken,
      user,
    });
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
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      accessToken,
    });
  });

  public static logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.cway_refresh;
    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie("cway_refresh", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
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
        preferredLanguage: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json({ status: "success", user });
  });
}
