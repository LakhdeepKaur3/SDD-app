# Tasks: Full-Stack Todo App

**Input**: Design documents from `specs/001-fullstack-todo-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rest-api.md

**No automated tests** — manual validation only, per plan.md (use quickstart.md scenarios).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies in this phase)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every description

## Path Conventions

```
backend/src/          — Express + TypeScript source
backend/prisma/       — Prisma schema and migrations
frontend/app/         — Next.js App Router pages and components
frontend/lib/         — Typed fetch helpers and shared types
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize both projects and shared infrastructure from scratch.

- [x] T001 Initialize backend Node.js project: create `backend/package.json` with `express`, `@types/express`, `prisma`, `@prisma/client`, `cors`, `@types/cors`, `dotenv`, `typescript`, `ts-node-dev`; create `backend/tsconfig.json` targeting ESNext with `rootDir: src` and `outDir: dist`
- [x] T002 [P] Initialize frontend Next.js 14 project with TypeScript and Tailwind CSS: run `npx create-next-app@14` in `frontend/` with `--typescript --tailwind --app --no-src-dir --no-import-alias` flags
- [x] T003 [P] Create `docker-compose.yml` at repo root that starts a PostgreSQL 15 container exposing port 5432 with credentials sourced from environment variables
- [x] T004 [P] Create `backend/.env` with `DATABASE_URL` and `PORT` placeholder values; create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000`; add both to `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend plumbing that ALL user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: Complete this phase before any user story implementation.

- [x] T005 Write Prisma schema in `backend/prisma/schema.prisma`: define `Todo` model with `id String @id @default(cuid())`, `text String`, `completed Boolean @default(false)`, `createdAt DateTime @default(now())`; configure `datasource db` with `provider = "postgresql"` and `url = env("DATABASE_URL")`
- [x] T006 Run `npx prisma migrate dev --name init` from `backend/` to apply the migration and generate the Prisma client; verify the `todos` table exists in the PostgreSQL container
- [x] T007 Create `backend/src/lib/prisma.ts` exporting a singleton `PrismaClient` instance
- [x] T008 Create `backend/src/server.ts`: initialize Express app; add `express.json()` and `cors()` middleware (allow frontend origin from env); mount the todos router at `/api/todos`; start listening on `process.env.PORT` (default 4000)
- [x] T009 Create `backend/src/routes/todos.ts`: create an `express.Router()`; export it for mounting in `server.ts` (leave route handlers empty — they will be filled per user story phase)
- [x] T010 [P] Create `frontend/lib/types.ts` exporting `interface Todo { id: string; text: string; completed: boolean; createdAt: string; }` matching the data-model definition
- [x] T011 [P] Replace `frontend/app/globals.css` content with only the three Tailwind directives: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`

**Checkpoint**: Backend server starts on port 4000; `GET /api/todos` returns a 404 (no handler yet). Prisma client is generated. Frontend dev server starts on port 3000.

---

## Phase 3: User Story 2 — View All Tasks (Priority: P1) 🎯 MVP Start

**Goal**: User opens the home page and sees all todos ordered newest-first. Empty state is shown when no todos exist. Error state is shown when the backend is unreachable.

**Independent Test**: Seed the database directly with 2–3 todos; load `http://localhost:3000`; confirm todos appear in newest-first order and the list survives a page reload (Quickstart Scenario B read-only + Scenario A).

### Implementation

