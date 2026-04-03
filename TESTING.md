# Testing Strategy

This file defines default automated validation gates.

Detailed manual checks are in `TESTING_MANUAL.md`.

## Command Reference (Repo Root)

- `npm run dev` — Start Next.js dev server at localhost:3000
- `npm run build` — Production build (catches type errors and build failures)
- `npm test` — Jest unit tests (ts-jest, node environment)
- `npm run lint` — Biome check (lint + format check)
- `npm run format` — Biome format --write (apply formatting)

Note: There is no `test:full`, `test:e2e`, or separate integration test command at this time.

## Goals

- Catch regressions quickly during iteration.
- Keep validation cost proportional to risk.
- Preserve confidence in high-value workflows.

## Automated Layers

1. **Unit tests** for pure logic (Jest + ts-jest). Currently: `src/lib/__tests__/crypto.test.ts`.
2. **Build validation** via `npm run build` — catches TypeScript errors and Next.js compilation issues.
3. **Linting** via `npm run lint` — Biome (replaces ESLint + Prettier).

## Default Validation Gate

For code changes:

1. Run the smallest relevant targeted scope first (e.g. `npm test -- --testPathPattern=crypto`).
2. Before handoff, run: `npm run build && npm test && npm run lint`.

For docs-only changes:

- No tests required unless explicitly requested.

For backlog-control and small-command turns with no code changes:

- No tests required.

## High-Risk Change Triggers

- Database schema changes (`src/lib/database.ts`).
- API route changes (`src/app/api/**`).
- Encryption/decryption logic (`src/lib/crypto.ts`).
- Form state management (`src/contexts/FormContext.tsx`, `src/contexts/FormActionsContext.tsx`).
- Type system changes (`src/types/Form.tsx`).

## Required Automated Coverage Areas

- Encryption/decryption round-trip (crypto.test.ts — exists).
- Form type system invariants (to be added).
- API route request/response contracts (to be added).

## Failure Handling

- If a broad test run is noisy, rerun the smallest failing scope.
- Document blockers directly in handoff if tests cannot be run.
