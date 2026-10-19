
# PRD — AI Factory Intelligence & Decision Support System

> Source: `mvp.md` (MVP Specification). This PRD refines it; where they differ, update this file and log the change in `Memory.md`.
> Tags used in all docs: **[Spec]** = stated in mvp.md · **[Proposed]** = a suggestion in these docs, needs owner confirmation · **[Open]** = undecided.

**Product promise:** *You run the factory. The software runs the complexity.*
**Intelligence loop:** Observe → Understand → Predict → Recommend → Approve → Act → Verify → Learn.

---

## 1. What to build

A simple, owner-centric factory operations product for **Indian MSME printing factories** that combines:

1. **Operations records** — orders, production, machines, inventory, downtime, waste, costs. One consistent data source.
2. **Deterministic intelligence** — feasibility, scheduling, stock, risk and profitability calculated by backend services (never by the LLM).
3. **AI interaction** — a **Copilot** that explains data, and a controlled **Agent** that plans, previews, asks approval, executes allowed actions, verifies results and reports honestly.

### MVP must prove one complete workflow [Spec]
Configure/import factory data → create an order → assess feasibility → generate a production plan → track production and issues → ask the Copilot for explanations → ask the Agent to prepare and execute approved actions → verify results.

### MVP definition of done [Spec]
A printing-factory user can configure or import valid data, see a truthful dashboard, assess a new order, generate a candidate production plan, track progress, ask evidence-based questions, and ask the Agent to prepare a plan whose approved actions are executed and verified safely.

### What it is NOT [Spec]
- Not a complicated ERP. Not a generic chatbot.
- Not a replacement for accounting, payroll, HR, CRM.
- No guaranteed delivery/profit/failure predictions. No fake probabilities (e.g. "86% on time") unless a validated model exists.
- No PLC/machine-hardware control, no predictive maintenance without data, no IoT / computer vision / multi-factory optimisation in v1.
- No unrestricted autonomous purchasing, payment, cancellation, price change or customer communication.

### Non-negotiable product rules [Spec]
- Never invent operational facts. Never claim an action succeeded without backend confirmation.
- Make missing or stale data visible. Suggested values are labelled **Suggested / Estimated — confirm before use**.
- Every consequential change is attributable and auditable.

---

## 2. Targeted users

| User | Needs | Can do | Cannot do |
|---|---|---|---|
| **Owner / Admin** | Know what matters today in <30 seconds; decide fast | Configure factory, manage users/permissions, import data, create orders, review feasibility/schedules, approve consequential Agent actions, set low-risk Agent permissions, view reports and audit logs | — |
| **Supervisor** | Keep production moving, record reality | Update production, assign/request jobs, record output/issues, report downtime/waste, confirm completion, add shift notes (per permissions) | Owner-only actions (approvals, permission changes) |
| **Worker / Operator** | A screen that is impossible to get wrong | Big actions: **START JOB · PAUSE · REPORT PROBLEM · ADD WASTE · COMPLETE JOB**; QR and voice input where built | Analytics, unrestricted data access |
| **Customer** *(later / limited)* | Approved order status only | View approved order status | See costs, staff data, other customers, internal recommendations |

**Initial market:** Indian MSME printing factories (owner is often the operator of the business; data lives in Excel, paper registers, calls, WhatsApp). **Later:** packaging, garments, furniture, food processing, electronics, auto components via configurable templates. [Spec]

**Permission principles [Spec]:** role-based access; factory-level tenant isolation; least privilege for users and tools; owner approval by default for high-impact changes; workers limited to assigned tasks; the backend validates every mutation — never trusted just because the AI asked.

---

## 3. Features

Priority key: **P0** = needed for the MVP demo · **P1** = MVP but can follow P0 · **Later** = after MVP.

### 3.1 Foundation
| Feature | Priority | Notes |
|---|---|---|
| Authentication, roles, factory isolation | P0 | Tenant check on every query/mutation |
| Audit log | P0 | Who, what, when, before/after summary, correlation ID |
| Multilingual UI + language dropdown | P0 | Onboarding + Settings; persisted; do not auto-translate names/records. **[Open]** launch languages |

### 3.2 Onboarding & setup
| Feature | Priority | Notes |
|---|---|---|
| Guided onboarding (factory profile → machines → materials → products/processes → employees → suppliers) | P0 | Partial setup allowed; resumable |
| Industry templates (Printing first) | P0 | Every suggestion marked Suggested/Estimated; owner can confirm/edit/remove/skip |
| Missing critical input detection | P0 | Flag before relying on a value |