- [x] T012 [US2] Add `getAll()` method to `backend/src/services/todosService.ts`: import the Prisma singleton from `lib/prisma.ts`; call `prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })`; return the array of todos
- [x] T013 [US2] Add `getAll` handler to `backend/src/controllers/todosController.ts`: call `todosService.getAll()`; respond with 200 and the todos array; on error respond with 500 `{ error: 'Failed to fetch todos' }`
- [x] T014 [US2] Register `GET /` route in `backend/src/routes/todos.ts` pointing to `todosController.getAll` (the router is mounted at `/api/todos` in `server.ts`, so this handles `GET /api/todos`)
- [x] T015 [P] [US2] Add `getTodos(): Promise<Todo[]>` fetch helper to `frontend/lib/api.ts`: call `fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`)`; throw on non-OK response; return parsed JSON array of `Todo`
- [x] T016 [P] [US2] Create `frontend/app/components/TodoList.tsx` (`"use client"`): accept `todos: Todo[]` prop; render an ordered `<ul>` of todo items; render an empty-state `<p>` (e.g., "No tasks yet. Add one above!") when the array is empty
- [x] T017 [P] [US2] Create `frontend/app/components/TodoItem.tsx` (`"use client"`): accept a `todo: Todo` prop; render the todo `text` in a `<li>`; apply `line-through` Tailwind class when `todo.completed` is true (no interactive buttons yet — those come in US3 and US4)
- [x] T018 [US2] Implement `frontend/app/page.tsx` (`"use client"`): use `useState<Todo[]>([])`, `useState<boolean>(false)` for `isLoading`, `useState<string | null>(null)` for `error`; fetch todos in `useEffect` via `getTodos()`; show a loading spinner while loading; show an error message on failure; render `<TodoList todos={todos} />` on success

**Checkpoint**: `http://localhost:3000` displays the todo list ordered newest-first, shows empty state when empty, shows error when backend is down, and survives page reload. Quickstart Scenarios A and B (read portion) pass.

---

## Phase 4: User Story 1 — Add a Task (Priority: P1)

**Goal**: User types a task description, submits it, and it appears at the top of the list. Blank input is rejected. Network errors are shown without losing the list.

**Independent Test**: Type "Buy groceries", submit, confirm it appears at the top and persists after reload. Submit an empty input and confirm no task is created (Quickstart Scenarios B and G).

### Implementation

- [x] T019 [US1] Add `create(text: string)` method to `backend/src/services/todosService.ts`: trim `text`; throw if empty or longer than 500 characters; call `prisma.todo.create({ data: { text } })`; return the created todo
- [x] T020 [US1] Add `create` handler to `backend/src/controllers/todosController.ts`: read `text` from `req.body`; call `todosService.create(text)`; respond with 201 and the created todo; on validation error respond with 400 `{ error: '...' }`; on other errors respond with 500
- [x] T021 [US1] Register `POST /` route in `backend/src/routes/todos.ts` pointing to `todosController.create`
- [x] T022 [P] [US1] Add `createTodo(text: string): Promise<Todo>` fetch helper to `frontend/lib/api.ts`: POST to `/api/todos` with `{ text }` JSON body; throw on non-OK response; return the created `Todo`
- [x] T023 [US1] Create `frontend/app/components/TodoInput.tsx` (`"use client"`): controlled `<input>` bound to local state; `<button>` to submit; trim and validate input client-side before calling `createTodo`; accept `onAdd: (todo: Todo) => void` callback prop; disable input and button while submitting; display an inline error message on failure; clear the input on success
- [x] T024 [US1] Add `handleAddTodo` to `frontend/app/page.tsx`: render `<TodoInput onAdd={...} />`; in `onAdd` prepend the returned todo to the local `todos` state (so it appears at the top without a full re-fetch)

**Checkpoint**: Submitting a task creates it in the DB, shows it at the top of the list, and it survives reload. Submitting blank input shows a validation message. Quickstart Scenarios B and G pass.

---

## Phase 5: User Story 3 — Mark a Task as Done / Undo Completion (Priority: P2)

**Goal**: User clicks a toggle on a todo to mark it complete (strikethrough) or incomplete. State persists across reloads. Network errors leave the visual state unchanged.

**Independent Test**: Click the toggle on a task, verify strikethrough appears; reload and verify state is preserved; click again to undo (Quickstart Scenarios D and E).

### Implementation

