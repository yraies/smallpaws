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

### Phase 4.5: Template/Form Lifecycle Refactor

- **B-012** — Enforce template finalization and structure validation before form creation or template sharing. Require at least one category and one question. (REQ-2, REQ-6)
- **B-013** — Add shareable finalized-template views and let recipients create their own local forms from them. (REQ-7)
- **B-015** — Make phase transitions clear in the UI: template creation, form filling, and reading results, including safe backtracking via new local copies. (REQ-18)
- **B-016** — Make JSON/CSV export and printing clearly discoverable and user-friendly in the relevant phases. (REQ-16, REQ-19)

### Phase 4.6: UI/UX Polish & Accessibility

- **B-017** — Add onboarding/help copy that explains the product purpose, privacy model, and the three workflow phases.
- **B-018** — High contrast display mode (REQ-19). Increased contrast ratios (WCAG AAA), larger text, bold borders, clear focus indicators.
- **B-019** — Simplified display mode (REQ-19). Minimal UI for focused reading.
- **B-020** — Keyboard navigation improvements. Tab order optimization, keyboard shortcuts, skip-to-content links.
- **B-021** — Screen reader support. ARIA labels, semantic HTML, alt text for icons, form field labels.
- **B-022** — Extract shared components between finalized-template, form, and shared-result pages. Unified display and action layouts.

### Phase 5: Public Templates (Optional)

- **B-030** — Public template designation (REQ-7, REQ-5). "Make Public Template" option on finalized templates.
- **B-031** — Public template browsing. Browse/search interface for community templates.
- **B-032** — Template attribution. Templates maintain creator attribution.
- **B-033** — Compare forms derived from the same finalized template lineage. Show agreements/disagreements across multiple filled forms.

### Standalone

- **B-040** — Template-wide custom answer enumerations (REQ-11). Template creators define answer options shared by all questions in a template.

## in_progress

- **B-011** — Introduce explicit template drafts, finalized templates, and fixed-structure forms. Align types, persistence, and routing with REQ-1/REQ-2/REQ-4/REQ-22/REQ-23.

## blocked

- None.

## postponed

- None.

## Iteration Protocol

- Stakeholder sends direction and testing feedback in chat.
- AI agents implement changes and keep docs synchronized.
- Meaningful declarative stakeholder feedback is summarized in `FEEDBACK_LOG.md`.
