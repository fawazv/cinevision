/**
 * Script controller — thin HTTP layer over script.service.
 */

import type { Request, Response, NextFunction } from 'express';
import * as scriptService from '../services/script.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

// ─── POST /api/scripts/upload ─────────────────────────────────────────────────

export async function uploadScript(
    req: Request<object, object, { projectId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // Multer has already validated and buffered the file by this point
        if (req.file === undefined) {
            res.status(400).json({
                success: false,
                error: { code: 'NO_FILE', message: 'No file was uploaded' },
            });
            return;
        }

        const ownerId = req.user!.sub;
        const { projectId } = req.body;

        const script = await scriptService.uploadScript(req.file, projectId, ownerId);

        const body: ApiSuccessResponse<typeof script> = {
            success: true,
            data: script,
        };

        res.status(201).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/scripts?projectId=... ──────────────────────────────────────────

export async function listScripts(
    req: Request<object, object, object, { projectId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const scripts = await scriptService.listScripts(req.query.projectId, ownerId);

        const body: ApiSuccessResponse<typeof scripts> = {
            success: true,
            data: scripts,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/scripts/:id ─────────────────────────────────────────────────────

export async function getScript(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const script = await scriptService.getScriptById(req.params.id, ownerId);

        const body: ApiSuccessResponse<typeof script> = {
            success: true,
            data: script,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/scripts/:id/download ───────────────────────────────────────────

export async function getScriptDownloadUrl(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const result = await scriptService.getScriptDownloadUrl(req.params.id, ownerId);

        const body: ApiSuccessResponse<typeof result> = {
            success: true,
            data: result,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── DELETE /api/scripts/:id ──────────────────────────────────────────────────

export async function deleteScript(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        await scriptService.deleteScript(req.params.id, ownerId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
