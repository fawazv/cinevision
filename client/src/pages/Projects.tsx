import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/project.store';
import {
    PlusCircle, Film, Trash2, Loader2, FolderOpen, AlertCircle
} from 'lucide-react';
import type { Project, CreateProjectPayload, ProjectGenre, ProjectStatus } from '../types/project.types';
import './Projects.css';

// ─── Genre & Status Options ───────────────────────────────────────────────────
const GENRES: ProjectGenre[] = ['drama', 'comedy', 'thriller', 'horror', 'sci-fi', 'action', 'documentary', 'other'];
const STATUSES: ProjectStatus[] = ['development', 'pre-production', 'production', 'post-production', 'completed'];

const STATUS_COLORS: Record<ProjectStatus, string> = {
    development: 'status-dev',
    'pre-production': 'status-pre',
    production: 'status-prod',
    'post-production': 'status-post',
    completed: 'status-done',
};

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
    const navigate = useNavigate();

    return (
        <article className="project-card glass-panel" onClick={() => navigate(`/projects/${project.id}`)}>
            <div className="card-genre-badge">{project.genre}</div>

            <div className="card-header">
                <div className="card-icon"><Film size={20} /></div>
                <h3 className="card-title">{project.title}</h3>
            </div>

            {project.description && (
                <p className="card-description">{project.description}</p>
            )}

            <div className="card-footer">
                <span className={`status-chip ${STATUS_COLORS[project.status ?? 'development']}`}>
                    {(project.status ?? 'development').replace('-', ' ')}
                </span>
                <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                    title="Delete project"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </article>
    );
}

// ─── Create Project Modal ─────────────────────────────────────────────────────
function CreateProjectModal({ onClose }: { onClose: () => void }) {
    const { createProject } = useProjectStore();
    const [form, setForm] = useState<CreateProjectPayload>({
        title: '',
        description: '',
        genre: 'drama',
        status: 'development',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fillWithExample = () => {
        const examples: CreateProjectPayload[] = [
            { title: 'The Silent Orbit', description: 'A psychological thriller about an astronaut stranded on a space station, who begins hearing voices from the dark side of the moon.', genre: 'sci-fi', status: 'development' },
            { title: 'Neon Shadows', description: 'In a cyberpunk metropolis, a rogue AI detective must solve the murder of their creator before their memory banks are remotely wiped.', genre: 'action', status: 'pre-production' },
            { title: 'Midnight at the Oasis', description: 'A quirky indie comedy following three strangers who accidentally steal a cursed vintage car and are forced on a road trip across the desert.', genre: 'comedy', status: 'development' },
            { title: 'Whispering Pines', description: 'A supernatural horror taking place in a secluded cabin, where the trees surrounding the property seem to move closer every night.', genre: 'horror', status: 'production' },
            { title: 'The Last Symphony', description: 'A historical drama about a deaf composer fighting to finish his masterpiece while the city falls under siege during World War II.', genre: 'drama', status: 'development' },
        ];
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        setForm(randomExample);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        setIsSubmitting(true);
        setError(null);
        try {
            await createProject(form);
            onClose();
        } catch {
            setError('Failed to create project. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop fade-in" onClick={handleBackdropClick}>
            <div className="modal-card glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>New Project</h2>
                    <button type="button" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={fillWithExample}>
                        ✨ Fill Example
                    </button>
                </div>

                {error && (
                    <div className="modal-error">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label className="field-label">Project Title *</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="The Last Transmission"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Description</label>
                        <textarea
                            className="input-field"
                            placeholder="Brief logline or synopsis..."
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">Genre</label>
                            <select
                                className="input-field"
                                value={form.genre}
                                onChange={(e) => setForm({ ...form, genre: e.target.value as ProjectGenre })}
                            >
                                {GENRES.map((g) => (
                                    <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field-group">
                            <label className="field-label">Status</label>
                            <select
                                className="input-field"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 size={14} className="spin" /> Creating...</> : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteConfirmModal({ project, onConfirm, onCancel }: {
    project: Project;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="modal-backdrop fade-in" onClick={onCancel}>
            <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Delete Project?</h2>
                <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
                    Are you sure you want to permanently delete <strong style={{ color: 'hsl(var(--text-main))' }}>"{project.title}"</strong>?
                    This action cannot be undone.
                </p>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn-danger" onClick={onConfirm}>Delete Project</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export function Projects() {
    const { projects, isLoading, error, fetchProjects, deleteProject } = useProjectStore();
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteProject(deleteTarget.id);
        setDeleteTarget(null);
    };

    return (
        <div className="projects-page fade-in">
            <header className="projects-header">
                <div>
                    <h2>My Projects</h2>
                    <p className="text-muted">
                        {isLoading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreate(true)}>
                    <PlusCircle size={18} />
                    New Project
                </button>
            </header>

            {error && (
                <div className="page-error glass-panel">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="loading-grid">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-state glass-panel">
                    <FolderOpen size={48} className="empty-icon" />
                    <h3>No projects yet</h3>
                    <p>Create your first pre-visualization project to get started.</p>
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <PlusCircle size={16} /> Create First Project
                    </button>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={(id) => setDeleteTarget(projects.find((p) => p.id === id) ?? null)}
                        />
                    ))}
                </div>
            )}

            {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
            {deleteTarget && (
                <DeleteConfirmModal
                    project={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
