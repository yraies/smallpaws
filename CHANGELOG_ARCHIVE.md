# Changelog Archive

This file preserves implemented-outcomes history.

Normalization policy:

- Keep this archive append-only.
- Prefer product-facing implemented outcomes over development diary detail.
- Include source feedback refs when known.
- Avoid backlog churn and validation-command logs unless they explain a durable outcome.

## Historical Rollup

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
- Updated layout with Small Paws branding, @fontsource-variable/outfit.
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
- Added first-run onboarding copy to the home page covering what Small Paws is for, how privacy works, and how the template -> form -> results workflow fits together.
- Extracted a shared document page shell so finalized templates, shared templates, editable forms, and shared results all compose the same header, action-rail, notice, and overlay structure.
- Fixed the published/shared form toolbar to react to the live publication state instead of leaving stale publish actions visible after publication.
- Unified access control so protected templates now mirror protected forms: finalized templates can be password-protected, direct template access uses a verifier-backed unlock flow, and shared template links reuse the same artifact password instead of inventing a second one.
