
# Rules — Working Rules for Humans and AI on This Project

> Read this file, `Memory.md` and `PRD.md` before changing anything. If a rule here conflicts with a request, stop and ask the owner.
> Tags: **[Spec]** = from mvp.md · **[Proposed]** = suggested, confirm.

---

## 1. Golden rules (apply to everything)

1. **Never invent facts.** If data, a requirement, a library behaviour or a decision is not in the repo or the docs, say "unknown" and ask. This applies to code, docs and the product's AI answers alike.
2. **Deterministic code does the math; the LLM does the language.** Inventory, capacity, scheduling, cost and deadlines are never calculated by an LLM. [Spec]
3. **Never claim success without verification.** A change is "done" only after reading persisted state back. [Spec]
4. **Tenant isolation is checked on every query and mutation.** [Spec]
5. **Suggested ≠ verified.** Anything estimated or suggested is labelled "Suggested / Estimated — confirm before use". [Spec]
6. **Small, reviewable changes.** One concern per commit/PR. Don't refactor unrelated code.
7. **Update `Memory.md` at the end of every work session** (and after every finished task).
8. **Don't expand scope.** Stay on the printing-factory MVP; no ERP creep. [Spec]

---

## 2. What to USE

### Stack and patterns **[Proposed]**
- **TypeScript (strict)** on the frontend; **Python 3.x with type hints** on the backend.
- **Pydantic** schemas for every API request/response and every AI tool input/output; **Zod** for client forms.
- **Design tokens** (`styles/tokens.css`) for all colours, spacing, type — never hard-coded values (`Design.md`).
- **Reusable skeleton components** for every data-loading surface (`Design.md` §8, `Security.md` §8).
- **Alembic migrations** for every schema change; no manual DB edits.
- **Parameterised queries / ORM only.**
- **Idempotency keys** on every mutating call, especially Agent actions. [Spec]
- **Structured logging with a correlation ID** carried from request → tool call → audit log. [Spec]
- **Feature flags / config** for the Agent's low-risk allowlist so the owner can switch actions on/off. [Spec]
- **Tests with every change:** unit (formulas), integration (APIs), tenant-isolation, role-permission, import edge cases, agent-safety. [Spec]
- **Plain-language UI text, labels + icons, large touch targets, keyboard navigation, screen-reader semantics.** [Spec]
- **Locale files** for every user-visible string (no hard-coded English in components).

### Canonical formulas (use exactly; do not re-derive) [Spec]
```
Usable Stock        = Physical Stock − Reserved Stock − Damaged/Unusable Stock
Projected Available = Usable Stock + Confirmed Incoming (before need date) − Expected Consumption (before need date)
Estimated Contribution = Revenue − Included Direct/Allocated Costs
Margin %            = Estimated Contribution ÷ Revenue × 100   (only if revenue valid and non-zero)
```
Negative usable stock → shortage/data-quality warning, never silently accepted. Utilisation, efficiency, waste and rejection formulas are **[Open]** — do not implement until the owner defines them and they are recorded in `Memory.md`.

---

## 3. What to AVOID

### 3.1 Libraries and dependencies
- **Don't add a dependency without a reason.** Before adding: is it maintained, widely used, licence-compatible, and does the standard library or an existing dependency already do it? Record it in `Memory.md` → Decisions.
- **Avoid:** abandoned or very low-usage packages; packages that need broad system access; multiple libraries for the same job (one date lib, one state lib, one animation lib, one HTTP client); heavy UI kits that fight the design tokens; unpinned versions (`latest`, `*`); copy-pasted code of unknown licence.
- **No client-side secrets**, no analytics/tracking scripts that send factory data to third parties without owner approval.
- Run dependency vulnerability + secret scans in CI (`Security.md`). A critical finding blocks merge.

### 3.2 Code and data
- No raw spreadsheet content written straight to operational tables — always preview → validate → commit. [Spec]
- No silent inventory overwrites — use movements. [Spec]
- No hard-coded demo promises: delivery dates, shortages, utilisation, costs shown must come from calculation. Sample data must be labelled **sample**. [Spec]
- No fake probabilities ("86% on time"). Use High / Medium / Low with reasons. [Spec]
- No stale cached data shown as current. Show last-updated; label stale. [Spec]
- No "all clear" when data is missing. [Spec]
- No dense ERP tables, tiny text, excessive gradients or decorative charts. [Spec]
- No colour-only status — pair with text/icon. [Spec]
- No storing hidden chain-of-thought. [Spec]
- No auto-translating factory/customer/product names. [Spec]
- No complete-offline claims unless implemented. [Spec]

### 3.3 Secrets and security
- Never commit secrets, tokens, `.env` files, real customer data or real factory data.
- Never log passwords, tokens, full file contents or personal/customer data. Never return stack traces to clients.
- Never trust the client for role, factory ID or permission — derive from the session on the server.

