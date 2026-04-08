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

### Changed

- Root-level docs now reflect the current Biome-based toolchain and shipped JSON export support.
- Recent forms now remain browser-local only; the server no longer exposes a recent-forms listing endpoint.
- The main UI now uses a warmer, narrower, blockier document-centered visual system so templates and forms stay visually primary without drifting into polished dashboard styling.
- Top-level form controls now sit in labeled left/right side stacks outside the center column on larger screens, keeping the document area cleaner while preserving a compact in-column fallback on smaller screens.
- Finalized templates, shared templates, and reading-results views now follow the same layout rule: the center column shows status/info, while primary actions live in the side rails.
- The document header no longer shows Published/Shared/Finalized badges next to the title; phase context now lives only in the page notices.
- Finalized templates, shared templates, and form views now expose printing directly in the action rails, and published/shared forms keep export actions visible alongside print.
- The home page now explains the product purpose, privacy model, and three workflow phases directly in the landing view so new users can understand how to start.
- Finalized templates, shared templates, editable forms, and shared results now share the same page-shell structure for headers, rails, notices, and overlays, reducing layout drift between phases.
- Protected templates now use the same password model as protected forms: the artifact itself owns the password, and shared links reuse that same password instead of introducing a separate one.

### Fixed

- Fixed recent-form draft IDs so hyphenated form IDs round-trip correctly through local storage.
- Fixed recent-form navigation to read draft payloads from the correct storage key.
- Fixed "Clear Recent Forms" so it clears only recent-form browser entries instead of wiping unrelated local storage or deleting server data.
- Fixed the recent-form delete button so removing an entry no longer also navigates into that form.
- Fixed the published/shared form toolbar so it tracks live form state correctly instead of showing stale actions after publication.

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
