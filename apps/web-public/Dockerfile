FROM oven/bun:1 AS builder

WORKDIR /app

# Accept build arguments for Vite
ARG VITE_API_BASE_URL
ARG VITE_JWT_ACCESS_TTL
ARG VITE_APP_NAME

# Set environment variables for the build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_JWT_ACCESS_TTL=${VITE_JWT_ACCESS_TTL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Copy workspace configs
COPY package.json bun.lock turbo.json ./

# Copy packages and web-public app source
COPY packages ./packages
COPY apps/web-public ./apps/web-public

# Install dependencies
RUN bun install

# Build the app
WORKDIR /app
RUN bun run build --filter=web-public

# Runner stage
FROM nginx:alpine AS runner

# Copy built static files to Nginx public directory
COPY --from=builder /app/apps/web-public/dist /usr/share/nginx/html

# Configure Nginx for SPA (React Router) fallback
RUN printf "server {\n\
    listen 3000;\n\
    server_name localhost;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
