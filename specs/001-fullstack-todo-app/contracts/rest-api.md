# REST API Contract: Full-Stack Todo App

**Date**: 2026-09-01
**Branch**: `001-fullstack-todo-app`
**Base URL**: `http://localhost:<BACKEND_PORT>/api`

All requests and responses use `Content-Type: application/json`.

---

## Todo Object

```json
{
  "id": "clx1abc234",
  "text": "Buy groceries",
  "completed": false,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```

---

## Endpoints

### GET /api/todos

Retrieve all todos, ordered newest first.

**Request**: No body, no query parameters.

**Response 200 OK**:

```json
[
  {
    "id": "clx2def567",
    "text": "Write tests",
    "completed": true,
    "createdAt": "2026-09-01T11:00:00.000Z"
  },
  {
    "id": "clx1abc234",
    "text": "Buy groceries",
    "completed": false,
    "createdAt": "2026-09-01T10:00:00.000Z"
  }
]
```

**Errors**:

| Status | Condition |
|--------|-----------|
| 500 | Database unavailable or query failure |

---

### GET /api/todos/:id

Retrieve a single todo by ID.

**Path parameter**: `id` — the todo's cuid string.

**Response 200 OK**:

```json
{
  "id": "clx1abc234",
  "text": "Buy groceries",
  "completed": false,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```

**Errors**:

| Status | Condition |
|--------|-----------|
| 404 | No todo with the given ID |
| 500 | Database error |

---

### POST /api/todos

Create a new todo.

**Request body**:

```json
{
  "text": "Buy groceries"
}
```

**Validation**:
- `text` is required
- `text` after trimming whitespace must not be empty
- `text` must be 500 characters or fewer

**Response 201 Created**:

```json
{
  "id": "clx3ghi890",
  "text": "Buy groceries",
  "completed": false,
  "createdAt": "2026-09-01T12:00:00.000Z"
}
```

**Errors**:

| Status | Condition |
|--------|-----------|
| 400 | `text` missing, empty, whitespace-only, or exceeds 500 chars |
| 500 | Database error |

---

### PUT /api/todos/:id

Update a todo (used to toggle completion status).

**Path parameter**: `id` — the todo's cuid string.

**Request body** (partial update; only provided fields are changed):

```json
{
  "completed": true
}
```

Optionally also accepts `"text"` to update the task description (future-proofing; not exposed in the UI for this feature).

**Validation**:
- At least one of `completed` or `text` must be present
- If `text` is provided, same validation as POST applies
- If `completed` is provided, must be a boolean

**Response 200 OK** — full updated todo:

```json
{
  "id": "clx1abc234",
  "text": "Buy groceries",
  "completed": true,
  "createdAt": "2026-09-01T10:00:00.000Z"
}
```

**Errors**:

| Status | Condition |
|--------|-----------|
| 400 | No valid fields provided; `text` fails validation |
| 404 | No todo with the given ID |
| 500 | Database error |

---

### DELETE /api/todos/:id

Permanently delete a todo.

**Path parameter**: `id` — the todo's cuid string.

**Request body**: None.

**Response 204 No Content**: Empty body.

**Errors**:

| Status | Condition |
|--------|-----------|
| 404 | No todo with the given ID |
| 500 | Database error |

---

## Error Response Shape

All error responses return a JSON body with a human-readable message:

```json
{
  "error": "Todo not found"
}
```

---

## CORS

The backend must allow requests from the frontend origin (e.g., `http://localhost:3000`) during development.
