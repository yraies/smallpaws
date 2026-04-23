# Garden Walk

A privacy-first conversation starter tool for complex personal topics, particularly relationship discussions. Garden Walk helps users identify areas of agreement and disagreement while ensuring important topics aren't overlooked during sensitive conversations.

## 🎯 Key Features

- **Privacy First**: Client-side encryption for all sensitive data
- **No Accounts Required**: Access through shareable links with optional passwords
- **Structured Conversations**: Category-based forms with customizable questions
- **Visual Feedback**: Clear indicators showing agreement/disagreement areas
- **Data Portability**: Export forms and responses as JSON
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Immutable Forms**: Published forms are version-tracked, not modified

## 🏗️ Architecture

Garden Walk is a Next.js application with:

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **Deployment**: Docker/Podman containerized

## 🚀 Running with Docker/Podman

### Quick Start

Build the image:

```bash
podman build -t garden-walk .
```

Run with a persistent volume:

```bash
podman run -d \
  --name garden-walk \
  -p 3000:3000 \
  -v garden-walk-data:/app/data \
  garden-walk
```

Access at `http://localhost:3000`

## 🛠️ Development

```bash
npm install          # Install dependencies
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm test             # Jest unit tests
npm run lint         # Biome check (lint + format check)
npm run format       # Biome format --write
```

## 📚 Documentation Map

| File                      | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `AGENTS.md`               | Agent rules, turn loop, doc system, done criteria      |
| `SPEC.md`                 | Canonical product requirements and acceptance behavior |
| `PRD.md`                  | Concise product summary                                |
| `BACKLOG.md`              | Active work items                                      |
| `TESTING.md`              | Test strategy and validation gates                     |
| `TESTING_MANUAL.md`       | Manual QA checklist                                    |
| `CHANGELOG.md`            | Recent implemented outcomes                            |
| `CHANGELOG_ARCHIVE.md`    | Full implementation history                            |
| `FEEDBACK_LOG.md`         | Current effective stakeholder direction                |
| `FEEDBACK_LOG_ARCHIVE.md` | Chronological stakeholder intent history               |
| `architecture/adrs/`      | Architecture Decision Records                          |
