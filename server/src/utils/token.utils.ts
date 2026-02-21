/**
 * JWT utility — sign and verify tokens.
 *
 * All JWT logic is isolated here so it's easy to swap algorithms
 * or add refresh-token support in the future without touching the service.
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../types/auth.types.js';

/**
 * Sign a new access token for a given user.
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
        algorithm: 'HS256',
    } as jwt.SignOptions);
}

/**
 * Verify and decode a token.
 * Throws `JsonWebTokenError` or `TokenExpiredError` on failure —
 * these are caught and normalised by the global error handler.
 */
export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtSecret, {
        algorithms: ['HS256'],
    }) as JwtPayload;
}

/**
 * Extract the Bearer token from the Authorization header.
 * Returns `null` if header is absent or malformed.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : null;
}
