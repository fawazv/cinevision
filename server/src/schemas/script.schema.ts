/**
 * Script Zod schemas (Zod v4 compatible).
 */

import { z } from 'zod';

const mongoIdRegex = /^[a-f\d]{24}$/i;

export const scriptUploadSchema = z.object({
    projectId: z
        .string()
        .min(1, 'projectId is required')
        .regex(mongoIdRegex, 'projectId must be a valid MongoDB ID')
        .trim(),
});

export const scriptListQuerySchema = z.object({
    projectId: z
        .string()
        .min(1, 'projectId query param is required')
        .regex(mongoIdRegex, 'projectId must be a valid MongoDB ID')
        .trim(),
});

export const scriptIdParamSchema = z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid script ID'),
});

export const parseScriptIdParamSchema = z.object({
    scriptId: z.string().regex(mongoIdRegex, 'Invalid scriptId'),
});

export const parseSceneIdParamSchema = z.object({
    sceneId: z.string().regex(mongoIdRegex, 'Invalid sceneId'),
});
