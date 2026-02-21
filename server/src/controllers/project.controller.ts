/**
 * Project controller — thin HTTP layer over project.service.
 */

import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service.js';
import type { CreateProjectBody, UpdateProjectBody, ProjectListQuery } from '../types/project.types.js';
import type { ApiSuccessResponse } from '../types/index.js';

// ─── GET /api/projects ────────────────────────────────────────────────────────

export async function listProjects(
    req: Request<object, object, object, ProjectListQuery>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const result = await projectService.listProjects(ownerId, req.query);

        const body: ApiSuccessResponse<typeof result> = {
            success: true,
            data: result,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── POST /api/projects ───────────────────────────────────────────────────────

export async function createProject(
    req: Request<object, object, CreateProjectBody>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const project = await projectService.createProject(ownerId, req.body);

        const body: ApiSuccessResponse<typeof project> = {
            success: true,
            data: project,
        };

        res.status(201).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/projects/:id ────────────────────────────────────────────────────

export async function getProject(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const project = await projectService.getProjectById(req.params.id, ownerId);

        const body: ApiSuccessResponse<typeof project> = {
            success: true,
            data: project,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────

export async function updateProject(
    req: Request<{ id: string }, object, UpdateProjectBody>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const project = await projectService.updateProject(req.params.id, ownerId, req.body);

        const body: ApiSuccessResponse<typeof project> = {
            success: true,
            data: project,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────

export async function deleteProject(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        await projectService.deleteProject(req.params.id, ownerId);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
