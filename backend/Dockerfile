# Production Dockerfile for ReliefNet Backend (Node.js + Express + Socket.IO)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Set production environment variables
ENV NODE_ENV=production \
    PORT=5000

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
