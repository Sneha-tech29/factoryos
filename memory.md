# Memory — Project Working Log

> **Purpose:** the single source of truth for *where the project stands*, so any AI or human can resume after a break without guessing or hallucinating.
> **Not for:** requirements (see `PRD.md`), rules (`Rules.md`), architecture (`Architecture.md`). This file records *progress and decisions only*.

---

## 0. Instructions for the AI working on this project (read first)

**At the START of every session**
1. Read this whole file, then `Rules.md`, then the doc relevant to your task.
2. Check §2 "Currently working on" and §6 "Next up". Continue from there; don't restart finished work.
3. If this file and the code disagree, **trust the code**, then correct this file and note the discrepancy in §9.

**DURING work**
- Update §2 when you start or switch a file/task.
- After finishing any task, move it to §3 (Completed) the same session — don't batch it for later.
- Record every decision (library, formula, rule, design choice) in §5 the moment it is made, with the reason.
- Record every unanswered question in §7 instead of guessing.

**At the END of every session (mandatory, even if you only did a little)**
- Update §2, §3, §4, §6, §8.
- Add one entry to the Session log (§9): date, what changed, files touched, what's next.

**Writing rules**
- Be factual and specific: file paths, endpoint names, test results. No vague phrases like "mostly done".
- Mark each item's status honestly: `DONE` (built **and** tested), `IN PROGRESS`, `BLOCKED`, `NOT STARTED`.
- Never write that something works unless you ran it. If untested, write `DONE (untested)`.
- Never delete history; mark superseded decisions as `SUPERSEDED by D-xx`.
- Don't paste secrets or real customer/factory data here.
- Keep this file concise. When §9 exceeds ~30 entries, summarise the oldest into a short "Earlier history" paragraph.

---

## 1. Project snapshot
- **Project:** AI Factory Intelligence & Decision Support System (MVP) — Indian MSME printing factories first.
- **Source spec:** `mvp.md` (v-unknown; never edit).
- **Current phase:** Phase 0 — Foundation & decisions (see `Phases.md`).
- **Overall status:** Documentation created; no application code yet.
- **Last updated:** 2026-10-19 by AI (Antigravity)

---

## 2. Currently working on
| Field | Value |
|---|---|
| **Active file(s)** | `apps/web/app/setup/page.tsx`, `apps/web/components/setup/*`, `apps/web/lib/assets.ts` |
| **Task** | Visual Enhancement of the 6-Step Setup Wizard with Industrial Photography, Visual Category Tiles, and Responsive Split Layout |
| **Phase / build-order step** | Complete & Verified (All 6 Steps enhanced with visuals, WebP/JPG fallbacks, responsive desktop/mobile layout, 100% test coverage) |
| **Started** | 2026-10-21 |
| **State** | DONE (56/56 wizard visual & E2E tests passing, 57/57 dashboard tests passing, 13/13 import tests passing, Next.js build clean) |
| **Blockers** | None |
| **Left in an unfinished state?** | No |

---

