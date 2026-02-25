import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Cpu, Clapperboard, Play, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/project.store';
import { useScriptStore } from '../store/script.store';
import { ScriptUploader } from '../components/upload/ScriptUploader';
import type { Script } from '../types/script.types';
import './ProjectDetail.css';

type Tab = 'scripts' | 'scenes' | 'storyboard';

// ─── Scene Card ───────────────────────────────────────────────────────────────
function SceneCard({ scene, projectId }: { scene: import('../types/script.types').SceneSummary; projectId: string }) {
    const navigate = useNavigate();
    return (
        <article
            className="scene-card glass-panel"
            onClick={() => navigate(`/projects/${projectId}/scene/${scene.id}`)}
        >
            <div className="scene-number">Scene {scene.sceneNumber}</div>
            <h3 className="scene-heading">{scene.heading}</h3>
            <div className="scene-meta">
                <span className="scene-tag">{scene.environment.type}</span>
                <span className="scene-tag">{scene.lighting.timeOfDay}</span>
                <span className="scene-tag mood">{scene.lighting.mood}</span>
            </div>
            <div className="scene-footer">
                <span>{scene.characters.length} character{scene.characters.length !== 1 ? 's' : ''}</span>
                <span>{scene.cameraSuggestions[0]?.shotType ?? 'default'} shot</span>
            </div>
        </article>
    );
}

// ─── Script Row ───────────────────────────────────────────────────────────────
function ScriptRow({
    script,
    onParse,
    onLoadScenes,
    isParsing,
    isLoadingScenes,
}: {
    script: Script;
    onParse: (id: string) => void;
    onLoadScenes: (id: string) => void;
    isParsing: boolean;
    isLoadingScenes: boolean;
}) {
    const statusClass = {
        uploaded: 'status-uploaded',
        parsing: 'status-parsing',
        parsed: 'status-parsed',
        failed: 'status-failed',
    }[script.status];

    return (
        <div className="script-row glass-panel">
            <div className="script-row-left">
                <FileText size={18} className="script-icon" />
                <div>
                    <p className="script-name">{script.originalName ?? script.filename}</p>
                    <p className="script-date">{new Date(script.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="script-row-right">
                <span className={`parse-status ${statusClass}`}>{script.status}</span>

                {script.status === 'uploaded' || script.status === 'failed' ? (
                    <button
                        className="btn-primary btn-sm"
                        onClick={() => onParse(script.id)}
                        disabled={isParsing}
                    >
                        {isParsing ? <><Loader2 size={12} className="spin" /> Parsing…</> : <><Cpu size={12} /> Parse with AI</>}
                    </button>
                ) : script.status === 'parsing' ? (
                    <span className="parsing-spinner"><Loader2 size={14} className="spin" /> Parsing…</span>
                ) : (
                    <button
                        className="btn-secondary btn-sm"
                        onClick={() => onLoadScenes(script.id)}
                        disabled={isLoadingScenes}
                    >
                        {isLoadingScenes ? <><Loader2 size={12} className="spin" /> Loading…</> : <><Play size={12} /> View Scenes</>}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main ProjectDetail Page ──────────────────────────────────────────────────
export function ProjectDetail() {
    const { id: projectId } = useParams<{ id: string }>();
    const { projects, fetchProjects } = useProjectStore();
    const {
        scripts, scenes,
        isLoadingScripts, isLoadingScenes,
        isUploading, isParsing,
        uploadProgress, parseError,
        fetchScripts, uploadScript, triggerParse, fetchScenes,
    } = useScriptStore();

    const [activeTab, setActiveTab] = useState<Tab>('scripts');
    const [activeScriptId, setActiveScriptId] = useState<string | null>(null);

    const project = projects.find((p) => p.id === projectId);

    useEffect(() => {
        if (!projectId) return;
        if (projects.length === 0) fetchProjects();
        fetchScripts(projectId);
    }, [projectId, fetchProjects, fetchScripts, projects.length]);

    const handleUpload = useCallback(async (file: File) => {
        if (!projectId) return;
        await uploadScript(projectId, file);
    }, [projectId, uploadScript]);

    const handleParse = useCallback(async (scriptId: string) => {
        setActiveScriptId(scriptId);
        await triggerParse(scriptId);
        // Auto-load scenes and switch tab after parsing starts
        await fetchScenes(scriptId);
        setActiveTab('scenes');
    }, [triggerParse, fetchScenes]);

    const handleLoadScenes = useCallback(async (scriptId: string) => {
        setActiveScriptId(scriptId);
        await fetchScenes(scriptId);
        setActiveTab('scenes');
    }, [fetchScenes]);

    const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
        { id: 'scripts', label: 'Scripts', icon: FileText },
        { id: 'scenes', label: `Scenes${scenes.length > 0 ? ` (${scenes.length})` : ''}`, icon: Clapperboard },
    ];

    return (
        <div className="project-detail fade-in">
            {/* Back nav */}
            <Link to="/projects" className="back-link">
                <ArrowLeft size={16} /> All Projects
            </Link>

            {/* Header */}
            <header className="detail-header">
                <div>
                    <h2>{project?.title ?? 'Project'}</h2>
                    <p className="text-muted">{project?.description ?? ''}</p>
                </div>
                {project && (
                    <span className="detail-genre-badge">{project.genre}</span>
                )}
            </header>

            {/* Tabs */}
            <div className="detail-tabs">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`tab-btn ${activeTab === id ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="detail-content">
                {/* ── Scripts Tab ── */}
                {activeTab === 'scripts' && (
                    <div className="scripts-tab">
                        <div className="tab-section">
                            <h3 className="section-title">Upload Screenplay</h3>
                            <ScriptUploader
                                onUpload={handleUpload}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                            />
                        </div>

                        {parseError && (
                            <div className="parse-error-banner">
                                <AlertCircle size={16} />
                                <span>{parseError}</span>
                            </div>
                        )}

                        <div className="tab-section">
                            <h3 className="section-title">Uploaded Scripts</h3>
                            {isLoadingScripts ? (
                                <div className="loading-row"><Loader2 className="spin" size={20} /> Loading scripts…</div>
                            ) : scripts.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>No scripts uploaded yet.</p>
                            ) : (
                                <div className="scripts-list">
                                    {scripts.map((s) => (
                                        <ScriptRow
                                            key={s.id}
                                            script={s}
                                            onParse={handleParse}
                                            onLoadScenes={handleLoadScenes}
                                            isParsing={isParsing && activeScriptId === s.id}
                                            isLoadingScenes={isLoadingScenes && activeScriptId === s.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Scenes Tab ── */}
                {activeTab === 'scenes' && (
                    <div className="scenes-tab">
                        {isLoadingScenes ? (
                            <div className="loading-row"><Loader2 className="spin" size={20} /> Loading scenes…</div>
                        ) : scenes.length === 0 ? (
                            <div className="empty-scenes">
                                <Clapperboard size={40} className="empty-icon" />
                                <p>No scenes parsed yet. Go to the Scripts tab and click <strong>Parse with AI</strong>.</p>
                            </div>
                        ) : (
                            <>
                                <div className="scenes-header-row">
                                    <p className="text-muted">{scenes.length} scene{scenes.length !== 1 ? 's' : ''} found</p>
                                    {activeScriptId && (
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => handleLoadScenes(activeScriptId)}
                                        >
                                            <RefreshCw size={12} /> Refresh
                                        </button>
                                    )}
                                </div>
                                <div className="scenes-grid">
                                    {scenes.map((scene) => (
                                        <SceneCard key={scene.id} scene={scene} projectId={projectId!} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
