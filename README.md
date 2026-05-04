# Vanguard Desktop

Electron + Next.js desktop application for the Vanguard financial planning platform.

---

## Requirements

- Node.js 18+
- npm

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp renderer/.env.example renderer/.env.local
```

Open `renderer/.env.local` and fill in the values:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Start development server

```bash
npm run dev
```

This starts both the Electron main process and the Next.js renderer together.

---

## Build for Production

```bash
npm run build
```

The packaged app will be output to the `dist/` folder.

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
├── docs/                     # Architecture and planning docs (markdown only)
├── tsconfig.json
└── package.json
```
