/**
 * Auth service — all authentication business logic lives here.
 *
 * Controllers call service functions and only deal with HTTP concerns
 * (parsing req, sending res). This keeps logic testable independently.
 */

import { User } from '../models/user.model.js';
import { AppError } from '../middleware/error-handler.js';
import { signToken } from '../utils/token.utils.js';
import type { RegisterBody, LoginBody, AuthResult, PublicUser } from '../types/auth.types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a Mongoose UserDocument to the safe public shape.
 * Relies on the model's toJSON transform but provides an explicit typed view.
 */
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
 * Register a new user.
 * Throws AppError(409) if the email is already registered.
 */
export async function registerUser(body: RegisterBody): Promise<AuthResult> {
    const { name, email, password } = body;

    // Check for duplicate email before Mongoose does (cleaner error message)
    const existing = await User.findOne({ email }).lean().exec();
    if (existing !== null) {
        throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const user = await User.create({ name, email, password });

    const token = signToken({ sub: user.id, email: user.email });

    return {
        user: toPublicUser(user),
        token,
    };
}

/**
 * Authenticate an existing user with email + password.
 * Throws AppError(401) for invalid credentials — same message for both
 * "user not found" and "wrong password" to avoid user enumeration.
 */
export async function loginUser(body: LoginBody): Promise<AuthResult> {
    const { email, password } = body;

    // Include password in this one query only
    const user = await User.findByEmailWithPassword(email);

    // Evaluate comparison in constant time even when user not found.
    // When user is null, bcrypt.compare is skipped — that's acceptable here
    // because the null-check already short-circuits to false.
    const passwordMatches = user !== null && await user.comparePassword(password);

    if (user === null || !passwordMatches) {
        // Intentionally vague — don't reveal whether the email exists
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // TypeScript now knows user is non-null inside this block
    const token = signToken({ sub: user.id, email: user.email });

    return {
        user: toPublicUser(user),
        token,
    };
}

/**
 * Fetch a single user by their ID.
 * Throws AppError(404) if not found.
 */
export async function getUserById(id: string): Promise<PublicUser> {
    const user = await User.findById(id).exec();
    if (user === null) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return toPublicUser(user);
}
