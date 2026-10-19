# Architecture — AI Factory Intelligence & Decision Support System

> Tags: **[Spec]** = stated in mvp.md · **[Proposed]** = suggestion, needs owner confirmation · **[Open]** = undecided.
> mvp.md leaves the stack open (PostgreSQL is only a "candidate"). Everything under "Tech stack" is **[Proposed]** until confirmed and logged in `Memory.md`.

---

## 1. Architecture at a glance

Three layers, one authoritative data source [Spec]:

1. **Operations** — records orders, production, machines, inventory, costs, events.
2. **Intelligence** — deterministic feasibility, scheduling, stock, risk, profitability.
3. **AI interaction** — Copilot explains; Agent plans, gets approval, executes, verifies, reports.

### Request pipeline [Spec]
```
Frontend
  → authenticated API (rate limit, tenant + role check)
    → Agent API / context manager
      → intent / task planner (LLM → structured intent)
        → permission / risk engine (deterministic)
          → typed tool orchestrator (allowlisted tools only)
            → deterministic business services
              → database / file storage
                → verification (read-back of persisted state)
                  → UI result + audit log
```

**The LLM never touches the database or does critical arithmetic.** It interprets language, picks among approved tools, explains results, summarises, drafts, and extracts fields from documents (with confirmation). Backend services own inventory math, capacity, scheduling constraints, costs/profit, deadlines, permission decisions and transaction success. [Spec]

---

## 2. App flow

### 2.1 User journey
```
Sign up / log in
  → Onboarding (factory profile → machines → materials → products/processes → employees → suppliers)
     (partial allowed, resumable, suggestions marked "Suggested / Estimated — confirm before use")
  → Import Excel/CSV (optional): upload → sheet → mapping → preview/validation → confirm → commit → history
  → Dashboard ("What do I need to know today?")
  → Orders → create → Feasibility → candidate plan
  → Production Planning → Action preview → approval → apply → read-back → risk recalculation
  → Production Tracking (workers/supervisors: start, pause, problem, waste, complete)
  → Copilot Q&A  /  Agent tasks ("Prepare my factory for tomorrow")
  → Reports, AI Activity / Audit
```

### 2.2 Agent task flow (persisted state machine, not one big prompt) [Spec]
States: `RECEIVED → NEEDS_INFORMATION → PLANNING → ANALYSING → WAITING_FOR_APPROVAL → EXECUTING → VERIFYING → COMPLETED | PARTIALLY_COMPLETED | FAILED | BLOCKED | CANCELLED`

```
User message + page context
  1. Resolve user / factory / role permissions
  2. LLM → structured intent (goal, scope, tools, mutation: none until approved)
  3. Read tools (orders, schedule, machines, stock, employees…)
  4. Analysis tools (feasibility, risk, scheduler…)
  5. Rank issues → create proposed actions
  6. Action previews → WAITING_FOR_APPROVAL
  7. Approve / Reject / Modify (bound to exact action version)
  8. Re-validate data → execute via typed action tools (idempotency key)
  9. VERIFYING: read authoritative state back
 10. Recalculate affected risks → report completed / blocked / failed / pending
```
The backend enforces legal state transitions and blocks duplicate execution. The UI always shows the state. Agent mutations never execute offline.

### 2.3 Data-freshness flow
Every dashboard/report figure carries a last-updated timestamp. Slow loads show skeletons; stale last-known data is shown only when labelled as stale (see `Security.md` §8 and `Design.md` §8). Missing data is never rendered as "all clear". [Spec]

---

## 3. Tech stack  **[Proposed — confirm before use]**

Chosen for: a mobile-first web app, deterministic Python-friendly scheduling/import tooling, typed contracts end to end, and room for multi-tenant growth.

