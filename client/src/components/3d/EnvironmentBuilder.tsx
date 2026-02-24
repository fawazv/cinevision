import { Environment, Sky, Stars } from '@react-three/drei';
import type { SceneEnvironment, SceneLighting } from '../../types/scene.types';

interface EnvironmentBuilderProps {
    environment: SceneEnvironment;
    lighting: SceneLighting;
}

export function EnvironmentBuilder({ environment, lighting }: EnvironmentBuilderProps) {
    const isNight = lighting.timeOfDay.toLowerCase().includes('night') ||
        environment.skyType === 'night';

    const isSunset = environment.skyType === 'golden-hour' ||
        environment.skyType === 'dusk';

    return (
        <>
            {/* Sky System */}
            <Sky
                distance={450000}
                sunPosition={isNight ? [0, -10, 0] : isSunset ? [0, 5, -20] : [10, 20, 10]}
                inclination={isSunset ? 0.6 : 0.2}
                azimuth={0.25}
            />

            {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

            {/* Global IBL Environment matching mood/time */}
            <Environment preset={isNight ? "night" : isSunset ? "sunset" : "city"} />

            {/* Ground plane placeholder */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={environment.ground === 'dirt' ? '#5c4033' : '#a0a0a0'} />
            </mesh>

            {/* Grid helper for scale reference */}
            <gridHelper args={[100, 100, 0x000000, 0xaaaaaa]} position={[0, 0, 0]} material-opacity={0.2} material-transparent />
        </>
    );
}
