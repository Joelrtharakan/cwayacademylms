import { Router } from "express";
import * as PC from "../controllers/programs.controller";
import multer from "multer";
import { cacheRoute } from "../middleware/cache.middleware";
import { accountLimiter } from "../middleware/rateLimit";
import { AppError } from "../utils/errors";

const router = Router();

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

const applicationUpload = multer({
  storage: multer.memoryStorage(),
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
    const hasDangerousExtension = intermediateExtensions.some(part =>
      DANGEROUS_EXTENSIONS.includes(part)
    );
    if (extMatch && mimeMatch && !hasDangerousExtension) {
      file.originalname = file.originalname.replace(/[^a-zA-Z0-9.\-_ ]/g, '');
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.originalname} (${file.mimetype}). Only images and PDFs are allowed.`));
    }
  },
});

// Helper wrapper for multer file upload handling to catch Multer/FileFilter errors cleanly with 400 status
const handleApplicationUpload = (req: any, res: any, next: any) => {
  applicationUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "certificates", maxCount: 5 }
  ])(req, res, (err: any) => {
    if (err) {
      return next(new AppError(err.message || "File upload validation failed", 400));
    }
    next();
  });
};

router.get("/", cacheRoute(300), PC.getPublicPrograms);
router.get("/:id", cacheRoute(300), PC.getProgram);

// BUG-005 FIX: Rate limited to 3 applications per IP per hour
// BUG-006 FIX: Uses validated applicationUpload with clean 400 error handling
router.post(
  "/:id/apply",
  accountLimiter,
  handleApplicationUpload,
  PC.applyForProgram
);

export default router;