| Concern | Proposal | Why / alternative |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript** | Mobile-first PWA-capable UI; strict types shared with API schema |
| Styling | **Tailwind CSS** driven by CSS-variable design tokens | Tokens come from `Design.md`; works whichever tool (Figma/Stitch) you use |
| UI primitives | **Radix UI / shadcn-style components** | Accessible keyboard/screen-reader semantics [Spec requirement] |
| Data fetching | **TanStack Query** | Caching, loading/error states → drives skeleton loaders |
| Forms/validation | **React Hook Form + Zod** | Shared validation approach client-side; server remains the authority |
| i18n | **next-intl** (or i18next) | Language dropdown; persisted preference |
| Animation | **Motion (Framer Motion)** + CSS; optional GSAP for scroll scenes | Must respect `prefers-reduced-motion` |
| Backend API | **FastAPI (Python) + Pydantic** | Typed tool schemas; OR-Tools/pandas/openpyxl available for scheduling and import. Alt: single-language TypeScript backend (NestJS/tRPC) |
| Database | **PostgreSQL** [Spec candidate] | Relational, `factory_id` on every tenant row; consider Row-Level Security |
| ORM/migrations | **SQLAlchemy + Alembic** | Versioned migrations |
| Cache / rate limits / queue broker | **Redis** | Rate-limit counters, idempotency keys, job queue |
| Background jobs | **Celery/RQ/Arq (Python)** | Imports, scheduler runs, reports, security checkups |
| Scheduling engine | **Own deterministic service; OR-Tools CP-SAT optional** | **[Open]** constraint rules must be decided first |
| File storage | **S3-compatible object storage** (private bucket, signed URLs) | Uploads, order files |
| Auth | **Managed auth provider or well-maintained library** (e.g. Auth.js / Clerk / Supabase Auth) | **[Open]**; must support session expiry, revocation, MFA for Owner |
| AI provider | **LLM API behind a provider-abstraction layer** | **[Open]** which provider; fallback to normal software if unavailable [Spec] |
| Observability | **Structured logging + error tracking + metrics (e.g. OpenTelemetry, Sentry)** | Needed for latency/crash detection (`Security.md` §8) |
| CI | **GitHub Actions** | Lint, typecheck, tests, dependency/secret scans |
| Hosting | **[Open]** | Pick for India latency/data-residency needs |

---

## 4. Folder & file structure  **[Proposed]**

Monorepo, so the web app and API stay in sync.

```
ai-factory/
├─ README.md
├─ docs/                          # the project docs live here (or repo root)
│  ├─ PRD.md
│  ├─ Architecture.md
│  ├─ Rules.md
│  ├─ Phases.md
│  ├─ Design.md
│  ├─ Memory.md                   # AI working log — update regularly
│  ├─ Security.md
│  └─ mvp.md                      # original spec, never edited
│
├─ apps/
│  ├─ web/                        # Next.js frontend
│  │  ├─ app/                     # routes: one folder per product area
│  │  │  ├─ (auth)/login, signup
│  │  │  ├─ onboarding/
│  │  │  ├─ dashboard/
│  │  │  ├─ orders/
│  │  │  ├─ production/{planning,tracking}/
│  │  │  ├─ inventory/
│  │  │  ├─ machines/
│  │  │  ├─ downtime-waste/
│  │  │  ├─ profitability/
│  │  │  ├─ suppliers/
│  │  │  ├─ factory-memory/
│  │  │  ├─ reports/
│  │  │  ├─ ai-activity/
│  │  │  ├─ settings/
│  │  │  └─ worker/               # large-button worker screen
│  │  ├─ components/
│  │  │  ├─ ui/                   # buttons, inputs, dialogs (token-driven)
│  │  │  ├─ skeletons/            # SkeletonCard, SkeletonTable, SkeletonChart…
│  │  │  ├─ agent/                # AgentPanel, ActionPreview, ApprovalBar, TaskStateBadge
│  │  │  ├─ status/               # StatusBadge (colour + icon + text), FreshnessLabel
│  │  │  └─ states/               # EmptyState, ErrorState, StaleBanner
│  │  ├─ lib/                     # api client, query hooks, i18n, formatters
│  │  ├─ styles/tokens.css        # colour/typography tokens from Design.md
│  │  ├─ locales/{en,hi,…}/       # translations
│  │  └─ tests/
│  │
│  └─ api/                        # FastAPI backend
│     ├─ app/
│     │  ├─ main.py
│     │  ├─ core/                 # config, auth, tenancy, rate_limit, errors, logging
│     │  ├─ api/v1/               # routers: factory, dashboard, orders, machines,
│     │  │                        # inventory, production, downtime, waste_rework,
│     │  │                        # reports, imports, ai/agent, admin/security
│     │  ├─ models/               # SQLAlchemy models (Factory, Order, Machine, …, AuditLog)
│     │  ├─ schemas/              # Pydantic request/response schemas
│     │  ├─ services/             # DETERMINISTIC business logic
│     │  │  ├─ inventory.py       # usable stock, projected available
│     │  │  ├─ feasibility.py
│     │  │  ├─ scheduler.py
│     │  │  ├─ profitability.py
│     │  │  ├─ risk.py
│     │  │  ├─ imports.py         # parse → map → validate → dry-run → commit
│     │  │  └─ reports.py
│     │  ├─ ai/
│     │  │  ├─ provider.py        # LLM abstraction + timeouts/retries
│     │  │  ├─ copilot/           # grounding, answer format
│     │  │  ├─ agent/             # state machine, planner, permission/risk engine,
│     │  │  │                     # orchestrator, verifier
│     │  │  ├─ tools/             # one file per tool: schema, permission, validation,
│     │  │  │                     # output schema, error codes, idempotency, audit, tests
│     │  │  └─ prompts/           # versioned system prompts
│     │  ├─ security/             # abuse scoring, flagging, checkup jobs
│     │  ├─ jobs/                 # background tasks
│     │  └─ db/                   # session, migrations (alembic/)
│     └─ tests/                   # unit, integration, tenant-isolation, agent-safety
│
├─ packages/
│  └─ contracts/                  # shared API/tool schemas (OpenAPI → TS types)
│
├─ data/
│  └─ sample/                     # sample printing-factory dataset (labelled SAMPLE)
├─ infra/                         # docker, deployment, env templates (no secrets)
├─ scripts/                       # dev/seed/check scripts
└─ .github/workflows/             # CI
```

