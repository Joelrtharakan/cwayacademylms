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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PC = __importStar(require("../controllers/programs.controller"));
const multer_1 = __importDefault(require("multer"));
const cache_middleware_1 = require("../middleware/cache.middleware");
const rateLimit_1 = require("../middleware/rateLimit");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
// BUG-006 FIX: Replace bare multer with validated instance (MIME + extension + size limits)
// Allows images and PDFs only — appropriate for passport photos and certificates
const DANGEROUS_EXTENSIONS = [
    'php', 'php3', 'php4', 'php5', 'phtml',
    'exe', 'sh', 'bat', 'cmd', 'com',
    'py', 'rb', 'pl', 'cgi',
    'asp', 'aspx', 'jsp', 'jspx',
    'js', 'mjs', 'ts',
    'html', 'htm', 'xml', 'svg',
];
const applicationUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — appropriate for application docs
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
            'application/pdf',
        ];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
        const nameLower = file.originalname.toLowerCase();
        const extMatch = allowedExtensions.some(ext => nameLower.endsWith(ext));
        const mimeMatch = allowedMimes.includes(file.mimetype);
        const nameParts = nameLower.split('.');
        const intermediateExtensions = nameParts.slice(1, -1);
        const hasDangerousExtension = intermediateExtensions.some(part => DANGEROUS_EXTENSIONS.includes(part));
        if (extMatch && mimeMatch && !hasDangerousExtension) {
            file.originalname = file.originalname.replace(/[^a-zA-Z0-9.\-_ ]/g, '');
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type: ${file.originalname} (${file.mimetype}). Only images and PDFs are allowed.`));
        }
    },
});
// Helper wrapper for multer file upload handling to catch Multer/FileFilter errors cleanly with 400 status
const handleApplicationUpload = (req, res, next) => {
    applicationUpload.fields([
        { name: "photo", maxCount: 1 },
        { name: "certificates", maxCount: 5 }
    ])(req, res, (err) => {
        if (err) {
            return next(new errors_1.AppError(err.message || "File upload validation failed", 400));
        }
        next();
    });
};
router.get("/", (0, cache_middleware_1.cacheRoute)(300), PC.getPublicPrograms);
router.get("/:id", (0, cache_middleware_1.cacheRoute)(300), PC.getProgram);
// BUG-005 FIX: Rate limited to 3 applications per IP per hour
// BUG-006 FIX: Uses validated applicationUpload with clean 400 error handling
router.post("/:id/apply", rateLimit_1.accountLimiter, handleApplicationUpload, PC.applyForProgram);
exports.default = router;
