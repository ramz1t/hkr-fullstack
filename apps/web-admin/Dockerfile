FROM oven/bun:1 AS builder

WORKDIR /app

# Accept build arguments for Vite
ARG VITE_API_BASE_URL
ARG VITE_JWT_ACCESS_TTL
ARG VITE_APP_NAME
ARG VITE_BASE_URL

# Set environment variables for the build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_JWT_ACCESS_TTL=${VITE_JWT_ACCESS_TTL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_BASE_URL=${VITE_BASE_URL}

# Copy workspace configs
COPY package.json bun.lock turbo.json ./

# Copy packages and web-admin app source
COPY packages ./packages
COPY apps/web-admin ./apps/web-admin

# Install dependencies
RUN bun install

# Build the app
WORKDIR /app/apps/web-admin
RUN bun run build

# Runner stage
FROM nginx:alpine AS runner

# Copy built static files to Nginx public directory
COPY --from=builder /app/apps/web-admin/dist /usr/share/nginx/html

# Configure Nginx for SPA (React Router) fallback
RUN printf "server {\n\
    listen 3001;\n\
    server_name localhost;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
