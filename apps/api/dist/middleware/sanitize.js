"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMiddleware = void 0;
const xss_1 = __importDefault(require("xss"));
/**
 * Recursively sanitizes input strings to prevent Cross-Site Scripting (XSS).
 * Leaves non-string values (numbers, booleans, objects) mostly intact,
 * but processes object values recursively.
 */
function sanitizeInput(data) {
    if (typeof data === "string") {
        // Apply XSS filter (strips <script>, javascript: links, etc.)
        return (0, xss_1.default)(data.trim());
    }
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeInput(item));
    }
    if (data !== null && typeof data === "object") {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(data)) {
            sanitizedObj[key] = sanitizeInput(value);
        }
        return sanitizedObj;
    }
    return data;
}
const sanitizeMiddleware = (req, res, next) => {
    if (req.body)
        req.body = sanitizeInput(req.body);
    if (req.query)
        req.query = sanitizeInput(req.query);
    if (req.params)
        req.params = sanitizeInput(req.params);
    next();
};
exports.sanitizeMiddleware = sanitizeMiddleware;
