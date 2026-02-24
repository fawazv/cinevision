import type { SceneLighting, LightConfig } from '../../types/scene.types';

interface LightingRigProps {
    lighting: SceneLighting;
}

function renderLight(light: LightConfig, name: string) {
    const { type, color, intensity, position = [0, 10, 0], castShadow } = light;

    switch (type) {
        case 'directional':
            return (
                <directionalLight
                    key={name}
                    color={color}
                    intensity={intensity}
                    position={position}
                    castShadow={castShadow}
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
            );
        case 'point':
            return (
                <pointLight
                    key={name}
                    color={color}
                    intensity={intensity}
                    position={position}
                    castShadow={castShadow}
                />
            );
        case 'spot':
            return (
                <spotLight
                    key={name}
                    color={color}
                    intensity={intensity}
                    position={position}
                    castShadow={castShadow}
                    angle={0.5}
                    penumbra={1}
                />
            );
        case 'hemisphere':
            return (
                <hemisphereLight
                    key={name}
                    color={color}
                    groundColor="#444444"
                    intensity={intensity}
                />
            );
        case 'ambient':
            return <ambientLight key={name} color={color} intensity={intensity} />;
        default:
            return null;
    }
}

export function LightingRig({ lighting }: LightingRigProps) {
    return (
        <group name="LightingRig">
            {/* Ambient */}
            {lighting.ambient && renderLight(lighting.ambient, 'ambientLight')}

            {/* Key Light */}
            {lighting.key && renderLight(lighting.key, 'keyLight')}

            {/* Fill Light (optional) */}
            {lighting.fill && renderLight(lighting.fill, 'fillLight')}

            {/* Practicals */}
            {lighting.practicals?.map((practical, idx) =>
                renderLight(practical, `practical_${idx}`)
            )}
        </group>
    );
}
