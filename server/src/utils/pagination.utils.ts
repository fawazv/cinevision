/**
 * Reusable pagination utility.
 *
 * Parse query params → safe, bounded numbers.
 * Build the PaginationMeta from a total count.
 */

import type { PaginationMeta } from '../types/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface ParsedPagination {
    page: number;
    limit: number;
    skip: number;
}

/**
 * Parse `page` and `limit` query strings into safe, bounded integers.
 * Falls back to sensible defaults and caps limit at MAX_LIMIT.
 */
export function parsePagination(
    rawPage: string | undefined,
    rawLimit: string | undefined,
): ParsedPagination {
    const page = Math.max(1, parseInt(rawPage ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(rawLimit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
    );
    return { page, limit, skip: (page - 1) * limit };
}

/**
 * Build the standard pagination metadata object.
 */
export function buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}

/**
 * Sanitise a sort string so only alphanumerics, underscores, dots, and a
 * leading minus (for descending) are allowed.  Falls back to `defaultSort`.
 */
export function parseSortString(raw: string | undefined, defaultSort: string): string {
    if (!raw) return defaultSort;
    // Allow: optional leading -, then word chars and dots
    return /^-?[\w.]+$/.test(raw) ? raw : defaultSort;
}
