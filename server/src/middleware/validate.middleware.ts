/**
 * Zod-based request validation middleware (Zod v4 compatible).
 *
 * Usage:
 *   validateResource(schema)                 — validates req.body
 *   validateResource(schema, 'query')        — validates req.query
 *   validateResource(schema, 'params')       — validates req.params
 */

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse, ValidationErrorDetail } from '../types/index.js';

type AnyZodSchema = z.ZodTypeAny;
type Source = 'body' | 'query' | 'params';

export function validateResource(schema: AnyZodSchema, source: Source = 'body') {
    return function (req: Request, res: Response, next: NextFunction): void {
        const result = schema.safeParse(req[source]);

        if (result.success) {
            // Replace the source with parsed (coerced/trimmed) data
            (req as unknown as Record<string, unknown>)[source] = result.data as unknown;
            next();
            return;
        }

        // Zod v4: result.error is a ZodError, issues are in .issues
        const zodError = result.error as z.ZodError;
        const details: ValidationErrorDetail[] = zodError.issues.map((issue) => ({
            field: issue.path.join('.') || 'unknown',
            message: issue.message,
        }));

        const body: ApiErrorResponse = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details,
            },
        };

        res.status(422).json(body);
    };
}
