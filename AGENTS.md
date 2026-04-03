# Repo Agent Rules

## 1) Hard Boundaries and Defaults

### Build and Test

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm test         # Jest unit tests
npm run lint     # Biome check (lint + format check)
npm run format   # Biome format --write (apply formatting)
```

### Repository Boundary

Repository boundary: all operations must stay inside this workspace. Do not read, write, delete, or create files outside the repository.

### Instruction Precedence

If instructions conflict, use this order:

1. Latest stakeholder chat instruction.
2. `SPEC.md`.
3. `PRD.md`.
4. `BACKLOG.md` and `TESTING.md`.
5. `AGENTS.md`.
6. `README.md`, `CHANGELOG.md`, `FEEDBACK_LOG.md`.

Newer stakeholder direction supersedes older feedback.

### Current Product Stage

- **Pre-release** (~75% complete). No compatibility obligations.
- Prefer deleting compatibility-only code when simplifying behavior unless real compatibility constraints exist.

### Developer Workflow Rules

- Diff-scope default: treat untracked files as part of the effective change set unless the stakeholder explicitly excludes them.
- Never run mutating git operations unless the stakeholder explicitly asks.
- Forbidden without explicit request: `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout` (branch/file restore), `git cherry-pick`, `git revert`, tag creation/deletion, or equivalent history/working-tree mutation.
- Allowed by default: non-mutating git inspection commands (`git status`, `git diff`, `git log`, `git show`, `git blame`).
- Never use isolated worktree or sandboxed-branch execution modes. All work happens directly in the main working tree.

### Code Style Defaults

- Match the existing TypeScript, React, Next.js, and Tailwind CSS conventions already present in this repo.
- Prefer one clear source of truth per behavior.
- Prefer readability and maintainability over cleverness.
- Avoid compatibility-only indirection unless it solves a real requirement.

### Architecture Snapshot

- **Primary frontend stack**: React 19 + TypeScript + Tailwind CSS 4
- **Primary backend/runtime stack**: Next.js 16 (App Router) + better-sqlite3 (SQLite)
- **Encryption**: crypto-js (client-side AES)
- **Canonical state container**: `src/contexts/FormContext.tsx` + `src/contexts/FormActionsContext.tsx`
- **Database module**: `src/lib/database.ts`
- **Canonical runtime requirement source**: `SPEC.md`
- **Deployment**: Docker/Podman with persistent volume for SQLite DB

### ADR Policy

- Capture only major, cross-cutting architecture or tooling decisions in `architecture/adrs/`.
- Do not require ADRs for routine feature increments, local refactors, or isolated implementation details.
- When a major decision changes, add a superseding ADR and mark the old one `superseded`.

### Requirement Handling Rules

- Treat stakeholder input as unstructured by default: agents should translate feature requests, testing feedback, and preferences into actionable work without requiring the stakeholder to manage process mechanics manually.
- If a suggestion is not clearly derived from current requirements, request explicit confirmation.
- Do not implement any binding requirement unless it is traceable to explicit stakeholder chat or `FEEDBACK_LOG_ARCHIVE.md`.

### Ambiguity Rule

- Ask a clarification question only when an unresolved ambiguity is explicitly blocking implementation.
- Otherwise, proceed with a reasonable interpretation and keep momentum.

## 2) Canonical Turn Loop and Execution Protocol

Every stakeholder message is handled as one turn and assigned one primary class by semantic interpretation:

1. `durable_direction`
2. `backlog_control`
3. `execution_or_small_command`

### Classification Precedence

1. If the message contains new durable stakeholder direction, use `durable_direction`.
2. Otherwise, if the message primarily manages backlog execution without introducing new requirements, use `backlog_control`.
3. Otherwise use `execution_or_small_command`.

### Feedback Logging Decision (Separate From Turn Class)

After classifying the turn, run a separate feedback-logging check.

- Do not let turn class decide whether meaningful feedback should be logged.
- Log feedback whenever the stakeholder provides meaningful product or workflow direction, including preferences, feature requests, acceptance behavior, scope boundaries, prioritization, or anything that would matter if the product were rebuilt from scratch.
- Preferences count even when expressed casually or embedded inside a larger request.
- Treat spec-bearing backlog additions as feedback.
- Do not treat pure backlog-execution control as feedback when it only changes execution order or backlog bookkeeping.
- This rule applies even when the primary turn class is `backlog_control` or `execution_or_small_command`.
- Only skip logging when the input is a purely operational command with no rebuild-relevant direction.

### Feedback Logging Gate (Mandatory Before Handoff)

- A turn is not complete until feedback logging is explicitly resolved as one of:
  - `logged`: added a new `FEEDBACK_LOG_ARCHIVE.md` entry and updated `FEEDBACK_LOG.md` if needed.
  - `not_logged`: explicitly confirmed the turn contains only operational execution with no rebuild-relevant direction.
- Do not rely on turn class defaults to skip this gate.

### Doc Routing Matrix (Do Not Scan Everything)

Use the minimum read/write scope for the selected turn class.

| Turn Class                   | Default Read Scope                                                     | Allowed Write Scope                                                             |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `durable_direction`          | Current stakeholder turn, `SPEC.md`, `BACKLOG.md`, `FEEDBACK_LOG.md`   | Behavior and requirement docs plus `FEEDBACK_LOG*` and `CHANGELOG*` when needed |
| `backlog_control`            | `BACKLOG.md` only, plus `BACKLOG_ARCHIVE.md` when moving items         | `BACKLOG.md` and `BACKLOG_ARCHIVE.md` only                                      |
| `execution_or_small_command` | No doc read by default; read one relevant canonical doc only if needed | No durable doc updates by default                                               |

Feedback logging override:

- If the separate feedback-logging decision says the turn contains meaningful feedback, `FEEDBACK_LOG*` becomes allowed write scope regardless of primary turn class.

Expansion rule:

- Do not perform full-doc sweeps by default.
- Expand read scope only when blocked by an explicit contradiction, missing canonical requirement context, or a stakeholder request for broader review.
- If expansion is required, read the smallest additional canonical surface first.

### Turn-Class Handling

- `durable_direction`:
  - Extract explicit stakeholder direction and keep quote-level traceability in `FEEDBACK_LOG_ARCHIVE.md`.
  - Resolve supersession against prior feedback where relevant.
  - Implement, validate proportionally to risk, and update canonical docs only where behavior or requirements actually changed.
- `backlog_control`:
  - Use only for pure backlog operations that do not introduce new specs or behavior.
  - Operate primarily on `BACKLOG.md`.
  - Update requirement docs and log feedback only if the turn still contains meaningful declarative direction rather than pure backlog control.
- `execution_or_small_command`:
  - Execute directly.
  - No durable doc updates by default, but still evaluate whether the turn contains meaningful feedback that belongs in `FEEDBACK_LOG*`.

### Validation and Delivery Tempo

- Escalate validation automatically when risk is high, including cross-layer edits, permission changes, schema changes, path normalization, targeted test failures, or unexpected regressions.
- For high-risk changes, run the smallest additional suites that close the risk.

### Test Execution Protocol (Agents)

- Do not run full suites after every small edit.
- During implementation, run the smallest relevant targeted scope first.
- Before handoff for code changes, run the repository's default validation gate from `TESTING.md`.
- For docs-only changes, skip tests unless explicitly requested.
- For `backlog_control` and `execution_or_small_command` turns with no code changes, do not run tests.

## 3) Documentation System and Traceability

### Documentation Operating Model

Use docs as an orthogonal system with one owner purpose per file.

### Canonical Docs (actively maintained)

- `SPEC.md`: canonical product requirements and acceptance behavior.
- `PRD.md`: concise product summary.
- `BACKLOG.md`: only active work.
- `TESTING.md`: test strategy and default validation gates.
- `TESTING_MANUAL.md`: manual QA checklist.
- `README.md`: onboarding/run/deploy entrypoint and doc map.

### Historical Docs (append-only evidence and summaries)

- `CHANGELOG.md`: concise current product-outcome changelog.
- `CHANGELOG_ARCHIVE.md`: append-only implemented-outcomes history.
- `FEEDBACK_LOG.md`: concise current effective-feedback summary.
- `FEEDBACK_LOG_ARCHIVE.md`: canonical append-only stakeholder intent history.
- `BACKLOG_ARCHIVE.md`: completed and superseded backlog history.

### How Agents Should Update Docs

- Change requirements: update `SPEC.md` first, then align `PRD.md`, `BACKLOG.md`, and `TESTING.md`.
- Add or remove work items: update `BACKLOG.md`; move completed items to `BACKLOG_ARCHIVE.md` during rollups.
- Change validation expectations: update `TESTING.md` and `TESTING_MANUAL.md`.
- User-facing setup or deploy changes: update `README.md`.
- Architecture or tooling decisions: add or update an ADR only when the decision is major and cross-cutting.
- Significant implemented outcome: update `CHANGELOG.md`; preserve detailed history in `CHANGELOG_ARCHIVE.md`.
- Stakeholder feedback: summarize in `FEEDBACK_LOG.md`; keep verbose chronology in `FEEDBACK_LOG_ARCHIVE.md`.

### Granularity Preservation Contract

#### Feedback Archive Rules

- `FEEDBACK_LOG_ARCHIVE.md` is append-only evidence for stakeholder intent.
- Insert new entries at the top of the `## Entries` section.
- Before creating a new entry, check whether the most recent entry covers the exact same topic. If it does, extend that entry instead of creating a new id.
- Do not delete or rewrite prior archive entries except for obvious typo fixes.
- Every meaningful stakeholder feedback item gets a unique stable id (`F-XXX`).
- New ids must be monotonic and never reused.
- If older guidance is superseded, keep the old entry and add explicit supersession linkage.

