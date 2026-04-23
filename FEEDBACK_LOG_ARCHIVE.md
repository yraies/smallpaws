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

### F-021 (2026-04-24) - Rename to "Garden Walk" and future theming direction

- **Date**: 2026-04-24
- **Source**: Stakeholder chat
- **Exact Quote**: "I would also like to rename the app from the working title into 'Garden Walk', because the users are encouraged to take a walk through their mental garden of thoughts, expectations, wants and needs etc, either alone or with others. Based on that we could later on make color schemes fitting four seasonal themes. The question/category blocks as well as the page background colors should also be customizable per template down the line. Based on the seasonal theme we should be able to make things harmoneous and also provide two to three semantic colors for the side-rail buttons (delete, publish, info? not sure)"
- **Normalized Intent**: (1) Rename from "Small Paws" to "Garden Walk" everywhere. (2) Future: four seasonal color themes. (3) Future: per-template customizable block/background colors. (4) Future: 2-3 semantic colors for side-rail action buttons (delete, publish, info) derived from the active theme.
- **Feedback**: The product name should be "Garden Walk" — evoking walking through a mental garden of thoughts, expectations, wants and needs. Future theming direction includes seasonal palettes, per-template color customization, and semantic button colors tied to the active theme.
- **Action taken**: Renamed all 26 occurrences across 13 files (UI, docs, package name, container names). Future theming direction captured for backlog.

### F-020 (2026-04-23) - Preset colors and icon picker for answer options

- **Date**: 2026-04-23
- **Source**: Stakeholder chat
- **Exact Quote**: "I would like to provide a set of preset colors in addition to the free color choice (fitting the rest of the app harmonious pastel colors: lavender, sky, pistachio, sand, raspberry, sepia, limoncello, rose, coral, peach, mint, grey) In addition I would like to specify some Icons via mouse clicks. I presume they can currently be set via text, but users will not know what is available. I think 5 to 10 icons should be enough."
- **Normalized Intent**: The answer option color picker should offer named preset pastel swatches alongside the free color input. Icon selection should be clickable rather than text-entry, with 5-10 recognizable icons.
- **Feedback**: Stakeholder wants (1) a preset color palette of 12 named pastels harmonizing with the app aesthetic, and (2) a clickable icon picker with ~8 icons for answer options, since users won't know what icon identifiers are available.
- **Action taken**: Added `PRESET_COLORS` (12 pastels) and `icon` field to `AnswerOption` type. Added `AVAILABLE_ICONS` registry (9 icons: exclamation, check, question, minus, cross, heart, star, thumbs-up, empty). Built inline color swatch + icon picker in AnswerSchemaEditor. Updated SelectionButton to resolve icons from `option.icon` with legacy key fallback.

### F-019 (2026-04-23) - Deprioritize display modes, prioritize custom answer enums

- **Date**: 2026-04-23
- **Source**: Stakeholder chat
- **Exact Quote**: "please deprioritize B018, B019 and B020. then continue with custom answer enumerations"
- **Normalized Intent**: High contrast, simplified, and keyboard-nav modes are less important right now. Custom answer enumerations (B-040/REQ-11) should be the next feature implemented.
- **Feedback**: Stakeholder deprioritizes the remaining accessibility/display-mode items (B-018, B-019, B-020) and wants custom answer enumerations (B-040) done next.
- **Action taken**: Moved B-018, B-019, B-020 to postponed in BACKLOG.md. Starting B-040 implementation.

### F-018 (2026-04-23) - Re-importable exports and multi-form comparison view

- **Date:** 2026-04-23
- **Source:** Chat-driven
- **Exact Quote:** "exported templates/forms should be re-import-able" and "I want a view in which I can compare multiple published forms of the same 'mother template' (2 or more!)"
- **Normalized Intent:** (1) JSON exports should be importable back into the app as new local drafts. (2) A dedicated comparison view should let users compare 2+ published forms that share the same parent template, showing agreements and disagreements across responses.
- **Feedback:** Two new feature directions: round-trip data portability via import, and a multi-form comparison view for sibling forms. Import should create a new local draft (not restore the exact original artifact). The comparison view strengthens the earlier F-005 direction about comparing filled-out sibling forms.
- **Action taken:** Added REQ-27 (JSON import) and REQ-28 (multi-form comparison) to SPEC.md. Added B-041 and updated B-033 in BACKLOG.md. Updated FEEDBACK_LOG.md.

