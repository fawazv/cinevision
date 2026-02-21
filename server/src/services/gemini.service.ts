/**
 * Mock Parsing Service — completely local, no API calls.
 *
 * This generates plausible 3D scene data instantly by doing basic
 * string matching on the script elements. Perfect for local development
 * without hitting API limits or incurring costs.
 */

import { AppError } from '../middleware/error-handler.js';
import type { ParsedSceneData, ScreenplayElement, SceneEnvironment, SceneCharacter, CameraSuggestion, SceneLighting, SceneProp } from '../types/scene.types.js';

// ─── Scene Text Builder ────────────────────────────────────────────────────────

function getSceneElements(
    elements: ScreenplayElement[],
    sceneNumber: number,
): ScreenplayElement[] {
    return elements.filter((e) => e.sceneNumber === sceneNumber);
}

// ─── Mock Generator ───────────────────────────────────────────────────────────

export async function extractSceneData(
    elements: ScreenplayElement[],
    sceneNumber: number,
): Promise<ParsedSceneData> {
    const sceneElements = getSceneElements(elements, sceneNumber);

    if (sceneElements.length === 0) {
        throw new AppError(
            `Scene ${sceneNumber} has no content to parse`,
            400,
            'EMPTY_SCENE',
        );
    }

    const headingEl = sceneElements.find((e) => e.type === 'scene_heading');
    const heading = headingEl ? headingEl.text : `SCENE ${sceneNumber}`;
    const headingUpper = heading.toUpperCase();

    // 1. Guess Environment
    const isExterior = headingUpper.includes('EXT.');
    const environment: SceneEnvironment = {
        type: isExterior ? 'outdoor' : 'indoor',
        subType: heading.replace(/^(INT\.|EXT\.|INT\/EXT\.)/, '').trim() || 'Room',
        ground: isExterior ? 'dirt' : 'floorboards',
    };
    if (isExterior) {
        environment.weather = 'clear';
        environment.skyType = 'day';
    }

    // 2. Guess Lighting
    const isNight = headingUpper.includes('NIGHT') || headingUpper.includes('DARK');
    const lighting: SceneLighting = {
        timeOfDay: isNight ? 'night' : 'day',
        key: {
            type: 'directional',
            color: isNight ? '#4b6584' : '#fff5e6', // Blueish vs warm
            intensity: isNight ? 0.8 : 1.5,
            position: [10, 20, 10],
            castShadow: true,
        },
        ambient: {
            type: 'ambient',
            color: '#ffffff',
            intensity: isNight ? 0.1 : 0.4,
        },
        practicals: [],
        mood: isNight ? 'moody' : 'neutral',
    };

    // 3. Extract Characters
    // Look for unique character names in this scene
    const characterMap = new Map<string, SceneCharacter>();
    let charIndex = 0;

    for (const el of sceneElements) {
        if (el.type === 'character') {
            // Clean up name (remove V.O. / O.S. parentheticals often found on same line)
            const cleanName = el.text.replace(/\s*\(.*?\)/g, '').trim();

            if (!characterMap.has(cleanName)) {
                characterMap.set(cleanName, {
                    name: cleanName,
                    // Place characters in a line along the X axis
                    position: [charIndex * 2 - 2, 0, 0],
                    facing: [0, 0, 1], // Facing the camera
                    description: 'Mocked character',
                    action: 'Standing idly',
                });
                charIndex++;
            }
        }
    }

    const characters = Array.from(characterMap.values());

    // 4. Create basic props and camera
    const props: SceneProp[] = [];
    const cameraSuggestions: CameraSuggestion[] = [
        {
            shotType: 'wide',
            angle: 'eye-level',
            movement: 'static',
            focalLength: 35,
            position: [0, 1.6, -8], // Camera far back, looking at center
            target: [0, 1.0, 0],
            notes: 'Establishing wide shot',
        },
        {
            shotType: 'medium',
            angle: 'eye-level',
            movement: 'tracking',
            focalLength: 50,
            position: [0, 1.6, -4],
            target: characters.length > 0 ? characters[0].position : [0, 1.0, 0],
            notes: 'Medium following action',
        }
    ];

    // Optional fast network delay purely to simulate "work" being done (e.g., 20ms)
    await new Promise((res) => setTimeout(res, 20));

    return {
        sceneNumber,
        heading,
        environment,
        lighting,
        characters,
        props,
        cameraSuggestions,
    };
}

export async function extractAllScenes(
    elements: ScreenplayElement[],
    totalScenes: number,
): Promise<{ scenes: ParsedSceneData[]; failedScenes: number[] }> {
    const scenes: ParsedSceneData[] = [];
    const failedScenes: number[] = [];

    // Instant parsing without rate limits!
    for (let i = 1; i <= totalScenes; i++) {
        try {
            const scene = await extractSceneData(elements, i);
            scenes.push(scene);
        } catch (err) {
            console.error(`⚠️ Failed to parse scene ${i}:`, err instanceof Error ? err.message : err);
            failedScenes.push(i);
        }
    }

    return { scenes, failedScenes };
}
