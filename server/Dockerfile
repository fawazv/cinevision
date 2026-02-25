# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# Use a full Node image to compile TypeScript to JavaScript.
# This stage is NOT included in the final image — it's just for building.
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first (Docker caches this layer — only re-runs if these change)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies like typescript and tsx)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run the TypeScript compiler to produce JavaScript in /app/dist
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production Image
# This is the final, lean image that will actually run in the cloud.
# It ONLY contains what's needed to run the compiled server.
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the compiled output from Stage 1
COPY --from=builder /app/dist ./dist

# Copy package files and install ONLY production dependencies
# (no TypeScript compiler, no tsx, no types — much smaller image)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Tell Docker that this container listens on port 5000
EXPOSE 5000

# The command to run when the container starts.
# Note: We use --env-file to load env vars — in production, Kubernetes Secrets handle this.
CMD ["node", "dist/server.js"]