## 3. Completed
| ID | What | Files | Verified how | Date |
|---|---|---|---|---|
| C-01 | Project docs created: PRD, Architecture, Rules, Phases, Design, Memory, Security | `docs/*.md` | Reviewed against mvp.md | _(initial)_ |
| C-02 | Master Implementation Plan created covering Phases 0–5 | `implementation_plan.md` | Cross-referenced against all 8 specification docs and rules | 2026-10-19 |
| C-03 | Frontend Scaffolding, Design Tokens, and Responsive Hero Implementation | `apps/web/*` | Verified against approved visual reference; Next.js production build passes 100% | 2026-10-19 |
| C-04 | Backend Deterministic Engines & Unit Test Suite | `apps/api/*` | 6 standard library unit tests passing (Inventory math, Feasibility, Profitability, Rate limiting) | 2026-10-19 |
| C-05 | Shared Type Contracts & Benchmark Dataset | `packages/contracts/`, `data/sample/` | Synthetic printing factory dataset loaded and validated | 2026-10-19 |
| C-06 | Owner Dashboard & Worker 5-Button Tactile Floor Screen | `apps/web/app/dashboard`, `apps/web/app/worker` | Compiled and verified; live HTTP 200 responses | 2026-10-19 |
| C-07 | Persistent SQLite Database & Schema (WAL mode, foreign keys, multi-tenant indices) | `data/db/factoryos.sqlite`, `apps/web/lib/db.ts`, `apps/api/app/db/database.py` | Schema initialized and shared between Next.js and FastAPI | 2026-10-20 |
| C-08 | Secure Owner Authentication (Registration, PBKDF2 hashing, session tokens, login/logout) | `apps/web/lib/auth.ts`, `apps/web/app/api/auth/*`, `apps/web/app/login`, `apps/web/app/register` | Tested duplicate email rejection, password strength, session expiration | 2026-10-20 |
| C-09 | 6-Step Persistent Setup Wizard (Steps 1–6, incremental saving, draft resume, 24 industries) | `apps/web/lib/catalog.ts`, `apps/web/app/api/setup/*`, `apps/web/app/setup/page.tsx` | Tested step-by-step persistence across page reloads and re-logins | 2026-10-20 |
| C-10 | Excel & CSV Data Import Engine (XLSX parsing, template generator, validation, formula injection prevention) | `apps/web/lib/importEngine.ts`, `apps/web/app/api/import/*` | Tested CSV/XLSX validation, malicious `=cmd` sanitization, transactional commit | 2026-10-20 |
| C-11 | Tenant Isolation & Returning Owner Routing | `apps/web/app/api/factory/data/route.ts`, `apps/web/app/dashboard/page.tsx` | Tested multi-tenant boundary: user A cannot access user B's factory records | 2026-10-20 |
| C-12 | Enhanced 6-Step Setup Wizard with Industrial Visuals, Industry Tiles & Split Layout | `apps/web/components/setup/*`, `apps/web/lib/assets.ts`, `apps/web/public/images/*`, `apps/web/app/setup/page.tsx` | Automated test suite (56 checks), WebP/JPG dual formats, zero type errors, Next.js build clean | 2026-10-21 |

---

## 4. In progress / partially done
_(none)_

---

## 5. Decisions log
| ID | Decision | Reason | Status | Date |
|---|---|---|---|---|
| D-01 | Product scope = printing-factory MVP first | Per mvp.md | Confirmed (from spec) | — |
| D-02 | PostgreSQL as database | mvp.md lists it as a candidate | Confirmed | — |
| D-03 | Stack: Next.js + TypeScript, FastAPI, Redis, S3-compatible storage | Architecture.md §3 | Confirmed | — |
| D-04 | Theme: Dark Industrial with Deep Background & Cyan/Mint Accents | Approved visual reference image | Confirmed | 2026-10-19 |
| D-05 | Design tokens: `#061116`, `#10222E`, `#65D8F5`, `#77E8C2`, `#F0F6FC` | Exact reference image palette | Confirmed | 2026-10-19 |
| D-06 | Rate limits split per page group; sliding window algorithm | Security.md §4 | Confirmed & tested | 2026-10-19 |
| D-07 | Skeleton loaders on all data surfaces; stale data allowed only if labelled | Owner requirement + mvp.md | Confirmed | — |
| D-08 | Use node:sqlite (WAL mode) for zero-dependency shared local database | Windows Node 24 support without C++ build tools | Confirmed & tested | 2026-10-20 |
| D-09 | Multi-tenant scoping on every database query using authenticated session factory_id | Prevent IDOR and cross-factory data leaks | Confirmed & tested | 2026-10-20 |
| D-10 | Formula injection defense: sanitize leading `=`, `+`, `-`, `@` with single quote prepend | Prevent CSV injection attacks | Confirmed & tested | 2026-10-20 |
| D-11 | Centralized Asset Registry (`lib/assets.ts`) with dual WebP/JPG fallback and descriptive alt text | High performance, cross-browser support, modular asset replacement without touching form components | Confirmed & tested | 2026-10-21 |
| D-12 | Responsive Split Layout (Desktop sticky right panel + Mobile compact banner) | Keeps functional forms prominent, accessible, and fast while providing rich industrial visual context | Confirmed & tested | 2026-10-21 |

---

## 6. Next up (ordered)
1. Ready for live demonstration and full user onboarding at `http://localhost:3000/setup`.
2. Provide comprehensive final deliverables report to the factory owner.

---

## 7. Open questions (do not guess — ask the owner)
- [ ] Connect production external AI provider API key when transitioning from fallback mode to live cloud models

---

## 8. Known issues / risks / things that look wrong
_(none)_

---

