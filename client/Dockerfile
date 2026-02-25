# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# Use a full Node image to compile the React app with Vite.
# The output is a folder of static files (HTML, CSS, JS).
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (leverages Docker layer cache)
COPY package.json package-lock.json ./

# Install all dependencies (including Vite, TypeScript, etc.)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the production bundle.
# Output will be in /app/dist (a folder of static files).
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production Image (Nginx)
# Nginx is a blazing-fast, battle-tested web server.
# We use it to serve our static files.
# The final image is ~25MB — much smaller than a Node image.
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy our built React app into the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (handles client-side routing for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx serves on port 80 by default
EXPOSE 80

# Nginx daemon starts automatically in this image
CMD ["nginx", "-g", "daemon off;"]
