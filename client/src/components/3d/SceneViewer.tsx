import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EnvironmentBuilder } from './EnvironmentBuilder';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { Character } from './Character';
import { Prop } from './Prop';
import type { ParsedSceneData } from '../../types/scene.types';

interface SceneViewerProps {
    sceneData: ParsedSceneData;
}

export function SceneViewer({ sceneData }: SceneViewerProps) {
    const [activeCameraIndex] = useState(0);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
            <Canvas id="cinevision-canvas" shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
                <Suspense fallback={null}>
                    <EnvironmentBuilder
                        environment={sceneData.environment}
                        lighting={sceneData.lighting}
                    />

                    <LightingRig lighting={sceneData.lighting} />

                    <CameraRig
                        suggestions={sceneData.cameraSuggestions || []}
                        activeCameraIndex={activeCameraIndex}
                    />

                    {/* Render Characters */}
                    {sceneData.characters?.map((char, idx) => (
                        <Character key={`char-${idx}`} character={char} />
                    ))}

                    {/* Render Props */}
                    {sceneData.props?.map((prop, idx) => (
                        <Prop key={`prop-${idx}`} propData={prop} />
                    ))}
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    pointerEvents: 'none',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                    Scene {sceneData.sceneNumber}: {sceneData.heading}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    {sceneData.cameraSuggestions[activeCameraIndex]?.shotType.toUpperCase() || 'DEFAULT'} SHOT
                </p>
            </div>
        </div>
    );
}
