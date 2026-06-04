import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from workspace root
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config(); // Fallback to local

import authRoutes from "./routes/auth.routes";
import { AppError } from "./utils/errors";

const app = express();
const PORT = process.env.API_PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging & Parsing
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "CWAY Academy LMS API is healthy" });
});

// API Routes mounting
app.use("/api/v1/auth", authRoutes);

// Catch-all unhandled routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
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
      console.error("ERROR 💥", err);
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
