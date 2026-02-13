# ─── Frontend Expo Web - Dockerfile ──────────────────────────────────────────
# Multi-stage build for the Expo/React Native Web frontend

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1: Dependencies
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --silent

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2: Build
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate API config for Docker environment
# The backend service is accessible via Docker network at http://backend:8000
# But the browser needs to access it via the host, so we use a dynamic approach
RUN echo '{\
  "api_base_url": "http://localhost:8000/api",\
  "backend_url": "http://localhost:8000",\
  "api_port": 8000,\
  "frontend_port": 8081,\
  "environment": "docker"\
}' > .api-config.json

# Build Expo for web
RUN npx expo export --platform web

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 3: Production with Nginx
# ═══════════════════════════════════════════════════════════════════════════════
FROM nginx:alpine AS frontend

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint for dynamic API URL injection
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
