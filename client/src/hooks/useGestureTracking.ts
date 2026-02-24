import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeHandLandmarker, classifyGesture } from '../services/gesture.service';
import type { GestureState } from '../types/gesture.types';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

interface UseGestureTrackingProps {
    onFrame: (state: GestureState) => void;
    enabled?: boolean;
}

export function useGestureTracking({ onFrame, enabled = true }: UseGestureTrackingProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number | null>(null);
    const [initError, setInitError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize MediaPipe
    useEffect(() => {
        let active = true;
        initializeHandLandmarker()
            .then((landmarker) => {
                if (!active) return;
                landmarkerRef.current = landmarker;
                setIsReady(true);
            })
            .catch((err) => {
                console.error('Failed to initialize MediaPipe HandLandmarker:', err);
                setInitError('Failed to load gesture tracking AI model.');
            });

        return () => {
            active = false;
            // We don't close the landmarker here immediately because 
            // it might be shared across components or re-mounted quickly.
        };
    }, []);

    // Set up the webcam stream
    useEffect(() => {
        if (!enabled || !isReady || !videoRef.current) return;

        let stream: MediaStream | null = null;
        let active = true;

        navigator.mediaDevices
            .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
            .then((s) => {
                if (!active) {
                    s.getTracks().forEach((track) => track.stop());
                    return;
                }
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(console.error);
                }
            })
            .catch((err) => {
                console.error('Webcam permission denied:', err);
                setInitError('Webcam access was denied.');
            });

        return () => {
            active = false;
            if (stream) stream.getTracks().forEach((track) => track.stop());
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [enabled, isReady]);

    // Main Detection Loop
    const detectHands = useCallback(() => {
        if (!videoRef.current || !landmarkerRef.current || !enabled) return;

        // Ensure video has actual frames to read
        if (videoRef.current.readyState >= 2 && videoRef.current.currentTime > 0) {
            const results = landmarkerRef.current.detectForVideo(
                videoRef.current,
                performance.now()
            );

            if (results.landmarks && results.landmarks.length > 0) {
                // We only care about the primary hand for now [0]
                const landmarks = results.landmarks[0];
                const handednessList = results.handednesses[0];

                const gesture = classifyGesture(landmarks);

                // Use Palm center (landmark 0 - wrist, or roughly average) 
                // We'll just use landmark 9 (middle finger MCP) as a stable center point.
                const center = landmarks[9];

                const state: GestureState = {
                    gesture,
                    position: center,
                    handedness: handednessList[0].categoryName as 'Left' | 'Right',
                    isTracking: true,
                };

                onFrame(state);
            } else {
                // No hands in frame
                onFrame({
                    gesture: 'NONE',
                    position: { x: 0, y: 0, z: 0 },
                    handedness: 'Right',
                    isTracking: false,
                });
            }
        }

        // Schedule next frame
        requestRef.current = requestAnimationFrame(detectHands);
    }, [enabled, onFrame]);

    // Start loop when video is playing
    const onVideoPlay = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(detectHands);
    };

    return {
        videoRef,
        isReady,
        initError,
        onVideoPlay
    };
}
