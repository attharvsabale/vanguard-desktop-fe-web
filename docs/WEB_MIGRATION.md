# Web Migration Guide

This document records the migration from a **Nextron (Electron + Next.js)** desktop app to a **pure Next.js 16 (App Router) web app**.

> The original `README.md` and `docs/INITIAL_SETUP.md` are kept untouched as the architectural source of truth. This file only describes what changed for the web build.

---

## Why

The client no longer needs a desktop application. The product ships as a web app served by Next.js.

---

## What Was Removed

| Path | Reason |
|---|---|
| `main/` | Electron main process |
| `app/main.js`, `app/preload.js` | Nextron build output / preload bridge |
| `shared/` | IPC channel constants and shared types between main/renderer |
| `resources/` | Electron app icons / native resources |
| `electron-builder.yml` | electron-builder config |
| `renderer/preload.d.ts` | `window.ipc` typings |
| `renderer/components/demo/NextronDemo.tsx` | Electron IPC demo component |
| `renderer/pages/next.tsx` | Demo route for the above |

Removed dependencies: `electron`, `electron-builder`, `electron-serve`, `electron-store`, `nextron`.

---

## What Was Kept (and Promoted to Root)

The entire `renderer/` tree was promoted to the project root:

| Old path | New path |
|---|---|
| `renderer/components/` | `components/` |
| `renderer/hooks/` | `hooks/` |
| `renderer/services/` | `services/` |
| `renderer/types/` | `types/` |
| `renderer/utils/` | `utils/` |
| `renderer/layouts/` | `layouts/` |
| `renderer/store/` | `store/` |
| `renderer/styles/` | `styles/` |
| `renderer/public/` | `public/` |
| `renderer/.env.example` | `.env.example` |
| `renderer/.env.local` | `.env.local` |

Layer responsibilities (services own HTTP, hooks own logic, components stay presentational, etc.) follow the rules in `docs/INITIAL_SETUP.md` exactly. The only deviation is that there is no longer a `main/`, `shared/`, or IPC layer.

---

## Routing: Pages Router → App Router

| Old (Pages Router) | New (App Router) |
|---|---|
| `renderer/pages/_app.tsx` | `app/layout.tsx` (root layout, imports global CSS) |
| — | `app/page.tsx` (redirects `/` → `/login`) |
| `renderer/pages/login.tsx` | `app/login/page.tsx` |
| `renderer/pages/forgot-password.tsx` | `app/forgot-password/page.tsx` |
| `renderer/pages/otp.tsx` | `app/otp/page.tsx` (wrapped in `<Suspense>` for `useSearchParams`) |
| `renderer/pages/reset-password.tsx` | `app/reset-password/page.tsx` (wrapped in `<Suspense>`) |
| `renderer/pages/home.tsx` | `app/home/page.tsx` |
| `renderer/pages/next.tsx` | removed |

### Router API changes
- `useRouter` now imported from `next/navigation` (not `next/router`).
- Query params no longer come from `router.query`; we use `useSearchParams()` from `next/navigation`.
- Object-style navigation (`router.push({ pathname, query })`) replaced with URL strings built via `URLSearchParams`.
- `router.isReady` no longer exists; we render a fallback while params are missing and redirect via `useEffect`.
- All pages and hooks that touch React state, effects, or routing are marked `'use client'`.

---

## Configuration Changes

### `package.json`
- `name` renamed to `vanguard-web`.
- Removed `"main": "app/main.js"` and the `postinstall` Electron step.
- Scripts replaced:
  - `dev` → `next dev`
  - `build` → `next build`
  - `start` → `next start`
  - `lint` → `next lint`
- `next`, `react`, `react-dom` moved into `dependencies` (were previously in devDependencies under Nextron).
- Added `@types/react-dom`.

### `tsconfig.json` (now at root)
- Merged the old root + `renderer/tsconfig.json` into a single config.
- Added `"baseUrl": "."` and `"paths": { "@/*": ["./*"] }` so imports use the `@/` alias (e.g. `@/components/auth/LoginForm`).
- `"jsx": "preserve"` (auto-rewritten to `react-jsx` by Next during build, which is expected).

### `next.config.ts` (root)
- Removed Electron-specific options: `output: 'export'`, `distDir: '../app'`, `trailingSlash: true`, `images.unoptimized: true`.
- Now a minimal config with `reactStrictMode: true`.

### `tailwind.config.ts`
- `content` updated from `./renderer/**/*` to `./app/**/*`, `./components/**/*`, `./layouts/**/*`, `./hooks/**/*`.

### `postcss.config.mjs`
- Moved to project root, content unchanged.

### `.gitignore`
- Removed `renderer/.env.local` and `/app` Electron build path.
- Added standard Next.js entries (`.next`, `out`, `.env*` variants, `*.tsbuildinfo`, `.DS_Store`).

---

## Code-Level Changes

### Hooks (`hooks/*.ts`)
- All marked `'use client'`.
- `useRouter` imported from `next/navigation`.
- `useSearchParams` used in `useOtpForm` and `useResetPasswordForm` instead of `router.query`.
- Replaced `any` in catch blocks with `unknown` + a narrow type assertion to satisfy strict TS.
- Removed extraneous `console.log` debug statements that were left over from desktop debugging (kept the meaningful error path; verbose logs dropped).
- Hooks use `@/services/*` and `@/types/*` alias imports.

### Components (`components/auth/*`)
- Untouched in structure. They are pure presentational and inherit the `'use client'` boundary from their parent pages.
- One pre-existing typing bug in `ForgotPasswordForm.tsx` was caught by strict TS (`form.touched?.email && form.errors?.email` — those fields don't exist on `ForgotPasswordFormState`). Fixed minimally to use `form.error`.

### `components/auth/inputHelpers.ts`
- Small DRY helper used by all 4 auth forms (Login, Forgot, OTP, Reset).
- Exports `getValidationClasses(isInvalid: boolean)` which returns Tailwind classes for input border + focus ring based on validation state (red when invalid, gray/blue when valid).
- Keep this file — removing it would require duplicating the conditional class string in every input across the auth screens.

### Services (`services/*`)
- No changes. `services/api.ts` and `services/authService.ts` already used Axios + `process.env.NEXT_PUBLIC_API_URL` and contained no Electron/IPC code.

### Types, layouts, utils, store
- No changes.

---

## Verification

```bash
npm install
npx tsc --noEmit          # passes
npx next build            # passes, all 7 routes prerender
npm run dev               # dev server boots on http://localhost:3000
```

Generated routes:
- `/`
- `/login`
- `/forgot-password`
- `/otp`
- `/reset-password`
- `/home`
- `/_not-found`

---

## Architecture Compliance

The web app continues to follow the rules in `docs/INITIAL_SETUP.md`:

- ✅ No API calls in components or pages (all in `services/`).
- ✅ No raw IPC anywhere (none exists).
- ✅ TypeScript strict, no `any` (replaced with `unknown` + narrowing).
- ✅ One component per file, PascalCase filenames.
- ✅ Hooks `useCamelCase`, services `camelCase`.
- ✅ All docs in `docs/` are `.md` only.

Rules that no longer apply (Electron-specific):
- ~~Never use raw `ipcRenderer` in components.~~
- ~~Never hardcode IPC channel names.~~
- ~~Never mix main and renderer code.~~
