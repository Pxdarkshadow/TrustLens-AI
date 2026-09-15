import { mkdirSync } from 'node:fs';
import { diskStorage } from 'multer';
import crypto from 'node:crypto';
import { extname } from 'node:path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// Shared multer disk-storage options. dir is resolved relative to STORAGE_DIR.
export function imageUploadOptions(dirPath: string): MulterOptions {
  mkdirSync(dirPath, { recursive: true });
  const storage = diskStorage({
    destination: dirPath,
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '') || '.jpg';
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  });
  return { storage, limits: { fileSize: 10 * 1024 * 1024 } };
}