## Quick orientation for AI coding agents

This file gives the minimal, actionable knowledge to be productive in the JSON Crack codebase.

High-level tech stack
- Next.js 14 (pages-based routing). See `pages/` for routes (e.g. `pages/editor.tsx`).
- TypeScript with `tsconfig.json` (types live in `types/`).
- pnpm is the package manager (see `package.json` and `packageManager`). Node >= 18.
- UI uses React + Mantine + Monaco editor (`@monaco-editor/react`). Visualizer uses `reaflow`.
- State: lightweight global store via `zustand` in `store/` (e.g. `useJson.ts`, `useConfig.ts`).

Key project structure & conventions
- `pages/` — Next.js routes and server/client boundaries. Follow existing pages for new routes.
- `src/layout/` — shared layout components (Navbar, Footer, PageLayout). Wrap new pages with `PageLayout`.
- `src/features/` — feature-area components; e.g. `editor/` contains `LiveEditor.tsx`, `TextEditor.tsx`, `Toolbar` and `views`.
- `src/features/modals/` — modal registration uses `ModalController.tsx` and `modalTypes.ts` — add modal components here and export via `index.ts`.
- `lib/utils/` — pure helpers and code generators (e.g. `generateType.ts`, `json2go.js`, `jsonAdapter.ts`). Prefer adding utility functions here.
- `store/` — zustand hooks; mutate state via provided hooks instead of ad-hoc React context.

Build / dev / lint commands (from `package.json`)
- Local dev: `pnpm dev` (runs `next dev` on :3000 by default)
- Build: `pnpm build` (note `postbuild` runs `next-sitemap --config next-sitemap.config.js`)
- Start (production): `pnpm start`
- Lint & typecheck: `pnpm lint` (runs `tsc`, `eslint src`, `prettier --check src`)
- Auto-fix formatting: `pnpm run lint:fix` (eslint --fix + prettier write)
- Analyzer: `pnpm run analyze` sets `ANALYZE=true` before build.

Docker
- There is a `Dockerfile` and `docker-compose.yml`. README shows `docker compose up` (app exposed at :8888 per README).

Important runtime & CI notes
- `NEXT_PUBLIC_NODE_LIMIT` (set in `.env`) controls node limit for visualizer — small changes to memory/node limit should be exposed here.
- Sentry is configured via `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — follow existing pattern when adding instrumentation.
- Post-build sitemap generation is hooked in `postbuild` script.

Code patterns & examples
- Add a new page: create `pages/my-tool.tsx`, export a React component, and wrap it with `PageLayout` if it’s a full page UI.
- Editor integrations: see `src/features/editor/LiveEditor.tsx` (Monaco integrations, debouncing and syncing with zustand hooks). Use existing hooks for focus and content.
- Converters: `pages/converter/*` demonstrate consistent patterns for tool pages (format -> transform -> download).
- Modals: register new modal in `src/features/modals/index.ts` and use `ModalController` to open.

Formatting & linting
- Follow project's eslint + prettier setup. Run `pnpm run lint:fix` to apply fixes.
- TypeRoot is `types/` (see `tsconfig.json`) — add ambient types there.

What to avoid / project-specific gotchas
- Don’t introduce new global state outside `store/` — prefer `zustand` hooks.
- Avoid server-side code in `pages` unless intentionally using Next APIs — inspect `pages/_app.tsx` and `pages/_document.tsx` for global wrappers.
- Post-build steps (sitemap) are required for builds; CI must run `pnpm build` which triggers sitemap generation.

If you change or add external dependencies
- Update `package.json` and prefer lightweight libs. This repo pins `next` and many Mantine packages; ensure compatibility with Node >=18 and Next 14.

Files to read first (quick tour)
- `package.json` — scripts & dependencies
- `README.md` — dev setup and Docker notes
- `src/features/editor/LiveEditor.tsx` — shows Monaco usage and editor flow
- `lib/utils/generateType.ts` — example of codegen utilities
- `store/useJson.ts`, `store/useConfig.ts` — zustand patterns

When unsure, ask the human maintainer: prefer small PRs that modify one area (UI, utils, store) and include the exact `pnpm` command used to test.

If you'd like, I can expand this into a short contributor checklist or add examples for adding pages/components.
