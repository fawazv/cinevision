/**
 * Project routes — all protected by JWT.
 *
 * GET    /api/projects          list (paginated, filterable)
 * POST   /api/projects          create
 * GET    /api/projects/:id      get one
 * PUT    /api/projects/:id      update
 * DELETE /api/projects/:id      delete
 */

import { Router } from 'express';
import { protect } from '../middleware/protect.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';
import {
    validateCreateProject,
    validateUpdateProject,
    validateProjectListQuery,
    validateObjectId,
} from '../middleware/project.validate.middleware.js';
import {
    listProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';

const router = Router();

// All project routes require authentication
router.use(protect);

router
    .route('/')
    .get(validateProjectListQuery, handleValidationErrors, listProjects)
    .post(validateCreateProject, handleValidationErrors, createProject);

router
    .route('/:id')
    .get(validateObjectId, handleValidationErrors, getProject)
    .put(validateObjectId, validateUpdateProject, handleValidationErrors, updateProject)
    .delete(validateObjectId, handleValidationErrors, deleteProject);

export default router;
