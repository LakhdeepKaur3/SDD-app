# Quickstart Validation Guide: Full-Stack Todo App

**Date**: 2026-09-01
**Branch**: `001-fullstack-todo-app`

This guide describes how to stand up the application and verify that every user scenario from the spec works end-to-end.

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Docker Desktop running | `docker info` |
| Node.js 20+ | `node --version` |
| npm / pnpm | `npm --version` |

---

## Setup

### 1. Start PostgreSQL via Docker

```bash
# From the project root
docker compose up -d
```

This starts PostgreSQL on the port configured in `docker-compose.yml` (default: 5432). The database name, user, and password are set via environment variables.

### 2. Configure environment variables

**Backend** — create `backend/.env`:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"
PORT=4000
```

**Frontend** — create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Run Prisma migration

```bash
cd backend
npx prisma migrate dev --name init
```

Expected output: migration applied, `Todo` table created in PostgreSQL.

### 5. Start the backend

```bash
cd backend
npm run dev
```

Backend listens on `http://localhost:4000`.

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend listens on `http://localhost:3000`.

---

## Validation Scenarios

Open a browser at `http://localhost:3000`.

### Scenario A — Empty State

**Steps**: Open the page with no todos in the database.

**Expected**: An empty-state message is visible (e.g., "No tasks yet"). No list items rendered.

---

### Scenario B — Add a Task

**Steps**:
1. Type "Buy groceries" in the input field.
2. Submit (press Enter or click the add button).

**Expected**:
- A loading indicator appears briefly.
- "Buy groceries" appears at the top of the list, uncompleted.
- Input field clears.
- **Persistence check**: Reload the page — "Buy groceries" is still at the top.

---

### Scenario C — Newest Task at Top

**Steps**:
1. Add "Task A".
2. Add "Task B".

**Expected**: "Task B" appears above "Task A" in the list.

---

### Scenario D — Mark Task as Done

**Steps**:
1. Add "Buy groceries" if not already present.
2. Click the completion toggle on "Buy groceries".

**Expected**:
- "Buy groceries" shows a strikethrough style.
- The task remains in the list (not removed).
- **Persistence check**: Reload — "Buy groceries" still shows strikethrough.

---

### Scenario E — Undo Completion

**Steps**:
1. With "Buy groceries" in completed state, click its toggle again.

**Expected**:
- Strikethrough is removed.
- Task appears as incomplete.
- **Persistence check**: Reload — "Buy groceries" shows no strikethrough.

---

### Scenario F — Delete a Task

**Steps**:
1. Add "Temporary task".
2. Click the delete button on "Temporary task".

**Expected**:
- "Temporary task" is removed from the list immediately.
- **Persistence check**: Reload — "Temporary task" does not reappear.

---

### Scenario G — Blank Input Validation

**Steps**:
1. Submit the input field while empty (or with only spaces).

**Expected**:
- No API call is made (or API returns 400 and frontend shows an error).
- No task is added to the list.
- An inline validation message is shown.

---

### Scenario H — Error State (Backend Down)

**Steps**:
1. Stop the backend process (`Ctrl+C`).
2. Reload the page.

**Expected**:
- An error message is shown (e.g., "Failed to load tasks").
- The page does not crash.

**Steps (mutation error)**:
1. Keep backend stopped.
2. Try to add a task or toggle/delete an existing one.

**Expected**:
- A loading indicator appears briefly.
- An error message is displayed.
- The existing list state is unchanged.

---

## API Smoke Test (curl)

Verify the backend independently using the [REST API contract](./contracts/rest-api.md):

```bash
# Create
curl -s -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Test task"}' | jq .

# List (newest first)
curl -s http://localhost:4000/api/todos | jq .

# Toggle complete (use the id from the create response)
curl -s -X PUT http://localhost:4000/api/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | jq .

# Delete
curl -s -X DELETE http://localhost:4000/api/todos/<id> -w "%{http_code}"
# Expected: 204
```

---

## Definition of Done

All of the following must be true before the feature is considered complete:

- [ ] Scenarios A–H pass in the browser
- [ ] API smoke tests return expected responses
- [ ] Page reload retains all todo state
- [ ] No browser console errors during normal operation
- [ ] Loading indicator appears and disappears for every mutation
- [ ] Error state is shown when backend is unreachable
