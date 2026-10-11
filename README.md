# Mini Ticket Tracker

A small support-ticket tracker: a REST API, a PostgreSQL database and a single-page UI.

- **API:** Node.js, Express 5, TypeScript, Prisma, zod
- **Database:** PostgreSQL 17
- **UI:** Angular 21, TanStack Query, PrimeNG (Aura theme) and Tailwind CSS
- **Tests:** Vitest + Supertest against a real PostgreSQL test database
- **Runtime:** Docker Compose, pnpm workspace

## Quick start (Docker)

Requires Docker with Compose.

```bash
docker compose up --build
```

- UI: http://localhost:8080
- API: http://localhost:3000 (also proxied by the UI at `/api`)

Migrations run automatically when the API container starts. If a port is taken, override it, e.g. `WEB_PORT=8081 API_PORT=3001 DB_PORT=5440 docker compose up --build`.

## Local development (pnpm workspace)

The repo is a pnpm workspace with two packages, `api` and `web`, and one lockfile at the root. Requires Node.js 22.12+, pnpm 11 (`npm install -g pnpm` or `corepack enable`) and Docker.

One-time setup from the repo root:

```bash
pnpm install                       # installs api + web, generates the Prisma client
cp api/.env.example api/.env
```

Then, from the repo root:

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Starts PostgreSQL, applies migrations, then runs the API (http://localhost:3000) and UI (http://localhost:4200) with live reload |
| `pnpm dev:api` | Database + API only |
| `pnpm dev:web` | UI only (proxies `/api` to the API on port 3000) |
| `pnpm test` | Starts the test database and runs the API integration tests |
| `pnpm build` | Builds both packages |
| `pnpm docker` | Everything in Docker (same as the quick start) |

The dev scripts stop the `api` and `web` containers first so ports 3000 and 4200 are free. To run a script in one package directly, use a filter, e.g. `pnpm --filter api exec prisma studio`.

## Running the tests

The integration tests hit the real HTTP layer and a separate PostgreSQL database, which is truncated before each test.

```bash
pnpm test
```

If port 5433 is taken, add `TEST_DB_PORT=5440` to a `.env` file in the repo root and set `TEST_DATABASE_URL=postgresql://tickets:tickets@localhost:5440/tickets_test` in `api/.env`.

The tests cover creating a ticket (defaults and validation), filtering and pagination, updating status/priority (including 404 and rejected fields) and the stats endpoint.

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/tickets` | Create a ticket. Body: `title` (required, max 200), `description?`, `priority?`, `status?` |
| `GET` | `/tickets` | List tickets, newest first. Query: `status?`, `page` (default 1), `limit` (default 20, max 100) |
| `PATCH` | `/tickets/:id` | Update `status` and/or `priority` (no other fields) |
| `GET` | `/tickets/stats` | Ticket counts per status, e.g. `{ "open": 3, "in_progress": 1, "closed": 0 }` |

`status` is one of `open`, `in_progress`, `closed`; `priority` is one of `low`, `medium`, `high`.

List response:

```json
{
  "data": [{ "id": 1, "title": "Printer offline", "description": null, "status": "open", "priority": "high", "createdAt": "2026-10-11T10:56:10.287Z" }],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

Errors use one shape, with `400` for validation, `404` for unknown tickets and `500` otherwise:

```json
{ "error": { "message": "Validation failed", "details": [{ "field": "title", "message": "Title is required" }] } }
```

Example:

```bash
curl -X POST localhost:3000/tickets -H 'content-type: application/json' -d '{"title":"VPN drops every hour","priority":"high"}'
curl 'localhost:3000/tickets?status=open&page=1&limit=10'
curl -X PATCH localhost:3000/tickets/1 -H 'content-type: application/json' -d '{"status":"in_progress"}'
curl localhost:3000/tickets/stats
```

## Project structure

```
api/
  prisma/schema.prisma        data model (enums, index) + migrations/
  src/app.ts                  express app (imported by tests)
  src/tickets/                router (HTTP) -> service (Prisma queries), zod schemas,
                              mapper (uppercase enums <-> lowercase API values)
  src/middleware/errors.ts    consistent JSON errors
  test/tickets.test.ts        integration tests
web/
  src/app/tickets.api.ts      typed API client
  src/app/stats-bar/          counts per status
  src/app/ticket-form/        create form (opened in a dialog from the list)
  src/app/ticket-list/        list, status filter, pagination, inline status change, "New ticket" dialog
  nginx.conf                  serves the UI and proxies /api to the API
docker-compose.yml            db, api, web (+ db-test for tests)
pnpm-workspace.yaml           workspace packages + allowed install scripts
```

## Decisions & Tradeoffs

I used plain Express with a small router, service and schema split, because it matches the brief directly and keeps each request easy to follow; a framework like NestJS would add structure this size does not need yet. Prisma owns the schema and migrations, and PostgreSQL enums plus a composite `(status, created_at)` index back the status filter and newest-first ordering; enums are uppercase in code (`IN_PROGRESS`) and mapped to the spec's lowercase values (`in_progress`) in the database and in one API mapper, so the public contract matches the brief exactly. Assumptions: any status transition is allowed (including reopening a closed ticket), PATCH accepts only `status` and `priority` as specified, new tickets default to `open`/`medium`, and ids are auto-increment integers rather than UUIDs. Pagination is offset-based with `id` as a tie-breaker for stable ordering, which is simple but gets slower and can shift rows on very large or fast-changing tables, where I would switch to cursor pagination. On the frontend, TanStack Query handles caching, loading and error states; every query key starts with `tickets`, so a single invalidation after a create or status change refreshes both the list and the stats. Shortcuts I took: no authentication or users, off-the-shelf PrimeNG components with Tailwind for layout instead of custom design (which raised the Angular bundle budget to 1.5 MB, about 250 kB gzipped), no frontend tests, and the API image keeps dev dependencies so it can run Prisma migrations on startup. I chose Angular 21 over 22 because 22 requires a very recent Node release, which would make local setup harder for reviewers. With more time I would add auth and ticket assignment, a status history (audit log), cursor pagination, component tests, a CI pipeline, and deployment to Azure App Service with Azure Database for PostgreSQL. I used an AI coding assistant for scaffolding and review; I reviewed every change and can walk through any decision.