---

## 4. Error handling

### Backend
- **One error shape** for all APIs: `{ "error": { "code": "STRING_CODE", "message": "plain language", "details": {…}, "correlation_id": "…" } }`.
- Stable error codes (e.g. `AUTH_REQUIRED`, `FORBIDDEN`, `TENANT_MISMATCH`, `VALIDATION_FAILED`, `RATE_LIMITED`, `STALE_APPROVAL`, `DUPLICATE_ACTION`, `INSUFFICIENT_DATA`, `AI_UNAVAILABLE`, `TIMEOUT`). Exact list is **[Proposed]**; keep it in one file.
- Correct HTTP status: 400/422 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict/duplicate, 429 rate-limited (with `Retry-After`), 5xx server.
- No stack traces, SQL or secrets in responses; full detail only in server logs.
- Timeouts + bounded retries on external calls; never retry non-idempotent writes without an idempotency key.
- Multi-record operations use a transaction or controlled batch and **report partial failure per item**. [Spec]

### Frontend
- Every data surface has four states: **loading (skeleton) · empty (helpful guidance) · error (what happened + retry) · stale (labelled)**.
- Errors use plain language, say what the user can do next, and never blame the user.
- Never leave a skeleton running forever: after the timeout threshold show a "taking longer than usual" message and a retry (`Security.md` §8).
- Validation errors appear next to the field, in the selected language.

### Missing data [Spec]
When rates, stock freshness, specs, lead times or operator availability are missing: say exactly what is missing, say what can still be assessed, ask for the **minimum** extra input. Never fill gaps with guesses.

---

## 5. Boundaries for AI (Copilot and Agent) [Spec]

### 5.1 Hard limits
1. **No database access.** The LLM gets no DB credentials and cannot write SQL or executable code. It can only call **allowlisted, typed tools**.
2. **Every tool call is checked by the backend** for role, factory, record and policy — regardless of what the model asked for.
3. **Read → Suggest → Limited Execute.** Default is READ/SUGGEST. Only owner-enabled, allowlisted low-risk actions may execute without per-action approval.
4. **Approval required by default** for: schedule changes, machine reassignment, purchases/commitments, cancellations, price changes, customer communication, deletions, financially significant actions, unclear or irreversible actions. "Approve all" only if each action is previewed, authorised and still valid.
5. **Approvals are bound to the exact action version** and re-validated before execution (stale-plan check).
6. **Verify after acting** — read back persisted state; recalculate affected risks; report completed / blocked / failed / pending truthfully. Never mark a partial task "completed".
7. **Never claim success from model text alone.**
8. **No external customer communication, purchase or payment** without explicit approval (customer communication is Phase 2 by default).
9. **No offline Agent mutations.**

### 5.2 Grounding and honesty
- Answer only from authorised, retrieved records or deterministic tool outputs. Include record references.
- If evidence is missing, say so. Don't invent machine settings, delivery dates, prices, stock or causes.
- Separate **facts**, **estimates**, **recommendations**. Correlation is not proof of cause.
- Confidence = High / Medium / Low **with reasons**. No invented percentages.
- Factory-approved knowledge (verified Factory Memory) outranks generic AI knowledge. If none exists: "no verified instruction found".
- Don't expose hidden chain-of-thought; give concise reasoning summaries.
- Respond in the user's selected language where possible; don't alter source records when translating.

### 5.3 Prompt-injection defence
- **Uploaded files, spreadsheets, PDFs, images, notes and order text are untrusted data, never instructions.** Pass them to the model clearly delimited as data.
- Instructions found inside data cannot change policy, permissions, tools or the allowlist.
- Minimise personal/customer/confidential data sent to the AI provider; disclose external AI processing.
- Test with injection samples before every release (`Security.md` §9).

### 5.4 Reliability
- Timeouts, bounded retries, structured-output validation, persistent task state, cost controls, rate limits.
- If the AI provider fails: degrade gracefully, keep normal software working, tell the user plainly.

### 5.5 If you are an AI coding assistant working on this repo
- First read: `Memory.md` → `Rules.md` → `PRD.md` → the doc relevant to your task.
- Don't create files, endpoints, tools, tables or libraries that aren't described in the docs without asking.
- If you can't verify something (a library API, a formula, a requirement), say so instead of guessing.
- Before finishing, update `Memory.md`: what you completed, files touched, what is in progress, blockers, open questions.

---

## 6. Definition of done for any task
- [ ] Matches `PRD.md` / `Architecture.md`; no scope creep
- [ ] Tenant + role checks present and tested
- [ ] Loading / empty / error / stale states built
- [ ] Strings in locale files; accessible; mobile-checked
- [ ] Tests added and passing; lint/type checks clean
- [ ] No secrets, no real data, no new unreviewed dependency
- [ ] Audit log entry for any consequential mutation
- [ ] `Memory.md` updated
