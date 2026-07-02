"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Dangerous executable-like extensions that should never appear inside a filename
const DANGEROUS_EXTENSIONS = [
    'php', 'php3', 'php4', 'php5', 'phtml',
    'exe', 'sh', 'bat', 'cmd', 'com',
    'py', 'rb', 'pl', 'cgi',
    'asp', 'aspx', 'jsp', 'jspx',
    'js', 'mjs', 'ts',
    'html', 'htm', 'xml',
    'svg',
];
// Use memory storage — files held in Buffer, then sent to R2
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // Strict MIME type checking
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'video/mp4', 'video/quicktime', 'video/webm',
            'application/zip',
        ];
        // Strict Extension Checking
        const allowedExtensions = [
            '.jpg', '.jpeg', '.png', '.webp',
            '.pdf', '.doc', '.docx', '.ppt', '.pptx',
            '.mp4', '.mov', '.webm', '.zip'
        ];
        const nameLower = file.originalname.toLowerCase();
        const extMatch = allowedExtensions.some(ext => nameLower.endsWith(ext));
        const mimeMatch = allowedMimes.includes(file.mimetype);
        // Check for dangerous extensions hidden ANYWHERE inside the filename
        // e.g. "malware.php.pdf" → parts = ["malware", "php", "pdf"] → "php" is dangerous
        const nameParts = nameLower.split('.');
        // Ignore the last part (the real extension) — only inspect intermediate parts
        const intermediateExtensions = nameParts.slice(1, -1);
        const hasDangerousExtension = intermediateExtensions.some(part => DANGEROUS_EXTENSIONS.includes(part));
        if (extMatch && mimeMatch && !hasDangerousExtension) {
            // Sanitize the original filename (strip dangerous chars)
            file.originalname = file.originalname.replace(/[^a-zA-Z0-9.\-_ ]/g, '');
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid or unsafe file: ${file.originalname} (${file.mimetype})`));
        }
    },
});