### F-017 (2026-04-23) - Give built-in starter templates both draft and fill entry paths

- **Date:** 2026-04-23
- **Source:** Chat-driven
- **Exact Quote:** "sounds good. While doing that we should also adress that the front page should probably provide both \"create template draft\" as well as \"fill form\" buttons for all but the empty default templates. the empty one should only allow for creation of a template draft."
- **Normalized Intent:** On the home page, built-in starter templates with valid structure should offer both a template-draft path and a fillable-form path, while the empty starter remains draft-only.
- **Feedback:** The home page should expose the workflow choice directly for ready-made starter templates instead of forcing every built-in starter through template drafting first. The empty starter remains the path for building structure from scratch.
- **Action taken:** Added explicit home-page actions for creating a template draft versus starting a fillable form from non-empty built-in starter templates, centralized lifecycle helpers for deriving template/form drafts from structure, and aligned SPEC/PRD/TESTING/BACKLOG wording with the built-in-starter rule.
- **Validation:** Added targeted lifecycle unit tests and verified the updated home page plus template/shared pages in real Chrome, including a mobile layout check.

### F-016 (2026-04-08) - Bring shared filled-form page back into the main UX system

- **Date:** 2026-04-08
- **Source:** Chat-driven
- **Exact Quote:** "the \"filled form\"-share page is utterly iconsistent to the rest of the application in terms of design and UX! please fix that."
- **Normalized Intent:** Refactor the shared filled-form page so it uses the same current design language, shell structure, and interaction patterns as the rest of the application.
- **Feedback:** The shared-results page had drifted into an older special-case UI that no longer matched the centered document shell, side-rail action placement, and calmer password/access flow used elsewhere.
- **Action taken:** Rebuilt the shared filled-form page around the common `DocumentPageShell`, `FormPhaseBanner`, `PageActionRails`, and `PasswordModal` patterns, while preserving shared-form loading, decryption, and clone-to-draft behavior.
- **Validation:** Verified in real Chrome that the shared filled-form URL now shows the same shell/notice structure as other document views in both the password-gated and unlocked states.

### F-015 (2026-04-08) - Use direct share wording and explicit removal

- **Date:** 2026-04-08
- **Source:** Chat-driven
- **Exact Quote:** "the wording is super confusing! Why \"One link\"? what does that even mean? users should be able to create the share link and delete it again/have it expire if needed."
- **Normalized Intent:** Rewrite the share UI around direct user actions and concepts: create a share link, let it expire or change expiry if relevant, and remove the share link explicitly when desired.
- **Feedback:** The prior wording described the implementation constraint instead of the user-facing action model. The UX should speak in terms of creating, expiring, and removing a share link, not abstract internal simplifications.
- **Action taken:** Reworded the template and form share modals to use direct action language, added explicit remove-share controls for both artifact types, and kept expiry editing visible on forms.
- **Validation:** Verified in real Chrome that template and form share modals now show clearer create/remove wording, and that removing an active share returns the UI to the create-share state.

### F-014 (2026-04-08) - Use one share link per document and fix copy buttons

- **Date:** 2026-04-08
- **Source:** Chat-driven
- **Exact Quote:** "the share ui is still too complex... one share link per document is enough for now... there is nothing useful to do with multiple links except effectively the latest one... copy buttons next to share links appear broken and need fixing"
- **Normalized Intent:** Simplify sharing further so each template or form has one canonical reusable share link for now, and make the share-link copy action reliable.
- **Feedback:** The remaining multi-link model adds complexity without practical benefit at this stage. The share flow should present one stable link per artifact, and copy controls must actually work in the live UI.
- **Action taken:** Logged the direction and implemented a single-share-link model in the share APIs and share modals, with a clipboard fallback for environments where the standard Clipboard API is unavailable.
- **Validation:** Verified in real Chrome that template and form share modals now show one canonical link, copy correctly writes the URL, and form expiry updates keep the same URL while updating the expiry.

