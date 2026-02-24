import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraSuggestion } from '../../types/scene.types';

interface CameraRigProps {
    suggestions: CameraSuggestion[];
    activeCameraIndex: number;
}

export function CameraRig({ suggestions, activeCameraIndex }: CameraRigProps) {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    // Get the currently active suggestion (fallback to first if invalid)
    const activeSuggestion = suggestions[activeCameraIndex] || suggestions[0];

    useEffect(() => {
        if (activeSuggestion) {
            const { position, target } = activeSuggestion;

            // Animate or teleport to the new position
            // For a simple viz, we just cut directly to the new position
            camera.position.set(position[0], position[1], position[2]);

            if (controlsRef.current) {
                controlsRef.current.target.set(target[0], target[1], target[2]);
                controlsRef.current.update();
            } else {
                camera.lookAt(target[0], target[1], target[2]);
            }
        }
    }, [activeSuggestion, camera]);

    if (!activeSuggestion) return <OrbitControls ref={controlsRef} />;

    return (
        <>
            <PerspectiveCamera
                makeDefault
                fov={activeSuggestion.focalLength === 50 ? 45 : (35 / activeSuggestion.focalLength) * 45} // rough approximation
                position={activeSuggestion.position}
            />
            <OrbitControls
                ref={controlsRef}
                target={new THREE.Vector3(...activeSuggestion.target)}
                makeDefault
            />
        </>
    );
}
