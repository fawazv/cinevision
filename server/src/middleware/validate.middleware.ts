/**
 * express-validator chains for auth routes.
 *
 * Centralising validation rules here keeps controllers thin and
 * makes it easy to reuse or tweak rules independently.
 */

import { body, validationResult, type ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse, ValidationErrorDetail } from '../types/index.js';
import { env } from '../config/env.js';

// ─── Reusable Field Rules ─────────────────────────────────────────────────────

const nameRule = (): ValidationChain =>
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters');

const emailRule = (): ValidationChain =>
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail();

const passwordRule = (): ValidationChain =>
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number');

// ─── Route Validators ─────────────────────────────────────────────────────────

/** Validation chain for POST /api/auth/register */
export const validateRegister: ValidationChain[] = [
    nameRule(),
    emailRule(),
    passwordRule(),
];

/** Validation chain for POST /api/auth/login */
export const validateLogin: ValidationChain[] = [
    emailRule(),
    body('password').notEmpty().withMessage('Password is required'),
];

// ─── Validation Result Handler ────────────────────────────────────────────────

/**
 * Middleware to read express-validator results and short-circuit with a
 * structured 422 error if any validation failures were found.
 *
 * Mount this AFTER the validation chains on a route.
 */
export function handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        next();
        return;
    }

    const details: ValidationErrorDetail[] = errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg as string,
    }));

    const body: ApiErrorResponse = {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details,
            ...(env.nodeEnv === 'development' ? {} : {}),
        },
    };

    res.status(422).json(body);
}
