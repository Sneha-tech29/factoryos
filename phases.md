# Phases — Project Breakdown

> Based on mvp.md §25 (MVP Phases) and §30 (Recommended Build Order). Phases are sequential; don't start a phase's build work until the previous phase's **exit criteria** are met or the owner explicitly waives them.
> Tags: **[Spec]** = from mvp.md · **[Proposed]** = suggested addition. No time estimates are given because none exist in the spec; add them once the team size is known (**[Open]**).
> Update status in `Memory.md`, not here.

---

## Phase 0 — Foundation & decisions
**Goal:** Remove every blocker so building doesn't stall or guess. [Spec]

**Deliverables**
- Confirm the pilot factory and launch languages; mobile-vs-desktop priority.
- Confirm stack, hosting, auth, AI provider, storage, background jobs (`Architecture.md` proposals).
- Data dictionary; canonical units and formulas (stock, utilisation, efficiency, waste, rejection, contribution margin).
- Roles and **permission matrix**; Agent low-risk allowlist and approval roles.
- Scheduling rules: hard/soft constraints, overtime, shifts, setup families, tie-breaking.
- Sample printing-factory dataset (labelled SAMPLE) and an expected-answer evaluation set.
- Environments (dev/staging/prod), repo, CI, secrets handling, rate-limit budgets (`Security.md` §4).
- Design direction chosen: dark metallic vs dark palette; Figma vs Stitch (`Design.md`).

**Exit criteria:** every **[Open]** item in `PRD.md` §8 is answered and logged in `Memory.md` → Decisions.

---

## Phase 1 — Operational foundation
**Goal:** An owner can set up the factory and see a truthful dashboard. [Spec]

**Build order (mvp.md §30, steps 1–5)**
1. Authentication, factory isolation, roles, audit foundation.
   - **[Proposed]** include rate limiting (auth + base API), sign-up abuse flagging, secure headers, secrets management — security is built in, not added later.
2. Onboarding + industry templates (suggestions marked estimated; partial setup; resumable).
3. Machines, materials, products/processes, employees, suppliers, customers, orders (form entry).
4. Excel/CSV import: upload → sheet → mapping → preview/validation → duplicate check → commit → history.
5. Honest dashboard backed by real data: freshness labels, empty states, top-3 attention items.
   - **[Proposed]** design tokens, base component library, **skeleton loaders** and the four data-surface states (loading/empty/error/stale) from the first screen.
   - Multilingual scaffolding (language dropdown, locale files).

**Exit criteria**
- Cross-factory access denied (tested); worker cannot do owner-only actions (tested).
- Onboarding works with partial data; suggestions are never shown as verified.
- Import: preview, errors, cancel, confirm, counts; re-import does not duplicate.
- Dashboard shows real data or clear empty states; readable on mobile; accessible contrast.

---

## Phase 2 — Decision intelligence
**Goal:** Deterministic answers to "can I accept this order?" and "what should run when?" [Spec]

**Build order (steps 6–8)**
6. Inventory calculations (usable/projected stock, movements) and **order feasibility** (Safe / Possible with Risk / Not Recommended / Cannot Assess).
7. Production tracking (stage transitions, worker screen with 5 large actions) and **deterministic scheduling** (candidates, alternatives, unscheduled-with-reasons, action previews, what-if).
8. Downtime, waste/rework, basic profitability, supplier basics, daily reports, notifications.
   - Maintenance schedule and Factory Memory (text) can land here or Phase 3 **[Open]**.

**Exit criteria**
- Formulas unit-tested against hand-checked cases.
- Feasibility and scheduler expose constraints, assumptions, missing data; never invent numbers.
- Applying a schedule shows affected orders first, then reads back persisted state and recalculates risk.
- Profitability shows "Insufficient cost data" when inputs are incomplete.

---

## Phase 3 — Copilot
**Goal:** Grounded natural-language Q&A. [Spec]

**Build order (step 9)**
- Retrieval over authorised records + tool calls to deterministic services.
- Answer format: short answer · supporting facts/sources · reasons · confidence & limits · next step.
- Factory Memory search with verification status.
- Source references; "evidence missing" behaviour; selected-language responses.
- AI provider abstraction, timeouts, retries, structured-output validation, cost controls, per-user AI rate limits.

**Exit criteria**
- Passes the expected-answer evaluation set; **zero** fabricated operational facts in the test set.
- Distinguishes facts / estimates / recommendations; says when evidence is missing.
- Works with the provider switched off (core app unaffected).

---

## Phase 4 — Controlled Agent
**Goal:** "AI, prepare my factory for tomorrow" works safely end to end. [Spec]

**Build order (steps 10–11)**
- Agent UI: global launcher, section context, task view, state badge, previews, approvals, results, errors.
- Intent/context handling; persisted state machine with legal-transition enforcement.
- Tool catalogue (read → analysis → action), each with typed schema, permission level, validation, output schema, error codes, idempotency, audit fields, tests.
- Permission engine (READ / SUGGEST / LIMITED EXECUTE); owner-controlled allowlist.
- Approval previews bound to action version; stale-approval re-validation; expiry rules.
- Execute → read-back verify → recalculate risk → report completed/blocked/failed/pending; partial-failure reporting.
- AI Activity / audit view.
- **[Proposed]** Agent-specific rate limits and anomaly flags (`Security.md`).

**Exit criteria**
- Primary demo scenario (mvp.md §24) runs with real calculations on sample data.
- Prompt injection in uploads cannot bypass policy (tested).
- No duplicate execution; no success claimed without verification.
- Every consequential action appears in the audit log with approver.

---

## Phase 5 — Pilot hardening
**Goal:** Safe and usable enough for a real pilot factory. [Spec]

**Build order (step 12)**
- Security tests: tenant isolation, role permissions, injection, upload abuse, rate-limit verification, dependency/secret scans.
- **[Proposed]** First full security checkup run and review (`Security.md` §6); load/latency test that exercises skeleton and degraded modes.
- Accessibility and language review (contrast, keyboard, screen reader, large touch targets).
- Import edge cases (bad dates, units, duplicates, huge files).
- Operational monitoring, backups, recovery drill, retention/deletion policy.
- User testing with owner, supervisor, worker; baseline KPIs measured **before** claiming improvement.
- Pilot sign-off and rollback criteria.

**Exit criteria:** signed-off pilot checklist; security findings of critical/high severity closed; baseline metrics recorded.

---

## Later phases [Spec]
- Multiple printing factories
- More procurement/supplier integrations and automated planning
- Shift handover and customer-communication drafts (explicit approval)
- Other industry templates (packaging, garments, furniture, food, electronics, auto components)
- IoT/telemetry and validated predictive maintenance
- Computer vision and multi-factory optimisation
- WhatsApp order intake; PDF/image order extraction at scale

---

## Dependency map
```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Later
              │          │         └─ needs Phase 2 services (tools call them)
              │          └─ needs Phase 1 data + isolation
              └─ security, skeleton/states, i18n scaffolding start here
```
Rule of thumb: **the Agent (Phase 4) can only be as trustworthy as the deterministic services (Phase 2) it calls.** Don't rush Phase 4 on top of unverified formulas.
