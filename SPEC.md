# SPEC

This is the canonical requirement document.

## Maintenance Rules

- Maintained by AI agents from stakeholder chat.
- Requirements must be explicit; do not infer unstated behavior.
- When requirements are ambiguous and the ambiguity blocks implementation, ask for clarification.
- Newer stakeholder direction supersedes older guidance.

## Product Goal

Small Paws is a privacy-first conversation starter tool for complex personal topics, particularly relationship discussions. It helps users identify areas of agreement/disagreement and ensures important topics aren't overlooked during sensitive conversations.

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
- **Reading results**: Users review finalized templates or shared/published forms in read-only form. Returning to an earlier phase happens by creating a new local draft/copy rather than mutating the finalized/shared artifact.

## Functional Requirements

### 1) Core Workflows

#### Template Creation and Structure

- **REQ-1: Create Template Draft** — Users create editable template drafts from scratch or by starting from an existing template structure. Templates are the structural source of truth for later forms. Status: ❌ not implemented.
- **REQ-2: Finalize Template Before Filling** — Users finalize template drafts into frozen template versions before creating forms. Only finalized templates can be used to start fillable forms. Status: ❌ not implemented.
- **REQ-3: Edit Template Structure** — Template drafts allow editing titles, categories, questions, ordering, and the template-wide answer schema. Finalized templates are read-only. Status: ❌ not implemented.
- **REQ-4: Template vs Fillable Form Distinction** — System distinguishes clearly between templates and forms. Templates contain structure and answer schema only; forms contain the same fixed structure plus filled answers. Status: ❌ not implemented.
- **REQ-20: Category-Based Organization** — Templates and forms are organized into categories, each containing related questions. Categories clearly separate different topic areas. Status: ✅ implemented.
- **REQ-6: Template Structure Validation** — Templates must have at least one category and one question before they can be finalized or shared. Status: ❌ not implemented.

#### Form Response and Interaction

- **REQ-22: Create Form from Finalized Template** — Starting a form from a finalized template creates an independent fillable copy with fixed categories, questions, and answer schema. Status: ❌ not implemented.
- **REQ-10: Predefined Answer Options** — Questions support: "must", "would like", "maybe", "off limits", and "unset" by default. Unset is the default state. Status: ✅ implemented.
- **REQ-11: Template-Wide Custom Answer Enumerations** — Template creators can define custom answer options for all questions in a template. These answer options carry into forms created from that template. Status: ❌ not implemented.
- **REQ-12: Visual Answer Indication** — Visual indicators for different answer states show agreement/disagreement areas. Indicators must be clear and distinguishable. Status: ✅ implemented.
- **REQ-17: Immutable Shared Forms** — Once a form is shared/published, its answers cannot be modified; changes require creating a new local form/copy. This protects recipients from silent changes. Status: ✅ partially implemented.
- **REQ-23: Forms Only Edit Answers** — In the form-filling phase, users can edit answers/content but not the form structure. Status: ❌ not implemented.

#### Privacy and Data Security

- **REQ-13: Client-Side Encryption** — All sensitive form data encrypted client-side before transmission or storage. Encryption keys never leave the client; server only stores encrypted data. Status: ✅ implemented.
- **REQ-14: No User Accounts Required** — System operates without user account creation or login. All data access relies on form links and optional encryption keys. Status: ✅ implemented.
- **REQ-9: Unified Access Control** — When password protection is used, template/form sharing access control should use one coherent password model rather than separate share-password and form-password systems. Status: ❌ not implemented.
- **REQ-15: Local Storage for Recent Forms** — Recently accessed forms stored only in browser local storage for quick access and draft recovery. Recent-form metadata must not be uploaded or exposed as a server-side list. Local storage respects privacy settings. Status: ✅ implemented.
- **REQ-24: Draft Recovery** — Local browser storage may keep draft templates/forms for quick recovery, but finalized/shared artifacts must not rely on mutable local state. Status: ✅ partially implemented.

#### Data Portability

- **REQ-16: User-Friendly JSON and CSV Export** — Users can export forms and responses as JSON and CSV files through clearly labeled UI actions. Exported data includes all form structure and response data. Status: ✅ partially implemented.
- **REQ-19: Print-Friendly and Accessible Display Modes** — Browser print plus print CSS must support printed output with handwritten response space. High contrast and simplified display modes remain planned. Status: ✅ partially implemented.
- **REQ-21: Responsive Design** — Interface works on desktop and mobile. All functionality accessible on mobile. Status: ✅ implemented.

#### Form Sharing and Collaboration

- **REQ-7: Share Finalized Templates** — Finalized templates can be shared via unique read-only links. Recipients can inspect the structure and create their own local forms from it. Status: ❌ not implemented.
- **REQ-8: Share Filled Forms** — Filled forms can be shared via unique read-only links that show answers/results without permitting mutation. Status: ✅ partially implemented.
- **REQ-18: Phase Backtracking via New Local Copies** — Users can move back to an earlier workflow phase by creating a new local draft/copy rather than editing the finalized/shared artifact directly. Status: ❌ not implemented.
- **REQ-5: Convert a Form into a Derived Template** — Users can create a template from a form's structure, preserving structural ancestry where useful for later reuse or comparison. Status: ❌ not implemented.

### 2) Important Constraints

- Privacy first: all sensitive data encrypted client-side; server is zero-knowledge.
- No user accounts: access through shareable links and optional passwords only.
- Finalization before filling: forms are created from finalized templates, not editable template drafts.
- Form immutability: shared/published forms cannot be modified, only replaced with new local versions.
- Client-side processing: server only stores/serves encrypted data blobs.
- Conversation focus: tool designed to start conversations, not replace them.

### 3) Acceptance Behaviors

- Starting from scratch opens template creation, not form filling.
- Finalizing a template freezes its structure and answer schema for future forms.
- Starting a form from a finalized template produces an independent fillable copy with fixed structure.
- Sharing a finalized template produces a unique URL; accessing it shows a read-only structure view.
- Encrypting a form or template with a password makes it inaccessible without the correct password.
- Sharing a filled form produces a unique URL; accessing it shows a read-only results view.
- To revise a finalized/shared artifact, the user creates a new local draft/copy instead of editing it in place.
- Deleting a form soft-deletes; shared links show a "form deleted" message.
- JSON and CSV export produce downloadable files with the relevant structure/response data.
- Browser print produces a readable print-friendly layout.
- All UI is responsive and functional on mobile viewports.

## Non-Goals

- Real-time collaboration or multi-user simultaneous editing.
- User accounts, authentication, or login systems.
- Server-side decryption or data processing.
- PDF export generation.
- Complex approval workflows for public templates.
