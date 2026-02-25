/**
 * Rate limiting configuration for CineVision API.
 *
 * Three tiers:
 *   - globalLimiter:  General API ceiling — prevents DDoS
 *   - authLimiter:    Strict limit on login/register — prevents brute force
 *   - parseJobLimiter: Throttles expensive AI parse calls per user
 */

import { rateLimit } from 'express-rate-limit';

/**
 * Global limiter — applied to every /api/* route.
 * 200 requests per minute window per IP.
 */
export const globalLimiter = rateLimit({
    windowMs: 60 * 1000,           // 1 minute
    max: 200,
    standardHeaders: 'draft-7',    // RFC 9110 retries-after header
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down and try again in a minute.',
        },
    },
});

/**
 * Auth limiter — strict for login / register endpoints.
 * 10 attempts per 15-minute window per IP.
 * Matches OWASP brute-force protection guidelines.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,      // 15 minutes
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,  // Only failed attempts count
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMIT',
            message: 'Too many authentication attempts. Try again in 15 minutes.',
        },
    },
});

/**
 * AI parse limiter — AI parsing is expensive (time + cost).
 * 20 parse requests per hour per IP.
 */
export const parseJobLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,     // 1 hour
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'PARSE_RATE_LIMIT',
            message: 'AI parse limit reached. You can parse up to 20 scripts per hour.',
        },
    },
});
