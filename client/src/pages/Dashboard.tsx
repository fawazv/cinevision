import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Cpu, Clapperboard, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../api/client';
import './Dashboard.css';

interface ProjectSummary {
    id: string;
    title: string;
    genre: string;
    status: string;
    updatedAt: string;
}

interface DashboardStats {
    totalProjects: number;
    recentProjects: ProjectSummary[];
}

const GENRE_ICONS: Record<string, string> = {
    'sci-fi': '🚀',
    thriller: '🔪',
    drama: '🎭',
    comedy: '😂',
    horror: '👻',
    action: '💥',
    romance: '❤️',
    documentary: '🎥',
    animation: '✨',
    other: '🎬',
};

export function Dashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get<unknown>('/projects?limit=5').then((res: unknown) => {
            const r = res as { data: { items: ProjectSummary[]; pagination: { total: number } } };
            setStats({
                totalProjects: r.data.pagination.total,
                recentProjects: r.data.items,
            });
        }).catch(() => {
            // Error is auto-toasted by interceptor
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const greetingHour = new Date().getHours();
    const greeting =
        greetingHour < 12 ? 'Good morning' :
            greetingHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="dashboard fade-in">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h2 className="dashboard-greeting">
                        {greeting}, <span className="text-gradient-accent">{user?.name?.split(' ')[0] ?? 'Director'}</span> 👋
                    </h2>
                    <p className="dashboard-subtitle">Here's a snapshot of your studio activity.</p>
                </div>
                <Link to="/projects" className="btn-primary dashboard-cta">
                    <Plus size={16} />
                    New Project
                </Link>
            </header>

            {/* Stats Row */}
            <div className="dashboard-stats">
                <div className="stat-card glass-panel">
                    <Film size={24} className="stat-icon" />
                    <div>
                        <p className="stat-value">
                            {loading ? <Loader2 size={20} className="spin-inline" /> : stats?.totalProjects ?? 0}
                        </p>
                        <p className="stat-label">Total Projects</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <Cpu size={24} className="stat-icon stat-icon--ai" />
                    <div>
                        <p className="stat-value">AI-Powered</p>
                        <p className="stat-label">Scene Extraction</p>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <Clapperboard size={24} className="stat-icon stat-icon--3d" />
                    <div>
                        <p className="stat-value">3D Ready</p>
                        <p className="stat-label">Pre-Viz Studio</p>
                    </div>
                </div>
            </div>

            {/* Recent Projects */}
            <section className="dashboard-section">
                <div className="section-header-row">
                    <h3 className="section-title">Recent Projects</h3>
                    <Link to="/projects" className="see-all-link">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="dashboard-loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton-row glass-panel" />
                        ))}
                    </div>
                ) : stats?.recentProjects.length === 0 ? (
                    <div className="dashboard-empty glass-panel">
                        <p className="empty-msg">📽️ No projects yet.</p>
                        <Link to="/projects" className="btn-primary" style={{ marginTop: '1rem' }}>
                            <Plus size={16} /> Create your first project
                        </Link>
                    </div>
                ) : (
                    <div className="projects-list">
                        {stats?.recentProjects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="project-row glass-panel"
                            >
                                <span className="project-genre-icon">
                                    {GENRE_ICONS[project.genre] ?? '🎬'}
                                </span>
                                <div className="project-row-info">
                                    <span className="project-row-title">{project.title}</span>
                                    <span className="project-row-meta">
                                        {project.genre} · {new Date(project.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className={`status-pill status-pill--${project.status ?? 'development'}`}>
                                    {(project.status ?? 'development').replace('-', ' ')}
                                </span>
                                <ArrowRight size={16} className="project-row-arrow" />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
