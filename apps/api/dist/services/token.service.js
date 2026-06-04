"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const errors_1 = require("../utils/errors");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "cway-academy-super-secret-access-token-key-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "cway-academy-super-secret-refresh-token-key-change-me";
class TokenService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
    }
    static async storeRefreshToken(userId, token) {
        const key = `refresh:${userId}`;
        // 7 days in seconds
        const TTL = 7 * 24 * 60 * 60;
        await redis_1.redis.set(key, token, "EX", TTL);
    }
    static async getRefreshToken(userId) {
        const key = `refresh:${userId}`;
        return await redis_1.redis.get(key);
    }
    static async revokeRefreshToken(userId) {
        const key = `refresh:${userId}`;
        await redis_1.redis.del(key);
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        }
        catch (err) {
            throw new errors_1.AppError("Invalid or expired access token", 401);
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
        }
        catch (err) {
            throw new errors_1.AppError("Invalid or expired refresh token", 401);
        }
    }
}
exports.TokenService = TokenService;
