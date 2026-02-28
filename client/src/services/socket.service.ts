import { io, Socket } from 'socket.io-client';

/**
 * Socket.IO service for real-time collaboration.
 *
 * Architecture:
 *   Frontend (Vercel HTTPS) → Vercel Rewrite Proxy → EC2 Backend (HTTP)
 *
 * We force "polling" transport because Vercel can proxy normal HTTP
 * requests but cannot upgrade them to raw WebSockets.
 * The polling fallback works perfectly for cursor tracking & events.
 */
class SocketService {
    private socket: Socket | null = null;

    /**
     * Establish a persistent connection to the /project namespace.
     * Uses the current origin ('' = same host) so Vercel's rewrite
     * proxy at /socket.io/* forwards traffic to EC2 seamlessly.
     */
    public connect(): Socket {
        if (!this.socket) {
            this.socket = io('/project', {
                // Force HTTP long-polling — Vercel can't proxy WebSocket upgrades
                transports: ['polling'],
                withCredentials: false,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('🔗 [Socket.IO] Connected:', this.socket?.id);
            });

            this.socket.on('connect_error', (err) => {
                console.warn('⚠️ [Socket.IO] Connection error:', err.message);
            });

            this.socket.on('disconnect', () => {
                console.log('❌ [Socket.IO] Disconnected');
            });
        }
        return this.socket;
    }

    /**
     * Close the connection
     */
    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Get the active socket instance
     */
    public getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketService = new SocketService();

