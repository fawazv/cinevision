/**
 * Multer configuration for script file uploads.
 *
 * Uses memory storage so the buffer is available directly for
 * streaming to Cloudinary without writing temp files to disk.
 */

import multer, { type FileFilterCallback } from 'multer';
import path from 'node:path';
import type { Request } from 'express';
import { AppError } from '../middleware/error-handler.js';
import { ALLOWED_EXTENSIONS } from '../types/script.types.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── File Filter ──────────────────────────────────────────────────────────────

function scriptFileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
): void {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ALLOWED_EXTENSIONS.has(ext)) {
        callback(null, true);
        return;
    }

    callback(
        new AppError(
            `Unsupported file type "${ext}". Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`,
            415,
            'UNSUPPORTED_FORMAT',
        ),
    );
}

// ─── Multer Instance ──────────────────────────────────────────────────────────

/**
 * `scriptUpload` middleware — handles a single file field named "script".
 *
 * Usage on a route:
 *   router.post('/', scriptUpload.single('script'), handler)
 */
export const scriptUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
    },
    fileFilter: scriptFileFilter,
});
