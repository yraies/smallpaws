# Feedback Log

Concise stakeholder feedback summary for active planning context.

Detailed chronological history is preserved in `FEEDBACK_LOG_ARCHIVE.md`.

## Effective Feedback Now

- **Agent tooling**: Both OpenCode and GitHub Copilot (via VS Code) are used interchangeably; agent harness must support both equally. (F-001)
- **Project simplicity**: Keep it simple; use well-known libraries, no over-engineering. (F-002)
- **Privacy first**: Client-side encryption, zero-knowledge server, no user accounts. (F-002)
- **Incremental progress**: Complete each phase fully before moving to next. (F-002)
- **Repo structure**: Flat root (no nextjs-app nesting); frontend/ deleted. (F-001)
- **Recent forms reliability**: Recent forms should be tracked correctly in browser local storage, and current worktree cleanup should finish before moving on. (F-003)

## Severity Scale

- `blocker`: core workflow cannot proceed.
- `high`: major feature broken or missing.
- `medium`: incorrect behavior with workaround.
- `low`: polish or preference-level request.

## Rollup Policy

- `SPEC.md`, `PRD.md`, `BACKLOG.md`, and `TESTING.md` are canonical active surfaces.
- This file is a concise summary surface; it is not the full historical source.
- Summary entries must include archive-id references once history starts accumulating.