#### Summary Log Rules

- `FEEDBACK_LOG.md` may roll up content for readability, but must preserve traceability back to archive ids.
- `FEEDBACK_LOG.md` `Effective Feedback Now` is the short current view and must stay aligned with the latest non-superseded direction.

#### Changelog Archive Rules

- `CHANGELOG_ARCHIVE.md` keeps detailed historical change notes.
- `CHANGELOG.md` stays concise and must not imply that archive detail was discarded.

## 4) Working Method, Handoff, and Done Criteria

### Working Method

1. Classify the turn.
2. For `durable_direction`, validate against `SPEC.md` and active backlog context.
3. Run the separate feedback-logging decision before implementation.
4. Implement.
5. Add or update tests for behavior changes tied to explicit stakeholder direction, reported bugs, or feedback.
6. Validate according to `TESTING.md`.
7. Apply required doc updates, then finalize the feedback logging gate.
8. Produce handoff with no intentional shortcuts left unstated.

### Implementation Efficiency

- Map the full change surface first. Use search tools to locate every file that must change, then read all of them before writing.
- Batch writes when possible.
- Run build, test, and lint once at the end for the final validation pass rather than after every small edit.

### Handoff Rules

- Default to non-technical summaries in chat handoff messages.
- Focus handoff on behavior changes, user-visible outcomes, validation status, and backlog or doc status.
- Only include implementation-level detail when explicitly requested.
- Include strategy rationale.
- Include one-line feedback logging status: `logged` or `not_logged` with a brief reason.

### Definition of Done

- Acceptance criteria implemented.
- Tests updated for behavior changes.
- Relevant validation passed or blocker documented.
- Canonical docs updated only when requirements or behavior changed.
- Historical docs updated when the turn introduced durable direction, meaningful declarative feedback, or a significant implementation milestone.
- Feedback logging gate satisfied.
- Handoff completed per the rules above.
