# Feedback Log

Concise stakeholder feedback summary for active planning context.

Detailed chronological history is preserved in `FEEDBACK_LOG_ARCHIVE.md`.

## Effective Feedback Now

- **Agent tooling**: Both OpenCode and GitHub Copilot (via VS Code) are used interchangeably; agent harness must support both equally. (F-001)
- **Project simplicity**: Keep it simple; use well-known libraries, no over-engineering. (F-002)
- **Privacy first**: Client-side encryption, zero-knowledge server, no user accounts. (F-002)
- **Incremental progress**: Complete each phase fully before moving to next. (F-002)
- **Repo structure**: Flat root (no nextjs-app nesting); frontend/ deleted. (F-001)
- **Recent forms privacy and reliability**: Recent forms should stay browser-local, not be exposed as a server-side list, and should behave correctly in the UI. (F-003)
- **Onboarding and accessibility clarity**: The app should better explain its purpose and help new users understand what to do first; current accessibility/self-explanation is not good enough. (F-004)
- **Workflow clarifications**: Print mode already exists via browser print/CSS; recent-form state should stay local only for now; draft recovery is intentional; published and shared should likely look nearly the same; share access control should align with the form password model; exports should remain available in user-friendly form. (F-005)
- **Potential future direction**: Comparing multiple filled-out forms, especially siblings from the same template, may become valuable and strengthens the case for a clearer template vs fillable-form distinction. Forms may be better modeled as always deriving from a template or hidden structural ancestor rather than being structurally rootless. (F-005)
- **Core data-model direction**: Templates are structure-only definitions of categories/questions and potentially shared answer sets; forms are fillable instances with a fixed structure and answer types. Template structure is editable; forms should only allow editing answers/content. (F-006)
- **Workflow model**: The product should be framed around three phases: template creation, form filling, and reading results. Forms should come from finalized templates; publishing/sharing is distinct from finalization. (F-006)
- **Validation workflow**: New or reworked features should always be tested in a real Chrome instance as the final quality gate to catch regressions that automated checks may miss. (F-007)
- **Design direction**: The app should return to a cozy, playful visual identity with warm colors, paper-like tactility, and a clearly centered document surface. It should feel hand-crafted and drawable with a few pens and a ruler: narrow, blocky, deliberate, and not overly polished. Avoid an overly rounded aesthetic, and keep the print layout space-efficient rather than decorative. Secondary controls should stay out of the way near the top edges rather than competing with the main form/template content; top controls can live in left/right vertical stacks outside the center column with text labels. (F-008)
- **Workflow preference**: Work should be committed regularly at sensible checkpoints instead of left uncommitted for long stretches. (F-009)

## Severity Scale

- `blocker`: core workflow cannot proceed.
- `high`: major feature broken or missing.
- `medium`: incorrect behavior with workaround.
- `low`: polish or preference-level request.

## Rollup Policy

- `SPEC.md`, `PRD.md`, `BACKLOG.md`, and `TESTING.md` are canonical active surfaces.
- This file is a concise summary surface; it is not the full historical source.
- Summary entries must include archive-id references once history starts accumulating.
