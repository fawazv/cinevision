/**
 * Type-safe environment configuration.
 *
 * Reads from process.env (populated by Node's --env-file flag or the OS).
 * Validates all required variables at startup — the server will refuse to boot
 * if any are missing, preventing silent misconfiguration in production.
 */

interface EnvConfig {
    readonly port: number;
    readonly nodeEnv: 'development' | 'production' | 'test';
    readonly mongodbUri: string;
    readonly jwtSecret: string;
    readonly jwtExpiresIn: string;
    readonly cloudinaryCloudName: string;
    readonly cloudinaryApiKey: string;
    readonly cloudinaryApiSecret: string;
    readonly geminiApiKey: string;
    readonly aiModel: string;
    readonly clientUrl: string;
}

function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value.trim();
}

function getOptionalEnv(key: string, defaultValue: string): string {
    const value = process.env[key];
    return value?.trim() || defaultValue;
}

function parseNodeEnv(value: string): EnvConfig['nodeEnv'] {
    if (value === 'development' || value === 'production' || value === 'test') {
        return value;
    }
    throw new Error(
        `Invalid NODE_ENV: "${value}". Must be "development", "production", or "test".`,
    );
}

function loadEnvConfig(): EnvConfig {
    return Object.freeze({
        port: parseInt(getOptionalEnv('PORT', '5000'), 10),
        nodeEnv: parseNodeEnv(getOptionalEnv('NODE_ENV', 'development')),
        mongodbUri: getRequiredEnv('MONGODB_URI'),
        jwtSecret: getRequiredEnv('JWT_SECRET'),
        jwtExpiresIn: getOptionalEnv('JWT_EXPIRES_IN', '7d'),
        cloudinaryCloudName: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
        cloudinaryApiKey: getRequiredEnv('CLOUDINARY_API_KEY'),
        cloudinaryApiSecret: getRequiredEnv('CLOUDINARY_API_SECRET'),
        geminiApiKey: getRequiredEnv('GEMINI_API_KEY'),
        aiModel: getOptionalEnv('AI_MODEL', 'gemini-2.0-flash'),
        clientUrl: getOptionalEnv('CLIENT_URL', 'http://localhost:5173'),
    });
}

// Singleton — evaluated once when this module is first imported.
export const env: EnvConfig = loadEnvConfig();
