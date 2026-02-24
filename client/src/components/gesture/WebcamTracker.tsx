import { useState, useCallback } from 'react';
import { useGestureTracking } from '../../hooks/useGestureTracking';
import type { GestureState } from '../../types/gesture.types';
import { Hand, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import './WebcamTracker.css';

interface WebcamTrackerProps {
    onGesture: (state: GestureState) => void;
}

export function WebcamTracker({ onGesture }: WebcamTrackerProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentGesture, setCurrentGesture] = useState<string>('NONE');

    // We wrap the parent callback so we can also drive our local UI state
    const handleFrame = useCallback(
        (state: GestureState) => {
            setCurrentGesture(state.isTracking ? state.gesture : 'No Hand Detected');
            onGesture(state);
        },
        [onGesture]
    );

    const { videoRef, isReady, initError, onVideoPlay } = useGestureTracking({
        onFrame: handleFrame,
        enabled: isActive,
    });

    if (initError) {
        return (
            <div className="tracker-panel error glass-panel">
                <AlertCircle size={24} className="error-icon" />
                <p className="error-text">{initError}</p>
            </div>
        );
    }

    return (
        <div className={clsx('tracker-panel glass-panel', isActive && 'active')}>
            <div className="tracker-header">
                <div className="tracker-title">
                    <Hand size={18} className="text-accent" />
                    <h4>Gesture Control</h4>
                </div>

                <button
                    className={clsx('toggle-btn', isActive ? 'btn-danger' : 'btn-primary')}
                    onClick={() => setIsActive(!isActive)}
                    disabled={!isReady}
                >
                    {!isReady ? (
                        <><Loader2 size={16} className="spin" /> Loading AI...</>
                    ) : isActive ? (
                        'Stop Tracking'
                    ) : (
                        'Enable Webcam'
                    )}
                </button>
            </div>

            {isActive && isReady && (
                <div className="tracker-body fade-in">
                    <div className="video-container">
                        {/* 
              We mirror the video (scaleX(-1)) because users expect a mirror.
              Note: MediaPipe parses raw coordinates, so logic downstream may need
              to account for mirroring if mapping to screen X/Y globally.
            */}
                        <video
                            ref={videoRef}
                            onPlay={onVideoPlay}
                            playsInline
                            muted
                            className="webcam-feed"
                        />

                        {/* Overlay Status */}
                        <div className="gesture-status">
                            <span className="status-dot tracking"></span>
                            {currentGesture.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="gesture-legend">
                        <p>✊ <b>Fist</b>: Orbit Camera</p>
                        <p>✋ <b>Palm</b>: Pan Camera</p>
                        <p>👌 <b>Pinch</b>: Zoom Camera</p>
                    </div>
                </div>
            )}
        </div>
    );
}
