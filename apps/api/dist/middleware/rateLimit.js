"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiLimiter = exports.accountLimiter = exports.loginLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
const handler = (req, res, next, options) => {
    logger_1.logger.warn(`Rate limit exceeded: ${options.message.message}`, { ip: req.ip, path: req.originalUrl });
    res.status(options.statusCode).send(options.message);
};
// Global API Limiter (Basic protection against scraping/DDoS)
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    message: { status: "error", message: "Too many requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});
// Strict Limiter for Login
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 login requests per window
    message: { status: "error", message: "Too many login attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});
// Strict Limiter for Account Creation & Password Resets
exports.accountLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: { status: "error", message: "Too many account creation or password reset requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});
// Limiter for AI Generation or high-cost endpoints
exports.aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 AI generation requests per hour
    message: { status: "error", message: "AI generation limit reached. Please try again next hour." },
    standardHeaders: true,
    legacyHeaders: false,
    handler,
});