### F-013 (2026-04-08) - Simplify share UI and allow deletion from admin URLs

- **Date:** 2026-04-08
- **Source:** Chat-driven
- **Exact Quote:** "I feel like the share system is too complex and does not fit into the established design system! additionally it seems like there is no exposed functionality to delete templates through the admin (ie non share) url! users have to be able to delete any data they input through their \"admin\" urls."
- **Normalized Intent:** Simplify the sharing UX so it fits the app's current visual/system language, and ensure any user-entered artifact can be deleted from its non-shared admin/edit URL.
- **Feedback:** Sharing currently feels too heavy and stylistically inconsistent. Deletion must be available from the authoritative direct URL for user-created data, not only through indirect flows.
- **Action taken:** Logged the direction and started implementation for a simpler sharing surface plus template deletion through the direct template URL.

### F-012 (2026-04-04) - One password model, not multiple user-facing passwords

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "I think 2 is fine, as long as the user is not confronted with multiple passwords or alike"
- **Normalized Intent:** Use the stricter server-verified access-control model, but keep it as one user-facing password per protected artifact/share flow rather than introducing separate passwords for different steps.
- **Feedback:** The stakeholder accepts a verifier-based protection model as long as it stays simple and does not burden users with multiple passwords.
- **Action taken:** Logged the chosen `B-014` direction and will implement unified artifact-level password handling without separate share passwords.

### F-011 (2026-04-04) - Use one consistent access-control model everywhere

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "I think everything should use one consistent model."
- **Normalized Intent:** Apply one coherent artifact-level password/access-control model across templates, forms, and shared links instead of mixing different rules by artifact or share type.
- **Feedback:** The stakeholder wants consistency over special cases in access-control behavior.
- **Action taken:** Logged the decision and proceeded with `B-014` implementation around a single unified model.

### F-010 (2026-04-04) - Prefer onboarding before deeper cleanup/accessibility

- **Date:** 2026-04-04
- **Source:** Chat-driven
- **Exact Quote:** "I think B-017, then B-022 and B-014 then B-021 sounds like the most reasonable order"
- **Normalized Intent:** Prioritize the next backlog slices in this order: onboarding/help copy first, then shared layout extraction, then password/access-control unification, then screen reader support.
- **Feedback:** The stakeholder prefers user guidance first, then UI consistency cleanup, then access-control logic, then deeper accessibility work.
- **Action taken:** Logged the preferred execution order so the next implementation pass follows this sequence.

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
- **Follow-up (2026-04-04):** Stakeholder suggested that the top controls may work better as left/right vertical stacks outside the center column, with labels next to the icons, rather than as a row near the document header.
- **Action taken (follow-up):** Logged the preferred control placement so the next layout pass can move the utility chrome out toward the screen edges while keeping the document column visually clean.
- **Follow-up (2026-04-04):** Stakeholder highlighted remaining inconsistencies where some pages still kept unlabeled or duplicated actions in the center column instead of using the rails.
- **Action taken (follow-up):** Standardized the rule that center-column notices are informational only while page actions belong in the side rails (with mobile fallback), and removed duplicated primary actions from the document body.
- **Follow-up (2026-04-04):** Stakeholder said, "I am not quite sure what the 'Published', 'Shared' and 'Finalized' Badges next to the name are for. So lets remove them"
- **Action taken (follow-up):** Removed the title-adjacent lifecycle badges from the shared document header so phase context lives in the page notices instead of next to the document name.
- **Follow-up (2026-04-04):** Stakeholder said, "I am not a big fan of the design of the 'start Here' box. Its pretty ... 'in your face'? and the three phase descriptions don't really make sense if you don't already know what the specific words mean."
- **Action taken (follow-up):** Softened the landing-page onboarding treatment and rewrote the workflow copy in plainer language so it introduces the flow before relying on internal product terms.

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
