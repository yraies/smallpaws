# Architecture Decision Records (ADRs)

This directory stores architecture and technical decision records for the project.

## Format

- File naming: `NNNN-short-kebab-case-title.md`
- Numbering: incremental, zero-padded (for example `0001`, `0002`)
- Status values: `proposed`, `accepted`, `superseded`, `deprecated`

## Required Sections

- Status
- Date
- Context
- Decision
- Consequences

## Maintenance Rules

- Create or update ADRs only for major, cross-cutting architecture or tooling decisions that are expected to shape multiple future changes.
- Do not create ADRs for routine feature increments, minor refactors, or one-off implementation details.
- Reference alternatives and key tradeoffs when relevant.
- If a decision changes, add a new ADR that supersedes the old one and mark the old status as `superseded`.
