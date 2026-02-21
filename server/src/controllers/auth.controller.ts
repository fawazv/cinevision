/**
 * Auth controller — thin HTTP layer.
 *
 * Each handler only:
 *  1. Reads from req
 *  2. Calls the service
 *  3. Sends the response
 *
 * Error handling is delegated to the global error handler via next(err).
 */

import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import type { RegisterBody, LoginBody } from '../types/auth.types.js';
import type { ApiSuccessResponse } from '../types/index.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(
    req: Request<object, object, RegisterBody>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await authService.registerUser(req.body);

        const body: ApiSuccessResponse<typeof result> = {
            success: true,
            data: result,
        };

        res.status(201).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(
    req: Request<object, object, LoginBody>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await authService.loginUser(req.body);

        const body: ApiSuccessResponse<typeof result> = {
            success: true,
            data: result,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function getMe(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // req.user is guaranteed by the `protect` middleware that precedes this handler
        const userId = req.user!.sub;
        const user = await authService.getUserById(userId);

        const body: ApiSuccessResponse<typeof user> = {
            success: true,
            data: user,
        };

        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}
