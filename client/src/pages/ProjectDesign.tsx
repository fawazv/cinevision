import { SceneViewer } from '../components/3d/SceneViewer';
import type { ParsedSceneData } from '../types/scene.types';

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
    return (
        <div className="fade-in" style={{ width: '100%', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <header>
                <h2>Project Design</h2>
                <p className="text-muted">3D Scene Viewer Demonstration</p>
            </header>

            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
                <SceneViewer sceneData={DUMMY_SCENE} />
            </div>
        </div>
    );
}
