/**
 * Application-level error class and global Express error-handling middleware.
 *
 * Pattern:
 *  - Throw `new AppError(message, statusCode)` anywhere in the app.
 *  - The error reaches `globalErrorHandler` via Express's `next(err)`.
 *  - The handler sends a consistent JSON response and logs accordingly.
 */

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';
import type { ApiErrorResponse } from '../types/index.js';

// ─── AppError ────────────────────────────────────────────────────────────────

export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    /** Operational errors are expected (e.g., 404, 401); non-operational are bugs. */
    readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true,
    ) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);

        // Capture a clean stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// ─── Mongoose Error Helpers ──────────────────────────────────────────────────

function handleCastError(err: { path: string; value: unknown }): AppError {
    return new AppError(
        `Invalid value "${String(err.value)}" for field "${err.path}"`,
        400,
        'INVALID_ID',
    );
}

function handleDuplicateKeyError(err: {
    keyValue: Record<string, unknown>;
}): AppError {
    const field = Object.keys(err.keyValue)[0] ?? 'field';
    return new AppError(
        `A record with this ${field} already exists`,
        409,
        'CONFLICT',
    );
}

function handleValidationError(err: {
    errors: Record<string, { message: string }>;
}): AppError {
    const messages = Object.values(err.errors)
        .map((e) => e.message)
        .join('. ');
    return new AppError(messages, 400, 'VALIDATION_ERROR');
}

function handleJwtError(): AppError {
    return new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
}

function handleJwtExpiredError(): AppError {
    return new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
}

// ─── Global Error Handler ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeError(err: any): AppError {
    if (err instanceof AppError) return err;
    if (err.name === 'CastError') return handleCastError(err as { path: string; value: unknown });
    if ((err.code as number) === 11000) return handleDuplicateKeyError(err as { keyValue: Record<string, unknown> });
    if (err.name === 'ValidationError') return handleValidationError(err as { errors: Record<string, { message: string }> });
    if (err.name === 'JsonWebTokenError') return handleJwtError();
    if (err.name === 'TokenExpiredError') return handleJwtExpiredError();
    return new AppError('Something went wrong', 500, 'INTERNAL_ERROR', false);
}

export const globalErrorHandler: ErrorRequestHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    // next MUST be declared for Express to recognise this as an error handler
    _next: NextFunction,
): void => {
    const appError = normalizeError(err);

    if (!appError.isOperational) {
        // Log programming/unexpected errors prominently
        console.error('💥 UNEXPECTED ERROR:', err);
    }

    const body: ApiErrorResponse = {
        success: false,
        error: {
            code: appError.code,
            message: appError.message,
            // Only expose stack traces in development
            ...(env.nodeEnv === 'development' && appError.stack !== undefined
                ? { stack: appError.stack }
                : {}),
        },
    };

    res.status(appError.statusCode).json(body);
};

// ─── 404 Handler ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}
