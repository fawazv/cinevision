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
import { validateResource } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validateResource(registerSchema), register);
router.post('/login', validateResource(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
