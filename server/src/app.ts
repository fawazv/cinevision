/**
 * Express application factory.
 *
 * The `app` is exported separately from the `server.ts` entry point so it
 * can be imported in tests without starting an HTTP listener.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import projectsRouter from './routes/project.routes.js';
import scriptsRouter from './routes/script.routes.js';
import { globalErrorHandler, notFoundHandler } from './middleware/error-handler.js';

// ─── Create App ──────────────────────────────────────────────────────────────

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS — only allow the configured client origin
app.use(
    cors({
        origin: env.clientUrl,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
);

// ─── Request Parsing ─────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────

// Use concise 'dev' format in development, structured 'combined' in production
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/scripts', scriptsRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
// Order matters: 404 handler must come after all routes,
// and the global error handler must be last.

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
