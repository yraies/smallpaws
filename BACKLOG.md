# Backlog

This file contains only active work items.

Completed and superseded items are moved to `BACKLOG_ARCHIVE.md`.

Status buckets: `todo`, `in_progress`, `blocked`, `postponed`

## Backlog Rules

- No inferred requirements: each item must map to `SPEC.md` or explicit stakeholder instruction.
- Keep backlog operation lightweight for unstructured stakeholder chat.
- Keep items outcome-focused and testable.
- If acceptance criteria are unclear, set status to `blocked` and ask clarifying questions.
- Do not leave completed items in this file; move completed items to `BACKLOG_ARCHIVE.md`.
- Backlog entries do not replace feedback tracking.

## todo

### Phase 6: Security Hardening Pass 2

- **B-050** — Timing-safe password comparison (audit item 9). Replace `===` with `crypto.timingSafeEqual()` in all password verification paths.
- **B-051** — Increase PBKDF2 iterations (audit item 12). Raise encryption key derivation iterations from 10,000 toward OWASP-recommended 600,000+.
- **B-052** — Password strength requirements (audit item 15). Add minimum length or complexity guidance when users set artifact passwords.
- **B-053** — ID format validation (audit item 16). Reject malformed artifact IDs early in API routes.
- **B-054** — Remove `clearAllForms()` export (audit item 17). Unexport the dangerous wipe function from database.ts.
- **B-055** — Add `.env*` and `data/` to `.dockerignore` (audit item 18). Prevent secrets and database from leaking into container images.
- **B-056** — Create `.env.example` (audit item 19). Document `ARTIFACT_ENCRYPTION_KEY` and other environment variables for deployers.
- **B-057** — Use `crypto.randomUUID()` instead of `Math.random()` for IDs (audit item 20). Replace any remaining non-cryptographic random ID generation.
- **B-058** — Remove verbose `console.error` from API routes (audit item 23). Avoid leaking internal error details in server logs.

## in_progress

- None.

## blocked

- None.

## postponed

### Phase 4.6: UI/UX Polish & Accessibility (deferred)

- **B-018** — High contrast display mode (REQ-19). Increased contrast ratios (WCAG AAA), larger text, bold borders, clear focus indicators.
- **B-019** — Simplified display mode (REQ-19). Minimal UI for focused reading.
- **B-020** — Keyboard navigation improvements. Tab order optimization, keyboard shortcuts, skip-to-content links.

### Phase 5: Public Templates (Optional, deferred until after standalone items)

- **B-030** — Public template designation (REQ-7). "Make Public Template" option on finalized templates.
- **B-031** — Public template browsing. Browse/search interface for community templates.
- **B-032** — Template attribution. Templates maintain creator attribution.

## Iteration Protocol

- Stakeholder sends direction and testing feedback in chat.
- AI agents implement changes and keep docs synchronized.
- Meaningful declarative stakeholder feedback is summarized in `FEEDBACK_LOG.md`.
