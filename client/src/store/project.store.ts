import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Project, CreateProjectPayload } from '../types/project.types';

interface ProjectStore {
    projects: Project[];
    total: number;
    isLoading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    createProject: (payload: CreateProjectPayload) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    total: 0,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/projects');
            const data = response as unknown as { data: { items: Project[]; pagination: { total: number } } };
            set({
                projects: data.data.items,
                total: data.data.pagination.total,
                isLoading: false,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message
                : typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : 'Failed to load projects.';
            set({ isLoading: false, error: message });
        }
    },

    createProject: async (payload) => {
        set({ error: null });
        try {
            const response = await apiClient.post('/projects', payload);
            const data = response as unknown as { data: Project };
            set((state) => ({
                projects: [data.data, ...state.projects],
                total: state.total + 1,
            }));
            return data.data;
        } catch (err) {
            const message = err instanceof Error ? err.message
                : typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : 'Failed to create project.';
            set({ error: message });
            throw err;
        }
    },

    deleteProject: async (id) => {
        set({ error: null });
        // Optimistic update for instant feedback
        const previous = get().projects;
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
        try {
            await apiClient.delete(`/projects/${id}`);
            set((state) => ({ total: state.total - 1 }));
        } catch (err) {
            // Revert on failure
            set({ projects: previous });
            const message = err instanceof Error ? err.message
                : typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : 'Failed to delete project.';
            set({ error: message });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
