/**
 * User service — settings and profile management.
 *
 * Intentionally separate from auth.service to keep responsibilities clean:
 *   auth.service  → registration, login, token issuance
 *   user.service  → profile reads/updates for authenticated users
 */

import { User } from '../models/user.model.js';
import { AppError } from '../middleware/error-handler.js';
import type { PublicUser } from '../types/auth.types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPublicUser(doc: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}): PublicUser {
    return {
        id: doc.id,
        name: doc.name,
        email: doc.email,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch the profile of a user by their ID.
 */
export async function getProfile(userId: string): Promise<PublicUser> {
    const user = await User.findById(userId).exec();
    if (user === null) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return toPublicUser(user);
}

/**
 * Update the user's display name.
 */
export async function updateName(userId: string, name: string): Promise<PublicUser> {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { name: name.trim() } },
        { new: true, runValidators: true },
    ).exec();

    if (user === null) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return toPublicUser(user);
}

/**
 * Change the user's password after verifying their current password.
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
): Promise<void> {
    // Fetch with password included for comparison
    const user = await User.findById(userId).select('+password').exec();
    if (user === null) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
        throw new AppError('Current password is incorrect', 400, 'INVALID_CREDENTIALS');
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash the new password
}
