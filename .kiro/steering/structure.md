# Project Structure

## Monorepo Layout

```
TalenCore/
  backend/                  # NestJS API (port 4000)
  frontend-admin/           # Next.js HR/Admin portal (port 3000)
  frontend-candidates/      # Next.js Candidate portal (port 3001)
  mobile-admin/             # Expo scaffold (not yet implemented)
  mobile-candidates/        # Expo scaffold (not yet implemented)
```

---

## Backend (`backend/src/`)

Standard NestJS feature-module pattern. Each domain lives in `src/modules/<name>/`:

```
src/
  app.module.ts             # Root module — imports all feature modules
  main.ts                   # Bootstrap: port 4000, CORS, cookieParser, ValidationPipe
  modules/
    <feature>/
      controllers/          # HTTP route handlers (one file per feature)
      services/             # Business logic (one file per feature)
      schemas/              # Mongoose schema + Document type + enums
      dtos/                 # CreateXxxDto / UpdateXxxDto with class-validator decorators
      gateways/             # WebSocket gateway (only job-description has one)
      <feature>.module.ts
```

Current modules: `auth`, `users`, `job-description`, `pipeline-template`, `email-template`, `skills`, `positions`, `departments`

### Backend Conventions
- Schema enums live in the schema file and are exported for use in DTOs and services
- `CreateXxxDto` uses required fields; `UpdateXxxDto` repeats all fields as `@IsOptional()` (no `PartialType`)
- DTO validation messages are in Vietnamese
- `Types.ObjectId` used for all references between documents
- `@Schema({ timestamps: true })` on all schemas

---

## Frontend Apps (`frontend-admin/` and `frontend-candidates/`)

Both apps share an identical folder structure:

```
app/                        # Next.js App Router — thin pages only
  (auth)/                   # Route group: login, register
  (dashboard)/              # Route group: authenticated pages with layout shell
    <feature>/
      page.tsx              # Server Component — fetches initial data, passes to client component
src/
  features/                 # Feature-sliced design
    <feature>/
      components/           # React UI components ("use client" where needed)
      services/             # API call functions — named *.api.ts
      types/                # TypeScript interfaces mirroring backend schemas
  components/
    layout/                 # Sidebar, Topbar, Header, MobileMenu
  providers/
    AuthProvider.tsx        # React Context: user, isLoading, setUser, logout
  lib/
    api-client.ts           # Thin fetch wrapper: get/post/put/patch/delete
  config/
    env.config.ts           # Centralized env vars with fallbacks
public/                     # Static assets (logo, favicon, images)
```

### Frontend Conventions
- **Pages** (`app/`) are Server Components that fetch `initialData` via `fetch` with `cache: "no-store"`, then pass it down to a `"use client"` component for interactivity — this is the standard SSR+client hybrid pattern used throughout
- **`"use client"`** only on components that need interactivity (state, effects, events)
- `export default` for all page and component exports
- `export const metadata` for page metadata in Server Components
- `@/` path alias maps to the repo root of each app
- All API calls use `credentials: "include"` (cookie-based auth)
- Backend response envelope `{ message, data }` — service functions unwrap `.data` before returning
- No external state management — React Context + local `useState` only
- No React Query / SWR — raw fetch with local state

### Naming Conventions
- **Files**: kebab-case (`job-description.service.ts`, `api-client.ts`)
- **React components**: PascalCase files and named exports (`CandidateJobsClient.tsx`)
- **API service files**: `*.api.ts` suffix (`auth.api.ts`, `job-description.api.ts`)
- **Types files**: `*.types.ts` suffix

### Styling
- Tailwind CSS 4 utility classes throughout
- Dark theme: `slate-950` / `slate-900` backgrounds, `blue-600` / `indigo-500` accents
- Admin sidebar color: `#1e1b4b`, active nav item: `#4f46e5`
- Candidate portal background: `#020512` / `#0a0f1d`
