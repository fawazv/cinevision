import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post<{ user: AuthUser; token: string }>(
                        '/auth/login',
                        { email, password }
                    );
                    // The response interceptor returns response.data at runtime,
                    // but TypeScript types it as AxiosResponse — access .data defensively
                    const payload = (response as unknown as { user: AuthUser; token: string });
                    set({
                        user: payload.user,
                        token: payload.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    localStorage.setItem('cinevision_token', payload.token);
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message
                        : typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message)
                            : 'Login failed. Please try again.';
                    set({ isLoading: false, error: message });
                    throw err;
                }
            },

            register: async (name, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post<{ user: AuthUser; token: string }>(
                        '/auth/register',
                        { name, email, password }
                    );
                    const payload = (response as unknown as { user: AuthUser; token: string });
                    set({
                        user: payload.user,
                        token: payload.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    localStorage.setItem('cinevision_token', payload.token);
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message
                        : typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message)
                            : 'Registration failed. Please try again.';
                    set({ isLoading: false, error: message });
                    throw err;
                }
            },

            logout: () => {
                localStorage.removeItem('cinevision_token');
                set({ user: null, token: null, isAuthenticated: false, error: null });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'cinevision-auth', // localStorage key
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
