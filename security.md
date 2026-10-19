
# Security — Protection, Rate Limits, Abuse Flagging, Checkups, Resilience

> Covers: regular security checkups · rate-limit verification · flagging of suspicious sign-ups/activity · rate limits divided per page · skeleton loading and graceful degradation when the site is slow or struggling.
> Tags: **[Spec]** = from mvp.md §22 · **[Proposed]** = suggestion; all numbers are **starting values to tune with real traffic** — none are measured or verified.
> **Honest scope note:** a document doesn't run checks by itself. The "checkups" below are *specifications for scheduled jobs and CI steps* that must be built (Phase 1 and Phase 5 in `Phases.md`). Until they exist, `Memory.md` must say so.

---

## 1. Principles
1. Defence in depth: auth → role → tenant → rate limit → validation → audit.
2. Least privilege for users, services and AI tools. [Spec]
3. The server decides: role, factory ID and permissions come from the session, never from client input.
4. Fail safe: when unsure, deny, log, and tell the user plainly.
5. Everything consequential is attributable and auditable. [Spec]

---

## 2. Identity, access, tenancy [Spec]
- Authentication with session expiry and access revocation; MFA for Owner/Admin **[Proposed]**.
- Role-based permissions (Owner, Supervisor, Worker, optional Customer) + factory-level tenant isolation on **every** query and mutation. Consider PostgreSQL Row-Level Security as a second line of defence **[Proposed]**.
- Customer view (later) exposes only approved order status — never costs, staff data, other customers, internal recommendations.
- Secrets live outside code, prompts and client bundles. Rotate on suspected exposure.
- Encrypt traffic (TLS) and sensitive data at rest according to deployment.

## 3. Data, files, and AI-specific security
- **Uploads:** allowlist types (`.xlsx`, `.csv`, plus order files as decided), enforce size limits, validate content not just extension, store in a private bucket with signed URLs, malware scan where available. Limits **[Open]** (`PRD.md` §8).
- **Spreadsheet formula injection:** treat cells starting with `=`, `+`, `-`, `@` as text when exporting or displaying **[Proposed]**.
- **AI boundaries:** no DB credentials for the LLM; typed allowlisted tools only; every tool call re-authorised server-side; idempotency keys; approvals bound to action version. Full list: `Rules.md` §5.
- **Prompt injection:** uploaded files, spreadsheets, PDFs, images, notes are data, never instructions. [Spec]
- **Privacy:** minimise personal/customer/confidential data sent to the AI provider; disclose external AI processing; retention/deletion policy **[Open]**.
- **Backups and recovery** with a tested restore. [Spec]

---

## 4. Rate limits — divided by page / feature group  **[Proposed starting values]**

**Why split:** one global limit lets a heavy feature (AI, import) starve light ones, and lets abuse of a cheap page hide behind a generous total. Each page group gets its **own budget**, and a request is counted in the group of the route it hits. Limits stack: a request must pass the **IP** limit (before login), then the **user** limit, then the **factory** limit.

### 4.1 Budgets
| Group | Pages / routes | Key | Starting limit | Notes |
|---|---|---|---|---|
| **A. Auth – login** | `/login`, token refresh | IP + account name | 5 attempts / 15 min per account; 20 / 15 min per IP | Progressive delay; flag on repeated failure |
| **B. Auth – sign-up** | `/signup`, invite accept | IP + device fingerprint + email domain | 3 / hour per IP; 10 / day per IP | Feeds abuse scoring (§5) |
| **C. Auth – recovery / email / OTP** | password reset, verification resend | IP + account | 3 / hour per account; 10 / hour per IP | Same response whether account exists or not |
| **D. Dashboard & lists (read)** | Dashboard, Orders list, Inventory, Machines, Suppliers, Reports view | user | 120 / min | Cheap reads; most-used |
| **E. Record writes** | Create/update order, machine, material, employee, supplier | user | 30 / min | Plus factory cap 300 / min |
| **F. Worker actions** | Production events (start/pause/problem/waste/complete) | user | 60 / min | Generous: factory-floor use can be bursty; dedupe by idempotency key |
| **G. Calculations** | Feasibility, scheduler candidates, what-if | user | 10 / min; factory 30 / min | CPU-heavy; queue extra requests |
| **H. Schedule apply** | `POST …/schedule/apply` | user | 10 / min | Consequential; also needs approval |
| **I. Import** | Upload, preview | user | 5 uploads / hour; 10 previews / hour | Size limits apply separately |
| **J. Import commit** | `…/imports/{id}/commit` | user | 5 / hour | One commit per import ID |
| **K. Copilot** | Q&A messages | user | 20 / min; 200 / day | Daily cap controls AI cost |
| **L. Agent** | Agent messages, task creation | user | 10 / min; 100 tasks / day | Factory cap on concurrent running tasks (e.g. 3) |
| **M. Agent approvals** | approve / reject | user | 30 / min | Must carry valid action version |
| **N. Reports / exports** | Generate/download reports | user | 10 / hour | |
| **O. Factory Memory / search** | add / search knowledge | user | 30 / min | |
| **P. Settings / admin** | users, permissions, Agent allowlist | user | 20 / min | All changes audited |
| **Q. Audit / AI Activity view** | read logs | user | 30 / min | |
| **R. Public / unauthenticated** | marketing pages, health | IP | 60 / min | |
Adjust per role if needed (e.g. Workers get only F, D-subset; Owners get all).

