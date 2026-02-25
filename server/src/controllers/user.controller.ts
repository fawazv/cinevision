/**
 * User controller — thin HTTP layer for user profile & settings.
 *
 * GET  /api/users/me            — fetch my profile
 * PUT  /api/users/me/name       — update display name
 * PUT  /api/users/me/password   — change password
 */

import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

// ─── GET /api/users/me ────────────────────────────────────────────────────────

export async function getMe(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const userId = req.user!.sub;
        const user = await userService.getProfile(userId);

        const body: ApiSuccessResponse<typeof user> = { success: true, data: user };
        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── PUT /api/users/me/name ───────────────────────────────────────────────────

export async function updateName(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const userId = req.user!.sub;
        const { name } = req.body as { name: string };
        const user = await userService.updateName(userId, name);

        const body: ApiSuccessResponse<typeof user> = { success: true, data: user };
        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}

// ─── PUT /api/users/me/password ───────────────────────────────────────────────

export async function changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const userId = req.user!.sub;
        const { currentPassword, newPassword } = req.body as {
            currentPassword: string;
            newPassword: string;
        };

        await userService.changePassword(userId, currentPassword, newPassword);

        const body: ApiSuccessResponse<{ message: string }> = {
            success: true,
            data: { message: 'Password updated successfully' },
        };
        res.status(200).json(body);
    } catch (err) {
        next(err);
    }
}
