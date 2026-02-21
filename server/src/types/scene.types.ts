/**
 * TypeScript types for the Scene domain.
 *
 * These types represent the structured data extracted from a screenplay
 * by the AI parsing pipeline.
 */

import type { Types } from 'mongoose';

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface LightConfig {
    type: 'directional' | 'point' | 'spot' | 'hemisphere' | 'ambient';
    color: string;         // hex string e.g. "#fff5e6"
    intensity: number;     // 0.0–2.0
    position?: [number, number, number];
    castShadow?: boolean;
}

export interface SceneLighting {
    timeOfDay: string;
    key: LightConfig;
    fill?: LightConfig;
    ambient: LightConfig;
    /** Practical lights — torches, lamps, screens, etc. */
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
    type: string;               // forest, office, rooftop, etc.
    subType?: string;
    ground: string;             // dirt, concrete, grass, water, etc.
    weather?: string;           // clear, foggy, rain, snow
    skyType?: string;
}

// ─── Parsed Scene ─────────────────────────────────────────────────────────────

/** The structured data for a single scene, as extracted by the AI. */
export interface ParsedSceneData {
    sceneNumber: number;
    heading: string;
    environment: SceneEnvironment;
    lighting: SceneLighting;
    characters: SceneCharacter[];
    props: SceneProp[];
    cameraSuggestions: CameraSuggestion[];
}

// ─── Public Shape ─────────────────────────────────────────────────────────────

export interface PublicScene {
    id: string;
    sceneNumber: number;
    heading: string;
    environment: SceneEnvironment;
    lighting: SceneLighting;
    characters: SceneCharacter[];
    props: SceneProp[];
    cameraSuggestions: CameraSuggestion[];
    script: string | Types.ObjectId;
    project: string | Types.ObjectId;
    owner: string | Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Fountain Structural Types ────────────────────────────────────────────────

export type ScreenplayElementType =
    | 'scene_heading'
    | 'action'
    | 'character'
    | 'dialogue'
    | 'parenthetical'
    | 'transition'
    | 'note';

export interface ScreenplayElement {
    type: ScreenplayElementType;
    text: string;
    sceneNumber: number;
}

export interface ParsedScreenplay {
    title: string;
    elements: ScreenplayElement[];
    totalScenes: number;
}
