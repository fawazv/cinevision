/**
 * TypeScript types for the Project domain.
 */

import type { Types } from 'mongoose';

// ─── Genre ───────────────────────────────────────────────────────────────────

export const PROJECT_GENRES = [
    'thriller',
    'drama',
    'action',
    'horror',
    'comedy',
    'sci-fi',
    'documentary',
    'fantasy',
    'romance',
    'other',
] as const;

export type ProjectGenre = (typeof PROJECT_GENRES)[number];

export const PROJECT_STATUSES = [
    'development',
    'pre-production',
    'production',
    'post-production',
    'completed',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateProjectBody {
    title: string;
    description?: string;
    genre?: ProjectGenre;
    status?: ProjectStatus;
}

export interface UpdateProjectBody {
    title?: string;
    description?: string;
    genre?: ProjectGenre;
    status?: ProjectStatus;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ProjectListQuery {
    page?: string;
    limit?: string;
    sort?: string;
    genre?: ProjectGenre;
}

// ─── Public Shapes ────────────────────────────────────────────────────────────

/** Safe project data returned to the client. */
export interface PublicProject {
    id: string;
    title: string;
    description: string;
    genre: ProjectGenre;
    status: ProjectStatus;
    owner: string | Types.ObjectId;
    sceneCount: number;
    createdAt: Date;
    updatedAt: Date;
}
