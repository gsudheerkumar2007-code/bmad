import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Allowed image types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create products subdirectory
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `product-${Date.now()}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per upload
  }
});

// Utility functions
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const getFileUrl = (filename: string): string => {
  // In production, this would be your CDN or static file server URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/products/${filename}`;
};

export const validateImageDimensions = (filePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    // This is a placeholder - you would use a library like 'sharp' or 'jimp' for real image processing
    // For now, we'll just resolve with default dimensions
    resolve({ width: 800, height: 600 });
  });
};

// Middleware for handling upload errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'E020',
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: {
          code: 'E021',
          message: 'Too many files. Maximum 10 files allowed',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: {
        code: 'E022',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  next(error);
};

// Image processing options (placeholder)
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const processImage = async (
  inputPath: string,
  outputPath: string,
  options: ImageProcessingOptions = {}
): Promise<void> => {
  // Placeholder for image processing
  // In a real implementation, you would use sharp or similar library
  // For now, just copy the file
  return new Promise((resolve, reject) => {
    fs.copyFile(inputPath, outputPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};