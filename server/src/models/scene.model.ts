/**
 * Scene Mongoose model.
 *
 * Stores AI-extracted 3D pre-visualization data for a single screenplay scene.
 */

import mongoose, {
    Schema,
    type Document,
    type Model,
    type Types,
} from 'mongoose';
import type {
    SceneEnvironment,
    SceneLighting,
    SceneCharacter,
    SceneProp,
    CameraSuggestion,
} from '../types/scene.types.js';

// ─── Document Interface ───────────────────────────────────────────────────────

export interface SceneDocument extends Document {
    id: string;
    sceneNumber: number;
    heading: string;
    environment: SceneEnvironment;
    lighting: SceneLighting;
    characters: SceneCharacter[];
    props: SceneProp[];
    cameraSuggestions: CameraSuggestion[];
    script: Types.ObjectId;
    project: Types.ObjectId;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface SceneModel extends Model<SceneDocument> { }

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const lightConfigSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['directional', 'point', 'spot', 'hemisphere', 'ambient'],
            required: true,
        },
        color: { type: String, required: true },
        intensity: { type: Number, required: true, min: 0, max: 2 },
        position: { type: [Number], default: undefined },
        castShadow: { type: Boolean, default: false },
    },
    { _id: false },
);

const lightingSchema = new Schema(
    {
        timeOfDay: { type: String, required: true },
        key: { type: lightConfigSchema, required: true },
        fill: { type: lightConfigSchema, default: undefined },
        ambient: { type: lightConfigSchema, required: true },
        practicals: { type: [lightConfigSchema], default: [] },
        mood: { type: String, required: true },
    },
    { _id: false },
);

const vec3Schema = { type: [Number], default: undefined };

const characterSchema = new Schema(
    {
        name: { type: String, required: true },
        position: { type: [Number], required: true },
        facing: vec3Schema,
        description: { type: String },
        action: { type: String },
    },
    { _id: false },
);

const propSchema = new Schema(
    {
        type: { type: String, required: true },
        position: { type: [Number], required: true },
        rotation: vec3Schema,
        scale: vec3Schema,
        properties: { type: [String], default: [] },
    },
    { _id: false },
);

const cameraSuggestionSchema = new Schema(
    {
        shotType: {
            type: String,
            enum: ['wide', 'medium', 'close-up', 'extreme-close-up', 'pov', 'aerial'],
            required: true,
        },
        angle: {
            type: String,
            enum: ['eye-level', 'low', 'high', 'birds-eye', 'dutch'],
            required: true,
        },
        movement: {
            type: String,
            enum: ['static', 'pan', 'tilt', 'tracking', 'dolly', 'crane', 'handheld'],
            required: true,
        },
        focalLength: { type: Number, required: true },
        position: { type: [Number], required: true },
        target: { type: [Number], required: true },
        notes: { type: String },
    },
    { _id: false },
);

const environmentSchema = new Schema(
    {
        type: { type: String, required: true },
        subType: { type: String },
        ground: { type: String, required: true },
        weather: { type: String },
        skyType: { type: String },
    },
    { _id: false },
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const sceneSchema = new Schema<SceneDocument, SceneModel>(
    {
        sceneNumber: { type: Number, required: true, min: 1 },
        heading: { type: String, required: true, trim: true },
        environment: { type: environmentSchema, required: true },
        lighting: { type: lightingSchema, required: true },
        characters: { type: [characterSchema], default: [] },
        props: { type: [propSchema], default: [] },
        cameraSuggestions: { type: [cameraSuggestionSchema], default: [] },
        script: {
            type: Schema.Types.ObjectId,
            ref: 'Script',
            required: true,
            index: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret: Record<string, unknown>) {
                ret['_id'] = undefined;
                return Object.fromEntries(
                    Object.entries(ret).filter(([, v]) => v !== undefined),
                );
            },
        },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Fast ordered listing of all scenes in a script
sceneSchema.index({ script: 1, sceneNumber: 1 }, { unique: true });

// ─── Export ───────────────────────────────────────────────────────────────────

export const Scene = mongoose.model<SceneDocument, SceneModel>('Scene', sceneSchema);
