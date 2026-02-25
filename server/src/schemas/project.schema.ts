/**
 * Project Zod schemas (Zod v4 compatible).
 */

import { z } from 'zod';
import { PROJECT_GENRES, PROJECT_STATUSES } from '../types/project.types.js';

const mongoIdRegex = /^[a-f\d]{24}$/i;

// Cast the readonly tuples to mutable arrays for z.enum() in Zod v4
const genres = [...PROJECT_GENRES] as [string, ...string[]];
const statuses = [...PROJECT_STATUSES] as [string, ...string[]];

export const createProjectSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be at most 100 characters')
        .trim(),
    description: z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    genre: z.enum(genres).optional(),
    status: z.enum(statuses).optional(),
});

export const updateProjectSchema = z.object({
    title: z
        .string()
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be at most 100 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    genre: z.enum(genres).optional(),
    status: z.enum(statuses).optional(),
});

export const projectListQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be a positive integer').optional(),
    limit: z.coerce.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional(),
    sort: z.string().regex(/^-?[\w.]+$/, 'Invalid sort parameter').optional(),
    genre: z.enum(genres).optional(),
});

export const mongoIdParamSchema = z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid project ID'),
});
