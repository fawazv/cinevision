/**
 * Server entry point.
 *
 * Responsibilities:
 *  1. Connect to MongoDB
 *  2. Start the HTTP listener
 *  3. Handle graceful shutdown (SIGTERM / SIGINT)
 *  4. Catch unhandled promise rejections / uncaught exceptions
 */

import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// ─── Unhandled Errors (must be set up before any async work) ─────────────────

process.on('uncaughtException', (err: Error) => {
    console.error('💥 UNCAUGHT EXCEPTION — shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// ─── Bootstrap ───────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
    // Connect to database first — fail fast if unreachable
    await connectDatabase();

    const server = app.listen(env.port, () => {
        console.log(`🚀 Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────────

    async function shutdown(signal: string): Promise<void> {
        console.log(`\n${signal} received — shutting down gracefully...`);

        // Stop accepting new connections
        server.close(async () => {
            console.log('🔴 HTTP server closed');
            await disconnectDatabase();
            process.exit(0);
        });

        // Force-kill if graceful shutdown takes too long (10 s)
        setTimeout(() => {
            console.error('⏱️  Graceful shutdown timed out — forcing exit');
            process.exit(1);
        }, 10_000).unref();
    }

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
        console.error('💥 UNHANDLED REJECTION — shutting down...');
        console.error(reason);
        server.close(() => process.exit(1));
    });
}

// Entry point — top-level await is valid in ESM
await bootstrap();
