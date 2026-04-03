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

- **Standard mode**: Interactive form with full editing and response features.
- **Print mode** (planned): Optimized for printing with handwriting space.
- **High contrast mode** (planned): Accessibility-focused display.
- **Simplified mode** (planned): Minimal UI for focus/reading.

## Functional Requirements

### 1) Core Workflows

#### Form Creation and Structure

- **REQ-1: Create Form from Template** — Users create fillable forms by selecting from predefined templates. Templates are read-only structures that generate new fillable forms. Status: ✅ implemented.
- **REQ-2: Create Empty Form** — Users create blank fillable forms to build custom questionnaires. Must allow naming during creation. Status: ✅ implemented.
- **REQ-3: Edit Form Structure** — Users modify form structure (titles, questions, categories, ordering). Only unfilled forms can be modified; once responses are added, structure becomes read-only. Status: ✅ implemented.
- **REQ-4: Template vs Fillable Form Distinction** — System distinguishes between templates (for creating forms) and fillable forms (for recording responses). Templates cannot be filled out directly. Status: ✅ implemented.
- **REQ-20: Category-Based Organization** — Forms organized into categories, each containing related questions. Categories clearly separate different topic areas. Status: ✅ implemented.
- **REQ-6: Form Structure Validation** — System ensures forms have valid structure before save/share. Requires at least one category and one question. Status: ✅ implemented.

#### Form Response and Interaction

- **REQ-10: Predefined Answer Options** — Questions support: "must", "would like", "maybe", "off limits", and "unset". Unset is the default state. Status: ✅ implemented.
- **REQ-11: Custom Answer Enumerations** — Form creators can define custom answer options for entire forms or question groups. Custom enumerations override defaults; must be consistent within scope. Status: ❌ not implemented.
- **REQ-12: Visual Answer Indication** — Visual indicators for different answer states show agreement/disagreement areas. Indicators must be clear and distinguishable. Status: ✅ implemented.
- **REQ-17: Immutable Forms** — Once saved, forms cannot be modified; changes require creating new versions. Status: ✅ implemented.

#### Privacy and Data Security

- **REQ-13: Client-Side Encryption** — All sensitive form data encrypted client-side before transmission or storage. Encryption keys never leave the client; server only stores encrypted data. Status: ✅ implemented.
- **REQ-14: No User Accounts Required** — System operates without user account creation or login. All data access relies on form links and optional encryption keys. Status: ✅ implemented.
- **REQ-9: Optional Form Encryption** — Form creators can optionally encrypt forms before sharing. Encrypted forms require password/key access; encryption happens client-side. Status: ✅ implemented.
- **REQ-15: Local Storage for Recent Forms** — Recently accessed forms stored in browser local storage for quick access. Local storage respects privacy settings. Status: ✅ implemented.

#### Data Portability

- **REQ-16: JSON Export** — Users can export forms and responses as JSON files. Exported data includes all form structure and response data. Status: ✅ implemented.
- **REQ-19: Print-Friendly and Accessible Display Modes** — Switch display modes for accessibility and printing. Must include high contrast, simplified layouts, and print-optimized formats with handwritten response space. Status: ❌ not implemented.
- **REQ-21: Responsive Design** — Interface works on desktop and mobile. All functionality accessible on mobile. Status: ✅ implemented.

#### Form Sharing and Collaboration

- **REQ-7: Share Form and Create Public Templates** — Form creators generate shareable links and optionally make forms available as public templates. Links must be unique. Status: ✅ partially implemented (sharing works; public templates not yet).
- **REQ-8: Clone Shared Form** — Recipients clone shared forms to create their own fillable version. Cloned forms are independent copies. Status: ✅ implemented.
- **REQ-18: Automatic Form Version Linking** — Form cloning creates bidirectional links between original and clone. Navigation available in both directions. Status: ✅ implemented (cloned_from tracking).
- **REQ-5: Convert Form to Template** — Users designate created forms as templates for others. Templates maintain attribution; conversion is one-way. Status: ❌ not implemented.

### 2) Important Constraints

- Privacy first: all sensitive data encrypted client-side; server is zero-knowledge.
- No user accounts: access through shareable links and optional passwords only.
- Form immutability: published forms cannot be modified, only versioned.
- Client-side processing: server only stores/serves encrypted data blobs.
- Conversation focus: tool designed to start conversations, not replace them.

### 3) Acceptance Behaviors

- Creating a form from a template produces an independent, editable copy.
- Encrypting a form with a password makes it inaccessible without the correct password.
- Sharing a form produces a unique URL; accessing it shows a read-only view (with password prompt if encrypted).
- Cloning a shared form produces a new independent form with cloned_from attribution.
- Deleting a form soft-deletes; shared links show a "form deleted" message.
- CSV export produces a downloadable file with all response data.
- All UI is responsive and functional on mobile viewports.

## Non-Goals

- Real-time collaboration or multi-user simultaneous editing.
- User accounts, authentication, or login systems.
- Server-side decryption or data processing.
- PDF export generation.
- Complex approval workflows for public templates.
