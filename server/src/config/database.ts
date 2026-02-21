/**
 * MongoDB connection management.
 *
 * Provides a `connectDatabase` function that establishes a Mongoose connection
 * and a `disconnectDatabase` function for graceful shutdown.
 */

import mongoose from 'mongoose';
import { env } from './env.js';

// Mongoose 7+ returns proper ES module compatible output
mongoose.set('strictQuery', true);

/**
 * Opens the MongoDB connection.
 * Resolves when the connection is established; rejects on failure.
 */
export async function connectDatabase(): Promise<void> {
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected');
    });

    mongoose.connection.on('error', (err: Error) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
    });

    await mongoose.connect(env.mongodbUri, {
        // Let Mongoose handle connection pooling defaults
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5_000,
        socketTimeoutMS: 45_000,
    });
}

/**
 * Closes the MongoDB connection gracefully.
 * Should be called during server shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
}

/**
 * Returns the current Mongoose connection state as a human-readable string.
 */
export function getDatabaseState(): string {
    const states: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] ?? 'unknown';
}
