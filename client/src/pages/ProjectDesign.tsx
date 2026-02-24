import { SceneViewer } from '../components/3d/SceneViewer';
import { WebcamTracker } from '../components/gesture/WebcamTracker';
import type { ParsedSceneData } from '../types/scene.types';
import type { GestureState } from '../types/gesture.types';

const DUMMY_SCENE: ParsedSceneData = {
    id: '123',
    sceneNumber: 1,
    heading: 'INT. UNDERGROUND BUNKER - NIGHT',
    environment: {
        type: 'indoor',
        ground: 'concrete',
        skyType: 'night'
    },
    lighting: {
        timeOfDay: 'night',
        key: { type: 'spot', color: '#ffffff', intensity: 1.5, position: [0, 5, 0], castShadow: true },
        ambient: { type: 'ambient', color: '#20242d', intensity: 0.3 },
        practicals: [
            { type: 'point', color: '#f59e0b', intensity: 1, position: [-2, 2, -2], castShadow: true }
        ],
        mood: 'tense'
    },
    characters: [
        { name: 'ALEX', position: [0, 0, 0], facing: [0, 0, 1] },
        { name: 'SAM', position: [1.5, 0, 1.5], facing: [-1, 0, -1] }
    ],
    props: [
        { type: 'table', position: [0, 0, 1], scale: [1, 1, 1] },
        { type: 'chair', position: [0, 0, -0.5], scale: [1, 1, 1] }
    ],
    cameraSuggestions: [
        {
            shotType: 'medium',
            angle: 'eye-level',
            movement: 'static',
            focalLength: 35,
            position: [0, 1.6, -4],
            target: [0, 1.2, 0]
        },
        {
            shotType: 'close-up',
            angle: 'low',
            movement: 'static',
            focalLength: 50,
            position: [0.5, 1.0, -2],
            target: [0, 1.6, 0]
        }
    ]
};

export function ProjectDesign() {
    const handleGesture = (state: GestureState) => {
        // For now, just log the gesture to prove the pipeline works
        if (state.isTracking && state.gesture !== 'NONE') {
            console.log('Gesture detected:', state.gesture, state.position);
        }
    };

    return (
        <div className="fade-in" style={{ width: '100%', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <header>
                <h2>Project Design</h2>
                <p className="text-muted">3D Scene Viewer & MediaPipe Demonstration</p>
            </header>

            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', padding: 0, position: 'relative' }}>
                <SceneViewer sceneData={DUMMY_SCENE} />

                {/* Floating Webcam Overlay for Gesture Control */}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
                    <WebcamTracker onGesture={handleGesture} />
                </div>
            </div>
        </div>
    );
}
