import jwt from "jsonwebtoken";
import { redis } from "../utils/redis";
import { AppError } from "../utils/errors";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "cway-academy-super-secret-access-token-key-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "cway-academy-super-secret-refresh-token-key-change-me";

export interface TokenPayload {
  userId: string;
  role: string;
}

export class TokenService {
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  }

  public static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  }

  public static async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh:${userId}`;
    // 7 days in seconds
    const TTL = 7 * 24 * 60 * 60;
    await redis.set(key, token, "EX", TTL);
  }

  public static async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh:${userId}`;
    return await redis.get(key);
  }

  public static async revokeRefreshToken(userId: string): Promise<void> {
    const key = `refresh:${userId}`;
    await redis.del(key);
  }

  public static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    } catch (err) {
      throw new AppError("Invalid or expired access token", 401);
    }
  }

  public static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    } catch (err) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}
