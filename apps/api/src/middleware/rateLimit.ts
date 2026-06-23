import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";

const handler = (req: any, res: any, next: any, options: any) => {
  logger.warn(`Rate limit exceeded: ${options.message.message}`, { ip: req.ip, path: req.originalUrl });
  res.status(options.statusCode).send(options.message);
};

// Global API Limiter (Basic protection against scraping/DDoS)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { status: "error", message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Strict Limiter for Login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { status: "error", message: "Too many login attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Strict Limiter for Account Creation & Password Resets
export const accountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: { status: "error", message: "Too many account creation or password reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Limiter for AI Generation or high-cost endpoints
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI generation requests per hour
  message: { status: "error", message: "AI generation limit reached. Please try again next hour." },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