---

## 5. Data model summary [Spec]

Relational; every tenant-owned table has `factory_id`, stable IDs, timestamps, foreign keys, indexes.

- **Core:** Factory, User, FactoryMembership, Machine, Employee, Material, InventoryMovement, Supplier, SupplierDelivery, Product, ProcessTemplate, Customer, Order, OrderFile, ProductionJob, ProductionEvent, MachineDowntime, WasteRework, QualityCheck, MaintenanceTask, CostRecord, JobProfitabilitySnapshot, FactoryKnowledge, Notification, ImportJob.
- **Agent:** AgentSession, AgentMessage, AgentTask, AgentRun, AgentAction, AgentApproval, AgentPermission, AgentMemory, AgentToolCall, AuditLog.
- **Security additions [Proposed]:** `RateLimitEvent`, `AbuseFlag`, `SecurityCheckRun`, `SecurityFinding` (see `Security.md`).
- Inventory is **movements, not silent overwrites**. No hidden chain-of-thought stored — only concise user-safe reasoning summaries and source references.

## 6. API surface [Spec]
All under `/api/v1`. Core: `factory`, `dashboard`, `orders` (+ `/feasibility`), `machines`, `inventory` (+ `/movements`), `production/schedule` (+ `/candidates`, `/apply`), `production/events`, `downtime`, `waste-rework`, `reports/daily`, `imports` (+ `/preview`, `/commit`). Agent: `ai/agent/sessions`, `…/messages`, `ai/agent/tasks`, `…/actions/{id}/approve|reject`, `ai/agent/activity`, `ai/agent/permissions`.
All endpoints enforce tenant + role checks, validate business rules, use consistent error codes, never leak stack traces or secrets, and bind approvals to the exact action version.

## 7. Reliability design [Spec + Proposed]
- Timeouts and bounded retries on every external call (AI, storage). Structured-output validation on every LLM response.
- Persistent task state; idempotency keys on mutations; cancellation rules.
- Heavy work (imports, scheduler runs, reports) runs as background jobs with visible progress.
- **If the AI provider is down, core software keeps working** (orders, inventory, tracking, dashboard).
- Latency/overload behaviour and skeleton loading: `Security.md` §8.

## 8. Key architectural decisions log
Record each confirmed decision in `Memory.md` → "Decisions". Until confirmed, treat every **[Proposed]** item as changeable.
