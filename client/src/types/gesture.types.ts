/**
 * Defines the core gestures we will recognize from MediaPipe Hand landmarks
 * and how they translate to 3D scene actions.
 */

export type RecognizedGesture =
    | 'NONE'
    | 'OPEN_PALM'    // All fingers extended
    | 'CLOSED_FIST'  // All fingers folded
    | 'PINCH'        // Thumb and Index touching
    | 'POINTING';    // Only index finger extended

export type SceneAction =
    | 'IDLE'
    | 'ORBIT_CAMERA'   // Map to Closed Fist + movement
    | 'PAN_CAMERA'     // Map to Open Palm + movement
    | 'ZOOM_CAMERA'    // Map to Pinch distance change
    | 'SELECT_OBJECT'; // Map to Pointing

export interface GestureState {
    gesture: RecognizedGesture;
    // Normalized 3D coordinates [x, y, z] of the palm center or index tip
    position: { x: number; y: number; z: number };
    // Which hand is performing the gesture (useful if we support two hands later)
    handedness: 'Left' | 'Right';
    isTracking: boolean;
}

// Emitted when a gesture translates into an actionable intent
export interface ActionIntent {
    action: SceneAction;
    deltaX: number;
    deltaY: number;
    deltaZ: number; // For zooming
}
