import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { RecognizedGesture } from '../types/gesture.types';

// The pre-trained model path provided via Google CDN.
const MODEL_ASSET_PATH = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

/**
 * Lazily initialize the MediaPipe Hand Landmarker WASM tools.
 */
export async function initializeHandLandmarker(): Promise<HandLandmarker> {
    if (handLandmarker) return handLandmarker;

    if (isInitializing) {
        // Wait incrementally if it's already initializing elsewhere
        while (!handLandmarker) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return handLandmarker!;
    }

    isInitializing = true;
    try {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: MODEL_ASSET_PATH,
                delegate: 'GPU', // Use WebGL/GPU acceleration
            },
            runningMode: 'VIDEO',
            numHands: 1, // Only tracking one dominant hand for now
            minHandDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.6,
        });

        return handLandmarker;
    } finally {
        isInitializing = false;
    }
}

/**
 * A rudimentary rule-based classifier for classifying hand landmarks
 * into high-level gestures (Open Palm, Closed Fist, Pinch, Pointing).
 */
export function classifyGesture(landmarks: { x: number; y: number; z: number }[]): RecognizedGesture {
    if (!landmarks || landmarks.length !== 21) return 'NONE';

    // Basic finger tip vs PIP (Proximal Interphalangeal) joint Y-axis comparisons.
    // In MediaPipe, Y goes down, so a lower Y value means it is higher physically on the screen.

    const isThumbExtended = findDistance(landmarks[4], landmarks[5]) > 0.05;
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isMiddleExtended = landmarks[12].y < landmarks[10].y;
    const isRingExtended = landmarks[16].y < landmarks[14].y;
    const isPinkyExtended = landmarks[20].y < landmarks[18].y;

    const extendedFingers = [isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended].filter(Boolean).length;

    // 1. PINCH Detection (Highest Priority)
    // Thumb tip (4) and Index tip (8) are very close.
    // We check this first because a pinch might still mathematically look like an OPEN_PALM 
    // depending on the other 3 fingers and camera angle.
    const pinchDist = findDistance(landmarks[4], landmarks[8]);
    if (pinchDist < 0.08) { // relaxed threshold from 0.05
        return 'PINCH';
    }

    // 2. CLOSED FIST
    if (extendedFingers === 0 || (extendedFingers === 1 && isThumbExtended)) {
        return 'CLOSED_FIST';
    }

    // 3. OPEN PALM
    if (extendedFingers >= 4) {
        return 'OPEN_PALM';
    }

    // 4. POINTING: Only index finger extended significantly
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
        return 'POINTING';
    }

    return 'NONE';
}

function findDistance(p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    // Ignoring Z for simple 2D screen distance approximation
    return Math.sqrt(dx * dx + dy * dy);
}
