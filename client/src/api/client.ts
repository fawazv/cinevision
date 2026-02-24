import axios from 'axios';

// The Vite proxy (configured in vite.config.ts) will route /api requests to the backend server.
const API_BASE_URL = '/api';

/**
 * Axios instance pre-configured for the CineVision API.
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token to every request automatically
apiClient.interceptors.request.use(
    (config) => {
        // We'll store the token in localStorage for simplicity on the client side
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to uniformly map backend AppError payloads
apiClient.interceptors.response.use(
    (response) => {
        // Unwrap the successful data payload
        return response.data;
    },
    (error) => {
        // If the backend sent our structured ApiErrorResponse
        if (error.response?.data?.error) {
            const apiError = error.response.data.error;
            // Throw a clean error object matching the backend's AppError shape
            return Promise.reject({
                message: apiError.message,
                code: apiError.code,
                status: error.response.status,
                details: apiError.details,
            });
        }

        // Network errors or generic 500s where JSON payload is missing
        return Promise.reject({
            message: error.message || 'An unexpected network error occurred',
            code: 'NETWORK_ERROR',
            status: error.response?.status || 500,
        });
    }
);
