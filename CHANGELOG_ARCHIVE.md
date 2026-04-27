# Changelog Archive

This file preserves implemented-outcomes history.

Normalization policy:

- Keep this archive append-only.
- Prefer product-facing implemented outcomes over development diary detail.
- Include source feedback refs when known.
- Avoid backlog churn and validation-command logs unless they explain a durable outcome.

## Historical Rollup

### Seasonal Theme System (Apr 2026)

Replaced the hardcoded 5-family Tailwind palette with a semantic CSS custom property system enabling runtime theme switching across all components.

- Defined 16 semantic `@theme` tokens (`th-paper`, `th-paper-soft`, `th-block`, `th-ink`, `th-ink-muted`, `th-line`, `th-primary`, `th-primary-hover`, `th-success`, `th-info`, `th-danger`, `th-danger-soft`) referencing CSS variables that change per theme.
- Created four seasonal themes (Spring, Summer, Autumn, Winter) as `[data-theme]` CSS variable blocks, each with distinct visual character: Spring is warm botanical, Summer is sunlit citrus/coastal, Autumn is earthy harvest, Winter is luminous pastel.
- Added `ThemeContext` with `themeId`/`setThemeId` and chip color helpers (`getChipColor(semantic)`) for future semantic answer option coloring.
- Added `ThemeSelector` component: four colored swatch radio buttons placed below the "Garden Walk" brand in the global layout.
- Flash-of-wrong-theme prevention via inline `<script>` in `<head>` that reads `localStorage` and sets `data-theme` on `<html>` synchronously before React hydrates.
- Migrated all 18 UI components from hardcoded palette classes (`sand-*`, `lavender-*`, `pistachio-*`, `complement-*`, `danger-*`) to semantic `th-*` tokens.
- Added `AnswerSemantic` type (`like`/`neutral`/`dislike`/`misc`) and `semantic` field to `AnswerOption` for future theme-aware answer chip coloring. Full custom-option rendering via theme colors is deferred.
- Updated print CSS to use `th-*` class patterns instead of old palette selectors.
- Removed unused `:root` CSS variables (`--paper`, `--paper-line`, `--plum`, `--paper-accent`, `--warning`, `--success`, `--info`).
- Source feedback: F-021, F-024.

### Phase 0: Next.js Migration (Nov 2025)

Migrated the entire React frontend to a fullstack Next.js 15 application with App Router.

- Created Next.js project with TypeScript and Tailwind CSS.
- Installed all dependencies: @heroicons/react, @uidotdev/usehooks, typeid-js, better-sqlite3, crypto-js.
- Migrated all components (Box, IconButton, LineButton, SelectionButton, QuestionsLine, CategoryPage) preserving functionality and styling.
- Migrated Form/Category/Question immutable type system with all methods.
- Migrated FormTemplates (relationship and PnP templates) and RelativeDates utilities.
- Created SQLite database with better-sqlite3 and FormStorage class.
- Implemented REST API: GET/POST/DELETE `/api/forms/[id]`, GET/DELETE `/api/forms`.
- Migrated from React Router to Next.js App Router with dynamic `/form/[id]` route.
- Migrated FormContext to work with Next.js (useParams from next/navigation).
- Integrated hybrid localStorage/API storage with fallback.
- Updated layout with Garden Walk branding, @fontsource-variable/outfit.
- Preserved all existing frontend features: template creation, form editing, drag-and-drop, real-time saving, recent forms, advanced/simple mode toggle, icon/text display toggle.

### Phase 1: Privacy & Encryption (Aug 2025)

Added optional client-side password protection with zero-knowledge architecture.

- Implemented client-side AES encryption using crypto-js.
- Added password protection to form save flow.
- Added password prompts for accessing encrypted forms.
- Added encryption status indicator in UI.
- Server only stores encrypted data blobs; never sees plaintext.

### Phase 2: Form Sharing (Nov 2025)

Enabled form sharing via unique links with access control.

- Added shared_forms table to SQLite database.
- Created sharing API endpoints (POST `/api/forms/[id]/share`, GET `/api/share/[shareId]`).
- Added share button and ShareModal component.
- Created `/share/[shareId]` page with read-only form view.
- Implemented password-protected shares.
- Added ShareInfoOverlay with view count, dates, expiry.

### Phase 3: Form Cloning (Nov 2025)

Enabled cloning of shared forms.

- Added clone button to shared form pages.
- Implemented clone API endpoint (POST `/api/share/[shareId]/clone`).
- Added cloned_from attribution tracking.
- Fixed infinite reload bug and layout consistency issues.

### Post-Phase 3: Enhanced Form Management (Nov 2025)

Polished core workflows and fixed critical architecture issues.

- Clone from published forms (not just shared).
- CSV export functionality for response data.
- Soft delete with graceful handling (shared links show "form deleted" message).
- Critical localStorage architecture fix.

### Harness Adoption (Apr 2026)

Adopted agent harness documentation system for use with both OpenCode and GitHub Copilot.

- Moved nextjs-app contents to repo root (removed unnecessary nesting).
- Deleted legacy `frontend/` directory (pre-migration React app).
- Created full doc system: AGENTS.md, SPEC.md, PRD.md, BACKLOG.md, TESTING.md, CHANGELOG.md, FEEDBACK_LOG.md with archives.
- Configured OpenCode (opencode.json) and GitHub Copilot (.github/copilot-instructions.md).

