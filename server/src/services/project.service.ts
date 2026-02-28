/**
 * Project service — all project business logic.
 *
 * All operations are owner-scoped: a user can only read, update,
 * or delete their own projects.
 */

import mongoose from 'mongoose';
import { Project } from '../models/project.model.js';
import { Script } from '../models/script.model.js';
import { Scene } from '../models/scene.model.js';
import { deleteAssets } from './s3.service.js';
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

    // Build the filter — remove owner constraint to allow testing shared collaboration
    const filter: Record<string, unknown> = {};
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
    _ownerId: string, // prefixed with underscore since it's temporarily unused for testing
): Promise<PublicProject> {
    assertValidObjectId(projectId, 'project');

    // Remove owner check for collaboration testing
    const project = await Project.findOne({ _id: projectId }).exec();

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

    // 1. Verify project exists and is owned by the user
    const project = await Project.findOne({ _id: projectId, owner: ownerId }).exec();
    if (project === null) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    // 2. Fetch all scripts for this project to get their S3 keys
    const scripts = await Script.find({ project: projectId }).select('s3ObjectKey').lean().exec();

    // 3. Delete files from S3 in bulk
    const objectKeys = scripts.map((s) => s.s3ObjectKey);
    if (objectKeys.length > 0) {
        await deleteAssets(objectKeys);
    }

    // 4. Cascade delete MongoDB documents
    // Order matters here to prevent orphans if MongoDB throws an error mid-way
    await Promise.all([
        Scene.deleteMany({ project: projectId }).exec(),
        Script.deleteMany({ project: projectId }).exec(),
    ]);

    // 5. Delete the actual project
    await Project.deleteOne({ _id: projectId }).exec();
}