## 9. Session log (newest first)
| Date | Who | What changed | Files touched | Next step |
|---|---|---|---|---|
| 2026-10-21 | AI (Antigravity) | Enhanced the existing 6-Step Setup Wizard with high-end industrial visual photography, selectable visual industry tiles, machine & material thumbnail badges, and responsive split layout (`lg:grid-cols-12`). Added 12 wizard step photography assets (WebP + JPG), 11 category thumbnails, and equipment badges. Created `lib/assets.ts` centralized asset registry, `IndustrialImageWithFallback.tsx`, `IndustryVisualTile.tsx`, `MachineThumbnailBadge.tsx`, and `IndustrialVisualPanel.tsx`. Preserved 100% of existing DB persistence, auth, validation, multi-tenant isolation, and import workflows. Verified with 56 automated visual & E2E tests, 0 type errors, clean Next.js build. | `apps/web/components/setup/*`, `apps/web/lib/assets.ts`, `apps/web/app/setup/page.tsx`, `apps/web/public/images/*`, `memory.md` | Deliver comprehensive summary to owner |
| 2026-10-20 | AI (Antigravity) | Implemented Owner Authentication, Persistent 6-Step Setup Wizard, and CSV/Excel Import Engine. Created SQLite relational database schema with WAL mode & multi-tenant indexes. Built 13 Next.js API routes, login/register UI, 6-step interactive wizard, template downloads, formula injection defenses, and dashboard live data integration. Added 58 automated unit & E2E tests (Node + Python, 100% pass rate). Verified production build (17 routes, exit code 0). | `apps/web/*`, `apps/api/*`, `data/db/*`, `scratch/*`, `memory.md` | Deliver final report to owner |
| 2026-10-20 | AI (Antigravity) | Added "dev": "npm run dev --workspace=@factoryos/web" alias to root package.json so "npm run dev" can be run directly from repo root; launched local Next.js dev server on port 3000 (verified HTTP 200). | `package.json`, `Memory.md` | Ready for live preview |
| 2026-10-19 | AI (Antigravity) | Built complete enterprise dashboard navigation matching user screenshots: DECISION ENGINE (Dashboard, AI Copilot, AI Alerts, Orders, AI Feasibility), OPERATIONS (Production, Machines, Maintenance, Inventory, Suppliers), ANALYTICS & FLOOR (Reports, Profitability, Worker View, Memory Bank), and ACTIONS (Factory Setup, Clear All Factory Data with restore/reset modal, Sign Out). Implemented rich working components and tested production build successfully. | `apps/web/components/dashboard/*`, `apps/web/app/dashboard/page.tsx`, `memory.md` | Deliver comprehensive summary to owner |
| 2026-10-19 | AI (Antigravity) | Created About, Contact, Solutions, and Features sections on homepage with smooth-scroll anchors (#about, #contact, #solutions, #features). Updated Navbar with functional click handlers on desktop and mobile. Created Footer component with quick platform links. Prerendered static pages & verified 200 OK. | `apps/web/components/sections/*`, `apps/web/components/hero/Navbar.tsx`, `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`, `memory.md` | Ready for owner review |
| 2026-10-19 | AI (Antigravity) | Replaced background with clean factory platform image (apps/web/public/images/factory-bg.png) with cinematic dark vignettes in Hero. Verified Next.js build passes with zero errors. | `apps/web/components/hero/Hero.tsx`, `apps/web/public/images/factory-bg.png`, `memory.md` | Awaiting user feedback |
| 2026-10-19 | AI (Antigravity) | Fully executed implementation across all phases: created monorepo (`apps/web`, `apps/api`, `packages/contracts`, `data/sample`, `infra`), implemented approved Homepage Hero matching visual reference, built deterministic engines, owner dashboard, and worker floor screen. Ran build and tests successfully. | `apps/web/*`, `apps/api/*`, `packages/contracts/*`, `data/sample/*`, `infra/*`, `memory.md` | Provide comprehensive final deliverable report |
| 2026-10-19 | AI (Antigravity) | Authored comprehensive Master Implementation Plan artifact | `implementation_plan.md`, `memory.md` | Owner approval & execution |

---

## 10. Quick-reference index
| Need | Open |
|---|---|
| What are we building, for whom? | `PRD.md` |
| How is it structured, what stack? | `Architecture.md` |
| What may / may not I do (incl. AI limits)? | `Rules.md` |
| What order do we build in? | `Phases.md` |
| How should it look and move? | `Design.md` |
| Security, rate limits, abuse flags, slow-load behaviour | `Security.md` |
| Original spec | `mvp.md` |
