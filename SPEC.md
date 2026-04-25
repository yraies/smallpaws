# SPEC

This is the canonical requirement document.

## Maintenance Rules

- Maintained by AI agents from stakeholder chat.
- Requirements must be explicit; do not infer unstated behavior.
- When requirements are ambiguous and the ambiguity blocks implementation, ask for clarification.
- Newer stakeholder direction supersedes older guidance.

## Product Goal

Garden Walk is a privacy-first conversation starter tool for complex personal topics, particularly relationship discussions. It helps users notice areas of agreement, disagreement, and alignment through structured reflection and conversation, and ensures important topics aren't overlooked during sensitive conversations.

## Product Stage

Pre-release (~75% complete). No compatibility obligations.

## Users

- Individuals or partners exploring complex relationship topics.
- People facilitating sensitive conversations.
- Privacy-conscious users wanting client-side encrypted data handling.

## Modes

- **Standard mode**: Interactive workflow across template creation, form filling, and reading results.
- **Print mode**: Browser print plus print CSS provide a printable layout with space for handwritten responses. Status: ✅ implemented.
- **High contrast mode** (planned): Accessibility-focused display.
- **Simplified mode** (planned): Minimal UI for focus/reading.

## Workflow Phases

- **Template creation**: Users create and edit structure-only templates. Templates contain categories, questions, and answer schema, but no filled answers.
- **Form filling**: Users create forms from finalized templates. Forms keep a fixed structure and answer schema, and users fill in answers.
- **Reading results**: Users review finalized templates or published/shared forms in read-only form. Published/admin URLs and shared/read-only URLs are distinct access paths to the same underlying artifact. Returning to an earlier phase happens by creating a new local draft/copy rather than mutating the finalized/shared artifact.

## Functional Requirements

### 1) Core Workflows

#### Template Creation and Structure

- **REQ-1: Create Template Draft** — Users create editable template drafts from scratch or by starting from an existing template structure. Templates are the structural source of truth for later forms. Status: ✅ implemented.
- **REQ-2: Finalize Template Before Filling** — Users finalize template drafts into frozen template versions before creating forms. Only finalized templates, or built-in starter templates with valid structure, can be used to start fillable forms. Status: ✅ implemented.
- **REQ-3: Edit Template Structure** — Template drafts allow editing titles, categories, questions, ordering, and the template-wide answer schema. Finalized templates are read-only. Status: ✅ partially implemented.
- **REQ-4: Template vs Fillable Form Distinction** — System distinguishes clearly between templates and forms. Templates contain structure and answer schema only; forms contain the same fixed structure plus filled answers. Status: ✅ implemented.
- **REQ-20: Category-Based Organization** — Templates and forms are organized into categories, each containing related questions. Categories clearly separate different topic areas. Status: ✅ implemented.
- **REQ-6: Template Structure Validation** — Templates must have at least one category and one question before they can be finalized or shared. Status: ✅ implemented.
- **REQ-26: Built-In Starter Entry Paths** — On the home page, built-in starter templates with valid structure can start either a local template draft or a local fillable form. The empty starter only allows local template-draft creation. Status: ✅ implemented.

#### Form Response and Interaction

- **REQ-22: Create Form from Finalized Template** — Starting a form from a finalized template creates an independent fillable copy with fixed categories, questions, and answer schema. Built-in starter templates with valid structure may act as ready-made finalized starters on the home page. Status: ✅ implemented.
- **REQ-10: Predefined Answer Options** — Questions support: "must", "would like", "maybe", "off limits", and "unset" by default. Unset is the default state. Status: ✅ implemented.
- **REQ-11: Template-Wide Custom Answer Enumerations** — Template creators can define custom answer options for all questions in a template. These answer options carry into forms created from that template. Status: ✅ implemented.
- **REQ-12: Visual Answer Indication** — Visual indicators for different answer states help users compare responses and notice patterns manually. Indicators must be clear and distinguishable. Status: ✅ implemented.
- **REQ-17: Immutable Shared Forms** — Once a form is published, its answers cannot be modified in place from either the published/admin URL or the shared/read-only URL. Changes require creating a new local form/copy. This protects recipients from silent changes. Status: ✅ implemented.
- **REQ-23: Forms Only Edit Answers** — In the form-filling phase, users can edit answers/content but not the form structure. Status: ✅ implemented.

