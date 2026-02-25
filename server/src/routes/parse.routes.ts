/**
 * Parse routes — all protected by JWT.
 *
 * POST /api/parse/:scriptId            trigger AI parsing
 * GET  /api/parse/:scriptId/scenes     list parsed scenes
 * GET  /api/parse/scenes/:sceneId      get one scene (for 3D viewer)
 */

import { Router } from 'express';
import { protect } from '../middleware/protect.middleware.js';
import { validateResource } from '../middleware/validate.middleware.js';
import {
    parseScriptIdParamSchema,
    parseSceneIdParamSchema,
} from '../schemas/script.schema.js';
import { parseScript, listScenes, getScene } from '../controllers/parse.controller.js';

const router = Router();

router.use(protect);

// Specific paths before parameterised ones
router.get(
    '/scenes/:sceneId',
    validateResource(parseSceneIdParamSchema, 'params'),
    getScene,
);

router.post(
    '/:scriptId',
    validateResource(parseScriptIdParamSchema, 'params'),
    parseScript,
);

router.get(
    '/:scriptId/scenes',
    validateResource(parseScriptIdParamSchema, 'params'),
    listScenes,
);

export default router;
