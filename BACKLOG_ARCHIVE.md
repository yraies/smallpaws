# Backlog Archive

This file stores completed, cancelled, and superseded backlog items.

## done

### Phase 6: Security Hardening Pass 2 (Apr 2026)

- **B-050** — Timing-safe password comparison (audit item 9). Password verification routes now use `crypto.timingSafeEqual()`-backed comparison helpers for both salted client-hash verification and legacy plaintext-hash fallback paths.
- **B-051** — Increase PBKDF2 iterations (audit item 12). New artifact encryption now uses 600,000 PBKDF2 iterations while legacy no-IV payloads still decrypt with the historical 10,000-iteration path for compatibility.
- **B-053** — ID format validation (audit item 16). Form, template, and share API routes now reject malformed artifact IDs with 400 responses before database work.
- **B-054** — Remove `clearAllForms()` export (audit item 17). Removed the bulk database wipe helper from `database.ts` so it is no longer available for accidental use.
- **B-055** — Add `.env*` and `data/` to `.dockerignore` (audit item 18). Docker builds now exclude environment files and the runtime data directory from the build context.
- **B-056** — Create `.env.example` (audit item 19). Added a deployer-facing example environment file documenting `ARTIFACT_ENCRYPTION_KEY` and `DATA_DIR`.
- **B-057** — Use stronger random ID generation (audit item 20). Replaced remaining `Math.random()`-based runtime/test ID generation with `typeid()` or `crypto.randomUUID()` as appropriate.
- **B-058** — Remove verbose `console.error` from API routes (audit item 23). API routes now log sanitized error names instead of raw error objects.

### Seasonal Theme System (Apr 2026)

- **B-050** — Four seasonal color themes with global theme switcher (F-021, F-024). Replaced hardcoded palette families with semantic CSS custom properties, created Spring/Summer/Autumn/Winter themes with distinct visual character, added ThemeContext with localStorage persistence, ThemeSelector UI, flash-of-wrong-theme prevention, and migrated all 18 UI components to semantic `th-*` tokens. Added `AnswerSemantic` type for future theme-aware answer chip coloring (full integration deferred).

### Standalone Features (Apr 2026)

- **B-033** — Multi-form comparison view (REQ-28). Users can compare 2 or more published forms side by side on `/compare`. Forms from the same template are aligned by matching category/question TypeIDs. The comparison shows raw answers side by side without automated agreement scoring. Supports adding forms via share links (with password handling for encrypted forms) or from recent published/shared forms. Entry points: "Compare" button on published form pages, shared form pages, and home page. Client-side only; no server-side parent-template tracking.
- **B-047** — Always-available shared view for published forms (REQ-8). Publishing a form now creates its canonical shared read-only view automatically. The form share modal always shows the current shared URL and can regenerate a new URL that invalidates the old one. Publishing/admin and shared/read-only access remain distinct capabilities.
- **B-048** — Auto-delete published forms (REQ-29). Form sharing now configures auto-delete of the underlying published form artifact rather than share-link expiry. When the configured time passes, both the admin URL and shared URL transition to deleted/unavailable states.
- **B-045** — Derived template draft from any readable artifact (REQ-5). "New Template" action available on published forms, shared forms, and shared templates. Creates a new local template draft using the artifact's structure and answer schema without copying answers.
- **B-049** — New fillable form from any readable artifact (REQ-30). "Start Fresh" action available on published forms and shared forms. Creates a new local fillable form with the artifact's structure and fresh (unset) answers. Distinct from "New Draft" which preserves answers for phase backtracking (REQ-18).
- **B-043** — Immutable published/shared forms enforced end to end (REQ-17). Published `/form/[id]` routes now trust server state before any local draft state, and pending local draft handoff is bound to its target route id so stale drafts cannot make a published form editable in place.
- **B-044** — Draft recovery boundaries tightened (REQ-24). Finalized `/template/[id]` routes now trust canonical server state before any local draft state, and pending template draft handoff is bound to its target route id so finalized templates never depend on mutable browser-local drafts.
- **B-042** — Template draft structure editing completed end to end (REQ-3). Draft templates now support editing titles, categories, questions, ordering, and template-wide answer schema together, and newly added questions/categories inherit the current template unset/default answer key.
- **B-046** — Stored artifact encryption at rest shipped by default (REQ-13, REQ-9). Form and template names plus payloads are now wrapped in server-held storage encryption before hitting SQLite, while optional user-password encryption remains available as an inner layer.

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
