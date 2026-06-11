"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const isProduction = process.env.NODE_ENV === "production";
class AuthController {
    static register = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json({ status: "success", data: result });
    });
    static verifyEmail = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.verifyEmail(req.params.token);
        // On success, redirect to login page with verified parameter
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?verified=true`;
        res.redirect(loginUrl);
    });
    static login = (0, errors_1.asyncHandler)(async (req, res) => {
        const { accessToken, refreshToken, user } = await auth_service_1.AuthService.login(req.body);
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
    static refresh = (0, errors_1.asyncHandler)(async (req, res) => {
        const token = req.cookies.cway_refresh;
        if (!token) {
            throw new errors_1.AppError("Authentication credentials not found", 401);
        }
        const { accessToken, refreshToken } = await auth_service_1.AuthService.refresh(token);
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
    static logout = (0, errors_1.asyncHandler)(async (req, res) => {
        const token = req.cookies.cway_refresh;
        if (token) {
            await auth_service_1.AuthService.logout(token);
        }
        res.clearCookie("cway_refresh", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "none",
        });
        res.status(200).json({ status: "success", message: "Logged out" });
    });
    static forgotPassword = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.forgotPassword(req.body.email);
        res.status(200).json({ status: "success", data: result });
    });
    static resetPassword = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.resetPassword(req.body);
        res.status(200).json({ status: "success", data: result });
    });
    static updatePassword = (0, errors_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new errors_1.AppError("Not authenticated", 401);
        }
        const result = await auth_service_1.AuthService.updatePassword(req.user.id, req.body);
        res.status(200).json({ status: "success", data: result });
    });
    static me = (0, errors_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new errors_1.AppError("Not authenticated", 401);
        }
        const user = await prisma_1.prisma.user.findUnique({
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
exports.AuthController = AuthController;
