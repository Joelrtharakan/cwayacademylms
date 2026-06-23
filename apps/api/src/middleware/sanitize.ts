import { Request, Response, NextFunction } from "express";
import xss from "xss";

/**
 * Recursively sanitizes input strings to prevent Cross-Site Scripting (XSS).
 * Leaves non-string values (numbers, booleans, objects) mostly intact, 
 * but processes object values recursively.
 */
function sanitizeInput(data: any): any {
  if (typeof data === "string") {
    // Apply XSS filter (strips <script>, javascript: links, etc.)
    return xss(data.trim());
  }
  
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item));
  }
  
  if (data !== null && typeof data === "object") {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj;
  }
  
  return data;
}

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  
  next();
};
