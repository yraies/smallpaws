# Changelog

Recent implemented product outcomes are tracked here.

Detailed historical notes are preserved in `CHANGELOG_ARCHIVE.md`.

## Surface Policy

- `CHANGELOG.md` stays concise and outcome-oriented.
- `CHANGELOG_ARCHIVE.md` preserves detailed historical rollout and context notes.
- Avoid backlog churn and internal dev-diary detail in this surface unless it explains a durable user-visible outcome.

## [Unreleased]

### Added

- Recent forms now persist entirely via browser storage metadata, including published-form recents without storing published plaintext locally.
- Screen reader users can now navigate the app with proper ARIA landmarks, dialog roles on modals, labeled form inputs, status announcements for loading states, and live error regions.
- Template creators can now define custom answer options (label, short label, color) that apply to all questions in a template. Custom options carry into forms and exports. Built-in defaults are used when no custom options are set.
- Users can now import a previously exported JSON file from the home page to create a new local draft. If the JSON has filled answers, it imports as a form draft; otherwise it imports as a template draft. Custom answer options are preserved through the export-import roundtrip.
- Answer option editor now offers 12 preset color swatches (lavender, sky, pistachio, sand, raspberry, sepia, limoncello, rose, coral, peach, mint, grey) alongside the free color picker, and a clickable icon picker with 9 icons (exclamation, check, question, minus, cross, heart, star, thumbs-up, empty circle).

### Changed

- App renamed from "Small Paws" to "Garden Walk" across all user-facing surfaces, documentation, and technical identifiers.
- Root-level docs now reflect the current Biome-based toolchain and shipped JSON export support.
- Recent forms now remain browser-local only; the server no longer exposes a recent-forms listing endpoint.
- The main UI now uses a warmer, narrower, blockier document-centered visual system so templates and forms stay visually primary without drifting into polished dashboard styling.
- Top-level form controls now sit in labeled left/right side stacks outside the center column on larger screens, keeping the document area cleaner while preserving a compact in-column fallback on smaller screens.
- Finalized templates, shared templates, and reading-results views now follow the same layout rule: the center column shows status/info, while primary actions live in the side rails.
- The document header no longer shows Published/Shared/Finalized badges next to the title; phase context now lives only in the page notices.
- Finalized templates, shared templates, and form views now expose printing directly in the action rails, and published/shared forms keep export actions visible alongside print.
- The home page now explains the product purpose, privacy model, and three workflow phases directly in the landing view so new users can understand how to start.
- Finalized templates, shared templates, editable forms, and shared results now share the same page-shell structure for headers, rails, notices, and overlays, reducing layout drift between phases.
- Shared filled-form links now use the same document shell, password-entry flow, and side-rail action layout as the rest of the app instead of falling back to an older special-case page design.
- Protected templates now use the same password model as protected forms: the artifact itself owns the password, and shared links reuse that same password instead of introducing a separate one.
- Share dialogs now use a simpler, calmer layout that matches the rest of the UI instead of the older card-heavy share flow.
- Template and form sharing now use one reusable share link per document instead of managing multiple parallel links.
- Template/form lifecycle phases (draft, finalized, published) are now explicit in both metadata and persistence rather than inferred from scattered boolean flags.
- All draft handoff between pages now goes through centralized session helpers instead of ad-hoc sessionStorage keys, reducing the risk of orphaned or mismatched keys.

### Fixed

- Fixed recent-form draft IDs so hyphenated form IDs round-trip correctly through local storage.
- Fixed recent-form navigation to read draft payloads from the correct storage key.
- Fixed "Clear Recent Forms" so it clears only recent-form browser entries instead of wiping unrelated local storage or deleting server data.
- Fixed the recent-form delete button so removing an entry no longer also navigates into that form.
- Fixed the published/shared form toolbar so it tracks live form state correctly instead of showing stale actions after publication.
- Direct admin URLs now expose deletion consistently for templates and draft forms, so users can remove the data they entered without going through shared views.
- Fixed share-link copy buttons so they work reliably in the live UI, including environments where the standard Clipboard API is unavailable.

## [v0.1.0] — 2025-11 (Post-Phase 3)

### Added

- Form creation from predefined templates and blank forms.
- Category-based form organization with drag-and-drop ordering.
- Predefined answer options (must / would like / maybe / off limits / unset).
- Client-side AES encryption with password protection (crypto-js).
- Shareable links with optional password protection.
- Form cloning with attribution tracking (cloned_from).
- CSV export for response data.
- Soft delete with graceful shared-link handling.
- Hybrid localStorage/API persistence with fallback.
- Docker/Podman deployment with persistent SQLite storage.
- Responsive design for desktop and mobile.
