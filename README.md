# hkr-fullstack

Turborepo monorepo — NestJS API, Vite/React player app, Vite/React admin dashboard, Next.js docs site.

**Package manager:** Bun · **Runtime:** Node ≥ 18

---

## Structure

| Path                | Description                            |
| ------------------- | -------------------------------------- |
| `apps/api`          | NestJS REST API (port 4000)            |
| `apps/web-public`   | Player-facing React app (port 5000)    |
| `apps/web-admin`    | Admin dashboard React app (port 5100)  |
| `apps/docs`         | Next.js documentation site (port 3000) |
| `packages/database` | Prisma schema + migrations             |
| `packages/types`    | Shared TypeScript types/DTOs           |
| `packages/ui`       | Shared React component library         |
| `packages/hooks`    | Shared React hooks                     |

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3
- Node ≥ 18
- PostgreSQL database

---

## Setup

### 1. Install dependencies

```sh
bun install
```

### 2. Configure environment

Copy and fill in each `.env.example`:

```sh
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web-public/.env.example apps/web-public/.env
cp apps/web-admin/.env.example apps/web-admin/.env
```

**Root `.env`** — shared with Prisma:

```
DATABASE_URL=<set-your-own>
```

**`apps/api/.env`:**

```
API_PORT=4000
DATABASE_URL=<set-your-own>
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5100
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800
```

**`apps/web-public/.env`:**

```
PORT=5000
VITE_API_BASE_URL=http://localhost:4000/api
VITE_JWT_ACCESS_TTL=900
VITE_APP_NAME=casinoapp
```

**`apps/web-admin/.env`:**

```
PORT=5100
VITE_API_BASE_URL=http://localhost:4000/api
VITE_JWT_ACCESS_TTL=900
VITE_APP_NAME=casinoapp
```

### 3. Generate Prisma client

```sh
bun run prisma:generate
```

### 4. Build prisma

```sh
bun --filter @repo/database build
```

### 5. Run database migrations

```sh
bun run prisma:migrate
```

### 6. (Optional) Seed the database

```sh
bun run prisma:seed
```

---

## Development

Start all apps in parallel:

```sh
bun run dev
```

Or run a single app:

```sh
bun run dev --filter api --filter web-public --filter web-admin
```

| App        | URL                                                                       |
| ---------- | ------------------------------------------------------------------------- |
| API        | http://localhost:4000/api                                                 |
| Swagger    | http://localhost:4000/swagger (add NODE_ENV=development to apps/api/.env) |
| Player app | http://localhost:5000                                                     |
| Admin app  | http://localhost:5100                                                     |

---

## Scripts

| Command                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `bun run dev`             | Start all apps in watch mode                |
| `bun run build`           | Build all apps and packages                 |
| `bun run lint`            | Lint all packages                           |
| `bun run check-types`     | Type-check all packages                     |
| `bun run format`          | Format all files with Prettier              |
| `bun run prisma:generate` | Regenerate Prisma client                    |
| `bun run prisma:migrate`  | Apply database migrations                   |
| `bun run prisma:seed`     | Seed the database                           |
| `bun run prisma:reset`    | Reset and re-seed the database              |
| `bun run clean`           | Remove all build artifacts and node_modules |

---

## Building for production

```sh
bun run build
```
