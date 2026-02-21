/**
 * TypeScript types specific to the authentication domain.
 *
 * Keeping domain types co-located with their feature keeps the
 * codebase navigable as it grows.
 */

// ─── Request / Response DTOs ─────────────────────────────────────────────────

export interface RegisterBody {
    name: string;
    email: string;
    password: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

// ─── Token Payloads ──────────────────────────────────────────────────────────

/** The data encoded inside a JWT access token. */
export interface JwtPayload {
    sub: string;   // user _id (MongoDB ObjectId as string)
    email: string;
    iat?: number;
    exp?: number;
}

// ─── Service Return Types ─────────────────────────────────────────────────────

/** Safe user data returned to the client — no password hash. */
export interface PublicUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/** Returned after a successful register or login. */
export interface AuthResult {
    user: PublicUser;
    token: string;
}
