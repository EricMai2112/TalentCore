# Tech Stack

## Backend (`backend/`, port 4000)

- **Framework**: NestJS 11
- **Database**: MongoDB via Mongoose 9 (`@nestjs/mongoose`)
- **Auth**: JWT (`@nestjs/jwt`) + cookie-based sessions (`cookie-parser`); passwords hashed with `bcrypt`
- **Validation**: `class-validator` + `class-transformer`; global `ValidationPipe({ whitelist: true })` applied in `main.ts`
- **Real-time**: Socket.io 4 via `@nestjs/websockets` / `@nestjs/platform-socket.io`
- **Config**: `@nestjs/config` — reads `.env` via `ConfigService`; `ConfigModule.forRoot({ isGlobal: true })`
- **Language**: TypeScript 5

## frontend-admin (`frontend-admin/`, port 3000)

- **Framework**: Next.js (App Router), React 19 — **read `node_modules/next/dist/docs/` before writing Next.js code**
- **Styling**: Tailwind CSS 4 (PostCSS plugin)
- **Icons**: lucide-react
- **HTTP**: Native `fetch` wrapped in a custom `apiClient` singleton (`src/lib/api-client.ts`)
- **State**: React Context only (`AuthProvider`) — no external state library
- **Language**: TypeScript 5

## frontend-candidates (`frontend-candidates/`, port 3001)

- Same stack as `frontend-admin`
- **Real-time**: `socket.io-client` 4 — connects to backend for live job update events

## mobile-admin / mobile-candidates (scaffold only)

- **Framework**: Expo 57 + React Native 0.86 + Expo Router
- No real features implemented yet

## Common Commands

### Backend
```bash
npm run start:dev   # dev server with hot reload (nest start --watch)
npm run build       # nest build
npm run start:prod  # node dist/main
npm run lint        # eslint --fix
npm run test        # jest
npm run test:e2e    # jest --config ./test/jest-e2e.json
npm run format      # prettier --write
```

### frontend-admin
```bash
npm run dev         # next dev (port 3000)
npm run build       # next build
npm run start       # next start
npm run lint        # eslint
```

### frontend-candidates
```bash
npm run dev         # next dev -p 3001
npm run build       # next build
npm run start       # next start
npm run lint        # eslint
```

### mobile apps
```bash
npm run start       # expo start
npm run android     # expo start --android
npm run ios         # expo start --ios
```

## Port Map

| App                  | Port |
|----------------------|------|
| backend              | 4000 |
| frontend-admin       | 3000 |
| frontend-candidates  | 3001 |
| mobile (Expo)        | varies |

## Environment
Backend reads `MONGODB_URI` and `PORT` from `.env`. Frontends read API/socket URLs from `src/config/env.config.ts` (centralized env with fallbacks).
