import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraSuggestion } from '../../types/scene.types';
import { useGestureStore } from '../../store/gesture.store';

interface CameraRigProps {
    suggestions: CameraSuggestion[];
    activeCameraIndex: number;
}

export function CameraRig({ suggestions, activeCameraIndex }: CameraRigProps) {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    // Track previous gesture state for calculating movement deltas
    const prevGestureRef = useRef<{ gesture: string; position: { x: number; y: number } } | null>(null);

    // Get the currently active AI-suggested camera pose (fallback to first if invalid)
    const activeSuggestion = suggestions[activeCameraIndex] || suggestions[0];

    useEffect(() => {
        if (activeSuggestion) {
            const { position, target } = activeSuggestion;

            // Cut directly to the AI's suggested position
            camera.position.set(position[0], position[1], position[2]);

            if (controlsRef.current) {
                controlsRef.current.target.set(target[0], target[1], target[2]);
                controlsRef.current.update();
            } else {
                camera.lookAt(target[0], target[1], target[2]);
            }
        }
    }, [activeSuggestion, camera]);

    // Frame loop for translating Gesture state into Camera modifications
    useFrame(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        // Use .getState() to poll cleanly within the requestAnimationFrame loop
        const currentState = useGestureStore.getState().currentGesture;

        // If tracking lost or hand at rest, reset our delta baseline
        if (!currentState || !currentState.isTracking || currentState.gesture === 'NONE') {
            prevGestureRef.current = null;
            return;
        }

        const currentPos = currentState.position;

        // If we have a continuous tracking frame of the *same* gesture, calculate physical delta
        if (prevGestureRef.current && prevGestureRef.current.gesture === currentState.gesture) {
            const prevPos = prevGestureRef.current.position;

            // MediaPipe coordinates are normalized 0.0 - 1.0. 
            // X is mirrored (webcam natural feel), Y goes down screen = positive.
            const dx = -(currentPos.x - prevPos.x);
            const dy = currentPos.y - prevPos.y;

            // Sensitivities adjusted for the 0.0-1.0 scale
            const SENSITIVITY_ORBIT = 3.5;
            const SENSITIVITY_PAN = 6.0;
            const SENSITIVITY_ZOOM = 15.0;

            // Ignore tiny micro-jitters (deadzone)
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0.002) {
                switch (currentState.gesture) {
                    case 'CLOSED_FIST':
                        // Orbit: rotate camera spherically around the target point
                        {
                            const offset = new THREE.Vector3().copy(camera.position).sub(controls.target);
                            const spherical = new THREE.Spherical().setFromVector3(offset);

                            // Shift azimuthal and polar angles
                            spherical.theta -= dx * SENSITIVITY_ORBIT;
                            spherical.phi -= dy * SENSITIVITY_ORBIT;

                            // Constrain polar angle so we don't flip upside down
                            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

                            offset.setFromSpherical(spherical);
                            camera.position.copy(controls.target).add(offset);
                            controls.update(); // Sync OrbitControls internal state
                        }
                        break;

                    case 'OPEN_PALM':
                        // Pan: move target and camera together linearly
                        {
                            // Calculate relative "right" and "up" axes from the camera's current perspective
                            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
                            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

                            const panVec = new THREE.Vector3()
                                .addScaledVector(right, -dx * SENSITIVITY_PAN)
                                .addScaledVector(up, -dy * SENSITIVITY_PAN);

                            camera.position.add(panVec);
                            controls.target.add(panVec);
                            controls.update();
                        }
                        break;

                    case 'PINCH':
                        // Zoom: slide camera forward/backward along line of sight based on Vertical (dy) hand movement
                        {
                            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                            // Moving pinched hand UP zooms IN (forward direction). Moving down zooms OUT.
                            const zoomVec = new THREE.Vector3().addScaledVector(forward, -dy * SENSITIVITY_ZOOM);

                            camera.position.add(zoomVec);
                            controls.update();
                        }
                        break;
                }
            }
        }

        // Save baseline for the next frame
        prevGestureRef.current = {
            gesture: currentState.gesture,
            position: { ...currentPos }
        };
    });

    if (!activeSuggestion) return <OrbitControls ref={controlsRef} enableDamping />;

    return (
        <>
            <PerspectiveCamera
                makeDefault
                fov={activeSuggestion.focalLength === 50 ? 45 : (35 / activeSuggestion.focalLength) * 45}
                position={activeSuggestion.position}
            />
            <OrbitControls
                ref={controlsRef}
                target={new THREE.Vector3(...activeSuggestion.target)}
                makeDefault
                enableDamping
                dampingFactor={0.1}
            />
        </>
    );
}
