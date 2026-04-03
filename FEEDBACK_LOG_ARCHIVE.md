# Feedback Log Archive

Maintained by AI agents from stakeholder chat feedback.

Archive policy:

- Append-only historical evidence log.
- Preserve stakeholder granularity, including minor UX or workflow preferences.
- Use unique stable ids (`F-XXX`) for new entries; do not reuse ids.
- If older guidance is superseded, keep the original entry and add explicit supersession linkage.

Required fields for new entries:

- `Date`
- `Source`
- `Exact Quote`
- `Normalized Intent`
- `Feedback`
- `Action taken`
- Optional `Validation`
- Optional `Follow-up`
- Optional `Superseded By`

## Severity Scale

- `blocker`: cannot continue core workflow.
- `high`: major feature broken.
- `medium`: incorrect behavior with workaround.
- `low`: minor issue or polish request.

## Supersession and Rollup Rules

- Newer stakeholder feedback supersedes older feedback when they conflict.
- `SPEC.md`, `PRD.md`, `BACKLOG.md`, and `TESTING.md` are the active requirement and planning surfaces.
- Feedback logging is evaluated separately from turn class.

## Entries

### F-003 (2026-04-03) - Finish current worktree and fix recent forms storage

- **Date:** 2026-04-03
- **Source:** Chat-driven
- **Exact Quote:** "please commit and 'clean up' (and by that I do NOT mean delete, but instead finish) the current worktree and lets have a look at recent forms. I have a feeling they are not stored properly in local storage."
- **Normalized Intent:** Finish the in-progress root-level repo work and make recent-forms persistence reliable, with browser local storage behaving correctly.
- **Feedback:** Recent forms are expected to be a trustworthy browser-local convenience layer, not a destructive control path or a broken draft cache.
- **Action taken:** Investigated recent-form persistence, fixed local storage key handling and clear-recents behavior, added automated tests, and aligned active docs/backlog with the current repo state before commit.

### F-002 (2025-08) - Project principles from original agent prompt

- **Date:** 2025-08 (approximate, from AgentPrompt.md)
- **Source:** Original project documentation
- **Exact Quote:** "Keep It Simple: Use well known libraries as much as needed - no over-engineering" / "Privacy First: Client-side encryption, no user accounts required" / "Incremental Progress: Complete each phase fully before moving to next"
- **Normalized Intent:** Core project principles: simplicity, privacy-first architecture, incremental delivery.
- **Feedback:** These principles have guided all implementation phases and remain in effect.
- **Action taken:** Captured in SPEC.md constraints and PRD.md delivery constraints.

### F-001 (2026-04-02) - Agent harness adoption and repo structure

- **Date:** 2026-04-02
- **Source:** Chat-driven (harness adoption conversation)
- **Exact Quote:** "opencode and github copilot via vscode are in the same class in terms of usage! dont forget that." / "you can delete the frontend folder. you can also move the contents of nextjs-app to the root, because the extra nesting is not necessary."
- **Normalized Intent:** (1) Both OpenCode and GitHub Copilot are equal-class agent tools; harness must support both. (2) Flatten repo structure: move nextjs-app to root, delete legacy frontend/.
- **Feedback:** Agent harness docs (AGENTS.md) and config files must be compatible with both OpenCode and Copilot. Repo structure simplified.
- **Action taken:** Created AGENTS.md at root (read by both tools). Created opencode.json for OpenCode config. Created .github/copilot-instructions.md for Copilot. Moved nextjs-app to root. Deleted frontend/.
