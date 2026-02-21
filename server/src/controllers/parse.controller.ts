/**
 * Parse controller — thin HTTP layer over parse.service.
 */

import type { Request, Response, NextFunction } from 'express';
import * as parseService from '../services/parse.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

// ─── POST /api/parse/:scriptId ────────────────────────────────────────────────

/**
 * Trigger AI parsing of a script. This is a long-running operation
 * (~seconds to minutes depending on scene count).
 * Returns the list of saved scenes and any failed scene numbers.
 */
export async function parseScript(
    req: Request<{ scriptId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const result = await parseService.parseScript(req.params.scriptId, ownerId);

        const body: ApiSuccessResponse<typeof result> = {
            success: true,
            data: result,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/parse/:scriptId/scenes ─────────────────────────────────────────

export async function listScenes(
    req: Request<{ scriptId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const scenes = await parseService.listScenes(req.params.scriptId, ownerId);

        const body: ApiSuccessResponse<typeof scenes> = {
            success: true,
            data: scenes,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/parse/scenes/:sceneId ──────────────────────────────────────────

export async function getScene(
    req: Request<{ sceneId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const ownerId = req.user!.sub;
        const scene = await parseService.getSceneById(req.params.sceneId, ownerId);

        const body: ApiSuccessResponse<typeof scene> = {
            success: true,
            data: scene,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}
