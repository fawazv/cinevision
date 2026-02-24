import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { SceneCharacter } from '../../types/scene.types';

interface CharacterProps {
    character: SceneCharacter;
}

export function Character({ character }: CharacterProps) {
    const groupRef = useRef<THREE.Group>(null);
    const { name, position, facing } = character;

    // Simple placeholder: A pill shape for the character
    return (
        <group ref={groupRef} position={position}>
            {/* Body */}
            <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
                <capsuleGeometry args={[0.3, 1.2, 4, 16]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.7} />
            </mesh>

            {/* Head / Face indicator (so we know which way they point) */}
            <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#bfdbfe" />
            </mesh>

            {/* Nose/direction indicator */}
            {facing && (
                <mesh position={[facing[0] * 0.3, 1.6 + facing[1] * 0.3, facing[2] * 0.3]}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshStandardMaterial color="#1d4ed8" />
                </mesh>
            )}

            {/* Floating Name Label */}
            <Text
                position={[0, 2.2, 0]}
                fontSize={0.2}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
            >
                {name}
            </Text>
        </group>
    );
}
