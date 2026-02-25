/**
 * Script routes — all protected by JWT.
 *
 * POST   /api/scripts/upload          upload a screenplay file
 * GET    /api/scripts?projectId=...   list scripts for a project
 * GET    /api/scripts/:id             get script metadata
 * GET    /api/scripts/:id/download    get signed download URL
 * DELETE /api/scripts/:id             delete script (S3 + DB)
 */

import { Router } from 'express';
import { protect } from '../middleware/protect.middleware.js';
import { validateResource } from '../middleware/validate.middleware.js';
import {
    scriptUploadSchema,
    scriptListQuerySchema,
    scriptIdParamSchema,
} from '../schemas/script.schema.js';
import { scriptUpload } from '../config/multer.config.js';
import {
    uploadScript,
    listScripts,
    getScript,
    getScriptDownloadUrl,
    deleteScript,
} from '../controllers/script.controller.js';

const router = Router();

router.use(protect);

// POST /api/scripts/upload — multipart/form-data
router.post(
    '/upload',
    scriptUpload.single('script'),
    validateResource(scriptUploadSchema),
    uploadScript,
);

// GET /api/scripts?projectId=...
router.get(
    '/',
    validateResource(scriptListQuerySchema, 'query'),
    listScripts,
);

// GET /api/scripts/:id
router.get(
    '/:id',
    validateResource(scriptIdParamSchema, 'params'),
    getScript,
);

// GET /api/scripts/:id/download
router.get(
    '/:id/download',
    validateResource(scriptIdParamSchema, 'params'),
    getScriptDownloadUrl,
);

// DELETE /api/scripts/:id
router.delete(
    '/:id',
    validateResource(scriptIdParamSchema, 'params'),
    deleteScript,
);

export default router;
