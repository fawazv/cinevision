/**
 * Script routes — all protected by JWT.
 *
 * POST   /api/scripts/upload          upload a screenplay file
 * GET    /api/scripts?projectId=...   list scripts for a project
 * GET    /api/scripts/:id             get script metadata
 * GET    /api/scripts/:id/download    get signed download URL
 * DELETE /api/scripts/:id             delete script (Cloudinary + DB)
 */

import { Router } from 'express';
import { protect } from '../middleware/protect.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import {
    validateScriptUpload,
    validateScriptListQuery,
    validateScriptId,
} from '../middleware/script.validate.middleware.js';
import { scriptUpload } from '../config/multer.config.js';
import {
    uploadScript,
    listScripts,
    getScript,
    getScriptDownloadUrl,
    deleteScript,
} from '../controllers/script.controller.js';

const router = Router();

// All script routes require authentication
router.use(protect);

// POST /api/scripts/upload — multipart/form-data
// Note: Multer middleware runs BEFORE validation so req.file is available.
//       We validate req.body fields (projectId) after Multer processes them.
router.post(
    '/upload',
    scriptUpload.single('script'),
    validateScriptUpload,
    handleValidationErrors,
    uploadScript,
);

// GET /api/scripts?projectId=...
router.get(
    '/',
    validateScriptListQuery,
    handleValidationErrors,
    listScripts,
);

// GET /api/scripts/:id
router.get(
    '/:id',
    validateScriptId,
    handleValidationErrors,
    getScript,
);

// GET /api/scripts/:id/download
router.get(
    '/:id/download',
    validateScriptId,
    handleValidationErrors,
    getScriptDownloadUrl,
);

// DELETE /api/scripts/:id
router.delete(
    '/:id',
    validateScriptId,
    handleValidationErrors,
    deleteScript,
);

export default router;
