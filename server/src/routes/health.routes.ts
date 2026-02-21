/**
 * Health check routes.
 *
 * Provides lightweight endpoints to verify the server and DB are alive.
 * Useful for load balancers, uptime monitors, and CI health checks.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getDatabaseState } from '../config/database.js';
import type { ApiSuccessResponse } from '../types/index.js';

const router = Router();

interface HealthData {
    status: 'ok';
    environment: string;
    uptime: number;
    timestamp: string;
}

interface DbHealthData {
    status: 'ok' | 'degraded';
    database: string;
}

/**
 * GET /api/health
 * Basic liveness check — confirms the server process is running.
 */
router.get('/', (_req: Request, res: Response): void => {
    const body: ApiSuccessResponse<HealthData> = {
        success: true,
        data: {
            status: 'ok',
            environment: process.env['NODE_ENV'] ?? 'development',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
        },
    };
    res.status(200).json(body);
});

/**
 * GET /api/health/db
 * Readiness check — confirms the MongoDB connection is healthy.
 */
router.get('/db', (_req: Request, res: Response): void => {
    const state = getDatabaseState();
    const isHealthy = state === 'connected';

    const body: ApiSuccessResponse<DbHealthData> = {
        success: true,
        data: {
            status: isHealthy ? 'ok' : 'degraded',
            database: state,
        },
    };

    res.status(isHealthy ? 200 : 503).json(body);
});

export default router;