### 4.2 Behaviour
- Algorithm: sliding-window or token bucket in **Redis** **[Proposed]**; counters keyed by group + identity; configuration in one file so limits can change without code edits.
- **Response when exceeded:** HTTP `429`, error code `RATE_LIMITED`, `Retry-After` header, plain-language message in the user's language ("Too many requests. Please wait 30 seconds."). Never silently drop requests.
- **UI:** disable the triggering button and show a countdown; keep the page usable.
- **Never rate-limit by blocking the worker screen entirely** — group F has headroom and a queue-and-retry path; critical safety reports shouldn't be lost.
- Log every limit hit to `RateLimitEvent` (group, key hash, time) — no secrets, no raw personal data.
- **Repeated limit hits** raise an abuse flag (§5).

### 4.3 Rate-limit verification (automated)
- **CI test (per group):** send N+1 requests and assert the last gets `429` with `Retry-After`; assert other groups are unaffected (isolation between groups).
- **Config lint:** fail CI if any route lacks a group assignment (no unlimited routes by accident).
- **Scheduled check (weekly):** read configured limits vs. expected table; alert on drift or a group with zero hits and zero tests.
- **Review monthly:** compare limit-hit logs with real usage; loosen limits that hit legitimate users, tighten ones never approached **and** exploited.

---

## 5. Suspicious sign-up and activity flagging  **[Proposed]**

**Goal:** catch fake/abusive accounts and unusual behaviour early, without blocking genuine factory staff. Flags **score and review**; they don't ban automatically except in clear-cut cases.

### 5.1 Signals (each adds to a risk score)
**Sign-up**
- Many sign-ups from one IP / device / network in a short time
- Disposable or throw-away email domains; unverified email
- Rapid form completion (bot-like timing), missing browser signals
- Sign-up followed immediately by heavy AI/import use
- Mismatched details (e.g. claimed factory profile vs. behaviour) — informational only
- Invite abuse: many invites sent, few accepted

**Activity**
- Repeated rate-limit hits (§4) or repeated failed logins
- Login from a new country/device for an Owner, or impossible travel
- Bulk exports or unusually large reads
- Cross-factory access attempts (`TENANT_MISMATCH`) — **always high severity**
- Repeated attempts at owner-only actions by a Worker
- Many failed validations / malformed requests / scanner-like path probing
- Upload of disallowed/oversized/suspicious files; repeated import failures
- Prompt-injection-like content in uploads or notes; repeated Agent policy violations
- Sudden spikes in AI usage or cost for one user/factory
- Odd-hours activity relative to the factory's configured shifts (low weight)

### 5.2 Scoring and actions
| Score band | Meaning | Automatic action |
|---|---|---|
| Low | Normal | None |
| Medium | Unusual | Add to review queue; extra verification (email/OTP); tighter limits for that identity |
| High | Likely abuse | Require re-authentication / MFA; temporarily restrict AI, import, export; notify Owner/Admin and security reviewer |
| Critical | Attack in progress (e.g. cross-tenant attempts, credential stuffing) | Block the identity/IP temporarily; revoke sessions; alert immediately |

