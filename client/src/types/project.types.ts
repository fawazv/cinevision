// Project types mirroring the backend Project model

export type ProjectStatus = 'development' | 'pre-production' | 'production' | 'post-production' | 'completed';
export type ProjectGenre = 'drama' | 'comedy' | 'thriller' | 'horror' | 'sci-fi' | 'action' | 'documentary' | 'other';

export interface Project {
    id: string;
    title: string;
    description?: string;
    genre: ProjectGenre;
    status: ProjectStatus;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectPayload {
    title: string;
    description?: string;
    genre: ProjectGenre;
    status?: ProjectStatus;
}

export interface ProjectsListResponse {
    projects: Project[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
