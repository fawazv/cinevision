import { io, Socket } from 'socket.io-client';

// Use same fallback URL logic as apiClient
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

class SocketService {
    private socket: Socket | null = null;

    /**
     * Establish a persistent connection to the /project namespace
     */
    public connect(): Socket {
        if (!this.socket) {
            // we use the empty string (current origin) or the loaded URL.
            // io() takes the base URL and the /project namespace separately
            const connectionUrl = `${SOCKET_URL}/project`;

            this.socket = io(connectionUrl, {
                withCredentials: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('🔗 [Socket.IO] Connected:', this.socket?.id);
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
