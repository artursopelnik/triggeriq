# TriggerIQ

A **Proof of Concept (PoC)** demonstrating a queue-based task triggering system using Trigger.dev for decoupled task execution.

## Overview

TriggerIQ showcases a modern architecture pattern where frontend applications enqueue tasks to a background queue, and separate worker processes execute them asynchronously.

### Architecture

```
Admin App (Next.js) → Trigger.dev Queue → A11y Runner
```

**Packages:**
- **`packages/admin`**: Next.js demo app that triggers tasks via Trigger.dev queue
- **`packages/a11y`**: Background task runner that consumes and executes jobs from the queue

## System Requirements

- **Node.js**: 20+ (specified in `.nvmrc`)
- **npm**: For dependency management

## Quick Start

### 1. Install Dependencies

```bash
npm i --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is required for compatibility because we use currently a older Next.js 14 version. It should also work with newer Version.

### 2. Configure Environment Variables

#### Admin Package

```bash
cd packages/admin
cp example.env.local .env.local
```

Edit `.env.local` and set:
```env
TRIGGER_SECRET_KEY=your_trigger_secret_key_here
```

### 3. Start Development Servers

#### Admin App (Next.js)

```bash
cd packages/admin
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

#### A11y Runner (Background Worker)

```bash
cd packages/a11y-worker
npm run dev
```

## Development Commands

### Admin Package (`packages/admin`)

| Command          | Description                  |
|------------------|------------------------------|
| `npm run dev`    | Start Next.js dev server     |
| `npm run build`  | Build for production         |
| `npm run start`  | Start production server      |
| `npm run lint`   | Run ESLint                   |

### A11y Package (`packages/a11y`)

| Command       | Description                     |
|---------------|---------------------------------|
| `npm run dev` | Start Trigger.dev dev server    |

## Features

- ✅ Queue-based task execution
- ✅ Decoupled frontend and background processing
- ✅ Type-safe Server Actions
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Configurable task timeouts (max 1 hour)
- ✅ Real-time task monitoring via Trigger.dev dashboard

## Configuration

### Task Settings

- **Max Duration**: 3600 seconds (1 hour) globally
- **Retry Policy**: 3 attempts with exponential backoff (factor: 2)
- **Dev Mode**: Retries enabled
