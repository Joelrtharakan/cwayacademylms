"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from workspace root
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "../../.env") });
dotenv_1.default.config(); // Fallback to local
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const forums_routes_1 = __importDefault(require("./routes/forums.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const errors_1 = require("./utils/errors");
const app = (0, express_1.default)();
const PORT = process.env.API_PORT || 4000;
// Security Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
}));
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
app.use("/api/v1", forums_routes_1.default);
app.use("/api/v1/student", student_routes_1.default);
// Catch-all unhandled routes
app.all("*", (req, res, next) => {
    next(new errors_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handling Middleware
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
