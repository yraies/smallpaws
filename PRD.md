# Product Requirements (PRD)

Owner: stakeholder direction, maintained by AI agents.

Canonical requirement source: `SPEC.md`.

## Product Goal

Garden Walk is a privacy-first conversation starter tool for complex personal topics (especially relationship discussions). It helps users identify areas of agreement/disagreement and ensures important topics aren't overlooked during sensitive conversations.

## Workflow Model

- **Template creation**: users design structure-only templates containing categories, questions, and answer schema.
- **Form filling**: users create fillable forms from finalized templates and answer them without changing structure.
- **Reading results**: users review finalized templates or shared/published forms in read-only form and branch backward by creating new local drafts/copies.
- **Starter templates**: built-in starter templates with valid structure can begin either a local template draft or a local fillable form from the home page; the empty starter remains draft-only.

## Users

- Individuals or partners exploring complex relationship topics.
- People facilitating sensitive conversations.
- Privacy-conscious users wanting client-side encrypted data handling.

## Product Boundaries

- Client-side encryption; server is zero-knowledge.
- No user accounts; access via shareable links and optional passwords.
- Recent forms are browser-local only; the server does not provide a synced or global recent-forms list.
- Templates are finalized before forms are created from them; forms hold answers while templates hold structure.
- Single-user form interaction (no real-time collaboration).
- Self-hosted via Docker/Podman with persistent SQLite storage.

## Architecture Snapshot

- **Primary frontend stack**: React 19 + TypeScript + Tailwind CSS 4
- **Primary backend/runtime stack**: Next.js 16 (App Router) + better-sqlite3 (SQLite)
- **Encryption**: crypto-js (client-side AES, password-based)
- **Canonical state container**: `src/contexts/FormContext.tsx` + `src/contexts/FormActionsContext.tsx`
- **Database module**: `src/lib/database.ts`
- **Canonical runtime requirement source**: `SPEC.md`

## Current Delivery Scope

1. Template/form lifecycle refactor: explicit template creation, template finalization, and fixed-structure form filling — **next**.
2. Client-side encryption and one coherent password/access-control model — **next**.
3. Shareable template and form links with read-only result views — **partial**.
4. UI/UX polish, onboarding clarity, and accessibility improvements — **next**.
5. Public template system and form comparison — **future/optional**.

## Form Factor

- Web application (responsive, mobile-friendly).
- Deployed as Docker/Podman container.

## Delivery Constraints

- Keep it simple: use well-known libraries, no over-engineering.
- Preserve existing working code; incremental feature addition.
- Privacy first: no server-side decryption.

## Non-Goals (Current Phase)

- User accounts or authentication.
- Real-time collaboration.
- Server-side data processing.
- PDF export.

## Acceptance Summary

See `SPEC.md` section 3 for detailed acceptance behaviors. Key outcomes:

- Templates are editable structure-only artifacts; forms are fixed-structure answerable artifacts created from finalized templates.
- Built-in starter templates with valid structure can begin either a local template draft or a local fillable form from the home page; the empty starter stays template-draft-only.
- All encryption is client-side; server never sees plaintext.
- JSON and CSV export are available through user-friendly UI.
- UI is responsive on desktop and mobile.
