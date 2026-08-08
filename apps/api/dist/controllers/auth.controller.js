"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const isProduction = process.env.NODE_ENV === "production";
class AuthController {
    static register = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json({ status: "success", data: result });
    });
    static verifyEmail = (0, errors_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.verifyEmail(req.params.token);
        // On success, redirect to login page with verified parameter
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.cwayacademy.com"}/login?verified=true`;
        res.redirect(loginUrl);
    });
    static login = (0, errors_1.asyncHandler)(async (req, res) => {
        try {
            const { accessToken, refreshToken, user } = await auth_service_1.AuthService.login(req.body);
            logger_1.logger.info(`Successful login: ${user.email}`, { userId: user.id, ip: req.ip });
            // Activity log — login success
            // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
            prisma_1.prisma.activityLog.create({
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
            }).catch(() => { }); // fire-and-forget
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
        }
        catch (error) {
            logger_1.logger.warn(`Failed login attempt for ${req.body?.email || "unknown"}`, { ip: req.ip, error: error.message });
            // Activity log — login failure
            // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
            prisma_1.prisma.activityLog.create({
                data: {
                    userId: null,
                    actorEmail: req.body?.email ?? null,
                    action: "LOGIN_FAILED",
                    description: `Failed login attempt for ${req.body?.email || "unknown"}`,
                    ipAddress: (req.ip ?? "").replace("::ffff:", ""),
                    userAgent: req.headers["user-agent"] ?? null,
                    status: "FAILED",
                },
            }).catch(() => { });
            throw error;
        }
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
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
            status: "success",
            accessToken,
        });
    });
    static logout = (0, errors_1.asyncHandler)(async (req, res) => {
        const token = req.cookies.cway_refresh;
        let userId = req.user?.id;
        let userEmail = req.user?.email;
        let userRole = req.user?.role;
        if (token) {
            try {
                const { TokenService } = await Promise.resolve().then(() => __importStar(require("../services/token.service")));
                const payload = TokenService.verifyRefreshToken(token);
                if (payload && payload.userId) {
                    userId = payload.userId;
                    if (!userEmail) {
                        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
                        if (user) {
                            userEmail = user.email;
                            userRole = user.role;
                        }
                    }
                }
            }
            catch (e) {
                // invalid token, ignore
            }
            await auth_service_1.AuthService.logout(token);
        }
        // Activity log — logout
        if (userId && userEmail) {
            // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
            prisma_1.prisma.activityLog.create({
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
            }).catch(() => { });
        }
        res.clearCookie("cway_refresh", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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
exports.AuthController = AuthController;
