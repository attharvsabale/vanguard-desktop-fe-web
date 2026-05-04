# Initial Setup & Architecture Guide

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Nextron (Next.js + Electron) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Component Library | shadcn/ui (built on Radix UI) |
| HTTP Client | Axios (one instance, configured centrally) |
| Linting | ESLint + Prettier |

---

## Project Structure

```
vanguard-desktop-fe/
├── main/                     # Electron main process
│   ├── background.ts         # App entry point, window creation
│   └── helpers/              # Native helpers (IPC handlers, etc.)
│
├── renderer/                 # Next.js app (all UI code lives here)
│   ├── pages/                # One file per route/screen
│   ├── components/           # Reusable UI components
│   ├── layouts/              # Page layout wrappers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API and IPC call wrappers
│   ├── store/                # Zustand global state
│   ├── types/                # TypeScript interfaces and types
│   └── utils/                # Helper functions and formatters
│
├── shared/                   # Code shared between main and renderer
│   ├── ipc-channels.ts       # IPC channel name constants
│   └── types.ts              # Shared TypeScript types
│
├── resources/                # Static assets (icons, images)
└── docs/                     # Architecture and planning docs (markdown only)
```

---

## Layer Responsibilities

### `main/`
- Electron main process only — window management, native OS APIs, IPC listeners
- Never import renderer code here
- All IPC handlers live in `main/helpers/`

### `renderer/pages/`
- One file per screen/route
- No business logic — delegates to hooks and services
- Handles layout composition only

### `renderer/components/`
- Reusable UI components
- No API calls, no direct store access — receive data via props
- One component per file, filename matches component name (`PascalCase`)

### `renderer/layouts/`
- Page layout wrappers (sidebars, headers, shells)
- Shared across multiple pages

### `renderer/hooks/`
- Custom React hooks for encapsulating logic
- All TanStack Query calls go here (e.g. `useClients`, `useAuth`)
- Named `useCamelCase`

### `renderer/services/`
- All HTTP calls to the backend via Axios (one configured instance)
- All IPC calls to the main process
- One file per domain (`authService.ts`, `clientService.ts`)
- Never call APIs directly from components or pages

### `renderer/store/`
- Zustand stores for global client-side state
- Server state (API data) → TanStack Query, not Zustand
- UI/session state → Zustand

### `renderer/types/`
- All TypeScript interfaces and types for the renderer
- API response types, component prop types, form types

### `renderer/utils/`
- Pure helper functions — formatters, date utils, calculators
- No side effects, no API calls

### `shared/`
- Code used by both `main/` and `renderer/`
- `ipc-channels.ts` — all IPC channel names as string constants (never hardcode channel names inline)
- `types.ts` — TypeScript types shared across both processes

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ClientCard.tsx` |
| Files/Folders | kebab-case | `client-card.tsx` |
| Hooks | useCamelCase | `useClients.ts` |
| Services/Utils | camelCase | `clientService.ts` |
| IPC channels | SCREAMING_SNAKE_CASE | `GET_CLIENTS` |
| Zustand stores | camelCase | `authStore.ts` |

---

## Developer Rules

> These rules must be followed strictly before committing and pushing any changes.

1. **Never put API calls in components or pages.** All backend/IPC calls go through `renderer/services/`.
2. **Never use raw `ipcRenderer` in components.** Wrap all IPC calls in `renderer/services/`.
3. **Never hardcode IPC channel names.** Always use constants from `shared/ipc-channels.ts`.
4. **Never mix main and renderer code.** They are separate processes — keep them strictly separated.
5. **Server state goes in TanStack Query, not Zustand.** Zustand is for UI/session state only.
6. **No prop drilling beyond 2 levels.** Use Zustand for shared state across components.
7. **TypeScript strict mode — no `any`.** All types must be defined in `renderer/types/` or `shared/types.ts`.
8. **One component per file.** Filename must match the component name.
9. **All docs in `docs/` must be `.md` files only.** No code files in the docs folder.
