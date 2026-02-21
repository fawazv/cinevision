/**
 * TypeScript types for the Script domain.
 */

import type { Types } from 'mongoose';

// ─── Format ───────────────────────────────────────────────────────────────────

export const SCRIPT_FORMATS = ['fountain', 'fdx', 'pdf', 'txt'] as const;
export type ScriptFormat = (typeof SCRIPT_FORMATS)[number];

export const SCRIPT_STATUSES = ['uploaded', 'parsing', 'parsed', 'failed'] as const;
export type ScriptStatus = (typeof SCRIPT_STATUSES)[number];

// ─── MIME → Format mapping ────────────────────────────────────────────────────

export const MIME_TO_FORMAT: Record<string, ScriptFormat> = {
    'text/plain': 'txt',
    'application/octet-stream': 'fountain', // .fountain files have no standard MIME
    'application/xml': 'fdx',
    'text/xml': 'fdx',
    'application/pdf': 'pdf',
};

export const ALLOWED_EXTENSIONS = new Set(['.fountain', '.fdx', '.pdf', '.txt']);

// ─── Public Shape ─────────────────────────────────────────────────────────────

export interface PublicScript {
    id: string;
    filename: string;
    originalName: string;
    format: ScriptFormat;
    /** Cloudinary secure URL */
    url: string;
    /** Cloudinary public_id — needed to delete the asset */
    cloudinaryPublicId: string;
    sizeBytes: number;
    project: string | Types.ObjectId;
    owner: string | Types.ObjectId;
    status: ScriptStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Request body ─────────────────────────────────────────────────────────────

/** Body params expected alongside the multipart upload. */
export interface UploadScriptBody {
    projectId: string;
}
