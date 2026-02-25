/**
 * User routes — all require authentication.
 *
 * GET  /api/users/me            — fetch current user profile
 * PUT  /api/users/me/name       — update display name
 * PUT  /api/users/me/password   — change password
 */

import { Router } from 'express';
import { getMe, updateName, changePassword } from '../controllers/user.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { validateResource } from '../middleware/validate.middleware.js';
import { updateNameSchema, changePasswordSchema } from '../schemas/user.schema.js';

const router = Router();

router.use(protect);

router.get('/me', getMe);
router.put('/me/name', validateResource(updateNameSchema), updateName);
router.put('/me/password', validateResource(changePasswordSchema), changePassword);

export default router;
