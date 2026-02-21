/**
 * Project Mongoose model.
 *
 * A Project is the top-level container owned by a User.
 * It holds metadata and references to Scenes (added in Component 5).
 */

import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import { PROJECT_GENRES, type ProjectGenre } from '../types/project.types.js';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProjectDocument extends Document {
    id: string;
    title: string;
    description: string;
    genre: ProjectGenre;
    /** Reference to the User who owns this project. */
    owner: Types.ObjectId;
    /**
     * Count of scenes — stored as a denormalised field and incremented /
     * decremented by the Scene service (Component 5).
     */
    sceneCount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ProjectModel extends Model<ProjectDocument> { }

// ─── Schema ──────────────────────────────────────────────────────────────────

const projectSchema = new Schema<ProjectDocument, ProjectModel>(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            minlength: [2, 'Title must be at least 2 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        genre: {
            type: String,
            enum: PROJECT_GENRES,
            default: 'other',
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sceneCount: {
            type: Number,
            default: 0,
            min: 0,
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

// Allows efficient listing of all projects by a given user, sorted by updatedAt
projectSchema.index({ owner: 1, updatedAt: -1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export const Project = mongoose.model<ProjectDocument, ProjectModel>(
    'Project',
    projectSchema,
);
