# Testing Strategy

This file defines default automated validation gates and the required final browser gate.

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
2. Before browser QA, run: `npm run build && npm test && npm run lint`.
3. Before handoff, verify the changed user-facing workflow in a real Chrome instance as the final quality gate.

For docs-only changes:

- No tests required unless explicitly requested.

For backlog-control and small-command turns with no code changes:

- No tests required.

## Final Browser Gate

- For any new feature, bug fix, or meaningful UI/workflow rework that affects user-facing behavior, finish validation with a real Chrome instance.
- Treat this Chrome run as the final gate after automated checks, not a substitute for them.
- Cover the specific flow changed in the turn and note any blocker if Chrome validation cannot be completed.

## High-Risk Change Triggers

- Database schema changes (`src/lib/database.ts`).
- API route changes (`src/app/api/**`).
- Encryption/decryption logic (`src/lib/crypto.ts`).
- Template/form state management (`src/contexts/FormContext.tsx`, `src/contexts/FormActionsContext.tsx`).
- Type system changes (`src/types/Form.tsx`).

## Required Automated Coverage Areas

- Encryption/decryption round-trip (crypto.test.ts — exists).
- Template/form type system invariants (to be added): templates carry no answers; forms carry fixed structure plus answers.
- API route request/response contracts (to be added).
- Recent-forms storage semantics (to be added): browser-local metadata/drafts only; no server-side recent-forms listing.
- Template/fill lifecycle invariants (to be added): forms can only be created from finalized templates or readable artifacts where explicitly allowed; finalized/shared artifacts are immutable in place.
- Starter-template entry behavior (to be added): non-empty built-in starters can open either a template draft or a fillable form; the empty starter remains template-draft-only.
- Unified access-control coverage (to be added): protected shared links use the same password model as the protected artifact.
- Compare identity and dedupe semantics (to be added): shared links and admin/local access paths to the same published form deduplicate in compare flows without exposing admin artifact ids.
- Artifact conversion coverage (to be added): any readable form/template can create a derived template draft, and any readable form/template can create a fresh fillable copy.

## Failure Handling

- If a broad test run is noisy, rerun the smallest failing scope.
- Document blockers directly in handoff if tests cannot be run.
