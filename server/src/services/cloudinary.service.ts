/**
 * Cloudinary service — thin, typed wrapper around the v2 SDK.
 *
 * Centralising Cloudinary calls here means the rest of the codebase
 * never imports from 'cloudinary' directly and stays easy to mock.
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error-handler.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadResult {
    publicId: string;
    secureUrl: string;
    bytes: number;
    format: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a raw file buffer to Cloudinary.
 *
 * @param buffer     The file data.
 * @param folder     Cloudinary folder path (e.g. "cinevision/scripts").
 * @param publicId   Optional — lets Cloudinary generate one if omitted.
 * @param resourceType "raw" for non-image files (scripts, PDFs, etc.)
 */
export async function uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId?: string,
    resourceType: 'image' | 'video' | 'raw' | 'auto' = 'raw',
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                ...(publicId !== undefined ? { public_id: publicId } : {}),
                // Scripts are private assets — not world-readable
                type: 'private',
            },
            (error, result) => {
                if (error !== undefined || result === undefined) {
                    console.error('Cloudinary upload error:', error);
                    reject(
                        new AppError(
                            `Failed to upload file to cloud storage: ${error?.message || 'Unknown error'}`,
                            502,
                            'UPLOAD_FAILED',
                        ),
                    );
                    return;
                }
                resolve({
                    publicId: result.public_id,
                    secureUrl: result.secure_url,
                    bytes: result.bytes,
                    format: result.format,
                });
            },
        );

        uploadStream.end(buffer);
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an asset from Cloudinary by its public_id.
 * Silently succeeds if the asset doesn't exist (idempotent).
 */
export async function deleteAsset(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'raw',
): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: 'private',
    });
}

// ─── Signed URL ───────────────────────────────────────────────────────────────

/**
 * Generate a short-lived signed URL for a private asset.
 * Default expiry: 15 minutes.
 */
export function getSignedUrl(publicId: string, expiresInSeconds = 900): string {
    return cloudinary.utils.private_download_url(publicId, 'raw', {
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
        resource_type: 'raw',
    });
}
