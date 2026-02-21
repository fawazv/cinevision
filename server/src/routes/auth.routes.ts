/**
 * Auth routes.
 *
 * POST /api/auth/register   — create account
 * POST /api/auth/login      — authenticate and receive JWT
 * GET  /api/auth/me         — get current user (protected)
 */

import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
    '/register',
    validateRegister,
    handleValidationErrors,
    register,
);

router.post(
    '/login',
    validateLogin,
    handleValidationErrors,
    login,
);

router.get(
    '/me',
    protect,
    getMe,
);

export default router;
