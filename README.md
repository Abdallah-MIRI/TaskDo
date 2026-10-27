# TaskDo

**Version:** 1.0.0  
**Framework:** React  
**Package manager:** npm

> Static-analyzed project summary.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Modules](#modules)
- [Routes / Pages](#routes--pages)
- [Components](#components)
- [Dependencies](#dependencies)
- [Build & Deploy](#build--deploy)

## Installation

```bash
git clone <REPO_URL>
cd TaskDo
npm install
```

## Usage

```bash
npm run dev


## Scripts

| Script | Command |
|--------|---------|
| `dev` | `vite --port=3000 --host=0.0.0.0` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `clean` | `rm -rf dist server.js` |
| `lint` | `tsc --noEmit` |

## Project structure

```

.
├── public
│ └── assets
│ └── aistudio
│ └── Paste*October_27\_\_2026*-\_6_14PM_b6613065
├── src
│ ├── components
│ │ ├── calendar
│ │ │ └── CalendarView.tsx
│ │ ├── dashboard
│ │ │ ├── DashboardView.tsx
│ │ │ └── TaskStatistics.tsx
│ │ ├── layout
│ │ │ ├── MobileNav.tsx
│ │ │ ├── Navbar.tsx
│ │ │ └── Sidebar.tsx
│ │ ├── projects
│ │ │ ├── ProjectModal.tsx
│ │ │ └── ProjectsView.tsx
│ │ ├── settings
│ │ │ └── SettingsView.tsx
│ │ ├── tasks
│ │ │ ├── TaskModal.tsx
│ │ │ └── TasksView.tsx
│ │ ├── ui
│ │ │ ├── ConfirmModal.tsx
│ │ │ └── ToastProvider.tsx
│ │ └── wizard
│ │ └── SetupWizardModal.tsx
│ ├── domain
│ │ ├── task-rules.test.ts
│ │ └── task-rules.ts
│ ├── i18n
│ │ ├── context.tsx
│ │ └── translations.ts
│ ├── storage
│ │ ├── adapters
│ │ │ ├── indexeddb-adapter.ts
│ │ │ ├── localstorage-adapter.ts
│ │ │ └── remote-adapters.ts
│ │ ├── contracts.ts
│ │ ├── seed-data.ts
│ │ └── storage-context.tsx
│ ├── types
│ │ └── index.ts
│ ├── App.tsx
│ ├── index.css
│ └── main.tsx
├── .env.example
├── bun.lock
├── index.html
├── metadata.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts

````

## Modules

### `App.tsx` — Source
- Exports: `App` (function)

### `components/` — UI components
- Files: 14 (14 code)
- Examples: `CalendarView.tsx`, `ConfirmModal.tsx`, `DashboardView.tsx`, `MobileNav.tsx`, `Navbar.tsx`

### `domain/` — Module
- Files: 2 (2 code)
- Examples: `task-rules.test.ts`, `task-rules.ts`

### `i18n/` — i18n
- Files: 2 (2 code)
- Examples: `context.tsx`, `translations.ts`

### `main.tsx` — Entry


### `storage/` — Module
- Files: 6 (6 code)
- Examples: `contracts.ts`, `indexeddb-adapter.ts`, `localstorage-adapter.ts`, `remote-adapters.ts`, `seed-data.ts`

### `types/` — Type definitions
- Files: 1 (1 code)
- Examples: `index.ts`

## Routes / Pages

_No routes detected._

## Components

| Component | File | Description |
|-----------|------|-------------|
| `App` | `src\App.tsx` | — |
| `CalendarView` | `src\components\calendar\CalendarView.tsx` | — |
| `DashboardView` | `src\components\dashboard\DashboardView.tsx` | — |
| `TaskStatistics` | `src\components\dashboard\TaskStatistics.tsx` | — |
| `MobileNav` | `src\components\layout\MobileNav.tsx` | — |
| `Navbar` | `src\components\layout\Navbar.tsx` | — |
| `Sidebar` | `src\components\layout\Sidebar.tsx` | — |
| `ProjectModal` | `src\components\projects\ProjectModal.tsx` | — |
| `ProjectsView` | `src\components\projects\ProjectsView.tsx` | — |
| `SettingsView` | `src\components\settings\SettingsView.tsx` | — |
| `TaskModal` | `src\components\tasks\TaskModal.tsx` | — |
| `TasksView` | `src\components\tasks\TasksView.tsx` | — |
| `ConfirmModal` | `src\components\ui\ConfirmModal.tsx` | — |
| `ToastProvider` | `src\components\ui\ToastProvider.tsx` | — |
| `SetupWizardModal` | `src\components\wizard\SetupWizardModal.tsx` | — |

## Dependencies

### Runtime

- `@tailwindcss/vite` — `^4.3.3`
- `@vitejs/plugin-react` — `^6.1.1`
- `dexie` — `^4.4.7`
- `dotenv` — `^17.2.3`
- `express` — `^4.21.2`
- `lucide-react` — `^0.546.0`
- `motion` — `^12.23.24`
- `react` — `^19.0.1`
- `react-dom` — `^19.0.1`
- `recharts` — `^3.10.1`
- `vite` — `^8.3.0`

### Dev

- `@types/express` — `^4.17.21`
- `@types/node` — `^22.14.0`
- `@types/react` — `^19.3.0`
- `@types/react-dom` — `^19.3.0`
- `autoprefixer` — `^10.4.21`
- `esbuild` — `^0.28.0`
- `tailwindcss` — `^4.3.3`
- `tsx` — `^4.21.0`
- `typescript` — `^7.0.2`

## Build & Deploy

**Build:**

```bash
npm run build
````

**Deploy:** Upload `build/` to Vercel/Netlify/S3.

## License

This project is licensed under the Apache License 2.0.

You may use, modify, and distribute this software, including for commercial purposes, subject to the terms and conditions of the license.

See the [LICENSE](./LICENSE) file for the full license text.

Copyright (c) 2026 Abdallah MIRI
