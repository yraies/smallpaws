# Small Paws 🐾

A privacy-first conversation starter tool for complex personal topics, particularly relationship discussions. Small Paws helps users identify areas of agreement and disagreement while ensuring important topics aren't overlooked during sensitive conversations.

## 🎯 Key Features

- **Privacy First**: Client-side encryption for all sensitive data
- **No Accounts Required**: Access through shareable links with optional passwords
- **Structured Conversations**: Category-based forms with customizable questions
- **Visual Feedback**: Clear indicators showing agreement/disagreement areas
- **Data Portability**: Export forms and responses as JSON
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Immutable Forms**: Published forms are version-tracked, not modified

## 🏗️ Architecture

Small Paws is a Next.js application with:

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **Deployment**: Docker/Podman containerized

## 🚀 Running with Docker/Podman

### Quick Start

Build the image:

```bash
podman build -t smallpaws .
```

Run with a persistent volume:

```bash
podman run -d \
  --name smallpaws \
  -p 3000:3000 \
  -v smallpaws-data:/app/data \
  smallpaws
```

Access at `http://localhost:3000`
