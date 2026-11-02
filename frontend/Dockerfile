# ==========================================
# Stage 1: Build React/Vite SPA
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install dependencies (including devDependencies required for vite build)
RUN npm ci || npm install

# Copy source code and build config
COPY . .

# Build argument for API URL (defaults to /api which matches Nginx reverse proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle into /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve Production Assets with Nginx
# ==========================================
FROM nginx:alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built production assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
