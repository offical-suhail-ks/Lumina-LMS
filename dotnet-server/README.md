# Lumina LMS API

ASP.NET Core 8 + EF Core backend for Lumina LMS — a full port of the original
Node/Express backend (`server/`), rebuilt on Postgres (Neon) with real
authentication, feature-folder architecture, and several source-app bugs fixed
rather than carried over. 118/118 original routes covered, plus one addition.

```
POST /auth/login          →  { token, user }        JWT, not the source app's fake uuid() token
GET  /students             →  401 without a Bearer token — the source app never actually enforced this
```

---

## Contents

- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Configuration reference](#configuration-reference)
- [Database](#database)
- [Running](#running)
- [Adding a new feature module](#adding-a-new-feature-module)
- [Conventions](#conventions)
- [Behavioral differences from the source Node app](#behavioral-differences-from-the-source-node-app)
- [Not ported](#not-ported)
- [Verification performed](#verification-performed)

---

## Architecture

Four projects, standard clean-architecture dependency direction
(`Api → Infrastructure → Application → Domain`, arrows meaning "depends on"):

```
┌─────────────────────────────────────────────────────────────────┐
│ LuminaLms.Api            controllers, Program.cs, appsettings   │
├─────────────────────────────────────────────────────────────────┤
│ LuminaLms.Infrastructure  EF Core, JWT, BCrypt, SMTP, file I/O   │
│                           — implements Application's interfaces │
├─────────────────────────────────────────────────────────────────┤
│ LuminaLms.Application     DTOs + service interfaces + auth       │
│                           contracts — no EF Core, no HTTP        │
├─────────────────────────────────────────────────────────────────┤
│ LuminaLms.Domain          entities + enums — no dependencies     │
└─────────────────────────────────────────────────────────────────┘
```

Within `Application` and `Infrastructure`, code is organized by **feature**,
not by technical type. Everything about payments — the DTOs, the service
interface, the service implementation — lives under a `Payments/` folder in
each project, not scattered across generic `Dtos/`, `Services/` folders. This
is what makes ~20 modules navigable instead of three folders of 20+ flat files.

Controllers mirror the same feature folders for consistency, though that's
purely organizational — ASP.NET Core discovers controllers by reflection, so
folder location never affects routing.

## Project structure

```
LuminaLms.sln
database/
  consolidated-schema.sql     reference doc — reconciled schema from every
                               server/database/*.sql script (see Database below)
src/
  LuminaLms.Domain/
    Entities/                 40 tables, grouped into ~17 cohesive files
    Enums/                    27 Postgres enum types as C# enums

  LuminaLms.Application/
    Auth/                     login, JWT, password hashing, password reset
    Common/                   JsonPatch, EnumConvert, EmailTemplates,
                               ScheduleCalculator, cross-cutting interfaces
    Features/<Domain>/        one folder per module — DTOs + I<X>Service
    GlobalUsings.cs           makes every Features.* namespace ambient

  LuminaLms.Infrastructure/
    Auth/                     AuthService, JwtTokenService, BCryptPasswordHasher,
                               PasswordResetService
    Email/                    SmtpEmailSender (dev fallback: logs instead of sending)
    Storage/                  LocalFileStorageService (module/assignment/video uploads)
    Features/<Domain>/        service implementations, mirrors Application/Features
    Persistence/
      LmsDbContext.cs         DbSets + Postgres enum registration
      LmsDbContextFactory.cs  `dotnet ef` design-time factory
      NpgsqlEnumMappings.cs   ADO.NET-level enum read/write mapping
      PostgresConnectionStringHelper.cs   accepts postgres:// URIs or Key=Value
      DbSeeder.cs             idempotent default accounts + feature flags
      Configurations/         EF Core fluent config, grouped by related tables
      Migrations/
    Options/                  strongly-typed appsettings sections
    DependencyInjection.cs    single AddInfrastructure() extension method
    GlobalUsings.cs

  LuminaLms.Api/
    Controllers/<Domain>/     one folder per module, mirrors Application/Features
    Common/                   ExceptionHandlingMiddleware, CsvWriter
    Program.cs
    appsettings.json          structure only — no secrets committed
    GlobalUsings.cs
```

**Why global usings instead of per-file imports?** With ~20 feature
namespaces referenced across ~90 files, tracking exactly which of
`Application.Features.Payments` / `.Quizzes` / `.Students` / etc. each
controller or service needs is pure friction with no payoff — the whole point
of a feature namespace is that everything in it belongs together. Each
project's `GlobalUsings.cs` makes all of them ambient project-wide, the same
way `ImplicitUsings` already makes `System`, `System.Linq`, etc. ambient.

## Getting started

1. **.NET 8 SDK** — `dotnet --list-sdks` should list `8.0.x`.
2. **A PostgreSQL database.** This project runs on **Neon** (not Supabase —
   see [Database](#database)), but any Postgres 14+ host works.
3. Clone, then configure secrets (next section) before running anything.

## Configuration reference

Nothing sensitive is committed — `appsettings.json` only has the key
structure with empty/default values. Configure via `dotnet user-secrets`
(recommended for local dev) or environment variables:

```bash
cd src/LuminaLms.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Postgres" "<connection string>"
dotnet user-secrets set "Jwt:Secret" "<at least 32 random bytes>"

# optional — omit Smtp:Host and emails are logged to the console instead of sent
dotnet user-secrets set "Smtp:Host" "smtp.example.com"
dotnet user-secrets set "Smtp:User" "..."
dotnet user-secrets set "Smtp:Pass" "..."
```

Environment-variable form uses `__` as the nesting separator, e.g.
`ConnectionStrings__Postgres`, `Jwt__Secret` — same values, useful for CI or
containers where user-secrets aren't available.

| Key | Purpose | Default |
|---|---|---|
| `ConnectionStrings:Postgres` | Npgsql connection string — accepts either `postgres://user:pass@host/db?sslmode=require` or `Host=...;Database=...;Username=...;Password=...` | *(required)* |
| `Jwt:Secret` | HMAC-SHA256 signing key for auth tokens | *(required)* |
| `Jwt:Issuer` / `Jwt:Audience` | Token claims | `LuminaLms` |
| `Jwt:ExpiryMinutes` | Token lifetime | `480` |
| `Smtp:Host` | SMTP server; omit to log emails to console instead | *(dev fallback)* |
| `Smtp:FrontendUrl` | Base URL for email links (reset-password, fees) | `http://localhost:5173` |
| `Storage:RootPath` | Local upload directory | `uploads` |
| `Database:AutoMigrateOnStartup` | Apply pending EF migrations on boot | `false` |
| `Database:SeedOnStartup` | Insert default accounts + feature flags if missing (idempotent, safe to leave on) | `false` |

## Database

**This backend runs on Neon, not Supabase.** The Node backend's Supabase
project (`server/`) is unrelated going forward — that decision was made
explicitly partway through the port, keeping Postgres but moving providers.

The EF Core model *is* the schema source of truth
(`src/LuminaLms.Infrastructure/Persistence/Migrations`). `database/consolidated-schema.sql`
is a **reference document only**, kept for traceability back to the original
`server/database/*.sql` scripts — reconciled into one coherent 40-table
schema, with a header documenting several bugs found in the original SQL
(index-name collisions, missing FKs, tables defined with invalid MySQL syntax
mixed into Postgres migration files). The EF migration is what actually runs.

**Apply the schema to a fresh database:**

```bash
cd src/LuminaLms.Api
dotnet ef database update --project ../LuminaLms.Infrastructure --startup-project .
```

Creates every table, enum type, index, and FK. Does **not** seed data — set
`Database:SeedOnStartup=true` for one run (or leave it on permanently, it's
idempotent) to insert:
- Default `admin` / `faculty` / `accounting` accounts (bcrypt-hashed — the
  source app's seed used plaintext `'admin'`, `'faculty'`, `'accounting'`)
- The 8 default feature-flag rows

### If you add a 28th Postgres enum

`modelBuilder.HasPostgresEnum<T>("some_name")`'s single positional string
binds to the **schema** parameter, not the enum name — passing it
positionally silently creates a schema named after your enum instead of a
plain `public.some_name` type, and no `CREATE TYPE` gets emitted for the name
your table columns actually reference. Always use the named parameter:

```csharp
modelBuilder.HasPostgresEnum<MyEnum>(name: "my_enum");   // correct
modelBuilder.HasPostgresEnum<MyEnum>("my_enum");          // wrong — "my_enum" becomes the schema
```

Already fixed in `LmsDbContext.OnModelCreating`; documented here because it's
a silent failure mode (compiles fine, migration generates, `dotnet ef
database update` fails with a confusing "type does not exist" error on table
creation) that's easy to reintroduce without knowing the gotcha.

## Running

```bash
# backend
cd dotnet-server
dotnet run --project src/LuminaLms.Api
# → https://localhost:7187 and http://localhost:5245, Swagger UI opens automatically

# frontend (repo root, separate terminal)
npm run dev
# → http://localhost:5173 — set VITE_API_URL in .env.local to point at the port above
```

Seeded accounts (after `Database:SeedOnStartup=true` has run once):
`admin`/`admin`, `faculty`/`faculty`, `accounting`/`accounting`.

## Adding a new feature module

The pattern is the same in every layer — following it keeps new modules as
navigable as the existing ones:

1. **Domain**: add entity classes to `Domain/Entities/`, enums to `Domain/Enums/`.
2. **Application**: create `Application/Features/<Name>/`, add `<Name>Dtos.cs`
   (records/DTOs) and `I<Name>Service.cs` (interface). Add the namespace to
   `Application/GlobalUsings.cs`.
3. **Infrastructure**: create `Infrastructure/Features/<Name>/<Name>Service.cs`
   implementing the interface, using `LmsDbContext` directly (no repository
   layer — EF Core's `DbContext` already *is* a unit of work). Register it in
   `DependencyInjection.cs`. Add both namespaces (Application and
   Infrastructure sides) to `Infrastructure/GlobalUsings.cs`.
4. **Api**: create `Api/Controllers/<Name>/<Name>Controller.cs` — thin, one
   call into the service per action. Add the Application namespace to
   `Api/GlobalUsings.cs`.
5. If the entity has a new Postgres enum, register it in both
   `LmsDbContext.OnModelCreating` (`HasPostgresEnum`, **named** `name:`
   parameter) and `NpgsqlEnumMappings.MapLmsEnums` — then regenerate the
   migration.

## Conventions

- **Partial updates use `JsonElement`, not typed PATCH DTOs.** System.Text.Json
  can't distinguish "field omitted" from "field explicitly null" against a
  plain C# DTO. Several source endpoints depend on that distinction (e.g.
  editing a student's phone number must never blank out their fee plan just
  because the request didn't mention it). Controllers bind the raw body as
  `JsonElement` and services use `JsonPatch`'s `Has()`/`GetString()`/etc.
  extension methods (`Application/Common/JsonPatch.cs`) to apply only the
  fields actually present.
- **Enum strings use snake_case on the wire, matching the original API
  contract** (`"fee_setup"`, not `"FeeSetup"`). `EnumConvert`
  (`Application/Common/EnumConvert.cs`) converts between the PascalCase C#
  enum members and the snake_case strings clients send/receive.
- **String IDs, not database identities.** Every table's primary key is a
  client-generated string (`$"student-{Guid.NewGuid()}"`), matching the
  source app's convention — `.ValueGeneratedNever()` on every entity
  configuration. Kept deliberately rather than switched to native
  `uniqueidentifier`/`int` to avoid a second, unrelated migration decision
  bundled into this port.
- **No repository/unit-of-work abstraction.** Services take `LmsDbContext`
  directly. Multi-statement writes that need to be atomic are wrapped in
  explicit `_db.Database.BeginTransactionAsync()` blocks rather than hidden
  behind a generic abstraction.

## Behavioral differences from the source Node app

Fixed rather than ported, since they're bugs, not intended behavior:

- **Plaintext passwords** → BCrypt, with lazy migration: on a successful
  login where the stored value isn't a bcrypt hash, it's rehashed and saved
  immediately. No bulk backfill needed.
- **No real auth enforcement** — the source `authMiddleware` was a
  pass-through stub and `/auth/login` returned `uuid()` as the "token" → real
  JWT bearer auth with role-based `[Authorize]` on every controller.
- **MySQL syntax that doesn't run on Postgres**: `CURDATE()`, `DATE_SUB(...)`,
  `ON DUPLICATE KEY UPDATE` in `certificateService`, `analyticsService`,
  `mailboxService`, `quizService`, `videoService` → correct Postgres/EF Core
  equivalents.
- **`quiz_answers` had no unique constraint** on `(attempt_id, question_id)`
  despite needing upsert semantics → added, so answer resubmission is a real
  update instead of accumulating duplicate rows.
- **Mailbox announcement targeting bug**: source compared the singular role
  string (`"student"`) directly against the plural `announcement_audience`
  enum (`"students"`), so role-targeted announcements could never match →
  explicit role→audience mapping.
- **N+1 queries** (courses, assignments, modules, quiz questions) → single
  queries with `Include()`.
- **Un-transacted multi-statement writes** (task creation, course
  create/update, forum replies) → wrapped in EF Core transactions.
- **Emailing plaintext passwords** in welcome/offer-letter emails → replaced
  with a one-time "set your password" link via the password-reset-token
  mechanism, since passwords aren't recoverable once hashed.
- **`/export/students` and `/export/courses`** called service methods that
  don't exist in the source (`listStudents`/`listCourses` vs. the real
  `getAll`) — dead code in the original; implemented for real here.

## Not ported

- `chat_groups` / `chat_group_messages` / `private_chat_threads` /
  `private_chat_messages` — tables exist in the schema (and as EF entities
  here) but had **zero** routes in `server/src/index.js`. Dead feature; no
  controller was written. Build on the existing entities if this needs to
  become real.
- `/ai/generate-questions` — ported as the same demo stub the source had
  (generates fake sample questions, no real AI call wired up).

## Verification performed

- Full solution build — clean, 0 errors.
- `dotnet ef database update` applied against a **live Neon database**: all
  27 enum types and 40 tables created for real, not just validated at the
  model level.
- Logged in as the seeded admin and faculty accounts against that live
  database — real bcrypt verification, real JWT issued.
- Exercised full read/write/cascade flows against Neon: created a course,
  created a student (triggering the accounting-task side effect inside a
  transaction), listed the resulting task, then deleted both — `ON DELETE
  CASCADE` removed the task automatically, confirmed empty afterward.
- Route-by-route diff of all 118 original Express routes against the live
  ASP.NET Core route table — 118/118 present, one addition (`GET
  /students/{id}`, never exposed by the source app).
- Full feature-folder reorganization re-verified end-to-end afterward
  (build + live login) to confirm no regressions from the restructuring.
- Not yet tested from the React frontend with real user flows beyond login —
  do that next.
