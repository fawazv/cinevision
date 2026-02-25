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
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/me', getMe);

router.put(
    '/me/name',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
    ],
    handleValidationErrors,
    updateName,
);

router.put(
    '/me/password',
    [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters'),
    ],
    handleValidationErrors,
    changePassword,
);

export default router;
