import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Script, SceneSummary } from '../types/script.types';

interface ScriptStore {
    scripts: Script[];
    scenes: SceneSummary[];
    isLoadingScripts: boolean;
    isLoadingScenes: boolean;
    isUploading: boolean;
    isParsing: boolean;
    uploadProgress: number;
    parseError: string | null;
    fetchScripts: (projectId: string) => Promise<void>;
    uploadScript: (projectId: string, file: File) => Promise<Script>;
    triggerParse: (scriptId: string) => Promise<void>;
    fetchScenes: (scriptId: string) => Promise<void>;
    clearScenes: () => void;
}

export const useScriptStore = create<ScriptStore>((set) => ({
    scripts: [],
    scenes: [],
    isLoadingScripts: false,
    isLoadingScenes: false,
    isUploading: false,
    isParsing: false,
    uploadProgress: 0,
    parseError: null,

    fetchScripts: async (projectId) => {
        set({ isLoadingScripts: true });
        try {
            const response = await apiClient.get(`/scripts?projectId=${projectId}`);
            const data = response as unknown as { data: Script[] };
            set({ scripts: data.data, isLoadingScripts: false });
        } catch {
            set({ isLoadingScripts: false });
        }
    },

    uploadScript: async (projectId, file) => {
        set({ isUploading: true, uploadProgress: 0 });
        const formData = new FormData();
        formData.append('script', file);
        formData.append('projectId', projectId);

        try {
            const response = await apiClient.post('/scripts/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => {
                    const progress = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
                    set({ uploadProgress: progress });
                },
            });
            const data = response as unknown as { data: Script };
            set((state) => ({
                scripts: [data.data, ...state.scripts],
                isUploading: false,
                uploadProgress: 100,
            }));
            return data.data;
        } catch (err: unknown) {
            set({ isUploading: false });
            throw err;
        }
    },

    triggerParse: async (scriptId) => {
        set({ isParsing: true, parseError: null });
        try {
            await apiClient.post(`/parse/${scriptId}`);
            // Parsing is async on the server: poll scenes after a brief delay
            await new Promise((r) => setTimeout(r, 2000));
            set({ isParsing: false });
        } catch (err: unknown) {
            const message = typeof err === 'object' && err !== null && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Parsing failed.';
            set({ isParsing: false, parseError: message });
        }
    },

    fetchScenes: async (scriptId) => {
        set({ isLoadingScenes: true });
        try {
            const response = await apiClient.get(`/parse/${scriptId}/scenes`);
            const data = response as unknown as { data: SceneSummary[] };
            set({ scenes: data.data, isLoadingScenes: false });
        } catch {
            set({ isLoadingScenes: false });
        }
    },

    clearScenes: () => set({ scenes: [] }),
}));
