import { useEffect, useState, useRef } from 'react';
import { socketService } from '../../services/socket.service';
import { MousePointer2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface CursorData {
    userId: string;
    x: number;
    y: number;
    user: string;
    color: string;
}

const CURSOR_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#06B6D4', '#3B82F6', '#6366F1', '#D946EF', '#F43F5E'
];

export function LiveCursors({ projectId }: { projectId: string }) {
    const { user } = useAuthStore();
    const [cursors, setCursors] = useState<Record<string, CursorData>>({});
    const myColor = useRef(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

    useEffect(() => {
        if (!projectId || !user) return;

        const socket = socketService.connect();

        // Join the specific project room
        socket.emit('join_project', projectId);

        // Listen for other people moving their mice
        socket.on('cursor_moved', (data: CursorData) => {
            setCursors(prev => ({
                ...prev,
                [data.userId]: data
            }));
        });

        // Cleanup on unmount
        return () => {
            socket.emit('leave_project', projectId);
            socket.off('cursor_moved');
            // We do NOT disconnect the whole service here, 
            // because we want it alive for other project pages.
        };
    }, [projectId, user]);

    // Track my own mouse and emit to others
    useEffect(() => {
        if (!projectId || !user) return;

        let frameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            // Throttle to requestAnimationFrame so we don't spam the server 60 times a second
            if (frameId) cancelAnimationFrame(frameId);

            frameId = requestAnimationFrame(() => {
                const socket = socketService.getSocket();
                if (socket?.connected) {
                    // Send normalized coordinates (0.0 to 1.0) relative to screen 
                    // so it works correctly across different screen resolutions
                    socket.emit('cursor_move', {
                        projectId,
                        x: e.clientX / window.innerWidth,
                        y: e.clientY / window.innerHeight,
                        user: user.name,
                        color: myColor.current
                    });
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [projectId, user]);

    return (
        <div className="live-cursors" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
            {Object.values(cursors).map(cursor => (
                <div
                    key={cursor.userId}
                    style={{
                        position: 'absolute',
                        // Convert normalized coordinates back to actual screen pixels
                        left: cursor.x * window.innerWidth,
                        top: cursor.y * window.innerHeight,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'left 0.1s linear, top 0.1s linear', // smooth interpolation
                    }}
                >
                    <MousePointer2
                        size={16}
                        fill={cursor.color}
                        color="white"
                        style={{ transform: 'rotate(-15deg)' }}
                    />
                    <div style={{ marginTop: '4px', backgroundColor: cursor.color, color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                        {cursor.user}
                    </div>
                </div>
            ))}
        </div>
    );
}