- [x] T025 [US3] Add `update(id: string, data: { completed?: boolean })` method to `backend/src/services/todosService.ts`: call `prisma.todo.update({ where: { id }, data })`; let Prisma throw on unknown id (caught in controller); return the updated todo
- [x] T026 [US3] Add `update` handler to `backend/src/controllers/todosController.ts`: read `id` from `req.params` and `completed` from `req.body`; validate that `completed` is a boolean; call `todosService.update`; respond 200 with updated todo; handle Prisma's `P2025` not-found error as 404; handle other errors as 500
- [x] T027 [US3] Register `PUT /:id` route in `backend/src/routes/todos.ts` pointing to `todosController.update`
- [x] T028 [P] [US3] Add `updateTodo(id: string, data: { completed: boolean }): Promise<Todo>` fetch helper to `frontend/lib/api.ts`: PUT to `/api/todos/${id}` with JSON body; throw on non-OK response; return the updated `Todo`
- [x] T029 [US3] Add toggle button to `frontend/app/components/TodoItem.tsx`: accept `onToggle: (id: string) => Promise<void>` prop; render a checkbox or button that calls `onToggle(todo.id)` on click; show a per-item loading state while the request is in progress; show a per-item error message on failure; do NOT change the visual state until the API call succeeds
- [x] T030 [US3] Add `handleToggleTodo` to `frontend/app/page.tsx`: call `updateTodo(id, { completed: !todo.completed })`; on success update the matching todo in local `todos` state; pass `onToggle={handleToggleTodo}` to `<TodoItem />`

**Checkpoint**: Toggling a task updates its strikethrough styling and state persists after reload. Network errors leave the task unchanged. Quickstart Scenarios D and E pass.

---

## Phase 6: User Story 4 — Delete a Task (Priority: P2)

**Goal**: User clicks delete on a todo and it is permanently removed from the list. It does not reappear after reload. Network errors leave the list unchanged.

**Independent Test**: Delete a task, confirm it disappears from the list, reload and confirm it is gone (Quickstart Scenario F).

### Implementation

- [x] T031 [US4] Add `remove(id: string)` method to `backend/src/services/todosService.ts`: call `prisma.todo.delete({ where: { id } })`; let Prisma throw on unknown id (caught in controller)
- [x] T032 [US4] Add `remove` handler to `backend/src/controllers/todosController.ts`: read `id` from `req.params`; call `todosService.remove`; respond 204 with no body; handle Prisma `P2025` as 404; other errors as 500
- [x] T033 [US4] Register `DELETE /:id` route in `backend/src/routes/todos.ts` pointing to `todosController.remove`
- [x] T034 [P] [US4] Add `deleteTodo(id: string): Promise<void>` fetch helper to `frontend/lib/api.ts`: DELETE to `/api/todos/${id}`; throw on non-OK response
- [x] T035 [US4] Add delete button to `frontend/app/components/TodoItem.tsx`: accept `onDelete: (id: string) => Promise<void>` prop; render a delete button (e.g., "×") that calls `onDelete(todo.id)` on click; show a per-item loading state while deleting; show a per-item error message on failure; do NOT remove from UI until the API call succeeds
- [x] T036 [US4] Add `handleDeleteTodo` to `frontend/app/page.tsx`: call `deleteTodo(id)`; on success filter the deleted todo out of local `todos` state; pass `onDelete={handleDeleteTodo}` to `<TodoItem />`

**Checkpoint**: Clicking delete removes the task from the list immediately and it does not reappear on reload. Network errors leave the list intact. Quickstart Scenario F passes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass covering cross-story UX, edge cases, and end-to-end validation.

