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
- **Last updated:** _(date)_ by _(who: human / AI name)_

---

## 2. Currently working on
| Field | Value |
|---|---|
| **Active file(s)** | _none yet_ |
| **Task** | _none yet_ |
| **Phase / build-order step** | Phase 0 |
| **Started** | _(date)_ |
| **State** | NOT STARTED |
| **Blockers** | Open decisions in §7 |
| **Left in an unfinished state?** | No |

_(If you stop mid-task, describe exactly what is half-done here, including any broken/failing thing.)_

---

## 3. Completed
| ID | What | Files | Verified how | Date |
|---|---|---|---|---|
| C-01 | Project docs created: PRD, Architecture, Rules, Phases, Design, Memory, Security | `docs/*.md` | Reviewed against mvp.md by author; **not yet reviewed by owner** | _(date)_ |

---

## 4. In progress / partially done
_(none)_

---

## 5. Decisions log
| ID | Decision | Reason | Status | Date |
|---|---|---|---|---|
| D-01 | Product scope = printing-factory MVP first | Per mvp.md | Confirmed (from spec) | — |
| D-02 | PostgreSQL as database | mvp.md lists it as a candidate | **Proposed — confirm** | — |
| D-03 | Stack: Next.js + TypeScript, FastAPI, Redis, S3-compatible storage | Proposal in `Architecture.md` §3 | **Proposed — confirm** | — |
| D-04 | Theme: dark only, no white; Direction A (metallic) vs B (dark palette) | Owner requirement; direction undecided | **Open** | — |
| D-05 | Design tool: Figma vs Stitch | Owner undecided | **Open** | — |
| D-06 | Rate limits split per page group; starting values in `Security.md` §4 | Owner requirement; numbers are placeholders | **Proposed — tune with real traffic** | — |
| D-07 | Skeleton loaders on all data surfaces; stale data allowed only if labelled | Owner requirement + mvp.md "never show stale as current" | Confirmed (requirement) | — |

---

## 6. Next up (ordered)
1. Owner reviews the seven docs; corrections logged in §9.
2. Resolve Phase 0 decisions (§7) and record them in §5.
3. Create repo skeleton per `Architecture.md` §4 (only after step 2's stack decisions).
4. Phase 1, step 1: authentication, factory isolation, roles, audit foundation (+ rate limiting and sign-up flagging).

---

## 7. Open questions (do not guess — ask the owner)
- [ ] Pilot factory and launch languages
- [ ] Mobile vs desktop priority; device constraints
- [ ] Formulas: utilisation, efficiency, waste, rejection, contribution margin (stock formulas are defined in mvp.md)
- [ ] Reserved / confirmed-incoming stock and adjustment rules
- [ ] Scheduling constraints, overtime, shifts, setup families, tie-breaking
- [ ] Agent low-risk action allowlist and approval roles
- [ ] Approval expiry, stale-plan handling, cancellation/compensation
- [ ] Framework, database, hosting, auth provider, AI provider, storage, job system
- [ ] File limits, retention, backups, monitoring, external integrations
- [ ] Pilot test plan, sample dataset, evaluation set, baselines, sign-off, rollback
- [ ] Theme direction (A/B) and design tool (Figma/Stitch)
- [ ] Rate-limit budgets: confirm or adjust the starting values

---

## 8. Known issues / risks / things that look wrong
_(none yet — add: what, where, how found, severity, status)_

---

## 9. Session log (newest first)
| Date | Who | What changed | Files touched | Next step |
|---|---|---|---|---|
| _(date)_ | AI (docs author) | Created the seven project docs from mvp.md | `PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Design.md`, `Memory.md`, `Security.md` | Owner review → Phase 0 decisions |

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
