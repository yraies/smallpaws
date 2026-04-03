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

### Fixed

- Fixed recent-form draft IDs so hyphenated form IDs round-trip correctly through local storage.
- Fixed recent-form navigation to read draft payloads from the correct storage key.
- Fixed "Clear Recent Forms" so it clears only recent-form browser entries instead of wiping unrelated local storage or deleting server data.

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