### Recent Forms Reliability Cleanup (Apr 2026)

Stabilized browser-local recent-form tracking after the root-level repo migration.

- Fixed recent-form metadata parsing for hyphenated form IDs.
- Fixed recent draft navigation to load the stored draft payload from the correct key.
- Moved recent-form listing back to browser-local metadata instead of treating all server forms as "recent".
- Prevented "clear recents" actions from deleting server-side forms or unrelated browser storage.
- Added automated tests for recent-form storage helpers.
- Removed the unused server-side recent-forms listing endpoint to keep recent-form tracking browser-local only.
- Fixed the home-page recent-form delete action so it does not trigger row navigation.
- Shifted the primary UI toward a warmer, narrower, more hand-crafted layout so templates/forms stay visually central while utility controls live near the top edges.
- Moved form utility controls into labeled left/right side stacks on larger screens so the narrow document column stays visually clean while the actions remain explicit and easy to scan.
- Extended that side-rail rule across finalized templates and shared templates, and removed duplicated primary actions from center-column phase notices so page chrome stays consistent across workflow phases.
- Removed the small Published/Shared/Finalized header badges so phase context is conveyed only by the page notices instead of being repeated next to the document name.
- Made print a first-class action in the side rails for finalized templates, shared templates, and form views, keeping export/print affordances visible in the phases where they matter.
- Added first-run onboarding copy to the home page covering what Garden Walk is for, how privacy works, and how the template -> form -> results workflow fits together.
- Extracted a shared document page shell so finalized templates, shared templates, editable forms, and shared results all compose the same header, action-rail, notice, and overlay structure.
- Fixed the published/shared form toolbar to react to the live publication state instead of leaving stale publish actions visible after publication.
- Unified access control so protected templates now mirror protected forms: finalized templates can be password-protected, direct template access uses a verifier-backed unlock flow, and shared template links reuse the same artifact password instead of inventing a second one.
- Simplified the share dialogs into calmer, flatter single-flow layouts so sharing matches the established design system instead of feeling like a separate dashboard.
- Added direct delete affordances for templates and draft forms on their admin URLs, ensuring user-entered artifacts can be removed from the authoritative non-shared pages.
- Collapsed template and form sharing to one canonical reusable link per document, removing the need to manage parallel share links that were effectively redundant in practice.
- Fixed share-link copy actions with a fallback path so copying works reliably in real Chrome/local environments where the async Clipboard API may be unavailable.
- Refactored shared filled-form links back onto the same document-page shell and calmer password/access flow as the rest of the product, removing an older dashboard-like special-case experience from that path.

### Template-Wide Custom Answer Enumerations (Apr 2026)

Added support for custom answer options that template creators define once and apply to all questions.

- Added `AnswerOption` type and `answerOptions` field to `Form`/`FormPOJO`. When undefined, the built-in defaults (must/like/maybe/off limits/unset) are used.
- `Question.selection` generalized from the `Selection` enum to `string`, allowing custom answer keys while maintaining backward compatibility.
- New `AnswerSchemaEditor` component on template draft pages lets creators add, remove, reorder, and customize answer options with label, short label, and color.
- `SelectionButton` now renders colors and labels dynamically from the form's answer options instead of a hardcoded config map.
- Answer options thread through the full component chain: `FormCategoryList` -> `CategoryBox` -> `QuestionLine` -> `SelectionButton`.
- CSV export now uses answer option labels instead of raw key strings.
- Custom answer options propagate automatically when creating forms from templates (via `withoutAnswers()` and `createFormDraftFromTemplate()`).
- JSON export/serialization includes `answerOptions` when present; older forms without the field fall back to defaults.
- Print CSS requires no changes — `data-label` and `data-selected` attributes already carry dynamic values.

### Screen Reader Accessibility Pass (Apr 2026)

Comprehensive screen reader accessibility improvements across all components.

- Added skip-nav link in the root layout and `<main>` landmark on the home page.
- PasswordModal, ShareModal, and TemplateShareModal now use `role="dialog"`, `aria-modal`, and `aria-labelledby` for proper screen reader announcement.
- Fixed duplicate `id="share-expiry"` in ShareModal (split into `share-expiry-active` and `share-expiry-new`).
- Share URL inputs now have `sr-only` labels associated via `htmlFor`/`id`.
- Error regions in all modals now use `role="alert"` with `aria-live="assertive"` for dynamic error announcements.
- Password toggle buttons have descriptive `aria-label`s ("Show password" / "Hide password").
- EdgeActionButton icon span marked `aria-hidden="true"` since the adjacent text label provides the accessible name.
- PageActionRails changed from generic `<div>` to `<nav aria-label="Page actions">` landmark.
- FormHeader input now has a proper `sr-only` `<label>` instead of relying on `title` attribute.
- LoadingState uses `role="status"` and `aria-live="polite"` so screen readers announce loading transitions.
- EncryptionStatus icons marked `aria-hidden="true"` with `sr-only` fallback text when `showText` is false.
- Decorative icons in DeletedFormMessage and ShareInfoOverlay marked `aria-hidden="true"`.
