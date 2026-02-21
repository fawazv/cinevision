/**
 * Script parsing service — orchestrates the full pipeline:
 *   1. Fetch raw script text from Cloudinary
 *   2. Parse structure (Fountain / FDX / TXT)
 *   3. AI-extract 3D scene data per scene
 *   4. Persist scenes to MongoDB
 *   5. Update Script status
 */

import axios from 'axios';
import { Script } from '../models/script.model.js';
import { Scene } from '../models/scene.model.js';
import { AppError } from '../middleware/error-handler.js';
import { parseFountain, parseTxt, extractFdxText } from '../utils/fountain.parser.js';
import { extractAllScenes } from './gemini.service.js';
import { getSignedUrl } from './cloudinary.service.js';
import type { PublicScene } from '../types/scene.types.js';
import type { SceneDocument } from '../models/scene.model.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPublicScene(doc: SceneDocument): PublicScene {
    return {
        id: doc.id as string,
        sceneNumber: doc.sceneNumber,
        heading: doc.heading,
        environment: doc.environment,
        lighting: doc.lighting,
        characters: doc.characters,
        props: doc.props,
        cameraSuggestions: doc.cameraSuggestions,
        script: doc.script,
        project: doc.project,
        owner: doc.owner,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

/**
 * Fetch script text from Cloudinary using a signed URL.
 */
async function fetchScriptText(cloudinaryPublicId: string): Promise<string> {
    const signedUrl = getSignedUrl(cloudinaryPublicId, 300); // 5-min window

    const response = await axios.get<string>(signedUrl, {
        responseType: 'text',
        timeout: 30_000,
    }) as { data: string };

    return response.data;
}

// ─── Core Parse Pipeline ──────────────────────────────────────────────────────

interface ParseResult {
    savedScenes: PublicScene[];
    failedScenes: number[];
    totalScenes: number;
    title: string;
}

/**
 * Parse a script by ID and extract 3D scene data using AI.
 * This is an owner-scoped operation.
 */
export async function parseScript(
    scriptId: string,
    ownerId: string,
): Promise<ParseResult> {
    // 1. Find and validate script ownership
    const script = await Script.findOne({ _id: scriptId, owner: ownerId }).exec();
    if (script === null) {
        throw new AppError('Script not found', 404, 'NOT_FOUND');
    }

    if (script.status === 'parsing') {
        throw new AppError(
            'This script is already being parsed',
            409,
            'ALREADY_PARSING',
        );
    }

    // Mark as parsing
    script.status = 'parsing';
    await script.save();

    try {
        // 2. Fetch raw script text from Cloudinary
        const rawText = await fetchScriptText(script.cloudinaryPublicId);

        // 3. Parse structure based on format
        let parsed;
        if (script.format === 'fdx') {
            const extracted = extractFdxText(rawText);
            parsed = parseFountain(extracted);
        } else if (script.format === 'fountain' || script.format === 'txt') {
            parsed = parseTxt(rawText);
        } else {
            // PDF — currently treated as plain text extraction (best effort)
            // In a production system you'd use a PDF-to-text library here
            parsed = parseTxt(rawText);
        }

        if (parsed.totalScenes === 0) {
            throw new AppError(
                'No scenes found in this script. Ensure it uses Fountain format scene headings (INT./EXT.).',
                422,
                'NO_SCENES_FOUND',
            );
        }

        // 4. Delete any previously parsed scenes for this script (re-parse scenario)
        await Scene.deleteMany({ script: scriptId }).exec();

        // 5. AI-extract per-scene data
        const { scenes: parsedScenes, failedScenes } = await extractAllScenes(
            parsed.elements,
            parsed.totalScenes,
        );

        // 6. Persist scenes to MongoDB
        const sceneDocs = parsedScenes.map((s) => ({
            sceneNumber: s.sceneNumber,
            heading: s.heading,
            environment: s.environment,
            lighting: s.lighting,
            characters: s.characters,
            props: s.props,
            cameraSuggestions: s.cameraSuggestions,
            script: scriptId,
            project: script.project,
            owner: ownerId,
        }));

        const inserted = await Scene.insertMany(sceneDocs, { ordered: false });

        // 7. Update script status
        script.status = failedScenes.length === parsed.totalScenes ? 'failed' : 'parsed';
        await script.save();

        return {
            savedScenes: inserted.map(toPublicScene),
            failedScenes,
            totalScenes: parsed.totalScenes,
            title: parsed.title,
        };
    } catch (err) {
        // Ensure status is reverted to 'failed' on any error
        script.status = 'failed';
        await script.save();
        throw err;
    }
}

// ─── Scene Queries ────────────────────────────────────────────────────────────

/**
 * List all parsed scenes for a script (owner-scoped, ordered by sceneNumber).
 */
export async function listScenes(
    scriptId: string,
    ownerId: string,
): Promise<PublicScene[]> {
    const scenes = await Scene.find({ script: scriptId, owner: ownerId })
        .sort({ sceneNumber: 1 })
        .exec();

    return scenes.map(toPublicScene);
}

/**
 * Get a single scene by ID (owner-scoped).
 */
export async function getSceneById(
    sceneId: string,
    ownerId: string,
): Promise<PublicScene> {
    const scene = await Scene.findOne({ _id: sceneId, owner: ownerId }).exec();
    if (scene === null) {
        throw new AppError('Scene not found', 404, 'NOT_FOUND');
    }
    return toPublicScene(scene);
}
