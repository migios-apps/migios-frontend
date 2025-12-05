# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_PUBLIC_API_URL_V1
ARG VITE_APP_CLIENT_ID
ARG VITE_APP_CLIENT_SECRET
ARG VITE_BASENAME

# Set environment variables for build
ENV VITE_PUBLIC_API_URL_V1=${VITE_PUBLIC_API_URL_V1}
ENV VITE_APP_CLIENT_ID=${VITE_APP_CLIENT_ID}
ENV VITE_APP_CLIENT_SECRET=${VITE_APP_CLIENT_SECRET}
ENV VITE_BASENAME=${VITE_BASENAME}

# Build the application
# Change build:prod to build:staging or build:dev as needed
RUN npm run build:prod

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5737

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5737/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

