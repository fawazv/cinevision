import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: '*',   // Accept proxied requests from Vercel
            methods: ['GET', 'POST', 'OPTIONS'],
            credentials: false,
        },
        // Allow polling transport (Vercel proxy doesn't support WebSocket upgrades)
        transports: ['polling', 'websocket'],
        allowEIO3: true,
    });

    const projectNamespace = io.of('/project');

    projectNamespace.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected to /project: ${socket.id}`);

        socket.on('join_project', (projectId: string) => {
            void socket.join(projectId);
            console.log(`🔌 Client ${socket.id} joined project room: ${projectId}`);
        });

        socket.on('leave_project', (projectId: string) => {
            void socket.leave(projectId);
            console.log(`🔌 Client ${socket.id} left project room: ${projectId}`);
        });

        // Broadcast cursor movements to everyone else in the project room
        socket.on('cursor_move', (data: { projectId: string; x: number; y: number; user: string; color: string }) => {
            socket.to(data.projectId).emit('cursor_moved', {
                userId: socket.id,
                x: data.x,
                y: data.y,
                user: data.user,
                color: data.color
            });
        });

        socket.on('disconnect', () => {
            console.log(`🛑 Client disconnected from /project: ${socket.id}`);
        });
    });

    return io;
}

export function getSocketServer(): Server {
    if (!io) {
        throw new Error('Socket.io not initialized. Please call initSocketServer first.');
    }
    return io;
}
