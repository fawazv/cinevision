import { useRef } from 'react';
import type { SceneProp } from '../../types/scene.types';
import * as THREE from 'three';

interface PropProps {
    propData: SceneProp;
}

export function Prop({ propData }: PropProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { type, position, rotation = [0, 0, 0], scale = [1, 1, 1] } = propData;

    // Render different basic shapes based on the prop type keyword
    const typeLower = type.toLowerCase();

    let geometry;
    let yOffset = 0; // To keep objects sitting on the floor

    // Very basic heuristic for placeholder shapes
    if (typeLower.includes('table') || typeLower.includes('desk')) {
        geometry = <boxGeometry args={[2, 0.1, 1]} />;
        yOffset = 0.75;
    } else if (typeLower.includes('chair') || typeLower.includes('seat')) {
        geometry = <boxGeometry args={[0.5, 0.5, 0.5]} />;
        yOffset = 0.25;
    } else if (typeLower.includes('tree') || typeLower.includes('plant')) {
        geometry = <coneGeometry args={[0.5, 2, 8]} />;
        yOffset = 1;
    } else if (typeLower.includes('car') || typeLower.includes('vehicle')) {
        geometry = <boxGeometry args={[2, 1, 4]} />;
        yOffset = 0.5;
    } else {
        // Default generic box
        geometry = <boxGeometry args={[1, 1, 1]} />;
        yOffset = 0.5;
    }

    // Adjust position array to include the heuristic Y offset
    const finalPosition: [number, number, number] = [
        position[0],
        position[1] + yOffset,
        position[2]
    ];

    return (
        <mesh
            ref={meshRef}
            position={finalPosition}
            rotation={new THREE.Euler(...rotation)}
            scale={new THREE.Vector3(...scale)}
            castShadow
            receiveShadow
        >
            {geometry}
            <meshStandardMaterial color="#9ca3af" roughness={0.8} />
        </mesh>
    );
}
