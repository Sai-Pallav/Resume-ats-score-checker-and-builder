import { Response } from 'express';

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    meta?: any;
    error: any | null;
    requestId?: string;
}

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: any) {
    const response: ApiResponse<T> = {
        success: true,
        data,
        error: null,
    };

    if (meta !== undefined) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
}

/**
 * Format a standardized error response (typically used by the global error handler).
 */
export function formatError(error: any, requestId?: string): ApiResponse<null> {
    return {
        success: false,
        data: null,
        error,
        requestId
    };
}
