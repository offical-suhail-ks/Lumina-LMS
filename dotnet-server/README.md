# Lumina LMS API — ASP.NET Core port

A full port of the Node/Express (`server/`) backend to ASP.NET Core 8 + EF Core,
targeting the same PostgreSQL/Supabase database. 95 routes / 119 operations
across every module of the original API (auth, students, faculty, accounting,
courses, assignments, attendance, payments, mailbox, quizzes, forum,
certificates, notifications, analytics, videos, achievements, activity logs,
feature flags, export).

## Solution layout

```
LuminaLms.sln
src/
  LuminaLms.Domain          entities + enums, no dependencies
  LuminaLms.Application     DTOs, service interfaces, auth contracts, JSON-patch/enum helpers
  LuminaLms.Infrastructure  EF Core DbContext + migrations, service implementations,
                             JWT/BCrypt/email/file-storage
  LuminaLms.Api             controllers, Program.cs, appsettings
```

Business logic lives in `Infrastructure/Services/*Service.cs` behind interfaces
defined in `Application/Services`. Controllers are thin — they call one service
method and shape the HTTP response. Simple CRUD (calendar, staff accounts) uses
the same pattern for consistency rather than talking to `DbContext` directly.

## Prerequisites

- .NET 8 SDK (`dotnet --list-sdks` should show `8.0.x`)
- A PostgreSQL database. This project uses **Neon** (not Supabase — decided
  during the port; see **Database** below), but any Postgres host works.

## Configuration

