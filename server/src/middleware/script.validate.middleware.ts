/**
 * Script upload validation middleware.
 */

import { body, param, query, type ValidationChain } from 'express-validator';

/** Body fields for multipart/form-data uploads */
export const validateScriptUpload: ValidationChain[] = [
    body('projectId')
        .trim()
        .notEmpty().withMessage('projectId is required')
        .isMongoId().withMessage('projectId must be a valid MongoDB ID'),
];

/** GET /api/scripts?projectId=... */
export const validateScriptListQuery: ValidationChain[] = [
    query('projectId')
        .trim()
        .notEmpty().withMessage('projectId query param is required')
        .isMongoId().withMessage('projectId must be a valid MongoDB ID'),
];

/** Route :id param */
export const validateScriptId: ValidationChain[] = [
    param('id')
        .isMongoId().withMessage('Invalid script ID'),
];
