# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Turbo with workspaces in `apps/*` and `packages/*`.
- `apps/web`: Next.js web client (Top-level routes under `app/`, static assets in `public/`).
- `apps/mobile`: React Native shell; mirror shared logic from packages where possible.
- `packages/ui`: Shared React components and styling primitives; prefer importing from `@repo/ui` instead of redefining.
- `packages/logic`: Cross-app business and networking utilities (e.g., streaming helpers, auth); keep platform specifics in app layers.
- `packages/eslint-config`, `packages/typescript-config`: Centralized lint/TS baselines; extend instead of overriding.

## Build, Test, and Development Commands
- `npm run dev` ? turbo-run dev for all workspaces; scope with `npx turbo run dev --filter=web` to focus.
- `npm run build` ? production builds for every package/app; honor `--filter` for targeted builds.
- `npm run lint` ? ESLint across the monorepo using shared config.
- `npm run check-types` ? TypeScript project refs; run before release PRs.
- `npm run format` ? Prettier on `*.ts, *.tsx, *.md`; run after large edits.

## Coding Style & Naming Conventions
- Language: TypeScript-first. Follow Prettier defaults (2-space indent, single quotes per config) and fix lint warnings before commit.
- Components/hooks: `PascalCase` components, `useX` hooks; files in `kebab-case.tsx/ts` (`video-player.tsx`).
- Styling: Prefer shared `@repo/ui` tokens; avoid inline magic numbers?introduce named constants.
- Imports: Absolute paths within a package via TS path aliases; keep public APIs via package entrypoints.

## Testing Guidelines
- Add tests colocated with source as `*.test.ts`/`*.test.tsx`; prefer Testing Library for React pieces and lightweight unit tests for `packages/logic`.
- Aim for meaningful coverage on new logic; mock network/streaming endpoints.
- Run `npm run build` after adding tests to verify types and lint still pass.

## Commit & Pull Request Guidelines
- Commits: Present-tense, imperative subject lines ("Add playback controls"), grouped by concern; keep diffs minimal and formatted.
- PRs: Include scope summary, linked issue/ticket, and screenshots or recordings for UI/UX changes; call out testing performed and known gaps.
- Avoid committing secrets; use local `.env` files and document required keys in PR description.

codex resume 019aa595-899d-71a1-9b7d-f8a47bc34280