# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Proof of Concept (PoC)** demonstrating a queue-based task triggering system:
- `packages/admin`: Next.js demo app that triggers tasks via an external queue (Trigger.dev)
- `packages/a11y`: Background task runner that executes jobs from the queue

**Architecture Flow:** Admin app → Trigger.dev queue → A11y runner

## System Requirements

- Node 20+ (specified in `.nvmrc`)
- Install dependencies with `npm i --legacy-peer-deps` (required for compatibility)

## Development Commands

### Root Level
```bash
npm i --legacy-peer-deps  # Install all dependencies
```

### Admin Package (`packages/admin`)
```bash
cd packages/admin
npm run dev    # Start Next.js dev server (http://localhost:3000)
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

### A11y Package (`packages/a11y`)
```bash
cd packages/a11y
npm run dev    # Start Trigger.dev dev server
```

## Architecture

### Trigger.dev Queue-Based Architecture
Both packages integrate with Trigger.dev (project ID: `proj_rajssdmcgtpysrlhcedy`) to create a decoupled task execution system:
- **Admin (v3.0.0-beta.55)**: Enqueues tasks to Trigger.dev
- **A11y (v4.3.3)**: Consumes and executes tasks from the queue

**Task Definition Pattern:**
- Tasks are defined in `src/trigger/` directories
- Use the `task()` function from `@trigger.dev/sdk/v3`
- Each task must have a unique `id` field (e.g., "hello-world")
- Tasks can specify `maxDuration` to prevent infinite runs

**End-to-End Flow:**
1. User interacts with Admin frontend (Next.js)
2. Frontend calls Server Action (`src/app/api/actions.ts`)
3. Server Action enqueues task to Trigger.dev using `tasks.trigger()`
4. A11y runner picks up and executes the task
5. Task results are logged and can be monitored via Trigger.dev dashboard

### Admin Package Structure
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **Key directories:**
  - `src/app/` - App Router pages and API routes
  - `src/app/api/` - Server Actions for triggering tasks
  - `src/trigger/` - Trigger.dev task definitions
- **Config files:**
  - `trigger.config.ts` - Trigger.dev configuration
  - `tailwind.config.ts` - Tailwind CSS configuration
  - `next.config.mjs` - Next.js configuration

### A11y Package Structure
- **Runtime:** Node.js (CommonJS)
- **Key directories:**
  - `src/trigger/` - Trigger.dev task definitions
- **Config file:**
  - `trigger.config.ts` - Defines task directories and runtime settings

## Important Notes

- **This is a PoC** demonstrating queue-based task execution between frontend and backend
- Both packages use the same Trigger.dev project but different SDK versions (v3 beta vs v4)
- Admin enqueues tasks; A11y consumes and executes them
- Tasks must be defined in **both** packages with matching `id` fields for the queue system to work
- Admin package uses Next.js Server Actions for type-safe task triggering
- Max task duration is set to 3600 seconds (1 hour) globally
- Retry logic is enabled in dev mode with exponential backoff (3 attempts, exponential factor: 2)