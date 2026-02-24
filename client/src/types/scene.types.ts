export interface LightConfig {
    type: 'directional' | 'point' | 'spot' | 'hemisphere' | 'ambient';
    color: string;
    intensity: number;
    position?: [number, number, number];
    castShadow?: boolean;
}

export interface SceneLighting {
    timeOfDay: string;
    key: LightConfig;
    fill?: LightConfig;
    ambient: LightConfig;
    practicals: LightConfig[];
    mood: string;
}

export interface SceneCharacter {
    name: string;
    position: [number, number, number];
    facing?: [number, number, number];
    description?: string;
    action?: string;
}

export interface SceneProp {
    type: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    properties?: string[];
}

export interface CameraSuggestion {
    shotType: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'pov' | 'aerial';
    angle: 'eye-level' | 'low' | 'high' | 'birds-eye' | 'dutch';
    movement: 'static' | 'pan' | 'tilt' | 'tracking' | 'dolly' | 'crane' | 'handheld';
    focalLength: number;
    position: [number, number, number];
    target: [number, number, number];
    notes?: string;
}

export interface SceneEnvironment {
    type: string;
    subType?: string;
    ground: string;
    weather?: string;
    skyType?: string;
}

export interface ParsedSceneData {
    id: string;
    sceneNumber: number;
    heading: string;
    environment: SceneEnvironment;
    lighting: SceneLighting;
    characters: SceneCharacter[];
    props: SceneProp[];
    cameraSuggestions: CameraSuggestion[];
}
