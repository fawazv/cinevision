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

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateProjectBody {
    title: string;
    description?: string;
    genre?: ProjectGenre;
}

export interface UpdateProjectBody {
    title?: string;
    description?: string;
    genre?: ProjectGenre;
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
    owner: string | Types.ObjectId;
    sceneCount: number;
    createdAt: Date;
    updatedAt: Date;
}
