/**
 * Script upload service — orchestrates Multer → format detection → Cloudinary → MongoDB.
 */

import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Script } from '../models/script.model.js';
import { Project } from '../models/project.model.js';
import { AppError } from '../middleware/error-handler.js';
import { uploadBuffer, deleteAsset, getSignedUrl } from './s3.service.js';
import {
    MIME_TO_FORMAT,
    ALLOWED_EXTENSIONS,
    type ScriptFormat,
    type PublicScript,
} from '../types/script.types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect script format from both file extension and MIME type.
 * Extension takes precedence over MIME (more reliable for .fountain files).
 */
function detectFormat(originalName: string, mimetype: string): ScriptFormat {
    const ext = path.extname(originalName).toLowerCase();

    const extMap: Record<string, ScriptFormat> = {
        '.fountain': 'fountain',
        '.fdx': 'fdx',
        '.pdf': 'pdf',
        '.txt': 'txt',
    };

    if (ALLOWED_EXTENSIONS.has(ext) && extMap[ext] !== undefined) {
        return extMap[ext]!;
    }

    const fromMime = MIME_TO_FORMAT[mimetype];
    if (fromMime !== undefined) return fromMime;

    throw new AppError(
        `Cannot determine format for file "${originalName}"`,
        415,
        'UNSUPPORTED_FORMAT',
    );
}

/**
 * Generate a unique, safe filename for Cloudinary storage.
 * Pattern: <timestamp>-<8-hex-random>-<sanitised-original>
 */
function generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const sanitised = path
        .basename(originalName, path.extname(originalName))
        .replace(/[^a-z0-9_-]/gi, '_')
        .slice(0, 40)
        .toLowerCase();
    return `${timestamp}-${random}-${sanitised}`;
}

function toPublicScript(doc: ScriptDocument): PublicScript {
    return {
        id: doc.id as string,
        filename: doc.filename,
        originalName: doc.originalName,
        format: doc.format,
        url: doc.url,
        s3ObjectKey: doc.s3ObjectKey,
        sizeBytes: doc.sizeBytes,
        project: doc.project,
        owner: doc.owner,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

// Import the document type for the helper
import type { ScriptDocument } from '../models/script.model.js';

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Upload a script file for a given project.
 *
 * Steps:
 *   1. Validate the project exists and belongs to the uploader
 *   2. Detect format
 *   3. Upload buffer to Cloudinary
 *   4. Persist script metadata to MongoDB
 */
export async function uploadScript(
    file: Express.Multer.File,
    projectId: string,
    ownerId: string,
): Promise<PublicScript> {
    // 1. Validate project ownership
    if (!mongoose.isValidObjectId(projectId)) {
        throw new AppError('Invalid project ID', 400, 'INVALID_ID');
    }

    const project = await Project.findOne({ _id: projectId, owner: ownerId }).lean().exec();
    if (project === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    // 2. Detect format
    const format = detectFormat(file.originalname, file.mimetype);

    // 3. Upload to S3
    const filename = generateFilename(file.originalname);
    const ext = path.extname(file.originalname).toLowerCase();
    const folder = `cinevision/scripts/${ownerId}`;

    const uploaded = await uploadBuffer(file.buffer, folder, filename, ext, file.mimetype);

    // 4. Save metadata to MongoDB
    const script = await Script.create({
        originalName: file.originalname,
        filename,
        format,
        url: uploaded.secureUrl,
        s3ObjectKey: uploaded.objectKey,
        sizeBytes: file.size,
        project: projectId,
        owner: ownerId,
        status: 'uploaded',
    });

    return toPublicScript(script);
}

/**
 * List all scripts for a project (owner-scoped).
 */
export async function listScripts(
    projectId: string,
    ownerId: string,
): Promise<PublicScript[]> {
    if (!mongoose.isValidObjectId(projectId)) {
        throw new AppError('Invalid project ID', 400, 'INVALID_ID');
    }

    // Verify ownership
    const project = await Project.findOne({ _id: projectId, owner: ownerId }).lean().exec();
    if (project === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    const scripts = await Script.find({ project: projectId, owner: ownerId })
        .sort('-createdAt')
        .exec();

    return scripts.map(toPublicScript);
}

/**
 * Get one script by ID (owner-scoped).
 */
export async function getScriptById(
    scriptId: string,
    ownerId: string,
): Promise<PublicScript> {
    if (!mongoose.isValidObjectId(scriptId)) {
        throw new AppError('Invalid script ID', 400, 'INVALID_ID');
    }

    const script = await Script.findOne({ _id: scriptId, owner: ownerId }).exec();
    if (script === null) {
        throw new AppError('Script not found', 404, 'NOT_FOUND');
    }

    return toPublicScript(script);
}

/**
 * Get a short-lived signed download URL for a private script (owner-scoped).
 */
export async function getScriptDownloadUrl(
    scriptId: string,
    ownerId: string,
): Promise<{ url: string; expiresInSeconds: number }> {
    const script = await Script.findOne({ _id: scriptId, owner: ownerId }).exec();
    if (script === null) {
        throw new AppError('Script not found', 404, 'NOT_FOUND');
    }

    const EXPIRES = 900; // 15 minutes
    return {
        url: await getSignedUrl(script.s3ObjectKey, EXPIRES),
        expiresInSeconds: EXPIRES,
    };
}

/**
 * Delete a script — removes from Cloudinary then from MongoDB (owner-scoped).
 */
export async function deleteScript(
    scriptId: string,
    ownerId: string,
): Promise<void> {
    if (!mongoose.isValidObjectId(scriptId)) {
        throw new AppError('Invalid script ID', 400, 'INVALID_ID');
    }

    const script = await Script.findOne({ _id: scriptId, owner: ownerId }).exec();
    if (script === null) {
        throw new AppError('Script not found', 404, 'NOT_FOUND');
    }

    // Delete from S3 first — if this fails, we keep the DB record intact
    await deleteAsset(script.s3ObjectKey);

    // Remove DB record
    await Script.findByIdAndDelete(scriptId).exec();
}
