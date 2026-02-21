/**
 * Protect middleware — verifies the Bearer JWT and attaches the decoded
 * user payload to `req.user` for use in downstream route handlers.
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler.js';
import { extractBearerToken, verifyToken } from '../utils/token.utils.js';
import { User } from '../models/user.model.js';
import type { JwtPayload } from '../types/auth.types.js';

/**
 * Augment Express Request to include the authenticated user payload.
 * Placed here (and not in types/index.ts) to co-locate with the middleware
 * that populates it.
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { _id: string };
        }
    }
}

/**
 * `protect` middleware — use on any route that requires authentication.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header
 *  2. Verify signature and expiry
 *  3. Confirm the user still exists in the DB (prevents stale tokens from
 *     working after account deletion)
 *  4. Attach decoded payload to req.user
 */
export async function protect(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
        // 1. Extract token
        const token = extractBearerToken(req.headers.authorization);
        if (token === null) {
            throw new AppError(
                'You are not logged in. Please log in to access this route.',
                401,
                'UNAUTHORIZED',
            );
        }

        // 2. Verify (throws JsonWebTokenError / TokenExpiredError on failure)
        const decoded = verifyToken(token);

        // 3. Check user still exists
        const currentUser = await User.findById(decoded.sub).lean().exec();
        if (currentUser === null) {
            throw new AppError(
                'The user belonging to this token no longer exists.',
                401,
                'UNAUTHORIZED',
            );
        }

        // 4. Attach to request
        req.user = { ...decoded, _id: decoded.sub };

        next();
    } catch (err) {
        next(err);
    }
}
