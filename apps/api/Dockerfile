FROM oven/bun:1 AS builder

WORKDIR /app

# Copy the monorepo root config files
COPY package.json bun.lock turbo.json ./

# Copy packages and the API app source
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies for the whole workspace
RUN bun install

# Generate Prisma Client
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN bun prisma:generate

# Build the API app
WORKDIR /app/apps/api
RUN bun run build

# Runner stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# The API_PORT environment variable
ENV API_PORT=4000
ENV NODE_ENV=production

# Copy root workspace configurations
COPY --from=builder /app/package.json /app/bun.lock ./

# Copy node_modules and built dist from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

# Expose the API port
EXPOSE ${API_PORT}

# Start the application
CMD ["bun", "dist/main.js"]
