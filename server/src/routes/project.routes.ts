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
import { validateResource } from '../middleware/validate.middleware.js';
import {
    createProjectSchema,
    updateProjectSchema,
    projectListQuerySchema,
    mongoIdParamSchema,
} from '../schemas/project.schema.js';
import {
    listProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';

const router = Router();

router.use(protect);

router
    .route('/')
    .get(validateResource(projectListQuerySchema, 'query'), listProjects)
    .post(validateResource(createProjectSchema), createProject);

router
    .route('/:id')
    .get(validateResource(mongoIdParamSchema, 'params'), getProject)
    .put(
        validateResource(mongoIdParamSchema, 'params'),
        validateResource(updateProjectSchema),
        updateProject,
    )
    .delete(validateResource(mongoIdParamSchema, 'params'), deleteProject);

export default router;
