# Data Model: Full-Stack Todo App

**Date**: 2026-09-01
**Branch**: `001-fullstack-todo-app`

## Entities

### Todo

Represents a single task created by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (cuid) | Primary key, auto-generated | Unique identifier for the todo |
| `text` | String | Non-empty, max 500 chars | The task description |
| `completed` | Boolean | Default `false` | Whether the task has been marked done |
| `createdAt` | DateTime | Auto-set on create | Timestamp used for newest-first ordering |

**Relationships**: None. Todos are standalone; no user, list, or tag relationships in scope.

**State transitions**:

```
incomplete → completed   (user marks as done)
completed  → incomplete  (user undoes completion)
any state  → deleted     (user deletes; record removed from database)
```

---

## Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Todo {
  id        String   @id @default(cuid())
  text      String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Shared TypeScript Type

The same shape is used in both the frontend API layer (`frontend/lib/types.ts`) and the backend service layer.

```typescript
// frontend/lib/types.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601 string
}
```

---

## Validation Rules

| Rule | Where enforced | Error |
|------|---------------|-------|
| `text` must not be empty or whitespace-only | Frontend + Backend | 400 Bad Request from backend; inline validation message on frontend |
| `text` max length 500 characters | Backend | 400 Bad Request |
| `id` must exist for update/delete | Backend | 404 Not Found |
| `completed` must be a boolean for updates | Backend | 400 Bad Request |

---

## Database Indexes

| Index | Column | Purpose |
|-------|--------|---------|
| Primary key | `id` | Lookup by ID for update/delete |
| Default sort | `createdAt DESC` | Newest-first list ordering (applied in query, no additional index required for the expected scale of ≤100 todos) |
