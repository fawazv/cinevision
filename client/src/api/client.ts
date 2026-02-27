import axios from 'axios';
import toast from 'react-hot-toast';

// Respect VITE_API_URL from environment variables (for Vercel deployment),
// fallback to '/api' for local development via Vite proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Axios instance pre-configured for the CineVision API.
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token to  every request automatically
apiClient.interceptors.request.use(
    (config) => {
        // We'll store the token in localStorage for simplicity on the client side
        const token = localStorage.getItem('cinevision_token');
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

            // Auto-logout on invalid or expired token — don't toast, just redirect
            if (error.response.status === 401) {
                import('../store/auth.store').then(({ useAuthStore }) => {
                    useAuthStore.getState().logout();
                });
                return Promise.reject({
                    message: apiError.message,
                    code: apiError.code,
                    status: 401,
                });
            }

            const errorMessage = apiError.message || 'Something went wrong';
            toast.error(errorMessage);

            return Promise.reject({
                message: errorMessage,
                code: apiError.code,
                status: error.response.status,
                details: apiError.details,
            });
        }

        // Network errors or generic 500s where JSON payload is missing
        const networkMsg = error.message || 'An unexpected network error occurred';
        toast.error(networkMsg);
        return Promise.reject({
            message: networkMsg,
            code: 'NETWORK_ERROR',
            status: error.response?.status || 500,
        });
    }
);