### 3.3 Excel/CSV import
| Feature | Priority | Notes |
|---|---|---|
| Upload `.xlsx`/`.csv`, sheet select, column mapping | P0 | Suggested mapping, owner confirms |
| Preview + row-level validation + duplicate detection | P0 | Dry run, cancel before commit |
| Commit with counts (created/updated/skipped/failed) + import history | P0 | Transaction or controlled batches; re-import must not duplicate |

### 3.4 Owner dashboard — "What do I need to know today?"
| Feature | Priority | Notes |
|---|---|---|
| Factory health (orders on track/at risk/delayed; machines running/idle/down/maintenance; inventory readiness; dispatches due) | P0 | Real data only |
| Top-3 attention items (severity, record, reason, data, recommended action, freshness, View/Review) | P0 | |
| Today's production (planned/completed/remaining; efficiency only when valid) | P0 | |
| Empty states instead of sample metrics; last-updated time everywhere | P0 | Demo data labelled "sample data" |
| Prominent Copilot/Agent entry | P0 | |

### 3.5 Orders & feasibility
| Feature | Priority | Notes |
|---|---|---|
| Order create (form) | P0 | Customer, product, qty/unit, deadline, specs, priority, optional price |
| Order list with filters (All, New, In Production, At Risk, Delayed, Completed, Dispatched) | P0 | Shows stage, progress, risk, ETA when calculable, risk reason |
| Feasibility engine → Safe / Possible with Risk / Not Recommended / Cannot Assess | P0 | Deterministic; shows constraints, assumptions, missing data, alternatives; confidence = High/Medium/Low with reasons |
| Natural-language / voice order entry ("ABC company ko 20,000 brochures chahiye 25 August tak") | P1 | Extract → owner confirms; never silently create from uncertain extraction |
| PDF/image order extraction | Later-P1 | With confirmation |
| WhatsApp order intake | Later | |

### 3.6 Production planning & tracking
| Feature | Priority | Notes |
|---|---|---|
| Deterministic scheduler (candidates, alternatives, unscheduled jobs with reasons) | P0 | Hard constraints respected; saved only after required approval |
| Action preview (current vs proposed, affected orders, deadline impact) | P0 | Read-back + risk recalculation after apply |
| Stage tracking with configurable stages and timestamped transitions | P0 | Invalid transitions blocked unless authorised override |
| Worker screen (5 large actions) | P0 | |
| What-if simulator (urgent order, machine unavailable) | P1 | |
| QR / voice input | P1 | Voice: editable transcript + confirm |

### 3.7 Inventory
| Feature | Priority | Notes |
|---|---|---|
| Usable stock = Physical − Reserved − Damaged/Unusable | P0 | Negative result = shortage/data-quality warning |
| Projected available = Usable + Confirmed incoming before need date − Expected consumption | P0 | Unconfirmed purchases never counted |
| Inventory as movements (not silent overwrites) | P0 | |
| Purchase-request draft + shortage recommendation | P1 | Approval before any external commitment |

### 3.8 Machines, downtime, waste
| Feature | Priority | Notes |
|---|---|---|
| Machine dashboard (status, current job, capacity, utilisation with stated denominator, downtime, maintenance) | P1 | |
| Downtime logging (Breakdown, Setup, Material waiting, Operator unavailable, Quality issue, Rework, Maintenance, Other) | P1 | |
| Waste/rework logging | P1 | Correlation ≠ cause; say "cannot be confirmed" when cause unrecorded |

### 3.9 Profitability & suppliers
| Feature | Priority | Notes |
|---|---|---|
| Job profitability (Contribution = Revenue − Included costs; Margin %) | P1 | Show completeness; "Insufficient cost data" instead of invented ranges |
| Supplier intelligence | P1 | Sparse data → show facts, say reliable ranking not possible |

### 3.10 Factory Memory (knowledge base) & maintenance
| Feature | Priority | Notes |
|---|---|---|
| Add/search verified tips, SOPs, troubleshooting | P1 | Verification status; factory-approved beats generic AI; if none, say so |
| Maintenance schedule, reminders, draft tasks | P1 | Predictive maintenance = Later |

### 3.11 AI Copilot
| Feature | Priority | Notes |
|---|---|---|
| Grounded Q&A over authorised data ("Which orders are at risk?", "Can I accept this order?", "Why was production low today?") | P0 | Answer = short answer + facts/sources + reasons + confidence/limits + next step |
| Never silently performs consequential actions; never exposes chain-of-thought | P0 | |