- [x] T037 [P] Add global error banner to `frontend/app/page.tsx`: ensure the error state from the initial `getTodos` call is displayed as a dismissible banner above the list without removing existing list items (covers Quickstart Scenario H)
- [x] T038 [P] Verify CORS is configured correctly in `backend/src/server.ts` so the frontend origin (from `NEXT_PUBLIC_API_URL`) is explicitly allowed
- [x] T039 Run all Quickstart validation scenarios A–H from `specs/001-fullstack-todo-app/quickstart.md`; fix any failures before marking the feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases
- **US2 View All (Phase 3)**: Depends on Phase 2 — first story to implement (needed to verify all others)
- **US1 Add Task (Phase 4)**: Depends on Phase 2; integrates with Phase 3 frontend
- **US3 Toggle (Phase 5)**: Depends on Phase 2; integrates with Phase 3+4 frontend
- **US4 Delete (Phase 6)**: Depends on Phase 2; integrates with Phase 3+4+5 frontend
- **Polish (Phase 7)**: Depends on all story phases being complete

### User Story Dependencies

- **US2 (P1)**: First story — no dependency on other stories
- **US1 (P1)**: Independent of US2 on backend; integrates into same page.tsx
- **US3 (P2)**: Extends `TodoItem.tsx` from US2; independent backend endpoint
- **US4 (P2)**: Extends `TodoItem.tsx` from US3; independent backend endpoint

### Within Each User Story (sequential order)

1. Backend service method
2. Backend controller handler
3. Backend route registration
4. (In parallel with 1–3) Frontend API helper
5. (In parallel with 1–3) Frontend component(s)
6. page.tsx integration (depends on 1–5)

### Parallel Opportunities

Within Phase 3 (US2):
```
Run in parallel:
  T012 → T013 → T014 (backend: service → controller → route)
  T015 (TodoList component)
  T016 (TodoItem component — display only)
  T017 will be done after T012–T016 are complete (page.tsx integration)
  T015 and T016 run alongside T012–T014 (different files)
```

Within Phase 4 (US1):
```
Run in parallel:
  T019 → T020 → T021 (backend: service → controller → route)
  T022 (api.ts helper)
  T023 depends on T022 (TodoInput uses createTodo)
  T024 depends on T019–T023 (page.tsx integration)
```

Within Phase 5 (US3):
```
Run in parallel:
  T025 → T026 → T027 (backend: service → controller → route)
  T028 (api.ts helper)
  T029 depends on T028 (TodoItem uses updateTodo)
  T030 depends on T025–T029 (page.tsx integration)
```

Within Phase 6 (US4):
```
Run in parallel:
  T031 → T032 → T033 (backend: service → controller → route)
  T034 (api.ts helper)
  T035 depends on T034 (TodoItem uses deleteTodo)
  T036 depends on T031–T035 (page.tsx integration)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: US2 — View All Tasks → **Validate independently**
4. Complete Phase 4: US1 — Add a Task → **Validate independently**
5. **STOP and DEMO**: The core to-do loop (add + view) works end-to-end

### Incremental Delivery

1. Foundation → View + Add (MVP, both P1 stories)
2. Add Toggle Completion (P2)
3. Add Delete (P2)
4. Polish pass

### Single-Developer Sequence

```
T001 → T002, T003, T004 (parallel setup)
T005 → T006 → T007 → T008 → T009, T010, T011 (parallel foundation)
T012 → T013 → T014 (backend US2, then:)
T015, T016 (parallel frontend US2 components, then:)
T018 (page.tsx US2)
T019 → T020 → T021 (backend US1, then:)
T022, T023 (api helper + TodoInput, then:)
T024 (page.tsx US1)
... continue for US3 and US4
T037, T038, T039 (polish)
```

---

## Notes

- `[P]` tasks operate on different files with no shared dependencies in their phase
- `[Story]` label maps every implementation task to its user scenario for traceability
- `TodoItem.tsx` is created in Phase 3 (display-only) and extended in Phases 5 and 6 (toggle and delete buttons)
- `frontend/lib/api.ts` accumulates helpers across phases — each phase adds one new function to the file
- `backend/src/services/todosService.ts` and `backend/src/controllers/todosController.ts` accumulate methods across phases
- Commit after each phase checkpoint to preserve independently working increments
- Refer to `specs/001-fullstack-todo-app/quickstart.md` for end-to-end validation steps
- Refer to `specs/001-fullstack-todo-app/contracts/rest-api.md` for exact request/response shapes
