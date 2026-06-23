import multer from 'multer'

// Use memory storage — files held in Buffer, then sent to R2
export const upload = multer({
  storage: multer.memoryStorage(),
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
    
    const extMatch = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    const mimeMatch = allowedMimes.includes(file.mimetype);

    // Reject double extensions (e.g., file.php.jpg) to prevent bypass
    const nameParts = file.originalname.split('.');
    const hasDoubleExtension = nameParts.length > 2 && !['tar', 'gz'].includes(nameParts[nameParts.length - 1]);

    if (extMatch && mimeMatch && !hasDoubleExtension) {
      // Sanitize the original filename (strip dangerous chars)
      file.originalname = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
      cb(null, true);
    } else {
      cb(new Error(`Invalid or unsafe file: ${file.originalname} (${file.mimetype})`));
    }
  },
})