#### Privacy and Data Security

- **REQ-13: Client-Side Encryption** — All sensitive template and form data must be encrypted before storage. User-managed passwords are optional; data may still be readable to anyone with the correct access URL when no password is set. Server should not store plaintext artifact data. The exact key-management model is an implementation decision. Status: ✅ partially implemented.
- **REQ-14: No User Accounts Required** — System operates without user account creation or login. All data access relies on form links and optional encryption keys. Status: ✅ implemented.
- **REQ-9: Unified Access Control** — Artifact access should use one coherent model built around possession of the correct access URL plus optional password protection, rather than separate share-password and form-password systems. Status: ✅ partially implemented.
- **REQ-15: Local Storage for Recent Forms** — Recently accessed forms stored only in browser local storage for quick access and draft recovery. Recent-form metadata must not be uploaded or exposed as a server-side list. Local storage respects privacy settings. Status: ✅ implemented.
- **REQ-24: Draft Recovery** — Local browser storage may keep draft templates/forms for quick recovery, but finalized/shared artifacts must remain retrievable and readable from their canonical URLs without depending on mutable local browser state. Status: ✅ partially implemented.
- **REQ-25: Direct Artifact Deletion** — Users can delete templates and forms from their direct non-shared admin URLs. Status: ✅ implemented.

#### Data Portability

- **REQ-16: User-Friendly JSON and CSV Export** — Users can export forms and responses as JSON and CSV files through clearly labeled UI actions. Exported data includes all form structure and response data. Status: ✅ implemented.
- **REQ-27: JSON Import** — Users can import a previously exported JSON file to create a new local draft (template or form). Importing always creates a fresh draft with a new ID rather than restoring the original artifact. Status: ✅ implemented.
- **REQ-19: Print-Friendly and Accessible Display Modes** — Browser print plus print CSS must support printed output with handwritten response space. High contrast and simplified display modes remain planned. Status: ✅ partially implemented.
- **REQ-21: Responsive Design** — Interface works on desktop and mobile. All functionality accessible on mobile. Status: ✅ implemented.

#### Form Sharing and Collaboration

- **REQ-7: Share Finalized Templates** — Finalized templates can be shared via unique read-only links. Recipients can inspect the structure and create their own local forms from it. Status: ✅ implemented.
- **REQ-8: Share Filled Forms** — Published forms always have a distinct shared read-only view that shows answers/results without permitting mutation. The shared URL can be regenerated, invalidating older shared URLs. Status: ✅ implemented.
- **REQ-18: Phase Backtracking via New Local Copies** — Users can move back to an earlier workflow phase by creating a new local draft/copy rather than editing the finalized/shared artifact directly. Status: ✅ implemented.
- **REQ-5: Create a Derived Template Draft from a Readable Artifact** — Users can create a new local template draft from any readable form or template by reusing its structure and answer schema. Filled answers are not copied into the new template draft. Structural ancestry may be preserved as internal metadata where useful for later reuse or comparison, but it must not be required for draft creation. Status: ✅ implemented.
- **REQ-28: Multi-Form Comparison View** — Users can compare 2 or more published forms that share the same template structure in a single view, showing responses side by side to help users notice agreement, disagreement, and alignment themselves without automated evaluation. Status: ✅ implemented.
- **REQ-29: Auto-Delete Published Forms** — Published forms may be configured to auto-delete the underlying artifact after a chosen time. Auto-delete removes both admin and shared access to that form, after which access paths should show a deleted/unavailable state. Status: ✅ implemented.
- **REQ-30: Create a New Fillable Form from a Readable Artifact** — Users can create a new local fillable form from any readable form or template by reusing its structure and answer schema. The new fillable form starts with fresh answers rather than copying filled answers from the source artifact. Status: ✅ implemented.

