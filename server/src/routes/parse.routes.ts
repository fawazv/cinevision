/**
 * Parse routes — all protected by JWT.
 *
 * POST /api/parse/:scriptId            trigger AI parsing
 * GET  /api/parse/:scriptId/scenes     list parsed scenes
 * GET  /api/parse/scenes/:sceneId      get one scene (for 3D viewer)
 */

import { Router } from 'express';
import { protect } from '../middleware/protect.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import { param } from 'express-validator';
import { parseScript, listScenes, getScene } from '../controllers/parse.controller.js';

const router = Router();

router.use(protect);

const validateMongoId = (field: string) =>
    param(field).isMongoId().withMessage(`Invalid ${field}`);

// Specific paths before parameterised ones
router.get(
    '/scenes/:sceneId',
    validateMongoId('sceneId'),
    handleValidationErrors,
    getScene,
);

router.post(
    '/:scriptId',
    validateMongoId('scriptId'),
    handleValidationErrors,
    parseScript,
);

router.get(
    '/:scriptId/scenes',
    validateMongoId('scriptId'),
    handleValidationErrors,
    listScenes,
);

export default router;
