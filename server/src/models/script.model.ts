/**
 * Script Mongoose model.
 *
 * Stores metadata about an uploaded screenplay file.
 * The actual file content lives on AWS S3 (s3ObjectKey + url).
 * Parsed scene data will be stored in the Scene model (Component 5).
 */

import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import { SCRIPT_FORMATS, SCRIPT_STATUSES, type ScriptFormat, type ScriptStatus } from '../types/script.types.js';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ScriptDocument extends Document {
    id: string;
    /** Original file name from the upload. */
    originalName: string;
    /** Sanitised, unique file name stored in S3. */
    filename: string;
    format: ScriptFormat;
    /** S3 presigned URL — populated after upload. */
    url: string;
    /** S3 object key — required to delete or presign the asset. */
    s3ObjectKey: string;
    sizeBytes: number;
    /** The Project this script belongs to. */
    project: Types.ObjectId;
    /** The User who uploaded this script. */
    owner: Types.ObjectId;
    status: ScriptStatus;
    createdAt: Date;
    updatedAt: Date;
}

interface ScriptModel extends Model<ScriptDocument> { }

// ─── Schema ──────────────────────────────────────────────────────────────────

const scriptSchema = new Schema<ScriptDocument, ScriptModel>(
    {
        originalName: {
            type: String,
            required: true,
            trim: true,
        },
        filename: {
            type: String,
            required: true,
            trim: true,
        },
        format: {
            type: String,
            enum: SCRIPT_FORMATS,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        s3ObjectKey: {
            type: String,
            required: true,
        },
        sizeBytes: {
            type: Number,
            required: true,
            min: 0,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: SCRIPT_STATUSES,
            default: 'uploaded',
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret: Record<string, unknown>) {
                ret['_id'] = undefined;
                return Object.fromEntries(
                    Object.entries(ret).filter(([, v]) => v !== undefined),
                );
            },
        },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// List all scripts for a project, most recent first
scriptSchema.index({ project: 1, createdAt: -1 });
// List all scripts uploaded by a user
scriptSchema.index({ owner: 1, createdAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export const Script = mongoose.model<ScriptDocument, ScriptModel>('Script', scriptSchema);
