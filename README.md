# Bookmark Manager

A GraphQL API for organizing bookmarks into folders, with title search and cursor-based pagination. Built with Bun, GraphQL Yoga, Prisma ORM 7, and PostgreSQL.

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | [Bun](https://bun.com) |
| Language | TypeScript (strict mode, no `any`) |
| API | GraphQL Yoga, schema-first (`src/graphql/schema.graphql`) |
| ORM | Prisma ORM 7 (`prisma-client` generator + `@prisma/adapter-pg`) |
| Database | PostgreSQL 17 via Docker Compose |
| Tests | `bun:test` (resolver unit tests + PostgreSQL integration) |

## Features

- Folders: list, fetch (with nested bookmarks), create, rename, delete
- Bookmarks: create, update, delete, move between folders
- Filter bookmarks by `folderId`
- Search bookmarks by title substring (`search`)
- Cursor-based pagination (`take` + `cursor`)
- Input validation and GraphQL errors (`BAD_USER_INPUT`, `NOT_FOUND`)
- Deleting a folder cascades to its bookmarks

### Validation

| Field | Rule |
| --- | --- |
| Folder name | Required after trim, max 100 characters |
| Bookmark title | Required after trim, max 200 characters |
| Bookmark URL | Must be a valid `http://` or `https://` URL |
| Tags | Optional; trimmed; blanks dropped; max 20 |
| `take` | Positive integer, default `10`, max `100` |

## Requirements

- [Bun](https://bun.com) v1.4 or later
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Git

## Setup

Clone the repository, copy the env file, start Postgres, install dependencies, generate the Prisma client and apply migrations, then start the API:

```bash
git clone https://github.com/Aniket2790/Bookmark-Manager.git
cd Bookmark-Manager
cp .env.example .env
docker compose up -d
bun install
bun run gendb
bun run dev
```

On Windows PowerShell, replace `cp .env.example .env` with:

```powershell
Copy-Item .env.example .env
```

If `bun run gendb` runs immediately after Compose and Postgres is not ready yet, wait a few seconds and run `bun run gendb` again.

The GraphQL server is at **http://localhost:4000/graphql** (GraphiQL is served at the same URL).

`bun run gendb` runs `prisma generate` and `prisma migrate deploy`.

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma Client and the Prisma CLI | `postgresql://postgres:postgres@localhost:5433/bookmark_manager` |

Copy `.env.example` to `.env`. `.env` is gitignored.

## Database

`docker-compose.yml` starts PostgreSQL 17:

| Setting | Value |
| --- | --- |
| Image | `postgres:17` |
| Container | `bookmark-manager-postgres` |
| Database | `bookmark_manager` |
| User / password | `postgres` / `postgres` |
| Host port | `5433` → container `5432` |
| Volume | `postgres_data` |

```bash
docker compose up -d
docker compose ps
docker compose down       # keep data
docker compose down -v    # wipe data
```

Prisma schema: `prisma/schema.prisma`. Migrations live in `prisma/migrations/` and are created with Prisma (`prisma migrate dev`), not by editing SQL by hand.

Useful commands:

```bash
bun run gendb                         # generate client + apply migrations
bunx prisma migrate dev --name ...    # create a new migration while developing
bunx prisma migrate status
bunx prisma studio
```

Models:

- **Folder** — `id` (UUID), `name`, `createdAt`, related `bookmarks`
- **Bookmark** — `id` (UUID), `title`, `url`, `tags` (`String[]`), `folderId`, `createdAt`

Relations: a bookmark belongs to one folder (`onDelete: Cascade`). Indexes on `Folder.name`, `Bookmark.folderId`, and `Bookmark.title`.

## Pagination

The `bookmarks` query uses **cursor-based pagination**.

- `take` — page size (default 10, max 100)
- `cursor` — the `id` of the last bookmark from the previous page

The resolver asks Prisma for `take + 1` rows, ordered by `createdAt desc` then `id desc`. If an extra row is returned, `pageInfo.hasNextPage` is `true` and that extra row is dropped from `nodes`. The next request passes `pageInfo.endCursor` as `cursor`. Prisma `skip: 1` avoids repeating the cursor row.

This is not a fixed offset window: each request continues after the previous cursor, so later pages return the next records.

Filtering (`folderId`, `search`) is applied on every page so pagination stays within the same result set.

## Running tests

```bash
bun test
bun run typecheck
bun run sanity    # typecheck + test
```

| Suite | Path | Needs Postgres? |
| --- | --- | --- |
| Bookmark resolvers | `src/graphql/resolvers/tests/bookmark.resolver.test.ts` | No |
| Folder resolvers | `src/graphql/resolvers/tests/folder.resolver.test.ts` | No |
| Validators | `src/graphql/validators/tests/` | No |
| Prisma + PostgreSQL | `src/lib/tests/prisma.integration.test.ts` | Yes |

Start Docker Postgres, set `DATABASE_URL`, and run `bun run gendb` before the integration tests. Validator and resolver tests do not need a database.

## API

Endpoint: `POST http://localhost:4000/graphql`

### Queries

| Query | Description |
| --- | --- |
| `folders` | All folders |
| `folder(id)` | One folder and its nested `bookmarks` |
| `bookmarks(folderId, search, take, cursor)` | Paginated bookmarks, optional folder filter and title search |
| `bookmark(id)` | One bookmark |

### Mutations

| Mutation | Description |
| --- | --- |
| `createFolder(name)` | Create a folder |
| `updateFolder(id, name)` | Rename a folder |
| `deleteFolder(id)` | Delete a folder (cascades bookmarks) |
| `createBookmark(title, url, tags, folderId)` | Create a bookmark |
| `updateBookmark(id, title, url, tags, folderId)` | Partial update |
| `deleteBookmark(id)` | Delete a bookmark |
| `moveBookmark(id, folderId)` | Move a bookmark to another folder |

Missing ids return `extensions.code: "NOT_FOUND"`. Invalid input returns `BAD_USER_INPUT`.

### Examples

Create a folder:

```graphql
mutation {
  createFolder(name: "Development") {
    id
    name
    createdAt
  }
}
```

Folder with nested bookmarks:

```graphql
query {
  folder(id: "FOLDER_ID") {
    id
    name
    bookmarks {
      id
      title
      url
      tags
    }
  }
}
```

Create a bookmark:

```graphql
mutation {
  createBookmark(
    title: "Prisma Docs"
    url: "https://www.prisma.io/docs"
    tags: ["prisma", "orm"]
    folderId: "FOLDER_ID"
  ) {
    id
    title
    url
    tags
    folderId
  }
}
```

Search and filter with pagination:

```graphql
query {
  bookmarks(folderId: "FOLDER_ID", search: "prisma", take: 10) {
    nodes {
      id
      title
      url
      tags
      createdAt
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Next page:

```graphql
query {
  bookmarks(
    folderId: "FOLDER_ID"
    search: "prisma"
    take: 10
    cursor: "BOOKMARK_ID_FROM_END_CURSOR"
  ) {
    nodes {
      id
      title
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Move a bookmark:

```graphql
mutation {
  moveBookmark(id: "BOOKMARK_ID", folderId: "OTHER_FOLDER_ID") {
    id
    folderId
    folder {
      id
      name
    }
  }
}
```

## Project structure

```text
bookmark-manager/
├── docker-compose.yml
├── prisma.config.ts
├── prisma/schema.prisma
├── prisma/migrations/
├── .env.example
└── src/
    ├── index.ts
    ├── lib/prisma.ts
    ├── lib/tests/prisma.integration.test.ts
    └── graphql/
        ├── schema.graphql
        ├── context.ts
        ├── errors.ts
        ├── resolvers/
        └── validators/
```

## Git

Remote: [https://github.com/Aniket2790/Bookmark-Manager](https://github.com/Aniket2790/Bookmark-Manager)

Default branch is `main`. Use Conventional Commits (`feat:`, `test:`, `docs:`). Do not commit `.env`, `node_modules/`, or `src/generated/prisma/`.

## How I'd extend this

This assignment stays a single-process GraphQL API on top of Postgres. If it became a production system, I would add:

- **Authentication** — issue sessions or JWTs; store `userId` on folders/bookmarks so data is per-user.
- **Authorization** — resolve the current user in Yoga context and reject reads/writes for rows the user does not own. Skip federation/RBAC until there is more than one role.
- **Caching** — cache hot folder lists in memory or Redis with short TTLs; invalidate on mutations. Nested `folder.bookmarks` is a candidate for DataLoader if N+1 shows up in traces.
- **Search** — `contains` on `title` is enough for this API. A larger catalog would use Postgres full-text search (`tsvector`) or an engine such as Meilisearch, plus indexes matched to the query pattern.
- **Observability** — structured request logs, OpenTelemetry traces around resolvers and Prisma, and metrics for latency and error codes (`NOT_FOUND` vs `BAD_USER_INPUT`).
- **API versioning** — keep schema-first SDL; additive GraphQL changes first. If a breaking change is required, ship a parallel `/graphql/v2` rather than mutating the existing contract in place.
- **Scaling** — connection pooling (PgBouncer or Prisma’s pool), migrate deploy in CI/CD, and horizontal replicas of the Yoga process in front of one primary database. Add read replicas only after write/read split is measurable.

I would not add auth, Redis, or extra infra in this repository unless those needs are explicit.
