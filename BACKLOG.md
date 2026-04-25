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

- **B-046** — Encrypt all stored template/form data before database storage without requiring a user-managed password by default (REQ-13, REQ-9). Database storage should not contain plaintext artifact data; exact key-management details remain an implementation decision.
- **B-042** — Complete template draft structure editing (REQ-3). Ensure template drafts support editing titles, categories, questions, ordering, and the template-wide answer schema end to end.
- **B-043** — Enforce immutable shared forms fully (REQ-17). Prevent any path that can mutate answers on shared/published forms; changes must go through a new local copy/draft.
- **B-044** — Tighten draft recovery boundaries (REQ-24). Draft recovery should remain browser-local for mutable drafts, while finalized/shared artifacts must not depend on mutable local state.

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
