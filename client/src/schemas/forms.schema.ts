/**
 * Client-side Zod schemas (Zod v4 compatible).
 *
 * These mirror the server schemas so the same rules are enforced on both
 * sides without HTTP round-trips.
 *
 * NOTE: Zod v4 removed `{ required_error }` from z.string().
 *       Use `.min(1, 'message')` to enforce non-empty strings.
 */

import { z } from 'zod';

// ── Reusable field definitions ────────────────────────────────────────────────

const emailField = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim();

const strongPasswordField = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number');

// ── Auth schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name must be at most 50 characters')
            .trim(),
        email: emailField,
        password: strongPasswordField,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

// ── Settings schemas ──────────────────────────────────────────────────────────

export const updateNameSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters')
        .trim(),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: strongPasswordField,
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

// ── Exported types ────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
