/**
 * Project service — all project business logic.
 *
 * All operations are owner-scoped: a user can only read, update,
 * or delete their own projects.
 */

import mongoose from 'mongoose';
import { Project } from '../models/project.model.js';
import { AppError } from '../middleware/error-handler.js';
import { parsePagination, buildPaginationMeta, parseSortString } from '../utils/pagination.utils.js';
import type {
    CreateProjectBody,
    UpdateProjectBody,
    ProjectListQuery,
    PublicProject,
} from '../types/project.types.js';
import type { PaginatedResponse } from '../types/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPublicProject(doc: {
    id: string;
    title: string;
    description: string;
    genre: PublicProject['genre'];
    status: PublicProject['status'];
    owner: PublicProject['owner'];
    sceneCount: number;
    createdAt: Date;
    updatedAt: Date;
}): PublicProject {
    return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        genre: doc.genre,
        status: doc.status,
        owner: doc.owner,
        sceneCount: doc.sceneCount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

function assertValidObjectId(id: string, label: string): void {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(`Invalid ${label} ID`, 400, 'INVALID_ID');
    }
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listProjects(
    ownerId: string,
    query: ProjectListQuery,
): Promise<PaginatedResponse<PublicProject>> {
    assertValidObjectId(ownerId, 'user');

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const sort = parseSortString(query.sort, '-updatedAt');

    // Build the filter — always scope to the authenticated user
    const filter: Record<string, unknown> = { owner: ownerId };
    if (query.genre !== undefined) {
        filter['genre'] = query.genre;
    }

    const [projects, total] = await Promise.all([
        Project.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
        Project.countDocuments(filter).exec(),
    ]);

    return {
        items: projects.map((p) =>
            toPublicProject({
                id: String(p._id),
                title: p.title,
                description: p.description,
                genre: p.genre,
                status: p.status,
                owner: p.owner,
                sceneCount: p.sceneCount,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            }),
        ),
        pagination: buildPaginationMeta(page, limit, total),
    };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProject(
    ownerId: string,
    body: CreateProjectBody,
): Promise<PublicProject> {
    assertValidObjectId(ownerId, 'user');

    const project = await Project.create({
        ...body,
        owner: ownerId,
    });

    return toPublicProject(project);
}

// ─── Get One ──────────────────────────────────────────────────────────────────

export async function getProjectById(
    projectId: string,
    ownerId: string,
): Promise<PublicProject> {
    assertValidObjectId(projectId, 'project');

    const project = await Project.findOne({ _id: projectId, owner: ownerId }).exec();

    if (project === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    return toPublicProject(project);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProject(
    projectId: string,
    ownerId: string,
    body: UpdateProjectBody,
): Promise<PublicProject> {
    assertValidObjectId(projectId, 'project');

    // findOneAndUpdate with owner filter prevents updating another user's project
    const project = await Project.findOneAndUpdate(
        { _id: projectId, owner: ownerId },
        { $set: body },
        { new: true, runValidators: true },
    ).exec();

    if (project === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    return toPublicProject(project);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProject(
    projectId: string,
    ownerId: string,
): Promise<void> {
    assertValidObjectId(projectId, 'project');

    const result = await Project.findOneAndDelete({
        _id: projectId,
        owner: ownerId,
    }).exec();

    if (result === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }
}