### 2) Important Constraints

- Privacy first: all sensitive data encrypted before storage; server should not store plaintext artifact data.
- No user accounts: access through opaque artifact links and optional passwords only.
- Finalization before filling: forms are created from finalized templates, not editable template drafts. Built-in starter templates with valid structure count as ready-made starter templates for beginning a fillable form from the home page.
- Form immutability: shared/published forms cannot be modified, only replaced with new local versions.
- Published/admin access and shared/read-only access are distinct capabilities, even when they refer to the same underlying form.
- Auto-delete acts on the underlying published form artifact, not just on the shared URL.
- Client-side processing: server stores encrypted artifact data and serves opaque access URLs; optional password checks may gate decryption.
- Conversation focus: tool designed to start conversations, not replace them.

### 2.1) Artifact State and Capability Rules

- **Template drafts** are locally editable artifacts. Users may edit structure and answer schema, and browser-local draft recovery may apply.
- **Finalized templates** are read-only structural artifacts. Users may inspect, share, export/print, create a new local template draft from them, or create a new local fillable form from them, but not edit them in place.
- **Form drafts** are locally editable answerable artifacts. Users may edit answers/content but not structure, and browser-local draft recovery may apply.
- **Published/admin forms** are read-only answer artifacts on their direct admin URLs. Users may inspect, export/print, compare, regenerate shared URLs, delete, create a new local template draft from them, or create a new local fillable form from them, but not edit answers in place.
- **Shared/read-only forms** are read-only access paths to published forms. Users may inspect, export/print, compare, create a new local template draft from them, or create a new local fillable form from them, but they cannot delete the underlying artifact, regenerate shared URLs, or edit answers in place.

### 3) Acceptance Behaviors

- Starting from scratch opens template creation, not form filling.
- On the home page, non-empty built-in starter templates offer both "Create Template Draft" and "Fill Form" actions; the empty starter remains template-draft-only.
- Finalizing a template freezes its structure and answer schema for future forms.
- Starting a form from a finalized template produces an independent fillable copy with fixed structure.
- Sharing a finalized template produces a unique URL; accessing it shows a read-only structure view.
- Stored forms/templates remain encrypted in the database.
- Adding password protection to a form or template makes it inaccessible without the correct password.
- Published forms have a distinct shared read-only view, and regenerating the shared URL invalidates the older shared URL.
- To revise a finalized/shared artifact, the user creates a new local draft/copy instead of editing it in place.
- Users can delete templates and forms from their direct non-shared URLs.
- Deleting a form soft-deletes; shared links show a "form deleted" message.
- Configured auto-delete removes the underlying published form; both admin and shared URLs thereafter show a deleted/unavailable state.
- JSON and CSV export produce downloadable files with the relevant structure/response data.
- Importing a previously exported JSON file creates a new local draft with a fresh ID, not a restoration of the original artifact.
- Creating a derived template from a readable form or template creates a new local template draft from that artifact's structure.
- Creating a new fillable form from a readable form or template creates a new local fillable copy with fresh answers and the source artifact's fixed structure.
- Comparing 2 or more published forms with the same template structure shows each form's answers side by side so users can interpret agreement, disagreement, and alignment themselves.
- Clearing browser-local storage may remove draft recovery, but must not make finalized templates, published/admin forms, or shared/read-only artifacts unreadable through their canonical URLs.
- Browser print produces a readable print-friendly layout.
- All UI is responsive and functional on mobile viewports.

## Non-Goals

- Real-time collaboration or multi-user simultaneous editing.
- User accounts, authentication, or login systems.
- Server-side decryption or data processing.
- PDF export generation.
- Complex approval workflows for public templates.