Weights and thresholds are **[Open]** — start simple (count-based), review flagged cases manually, then tune. Avoid black-box blocking.

### 5.3 Flag lifecycle
`NEW → UNDER_REVIEW → CONFIRMED_ABUSE | FALSE_POSITIVE → RESOLVED`
- Store in `AbuseFlag`: id, factory_id (nullable pre-signup), user/identity reference, signals, score, status, reviewer, notes, timestamps. Store minimal personal data; hash IPs/device IDs where possible.
- **Review queue** page for Admin/security reviewer (inside Settings/Admin): filter by severity, one-click *Dismiss / Require verification / Suspend / Unblock*. Every decision is audited.
- Users who are wrongly flagged get a clear message and a way to appeal; no silent lockouts.
- Alerts follow the notification rules: group, deduplicate, throttle. [Spec]

---

## 6. Scheduled security checkups  **[Proposed — to be built]**

Run as background jobs and CI steps. Each run writes a row to `SecurityCheckRun` and findings to `SecurityFinding` (severity, area, description, evidence reference, status, owner, timestamps). Critical/High findings notify the Owner/Admin and create a task.

| Frequency | Check | How |
|---|---|---|
| **Every commit / PR (CI)** | Lint, type-check, unit + tenant-isolation + role tests | Test suite |
| | Dependency vulnerability scan | e.g. `pip-audit`, `npm audit` or equivalent |
| | Secret scan (keys/tokens in repo) | e.g. gitleaks or equivalent |
| | Rate-limit test per group; "every route has a group" lint | §4.3 |
| | Static analysis for common web flaws | e.g. Semgrep/Bandit or equivalent |
| **Daily** | Failed-login / lockout / 429 / abuse-flag summary and anomaly check | Job over logs |
| | Backup success and age | Job |
| | Certificate / secret expiry warnings | Job |
| | Open Critical/High findings reminder | Job |
| **Weekly** | Rate-limit config vs. expected table; limit-hit review | §4.3 |
| | Dependency updates review | Report |
| | Permission drift: list Owners, users with elevated roles, enabled Agent actions, inactive-but-active accounts | Job → Owner |
| | Prompt-injection regression suite against Copilot/Agent | Test run |
| **Monthly** | Access review (who can see what); revoke stale access | Owner sign-off |
| | Audit-log integrity and retention check | Job |
| | Restore test from backup | Drill |
| | Review abuse-flag false-positive/negative rate; tune §5 | Review |
| **Quarterly / before pilot** | Full tenant-isolation and role penetration-style test; upload abuse test; load/latency test (§8) | Manual + tools |
| | Review of this file and `Rules.md` | Owner |

**Honesty rule:** a checkup that didn't run or failed to run is reported as **"not run"**, never as "passed". Missing data is not a clean bill of health. [Spec principle applied]

**Where results show up:** an *Admin → Security* page (last run time per check, open findings by severity) and the daily/weekly digest. The page uses the same skeleton/stale rules as the rest of the app (§8).

---

## 7. Logging, audit, incident response
- **AuditLog** for every consequential mutation: actor (user or AI), action, entity, before/after summary, correlation ID, timestamp. [Spec]
- Logs contain no passwords, tokens, full file contents or unnecessary personal data.
- Security events (flags, 429s, auth failures, permission denials) are logged separately and retained per the retention policy **[Open]**.
- **Incident basics [Proposed]:** detect → contain (block identity/IP, revoke sessions, disable feature flag for the Agent or imports) → assess impact (which factories, which data) → notify owner(s) → fix → record in `Memory.md` §8/§9 and add a regression test.
- **Kill switches [Proposed]:** feature flags to disable the Agent, Copilot, imports, or sign-ups instantly without a deploy.

---

## 8. Slow loads, high latency, and "about to crash" — graceful degradation  **[Proposed]**

**Goal:** if responses are slow or the system is under strain, the user still sees a stable, honest page — structure with skeleton placeholders — and the system protects itself instead of falling over.