### 3.12 AI Agent
| Feature | Priority | Notes |
|---|---|---|
| Section Agent (page/record context) and Whole-Factory Agent ("Prepare my factory for tomorrow") | P0 | Returns prioritised plan, not a record dump |
| Persisted task state machine (RECEIVED … COMPLETED/PARTIALLY_COMPLETED/FAILED/BLOCKED/CANCELLED) | P0 | State always visible in UI |
| Allowlisted typed tools, permission levels READ / SUGGEST / LIMITED EXECUTE | P0 | |
| Action preview + Approve/Cancel/Modify, bound to exact action version | P0 | Re-validate stale approvals |
| Execute → read back → verify → report partial failures precisely | P0 | |
| Agent activity / audit view | P0 | |

### 3.13 Reports & notifications
| Feature | Priority | Notes |
|---|---|---|
| Morning briefing, end-of-day report | P1 | |
| Notifications: Critical / Important / Informational; grouped, deduplicated, throttled, acknowledgeable | P1 | Missing data never disguised as "all clear" |

### 3.14 Platform protection (see `Security.md`)
| Feature | Priority | Notes |
|---|---|---|
| Per-page-group rate limits | P0 | |
| Suspicious sign-up / activity flagging + review queue | P0 | |
| Scheduled security checkups | P1 | |
| Skeleton loaders + graceful degradation under slow responses | P0 | |

---

## 4. Navigation [Spec]
Dashboard · Orders · Production Planning · Production Tracking · Inventory · Machines · Downtime & Waste · Profitability · Suppliers · Factory Memory · Reports · AI Activity / Audit · Settings · persistent **AI Factory Agent** launcher (floating on mobile).

## 5. Success metrics [Spec]
Measure a baseline before claiming any improvement. Product: onboarding completion/time, import success, orders tracked end-to-end. Operations: planning time, late orders, stockouts, downtime by cause, waste rate. AI/Agent: grounded answer accuracy, tool success, approval/rejection rate, invalid/false actions, % actions verified, **operational-fact hallucination incidents (target: zero)**. Business: owner-reported time saved, retention, willingness to pay.

## 6. Acceptance criteria (summary) [Spec]
- **Onboarding:** works with partial data; suggestions marked estimated; owner can edit/skip.
- **Import:** upload → sheet → mapping → preview/errors → cancel/confirm; counts visible; no duplicate explosion on re-import.
- **Dashboard:** real data, freshness, clear empty states, top risks first, usable on mobile with accessible contrast.
- **Feasibility/scheduling:** deterministic, exposes constraints/assumptions/missing data, previews affected orders, no invented numbers.
- **Copilot:** uses authorised data, separates facts / estimates / recommendations, says when evidence is missing.
- **Agent:** supports page context, shows state, allowlisted tools only, approval for consequential actions, verifies changes, reports partial failure accurately, logs everything.
- **Security:** cross-factory access denied; worker can't run owner-only actions; prompt injection in uploads can't bypass policy; every mutation validated server-side.

## 7. Primary demo scenario [Spec]
Printing unit, 5 existing orders, 4 machines, several paper types, partial employee/supplier data — **all labelled sample data**. Owner: *"AI, prepare my factory for tomorrow."* Agent reads → calculates → ranks risks → proposes plan → shows previews → owner approves → Agent executes → backend verifies → dashboard refreshes → Agent reports success/blocked/failed. Any delivery date, shortage or cost shown must come from real calculation, not hardcoded promises.

## 8. Open decisions that block build [Open] (from mvp.md §29)
1. Exact pilot factory and launch languages.
2. Mobile vs desktop priority and device constraints.
3. Canonical units and formulas: stock, utilisation, efficiency, waste, rejection, contribution margin.
4. Rules for reserved stock, confirmed incoming stock, stock adjustments.
5. Scheduling: hard/soft constraints, overtime, shifts, setup families, tie-breaking.
6. Exact low-risk Agent action allowlist and approval roles.
7. Approval expiry, stale-plan handling, cancellation/compensation, duplicate prevention.
8. Framework, database, hosting, auth, AI provider, storage, background jobs (see `Architecture.md` proposals).
9. File limits, retention, backups, monitoring, security review, external integrations.
10. Pilot interview/test plan, sample dataset, expected-answer evaluation set, baseline metrics, sign-off and rollback criteria.
