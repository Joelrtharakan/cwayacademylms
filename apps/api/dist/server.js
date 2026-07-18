"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Trigger API restart
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from workspace root
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "../../.env") });
dotenv_1.default.config(); // Fallback to local
// Required Environment Variables Check
const requiredEnvVars = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missingVars.join(", ")}`);
    console.error("Please add them to your .env file and restart the server.");
    process.exit(1);
}
const rateLimit_1 = require("./middleware/rateLimit");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const forums_routes_1 = __importDefault(require("./routes/forums.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const programs_routes_1 = __importDefault(require("./routes/programs.routes"));
const references_routes_1 = __importDefault(require("./routes/references.routes"));
const errors_1 = require("./utils/errors");
const app = (0, express_1.default)();
app.set("trust proxy", 1); // Trust first proxy for rate limiting (Render/Cloudflare)
const PORT = process.env.PORT || 4000;
// Security Middlewares
app.use((0, helmet_1.default)({
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
app.use((0, compression_1.default)());
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
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// Rate limiting
app.use('/api', rateLimit_1.globalLimiter);
// Logging & Parsing
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined"));
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Root Welcome Route
app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "Welcome to CWAY Academy API. The backend is running perfectly!" });
});
// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "success", message: "CWAY Academy LMS API is healthy" });
});
// Serve local uploads
const uploadsDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express_1.default.static(uploadsDir));
// API Routes mounting
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1", courses_routes_1.default);
app.use("/api/v1/forums", forums_routes_1.default);
app.use("/api/v1/student", student_routes_1.default);
app.use("/api/v1/blog", blog_routes_1.default);
app.use("/api/v1/programs", programs_routes_1.default);
app.use("/api/v1/references", references_routes_1.default);
// Catch-all unhandled routes
app.all("*", (req, res, next) => {
    next(new errors_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
const logger_1 = require("./utils/logger");
const activityLog_middleware_1 = require("./middleware/activityLog.middleware");
// Global Error Handling Middleware
app.use(activityLog_middleware_1.errorLog);
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        res.status(statusCode).json({
            status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }
    else {
        // Production: don't leak database or internal details
        if (err.isOperational) {
            res.status(statusCode).json({
                status,
                message: err.message,
            });
        }
        else {
            logger_1.logger.error(err, { path: req.originalUrl, ip: req.ip, method: req.method });
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
