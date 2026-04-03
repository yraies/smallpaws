# GitHub Copilot Instructions — Small Paws

## Project Overview

Small Paws is a privacy-first conversation starter tool for complex personal topics. It's a Next.js 16 fullstack app with React 19, TypeScript, Tailwind CSS 4, SQLite (better-sqlite3), and client-side AES encryption (crypto-js).

## Agent Rules

Read and follow `AGENTS.md` at the repo root. It contains the full turn loop, documentation system, validation gates, and handoff protocol.

## Key Files

- `AGENTS.md` — Agent rules, turn loop, doc system, done criteria.
- `SPEC.md` — Canonical product requirements and acceptance behavior.
- `PRD.md` — Concise product summary.
- `BACKLOG.md` — Active work items only.
- `TESTING.md` — Test strategy and default validation gates.
- `TESTING_MANUAL.md` — Manual QA checklist.
- `CHANGELOG.md` / `CHANGELOG_ARCHIVE.md` — Implemented outcomes.
- `FEEDBACK_LOG.md` / `FEEDBACK_LOG_ARCHIVE.md` — Stakeholder intent history.

## Build and Test Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm test         # Jest unit tests
npm run lint     # Biome check (lint + format check)
npm run format   # Biome format --write
```

## Architecture

- **Frontend**: `src/components/`, `src/contexts/`, `src/types/`
- **Backend API**: `src/app/api/` (Next.js route handlers)
- **Database**: `src/lib/database.ts` (SQLite via better-sqlite3)
- **Encryption**: `src/lib/crypto.ts` (client-side AES via crypto-js)
- **State**: `src/contexts/FormContext.tsx`, `src/contexts/FormActionsContext.tsx`

## Code Style

- TypeScript strict mode.
- Tailwind CSS 4 for styling (no CSS modules).
- Immutable data model for Form/Category/Question (`src/types/Form.tsx`).
- Prefer readability over cleverness.
- Match existing patterns in the codebase.
