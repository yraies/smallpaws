# Product Requirements (PRD)

Owner: stakeholder direction, maintained by AI agents.

Canonical requirement source: `SPEC.md`.

## Product Goal

Small Paws is a privacy-first conversation starter tool for complex personal topics (especially relationship discussions). It helps users identify areas of agreement/disagreement and ensures important topics aren't overlooked during sensitive conversations.

## Users

- Individuals or partners exploring complex relationship topics.
- People facilitating sensitive conversations.
- Privacy-conscious users wanting client-side encrypted data handling.

## Product Boundaries

- Client-side encryption; server is zero-knowledge.
- No user accounts; access via shareable links and optional passwords.
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

1. Form creation (from templates and blank), editing, category/question management — **done**.
2. Client-side encryption, password protection, zero-knowledge sharing — **done**.
3. Shareable links, form cloning with attribution, soft delete — **done**.
4. UI/UX polish, accessibility modes, print-friendly display — **next**.
5. Public template system — **future/optional**.

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

- Forms are creatable, editable, encryptable, shareable, and clonable.
- All encryption is client-side; server never sees plaintext.
- CSV and JSON export work for form response data.
- UI is responsive on desktop and mobile.
