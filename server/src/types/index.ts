/**
 * Shared TypeScript types used across the entire server.
 *
 * Centralising types here prevents circular imports and makes
 * the contract of every API response predictable.
 */

// ─── API Response Wrapper ────────────────────────────────────────────────────

/** Standard shape for every successful API response. */
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

/** Standard shape for every error API response. */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        /** Only present in development mode */
        stack?: string;
        /** Field-level validation errors */
        details?: ValidationErrorDetail[];
    };
}

export interface ValidationErrorDetail {
    field: string;
    message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}

// ─── Express Augmentation ────────────────────────────────────────────────────

/**
 * Augment Express's Request type to include our custom properties.
 * Additional properties (e.g., req.user) will be added here as new
 * components are built.
 */
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}