### 8.1 What the user sees (frontend)
| Situation | Behaviour |
|---|---|
| Normal load (< ~150 ms) | Render directly, no skeleton |
| Loading > ~150 ms | Show **skeleton loader** matching the real layout (`Design.md` §8); keep ≥ ~400 ms to avoid flicker |
| Loading > ~8 s **[tune]** | Keep skeleton, add "Taking longer than usual…" + **Retry** |
| Request fails / times out | Replace skeleton with an **error state** (what happened, Retry); never an infinite skeleton |
| Previously loaded data exists | Show it under a **StaleBanner** ("Showing data from 10:42, refreshing…") — only as *stale*, never as current [Spec] |
| AI slow / unavailable | Core pages unaffected; Copilot/Agent panel shows a skeleton then "AI assistant is unavailable right now. You can still use orders, inventory and production." |
| Slow generation (Copilot answer, report) | Show progress / "working" state with cancel; stream partial text if the provider supports it; Agent shows its task state badge |
| Import / scheduler / report running | Job progress (queued → running → done), not a blank wait |
| Missing sections | Each widget loads independently — one slow widget never blocks the whole dashboard |

"Fetch the files and data while waiting": load in this order — page shell and navigation → primary data for the screen (e.g. top-3 attention items) → secondary widgets → heavy extras (charts, reports). Prefetch likely next pages (e.g. order detail on hover/focus) **[Proposed]**. Cache with a clear freshness label; use client caching (TanStack Query) with `staleTime` set per data type.

### 8.2 What the system does (backend)
- **Timeouts** on every DB, AI, storage call; **bounded retries** with backoff only for idempotent operations.
- **Circuit breaker** around the AI provider: after repeated failures stop calling it for a cool-down and serve the "AI unavailable" state. [Spec: fall back to normal software]
- **Queue heavy work** (imports, scheduler, reports, security checkups) into background jobs; API returns a job ID immediately.
- **Load shedding order** when strained (shed first → last): AI features → reports/exports → what-if/scheduler candidates → non-critical widgets → standard reads/writes → **worker production events and auth are protected last**.
- **Health endpoints** (`/health` live, `/ready` dependencies) and **latency monitoring** (p50/p95/p99 per route group, error rate, queue depth, DB connections, memory/CPU).
- **Alerts [Proposed thresholds, tune]:** p95 latency above target for 5 min; error rate above target; queue depth growing; DB pool near exhaustion; memory near limit → notify and, if configured, enable "degraded mode" (shed per order above, shorter cache for read-heavy data, tighter AI limits).
- **Autoscaling / capacity** per hosting choice **[Open]**.
- Return `503` with `Retry-After` when shedding; the UI turns that into the "busy, retrying" message rather than a raw error.

### 8.3 Don'ts
- Don't hide errors behind perpetual skeletons.
- Don't show cached numbers as current.
- Don't fabricate placeholder values in skeletons.
- Don't drop worker production events — queue locally/retry with idempotency keys and tell the user what is pending. (Offline queuing, if implemented, needs conflict handling; Agent mutations never run offline.) [Spec]

---

## 9. Verification tests (must exist before pilot) [Spec + Proposed]
- Cross-factory access denied on every endpoint (automated sweep).
- Worker cannot call owner-only endpoints/tools; Supervisor limits respected.
- Every mutation validated server-side; client-sent role/factory ignored.
- Rate limit per group returns `429` + `Retry-After`; groups don't starve each other.
- Sign-up abuse: simulated burst raises flags and applies the right action; legitimate user path still works.
- Prompt injection in spreadsheet cells, PDF text, image text, notes: Copilot/Agent policy unchanged; no extra tool called; no data leaked.
- Upload abuse: wrong type, oversized, malformed, formula-injection cells.
- Agent: stale approval rejected; duplicate action blocked by idempotency key; partial failure reported accurately; no success claimed without read-back.
- Latency/chaos: simulate slow API, slow AI, AI down, DB slow → skeletons appear after threshold, timeout → error state with retry, stale banner correct, core pages stay usable.
- Backup restore drill; secrets never in logs or client bundle.

## 10. Open decisions [Open]
1. Auth provider and MFA scope.
2. Confirm or adjust the rate-limit budgets in §4.1 (they are placeholders).
3. Abuse-score weights, thresholds, and who reviews flags.
4. File limits, retention, backup frequency, malware scanning option.
5. Hosting and autoscaling approach; monitoring/alerting tools; latency targets per route group.
6. Whether Customer-facing views are in the pilot.
7. Who owns the security review before pilot, and the sign-off criteria.
