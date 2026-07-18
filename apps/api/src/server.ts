// Trigger API restart
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from workspace root
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config(); // Fallback to local

// Required Environment Variables Check
const requiredEnvVars = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("Please add them to your .env file and restart the server.");
  process.exit(1);
}

import { globalLimiter } from "./middleware/rateLimit";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import coursesRoutes from "./routes/courses.routes";
import forumsRoutes from "./routes/forums.routes";
import studentRoutes from "./routes/student.routes";
import blogRoutes from "./routes/blog.routes";
import programsRoutes from "./routes/programs.routes";
import referencesRoutes from "./routes/references.routes";
import { AppError } from "./utils/errors";

const app = express();
app.set("trust proxy", 1); // Trust first proxy for rate limiting (Render/Cloudflare)
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*.r2.dev", "cwayacademy.netlify.app", "*.bunny.net"],
      frameSrc: ["'self'", "iframe.mediadelivery.net", "js.stripe.com", "localhost:*"],
      connectSrc: ["'self'", "api.stripe.com"],
    }
  }
}));

// Response compression (gzip)
app.use(compression());

// CORS — only allow your domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://learn.cwayacademy.com',
  'https://cwayacademy.com',
  'https://www.cwayacademy.com',
  'https://cwayacademylms.netlify.app',
  'https://cwayacademy.netlify.app',
  'https://cwayacademylms.joelrtharakan.workers.dev',
  process.env.FRONTEND_URL // Allow dynamic URL from Render env vars
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
app.use('/api', globalLimiter);

// Logging & Parsing
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root Welcome Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Welcome to CWAY Academy API. The backend is running perfectly!" });
});

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "CWAY Academy LMS API is healthy" });
});

// Serve local uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// API Routes mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", coursesRoutes);
app.use("/api/v1/forums", forumsRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/programs", programsRoutes);
app.use("/api/v1/references", referencesRoutes);

// Catch-all unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

import { logger } from "./utils/logger";
import { errorLog } from "./middleware/activityLog.middleware";

// Global Error Handling Middleware
app.use(errorLog);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production: don't leak database or internal details
    if (err.isOperational) {
      res.status(statusCode).json({
        status,
        message: err.message,
      });
    } else {
      logger.error(err, { path: req.originalUrl, ip: req.ip, method: req.method });
      res.status(500).json({
        status: "error",
        message: "Something went wrong internally",
      });
    }
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 CWAY Academy API Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
