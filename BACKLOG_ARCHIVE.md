# Backlog Archive

This file stores completed, cancelled, and superseded backlog items.

## done

### Phase 4.6: UI/UX Polish & Accessibility (Apr 2026)

- **B-017** — Add onboarding/help copy that explains the product purpose, privacy model, and the three workflow phases. Home page now has a "What Garden Walk helps with" section with workflow steps and privacy note.
- **B-021** — Screen reader support. Added ARIA dialog roles to all modals, aria-hidden on decorative icons, sr-only labels for icon-only controls, role="status" on loading indicators, aria-live error regions, nav landmark for action rails, proper label associations on form inputs, skip-nav link, and heading hierarchy review.
- **B-022** — Extract shared components between finalized-template, form, and shared-result pages. DocumentPageShell, PageActionRails, DocumentPhaseNotice, FormCategoryList, FormHeader, and EdgeActionButton are now shared across all document pages.

### Standalone Features (Apr 2026)

- **B-041** — JSON import (REQ-27). Users can import a previously exported JSON file from the home page to create a new local draft. Auto-detection determines whether the import becomes a form draft (if it has non-unset answers) or a template draft (if all answers are unset). Creates a fresh ID; does not restore the original artifact. Preserves custom answer options from the exported form. File input resets after each import attempt so the same file can be re-selected.
- **B-040** — Template-wide custom answer enumerations (REQ-11). Template creators can define custom answer options (key, label, short label, color) that apply to all questions. Options carry into forms created from the template. Built-in defaults (must/like/maybe/off limits/unset) used when no custom options are set. AnswerSchemaEditor component on template pages; SelectionButton renders dynamic colors and labels; CSV export uses answer option labels.

### Phase 4.5: Template/Form Lifecycle Refactor (Apr 2026)

- **B-011** — Introduce explicit template drafts, finalized templates, and fixed-structure forms. Align types, persistence, and routing with REQ-1/REQ-2/REQ-4/REQ-22/REQ-23. Centralized session handoff helpers, explicit lifecycle phase metadata, renamed generic storage helpers.
- **B-012** — Enforce template finalization and structure validation before form creation or template sharing. Server-side validation on finalization, client-side gating on form creation, sharing restricted to finalized templates. (REQ-2, REQ-6)
- **B-013** — Shareable finalized-template views with password support, read-only display, and "Create My Form" action for recipients. (REQ-7)
- **B-014** — Unify password/access-control handling for protected templates/forms and their shared links. (REQ-9)
- **B-015** — Phase transitions clear in the UI with DocumentPhaseNotice/FormPhaseBanner on all views and "New Draft" backtracking on finalized templates, published forms, and shared forms. (REQ-18)
- **B-016** — JSON/CSV export and print now available across all phases: draft forms, published forms, shared forms, templates, and shared templates. (REQ-16, REQ-19)

### Phase 0: Next.js Migration (Nov 2025)

- **B-001** — Migrate React frontend to Next.js App Router with TypeScript. (REQ-1 through REQ-4, REQ-20)
- **B-002** — Implement SQLite backend with better-sqlite3 and REST API routes. (Infrastructure)
- **B-003** — Migrate all components: Box, IconButton, LineButton, SelectionButton, QuestionsLine, CategoryPage. (REQ-3, REQ-10, REQ-12)
- **B-004** — Migrate Form/Category/Question type system with immutable data model. (REQ-17)
- **B-005** — Integrate FormTemplates and RelativeDates assets. (REQ-1)
- **B-006** — Set up hybrid localStorage/API storage with fallback. (REQ-15)

### Phase 1: Privacy & Encryption (Aug 2025)

- **B-007** — Client-side AES encryption with crypto-js, password-based. (REQ-13, REQ-9)
- **B-008** — Password prompts for encrypted forms, encryption status UI. (REQ-9, REQ-14)

### Phase 2: Form Sharing (Nov 2025)

- **B-009** — Shareable links with optional passwords, share page route, access control. (REQ-7)

### Phase 3: Form Cloning (Nov 2025)

- **B-010-old** — Clone shared forms, clone attribution tracking (cloned_from). (REQ-8, REQ-18)

### Post-Phase 3: Enhanced Form Management (Nov 2025)

- **B-011-old** — Clone from published forms. (REQ-8)
- **B-012-old** — CSV export functionality. (REQ-16 partial)
- **B-013-old** — Soft delete with graceful handling. (Infrastructure)
- **B-014-old** — Critical localStorage architecture fix. (REQ-15)

### Root Repo Cleanup and Recent Forms Reliability (Apr 2026)

- **B-010** — JSON export for forms and responses. (REQ-16)

## cancelled

- None.

## superseded

- None.
