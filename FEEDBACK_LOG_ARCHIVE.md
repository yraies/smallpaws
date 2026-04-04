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

### F-009 (2026-04-04) - Commit work regularly

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "please make sure that you regularly commit stuff by the way. not sure if you do that"
- **Normalized Intent:** Create git commits regularly at coherent implementation checkpoints instead of letting work accumulate indefinitely.
- **Feedback:** The stakeholder expects regular commits as part of the working style.
- **Action taken:** Logged the workflow preference and will start committing at sensible checkpoints when implementing ongoing work.

### F-008 (2026-04-04) - Restore cozy, centered visual identity

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "I think the app should have a cozy feeling UI. Lots of warmish colors, somewhat haptic paper-like feelings, etc. kind of playful, but definetely not corporate or alike. I also want to have the template or forms be the center of attention in the middle of the page. And everything else should either be at the top or the top left and top right out of the way."
- **Normalized Intent:** Re-establish a stronger visual identity built around a warm, tactile, playful document-first UI with the form/template centered and peripheral controls pushed to the top edges.
- **Feedback:** The current design has drifted toward generic gray/blue product UI. The app should feel cozy and paper-like, with the main document as the visual focus and supporting controls de-emphasized spatially.
- **Action taken:** Logged the design-system direction so upcoming UI work can align with it before further visual implementation.
- **Follow-up (2026-04-04):** Stakeholder clarified, "I am not too happy with the overly round aesthetic. additionally the pretty finnicy print layout is now incredibly space-inefficient"
- **Action taken (follow-up):** Tightened the visual language away from pill-heavy rounding and treated print efficiency as a first-class constraint for the design-system pass.
- **Follow-up (2026-04-04):** Stakeholder added, "I think the new ui is looking a bit too polished still... I could have drawn that very design with 2-3 pens and a ruler or square-grid sheet of paper... it had blocky colors and hadn't had as many gradients and pills/tags/badges... I also kind of liked that the app was somewhat narrow... it looked more deliberate."
- **Action taken (follow-up):** Re-centered the visual rollback around the older narrow, hand-crafted, blocky qualities instead of continuing toward a glossy paper-card system.

### F-007 (2026-04-04) - Browser validation is the final gate

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "please always test new/reworked features in an actual browser as the final quality gate to make sure we did not accidentally break anything. besides that please continue with the next tasks"
- **Normalized Intent:** Treat real browser validation as the final acceptance gate for new or significantly reworked features, then continue implementing the next backlog slice.
- **Feedback:** Automated tests, linting, and builds are not enough on their own; browser testing should be the final quality check for changed user-facing workflows.
- **Action taken:** Logged the validation requirement and continued with the next implementation task.
- **Follow-up (2026-04-04):** Stakeholder clarified, "please always test with a real chrome instance as a final quality gate!"
- **Action taken (follow-up):** Updated the active testing guidance to require a real Chrome instance, not just a generic browser run, for the final manual quality gate on changed user-facing work.

### F-006 (2026-04-03) - Define template vs form model and open publication question

- **Date:** 2026-04-03
- **Source:** Chat-driven
- **Exact Quote:** "A template is a list of categories and questions without any answers. And in the future, we might also provide template-wide answers... a form is a fixed set of categories, questions and answer types, but we're now able to fill them in. In templates the structure is editable, in forms only the contents/answers... templates have to be published before they can be filled in, right?"
- **Normalized Intent:** Establish a clearer conceptual distinction between templates and forms, with templates owning editable structure and forms owning answerable instances of fixed structure, while deciding whether forms can only be created from published templates.
- **Feedback:** Templates should be modeled as structure-only objects, possibly with template-wide answer enumerations later. Forms should be answerable instances with fixed structure and answer options. The product should consider whether only published templates are eligible for creating fillable forms.
- **Action taken:** Logged the conceptual model and analyzed the publication gate as an open workflow decision before changing requirements or implementation.
- **Follow-up (2026-04-03):** Stakeholder approved a phase-oriented framing: template creation, form filling, and reading results, and accepted the recommendation that forms should come from finalized templates while publishing/sharing remains a separate concept.
- **Action taken (follow-up):** Updated canonical requirements, backlog, and testing docs to use the new template/finalization/form model and phase-oriented workflow.

### F-005 (2026-04-03) - Clarify workflow expectations and explore compare/forms model

- **Date:** 2026-04-03
- **Source:** Chat-driven
- **Exact Quote:** "a print mode is actually already implemented through some css and the browser print functionality!... One last thing: I've noticed that it would be great if one could compare two or more filled out forms, especially if they sprung of from the same template. This makes me think that it would indeed be useful to differentiate between fillable forms and templates. What do you think?"
- **Normalized Intent:** Clarify current intended behavior around print mode, recent forms, draft recovery, shared vs published presentation, sharing passwords, and export UX; explore whether future comparison workflows strengthen the need for a stronger template vs fillable-form distinction.
- **Feedback:** Print mode should be treated as already present via CSS/browser printing. Recent-form state should remain browser-local for now. Draft recovery is explicitly intended. Published forms must remain non-editable from the user's perspective. Shared and published views should probably remain visually similar. Sharing access control should converge on one password model rather than separate systems. CSV/JSON export is acceptable if user-friendly. Comparing completed forms could become a useful future workflow.
- **Action taken:** Captured stakeholder clarifications and used them to refine the product interpretation before further implementation planning.
- **Follow-up (2026-04-03):** Stakeholder questioned whether fillable forms should ever be structurally rootless and suggested that forms should always derive from a template or inherited "mother-template", while templates can be created from scratch, templates, or forms.

### F-004 (2026-04-03) - Improve onboarding clarity and accessibility

- **Date:** 2026-04-03
- **Source:** Chat-driven
- **Exact Quote:** "I think accessibility or self-explanation of the application is pretty bad at the moment. So please suggest some changes that would help new users understand what's going on and what the application is intended for."
- **Normalized Intent:** Improve the app's first-run clarity and accessibility so new users can quickly understand the product's purpose and the basic workflow.
- **Feedback:** The current interface does not explain itself well enough and needs stronger onboarding, clearer labels, and more accessible guidance.
- **Action taken:** Reviewed the current landing and form UI and provided concrete UX/accessibility recommendations before implementation.

### F-003 (2026-04-03) - Finish current worktree and fix recent forms storage

- **Date:** 2026-04-03
- **Source:** Chat-driven
- **Exact Quote:** "please commit and 'clean up' (and by that I do NOT mean delete, but instead finish) the current worktree and lets have a look at recent forms. I have a feeling they are not stored properly in local storage."
- **Normalized Intent:** Finish the in-progress root-level repo work and make recent-forms persistence reliable, with browser local storage behaving correctly.
- **Feedback:** Recent forms are expected to be a trustworthy browser-local convenience layer, not a destructive control path or a broken draft cache.
- **Action taken:** Investigated recent-form persistence, fixed local storage key handling and clear-recents behavior, added automated tests, and aligned active docs/backlog with the current repo state before commit.
- **Follow-up (2026-04-03):** Stakeholder asked, "are the recent forms somehow sent to the server or something? because I dont think i want that. besides that pls fix the bug".
- **Action taken (follow-up):** Confirmed the home page reads recent forms from browser local storage, removed the unused server-side `/api/forms` recent-list endpoint, and fixed the recent-form delete control so it no longer navigates into the deleted draft.

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