Nothing sensitive is committed. Set these via `dotnet user-secrets` (recommended
for local dev) or environment variables (`ConnectionStrings__Postgres`,
`Jwt__Secret`, etc. — double underscore is .NET's env-var nesting separator).

```bash
cd src/LuminaLms.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Postgres" "<connection string>"
dotnet user-secrets set "Jwt:Secret" "<at least 32 random bytes>"
# optional — omit Smtp:Host to log emails to the console instead of sending
dotnet user-secrets set "Smtp:Host" "smtp.example.com"
dotnet user-secrets set "Smtp:User" "..."
dotnet user-secrets set "Smtp:Pass" "..."
```

The connection string accepts either the classic ADO.NET form
(`Host=...;Database=...;Username=...;Password=...;SSL Mode=Require`) or a
`postgres://user:pass@host/db?sslmode=require` URI — hosted providers
(Neon, Heroku, Railway) usually hand out the URI form, and it's normalized
automatically (`PostgresConnectionStringHelper`).

| Key | Purpose | Default |
|---|---|---|
| `ConnectionStrings:Postgres` | Npgsql connection string (URI or keyword form) | *(required)* |
| `Jwt:Secret` | HMAC-SHA256 signing key for auth tokens | *(required)* |
| `Jwt:ExpiryMinutes` | Token lifetime | 480 |
| `Smtp:Host` | SMTP server; omit to log emails to console in dev | *(none — dev fallback)* |
| `Smtp:FrontendUrl` | Base URL used to build email links (reset-password, fees) | `http://localhost:5173` |
| `Storage:RootPath` | Local upload directory (module materials, assignments, videos) | `uploads` |
| `Database:AutoMigrateOnStartup` | Run pending EF migrations on boot | `false` |
| `Database:SeedOnStartup` | Insert default admin/faculty/accounting users + feature flags if missing (idempotent, safe to leave on) | `false` |

## Database

**This project no longer uses Supabase.** Partway through the port, the
decision was made to move off Supabase specifically (keeping Postgres) —
it now runs against a **Neon** Postgres database. `server/`'s Supabase
project is unrelated to this backend going forward.

The EF Core model (`src/LuminaLms.Infrastructure/Persistence/Migrations`) and
`database/consolidated-schema.sql` both describe the same **intended final
schema** — 40 tables, reconciled from `server/database/schema-postgres.sql`
plus every `migrate-add-*` script, with several latent bugs fixed along the way
(see **Behavioral differences** below). `consolidated-schema.sql` is a
reference document only — the EF Core migration is what actually runs.

Apply the schema to a fresh database with:

```bash
cd src/LuminaLms.Api
dotnet ef database update --project ../LuminaLms.Infrastructure --startup-project .
```

This creates every table, enum type, index, and FK. It does **not** insert
seed data — set `Database:SeedOnStartup=true` for one run (or permanently,
it's idempotent) to insert the default admin/faculty/accounting accounts
(bcrypt-hashed, unlike the source app's plaintext seed) and the 8 default
feature-flag rows.

### Gotcha hit while wiring this up

`modelBuilder.HasPostgresEnum<T>("some_name")` binds that single positional
string to the **schema** parameter, not the enum type name — passing it
positionally silently created a schema-per-enum (e.g.
`achievement_type_enum.achievement_type`) instead of a plain
`public.achievement_type_enum` type, and no `CREATE TYPE` was emitted for the
name the table columns actually reference. Every enum registration must use
the named `name:` parameter (`HasPostgresEnum<AchievementType>(name: "achievement_type_enum")`)
— already fixed in `LmsDbContext.OnModelCreating`, documented here in case you
add a 28th enum later and hit the same trap.

## Running

```bash
dotnet run --project src/LuminaLms.Api
```

Swagger UI is at `/swagger` in Development. The root `/` returns a health payload.

## Authentication

Real JWT bearer auth with role claims (`[Authorize(Roles = "admin,faculty")]`
on controllers) — **this is new**. The source Node app's `authMiddleware` was a
pass-through stub (`// TODO: Verify JWT token here`) and `/auth/login` returned
`uuid()` as the "token", so the original API had no actual auth enforcement.

Passwords were stored in **plaintext** in the source app. This port hashes new/
changed passwords with BCrypt and lazily upgrades existing plaintext rows: on
a successful login where the stored value isn't a bcrypt hash, it's rehashed
and saved immediately. No bulk backfill migration is needed, but any account
that's never logged in again post-cutover keeps its plaintext value until it does.

## Behavioral differences from the source Node app

Fixed rather than ported, since they're bugs, not intended behavior:

- **Plaintext passwords** → BCrypt with lazy-migration (above).
- **No real auth** → JWT bearer + role-based `[Authorize]`.
- **MySQL syntax that doesn't run on Postgres**: `CURDATE()`, `DATE_SUB(...)`,
  `ON DUPLICATE KEY UPDATE` in `certificateService`, `analyticsService`,
  `mailboxService`, `quizService`, `videoService` — replaced with correct
  Postgres/EF Core equivalents.
- **`quiz_answers` had no unique constraint** on `(attempt_id, question_id)`
  despite the app needing upsert semantics — added, so answer resubmission is
  a real `ON CONFLICT`-style update instead of accumulating duplicate rows.
- **Mailbox announcement targeting bug**: the source compared a singular role
  (`"student"`) directly against the plural `announcement_audience` enum
  (`"students"`), so role-targeted announcements could never match. Fixed via
  an explicit role→audience mapping.
- **N+1 queries** (`courseService.getAll`, `assignmentService.getAll`,
  `moduleService.getAllByCourse`, `quizService.getQuestionsByQuiz`) → single
  queries with `Include()`.
- **Un-transacted multi-statement writes** (`accountingService.createTask`,
  `courseService.create/update`, `forumService.createReply`) → wrapped in EF
  Core transactions.
- **Emailing plaintext passwords** (welcome/offer-letter emails) → replaced
  with a one-time "set your password" link using the same password-reset-token
  mechanism, since passwords are no longer recoverable once hashed.
- **`/export/students` and `/export/courses`** called service methods that
  don't exist in the source (`listStudents`/`listCourses` vs. the real
  `getAll`) — dead code in the original; implemented for real here.

## Not ported

- `chat_groups` / `chat_group_messages` / `private_chat_threads` /
  `private_chat_messages` tables exist in the schema but have **no** routes in
  `server/src/index.js` — dead feature, so no controller was written. The
  entities/EF configuration exist if you want to build routes on them later.
- `/ai/generate-questions` is ported as the same demo stub the source app had
  (no real AI call wired up).

## Verification performed

- `dotnet build` across the full solution — clean, 0 errors.
- `dotnet ef database update` applied cleanly against a **live Neon database**
  (not just `migrations add` — the actual DDL ran and all 27 enum types + 40
  tables exist there now).
- Seeded and logged in as the default admin and faculty accounts against that
  live database — real bcrypt verification, real JWT issued.
- Exercised real read/write/cascade flows against Neon: created a course,
  created a student (which triggers the accounting-task side effect in a real
  transaction), listed the resulting accounting task, then deleted the student
  and course again to leave the database clean (`ON DELETE CASCADE` removed
  the task automatically).
- `GET /students` without a token returns 401; `POST /auth/login` against an
  unreachable DB correctly surfaces as 500, not misclassified as a 400.
- Not yet tested from the React frontend (`src/services/api.js` still points
  at the old backend) — that's the natural next step.
