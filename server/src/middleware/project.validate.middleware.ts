/**
 * Project validation middleware (express-validator).
 */

import { body, param, query, type ValidationChain } from 'express-validator';
import { PROJECT_GENRES } from '../types/project.types.js';

// ─── Field Rules ──────────────────────────────────────────────────────────────

const titleRule = (): ValidationChain =>
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters');

const descriptionRule = (): ValidationChain =>
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters');

const genreRule = (): ValidationChain =>
    body('genre')
        .optional()
        .isIn(PROJECT_GENRES).withMessage(`Genre must be one of: ${PROJECT_GENRES.join(', ')}`);

// ─── Route Validators ─────────────────────────────────────────────────────────

/** POST /api/projects */
export const validateCreateProject: ValidationChain[] = [
    titleRule(),
    descriptionRule(),
    genreRule(),
];

/** PUT /api/projects/:id — all fields optional but at least one expected */
export const validateUpdateProject: ValidationChain[] = [
    titleRule().optional(),
    descriptionRule(),
    genreRule(),
];

/** GET /api/projects — query params */
export const validateProjectListQuery: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .matches(/^-?[\w.]+$/).withMessage('Invalid sort parameter'),
    query('genre')
        .optional()
        .isIn(PROJECT_GENRES).withMessage(`Genre must be one of: ${PROJECT_GENRES.join(', ')}`),
];

/** Route params — validate MongoDB ObjectId format */
export const validateObjectId: ValidationChain[] = [
    param('id')
        .isMongoId().withMessage('Invalid project ID'),
];
