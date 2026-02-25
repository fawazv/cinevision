/**
 * AWS S3 service — thin, typed wrapper around the AWS SDK v3.
 *
 * Centralising S3 calls here means the rest of the codebase
 * never imports from '@aws-sdk' directly and stays easy to mock.
 */

import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error-handler.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const s3 = new S3Client({
    region: env.awsRegion,
    credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
    },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadResult {
    /** The S3 object key (path within the bucket). Replaces Cloudinary's publicId. */
    objectKey: string;
    /** A public or presigned URL to access the file. */
    secureUrl: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a raw file buffer to the configured S3 bucket.
 *
 * @param buffer       The file data (from Multer).
 * @param folder       Logical folder path within the bucket (e.g. "scripts/userId").
 * @param filename     Unique sanitised filename (without extension).
 * @param extension    File extension (e.g. ".pdf").
 * @param contentType  MIME type of the file.
 */
export async function uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    extension: string,
    contentType: string,
): Promise<UploadResult> {
    const objectKey = `${folder}/${filename}${extension}`;

    try {
        await s3.send(
            new PutObjectCommand({
                Bucket: env.awsS3BucketName,
                Key: objectKey,
                Body: buffer,
                ContentType: contentType,
                // Objects are private by default. Access is granted only via pre-signed URLs.
            }),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new AppError(
            `Failed to upload file to S3: ${message}`,
            502,
            'UPLOAD_FAILED',
        );
    }

    // Build a permanent reference URL (not publicly accessible without signing)
    const secureUrl = `https://${env.awsS3BucketName}.s3.${env.awsRegion}.amazonaws.com/${objectKey}`;

    return { objectKey, secureUrl };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an object from S3 by its object key.
 * Silently succeeds if the object doesn't exist (idempotent).
 */
export async function deleteAsset(objectKey: string): Promise<void> {
    try {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: env.awsS3BucketName,
                Key: objectKey,
            }),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`S3 delete failed for key "${objectKey}": ${message}`);
        // Don't throw — we still want to complete the DB delete
    }
}

/**
 * Bulk delete multiple objects from S3.
 * Silently succeeds for missing objects.
 */
export async function deleteAssets(objectKeys: string[]): Promise<void> {
    if (objectKeys.length === 0) return;

    try {
        await s3.send(
            new DeleteObjectsCommand({
                Bucket: env.awsS3BucketName,
                Delete: {
                    Objects: objectKeys.map((key) => ({ Key: key })),
                    Quiet: true,
                },
            }),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`S3 bulk delete failed: ${message}`);
        // Don't throw — keep DB cascading delete moving
    }
}

// ─── Presigned URL ────────────────────────────────────────────────────────────

/**
 * Generate a short-lived pre-signed GET URL for a private S3 object.
 * Default expiry: 15 minutes.
 */
export async function getSignedUrl(
    objectKey: string,
    expiresInSeconds = 900,
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: env.awsS3BucketName,
        Key: objectKey,
    });

    return awsGetSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
