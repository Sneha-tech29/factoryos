# AI Factory Intelligence & Decision Support System

> *You run the factory. The software runs the complexity.*

A simple, owner-centric factory operations product for **Indian MSME printing factories**. It combines one consistent set of operations records, deterministic calculations (feasibility, scheduling, stock, profitability), and an AI **Copilot** and controlled **Agent** that explain, plan, ask for approval, act, and verify.

**Intelligence loop:** Observe → Understand → Predict → Recommend → Approve → Act → Verify → Learn.

---

## Status

**Pre-build. Documentation only — no application code yet.**
Current phase: **Phase 0 — Foundation & decisions** (see [`Phases.md`](./Phases.md)).
Live progress is tracked in [`Memory.md`](./Memory.md), not here.

---

## What it is (and isn't)

**It is**
- One screen that tells the owner what matters today, in under 30 seconds
- Guided setup with industry templates and Excel/CSV import (preview → validate → commit)
- Order feasibility, production scheduling, tracking, inventory, downtime/waste and basic profitability, all calculated by backend services
- A Copilot that answers from authorised factory data, and an Agent that previews actions, waits for approval, executes allowed actions, verifies the result, and reports partial failures honestly

**It is not**
- A complicated ERP, or a replacement for accounting/payroll/HR/CRM
- A generic chatbot, or an AI that does the math or touches the database directly
- A source of guaranteed delivery dates, profit, or failure predictions

---

## Documentation

Read in this order before changing anything:

| # | File | What it answers |
|---|---|---|
| 1 | [`Memory.md`](./Memory.md) | Where is the project right now? What was done, what's in progress, what's next? |
| 2 | [`Rules.md`](./Rules.md) | What must I use, avoid, and never let the AI do? |
| 3 | [`PRD.md`](./PRD.md) | What are we building, for whom, with which features? |
| 4 | [`Architecture.md`](./Architecture.md) | App flow, folder structure, tech stack |
| 5 | [`Phases.md`](./Phases.md) | In what order do we build it? |
| 6 | [`Design.md`](./Design.md) | Colours, typography, motion, skeleton loaders |
| 7 | [`Security.md`](./Security.md) | Rate limits per page, abuse flagging, scheduled checkups, slow-load behaviour |
| — | `mvp.md` | The original specification (source of truth for requirements; never edited) |

**Tags used across the docs:** **[Spec]** = stated in `mvp.md` · **[Proposed]** = a suggestion awaiting owner confirmation · **[Open]** = not yet decided.

---

## Planned tech stack (all [Proposed] — not confirmed)

| Area | Proposal |
|---|---|
| Frontend | Next.js (React) + TypeScript, Tailwind CSS driven by design tokens |
| Backend | FastAPI (Python) + Pydantic |
| Database | PostgreSQL |
| Cache / rate limits / queue | Redis |
| Storage | S3-compatible private object storage |
| AI | LLM provider behind an abstraction layer (provider **[Open]**) |

Full table, alternatives and the proposed monorepo layout: [`Architecture.md`](./Architecture.md).

---

## Repository layout (planned)

```
ai-factory/
├─ README.md
├─ docs/            # PRD, Architecture, Rules, Phases, Design, Memory, Security, mvp.md
├─ apps/
│  ├─ web/          # Next.js frontend
│  └─ api/          # FastAPI backend (deterministic services + AI tools)
├─ packages/contracts/   # shared API / tool schemas
├─ data/sample/     # sample printing-factory dataset, labelled SAMPLE
├─ infra/           # deployment config, env templates (no secrets)
├─ scripts/
└─ .github/workflows/
```

---

## Getting started

Setup, install, and run commands will be added here once the stack is confirmed and the repo skeleton exists (Phase 0 → Phase 1). Until then there is nothing to run.

---

## Build phases

| Phase | Goal |
|---|---|
| 0 | Foundation & decisions |
| 1 | Operational foundation: auth, isolation, onboarding, import, honest dashboard |
| 2 | Decision intelligence: inventory, feasibility, scheduling, tracking, profitability |
| 3 | Copilot: grounded Q&A |
| 4 | Controlled Agent: previews, approvals, execution, verification |
| 5 | Pilot hardening: security tests, accessibility, monitoring, user testing |

Details and exit criteria: [`Phases.md`](./Phases.md).

---

## Core principles

1. **Never invent operational facts.** Unknown stays "unknown".
2. **Deterministic code does the math; the LLM does the language.**
3. **No success claimed without verification** (read back persisted state).
4. **Tenant isolation on every query and mutation.**
5. **Suggested ≠ verified.** Estimates are labelled "Suggested / Estimated — confirm before use".
6. **Honest UI:** last-updated times, clear empty states, labelled stale data, skeleton loaders for slow loads, no fake "all clear".

---

## Contributing (humans and AI assistants)

1. Read `Memory.md`, then `Rules.md`, then the doc relevant to your task.
2. Keep changes small; don't add files, endpoints, tools, tables, or libraries that aren't in the docs without asking the owner.
3. If you can't verify something, say so instead of guessing.
4. Before finishing any session, update `Memory.md`.

---

## Security

Report vulnerabilities privately to the project owner (contact **[Open]**). Never commit secrets, real customer data, or real factory data. See [`Security.md`](./Security.md).

## Licence

**[Open]** — to be decided by the owner.
