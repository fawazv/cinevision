import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SceneViewer } from '../components/3d/SceneViewer';
import { WebcamTracker } from '../components/gesture/WebcamTracker';
import type { ParsedSceneData } from '../types/scene.types';
import type { GestureState } from '../types/gesture.types';
import { useGestureStore } from '../store/gesture.store';
import { exportStoryboardPDF, exportShotListCSV } from '../services/export.service';
import { apiClient } from '../api/client';
import { LiveCursors } from '../components/common/LiveCursors';
import { ArrowLeft, Loader2, AlertCircle, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import './ProjectDesign.css';

// ─── Scene Fetch Hook ─────────────────────────────────────────────────────────
function useSceneData(sceneId: string | undefined) {
    const [sceneData, setSceneData] = useState<ParsedSceneData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sceneId) return;
        setIsLoading(true);
        setError(null);

        apiClient.get(`/parse/scenes/${sceneId}`)
            .then((response) => {
                const data = response as unknown as { data: ParsedSceneData };
                setSceneData(data.data);
            })
            .catch((err: unknown) => {
                const message = typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : 'Failed to load scene.';
                setError(message);
            })
            .finally(() => setIsLoading(false));
    }, [sceneId]);

    return { sceneData, isLoading, error };
}

// ─── Camera Shot Selector ─────────────────────────────────────────────────────
function CameraShotSelector({
    sceneData,
    activeCameraIndex,
    onSelect,
}: {
    sceneData: ParsedSceneData;
    activeCameraIndex: number;
    onSelect: (idx: number) => void;
}) {
    const suggestions = sceneData.cameraSuggestions;
    if (!suggestions || suggestions.length <= 1) return null;

    return (
        <div className="camera-selector">
            <Camera size={14} className="camera-selector-icon" />
            <button
                className="camera-nav-btn"
                onClick={() => onSelect(Math.max(0, activeCameraIndex - 1))}
                disabled={activeCameraIndex === 0}
                title="Previous shot"
            >
                <ChevronLeft size={16} />
            </button>

            <div className="camera-pills">
                {suggestions.map((cam, idx) => (
                    <button
                        key={idx}
                        className={`camera-pill ${idx === activeCameraIndex ? 'active' : ''}`}
                        onClick={() => onSelect(idx)}
                        title={`${cam.shotType} — ${cam.angle}`}
                    >
                        <span>{cam.shotType}</span>
                    </button>
                ))}
            </div>

            <button
                className="camera-nav-btn"
                onClick={() => onSelect(Math.min(suggestions.length - 1, activeCameraIndex + 1))}
                disabled={activeCameraIndex === suggestions.length - 1}
                title="Next shot"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}

// ─── Main: Scene Designer ─────────────────────────────────────────────────────
export function ProjectDesign() {
    const { id: projectId, sceneId } = useParams<{ id: string; sceneId: string }>();
    const navigate = useNavigate();
    const { sceneData, isLoading, error } = useSceneData(sceneId);
    const [activeCameraIndex, setActiveCameraIndex] = useState(0);

    // Reset camera index when scene changes
    useEffect(() => setActiveCameraIndex(0), [sceneId]);

    const handleGesture = useCallback((state: GestureState) => {
        useGestureStore.getState().setGesture(state);
    }, []);

    // ── Loading State ──
    if (isLoading) {
        return (
            <div className="designer-loading fade-in">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading scene data from AI…</p>
            </div>
        );
    }

    // ── Error State ──
    if (error || !sceneData) {
        return (
            <div className="designer-error fade-in glass-panel">
                <AlertCircle size={28} />
                <h3>Failed to load scene</h3>
                <p>{error ?? 'Scene not found.'}</p>
                {projectId && (
                    <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}`)}>
                        <ArrowLeft size={14} /> Back to Project
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="project-designer fade-in">
            {/* Live Collaborative Cursors */}
            {projectId && <LiveCursors projectId={projectId} />}

            {/* ── Header Bar ─────────────────────────────── */}
            <header className="designer-header">
                <div className="designer-header-left">
                    {projectId && (
                        <Link to={`/projects/${projectId}`} className="back-link">
                            <ArrowLeft size={15} /> Project
                        </Link>
                    )}
                    <div className="scene-info">
                        <span className="scene-label">Scene {sceneData.sceneNumber}</span>
                        <h2 className="scene-title">{sceneData.heading}</h2>
                    </div>
                </div>

                <div className="designer-header-right">
                    <button
                        className="btn-secondary btn-sm"
                        onClick={() => exportShotListCSV([sceneData])}
                    >
                        Export CSV
                    </button>
                    <button
                        className="btn-primary btn-sm"
                        onClick={() => exportStoryboardPDF('cinevision-canvas', [sceneData])}
                    >
                        Export PDF
                    </button>
                </div>
            </header>

            {/* ── Scene Meta Tags ─────────────────────────── */}
            <div className="scene-tags">
                <span className="scene-tag">{sceneData.environment.type}</span>
                <span className="scene-tag">{sceneData.lighting.timeOfDay}</span>
                <span className="scene-tag mood">{sceneData.lighting.mood}</span>
                {sceneData.characters?.map((c) => (
                    <span key={c.name} className="scene-tag character">{c.name}</span>
                ))}
            </div>

            {/* ── Camera Selector ─────────────────────────── */}
            <CameraShotSelector
                sceneData={sceneData}
                activeCameraIndex={activeCameraIndex}
                onSelect={setActiveCameraIndex}
            />

            {/* ── 3D Viewer ──────────────────────────────── */}
            <div className="designer-canvas-wrap glass-panel">
                <SceneViewer
                    sceneData={sceneData}
                    activeCameraIndex={activeCameraIndex}
                />

                {/* Floating Webcam Gesture Overlay */}
                <div className="webcam-overlay">
                    <WebcamTracker onGesture={handleGesture} />
                </div>
            </div>
        </div>
    );
}
