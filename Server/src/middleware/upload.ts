import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ENV } from '../config/environment.js';
import { cloudinary } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

// Ensure uploads folder exists
if (!fs.existsSync(ENV.UPLOADS_DIR)) {
  fs.mkdirSync(ENV.UPLOADS_DIR, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, ENV.UPLOADS_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images and media
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM, MP3.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
});

/**
 * Uploads file to Cloudinary if configured; otherwise returns local static URL
 */
export async function processUploadedFile(
  file: Express.Multer.File,
  folder = 'auren'
): Promise<string> {
  if (ENV.CLOUDINARY.IS_CONFIGURED) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `auren/${folder}`,
        resource_type: 'auto',
      });
      // Remove temporary local file after successful upload to Cloudinary
      fs.unlink(file.path, () => {});
      return result.secure_url;
    } catch (error) {
      logger.error('Cloudinary upload failed, falling back to local file path:', error);
      return `/uploads/${file.filename}`;
    }
  }

  // Local URL served statically by express
  return `/uploads/${file.filename}`;
}

