// Script and parsed scene types — mirrors the backend models

export type ScriptStatus = 'uploaded' | 'parsing' | 'parsed' | 'failed';

export interface Script {
    id: string;
    projectId: string;
    filename: string;
    originalName: string;
    format: string;
    cloudinaryUrl: string;
    status: ScriptStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ScriptListResponse {
    scripts: Script[];
}

// Lightweight scene summary for the list view
export interface SceneSummary {
    id: string;
    sceneNumber: number;
    heading: string;
    environment: { type: string; skyType: string };
    lighting: { timeOfDay: string; mood: string };
    characters: { name: string }[];
    cameraSuggestions: { shotType: string; angle: string }[];
}
