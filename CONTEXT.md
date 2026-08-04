# saas-payment-ddd

Portfolio sample that demonstrates **webhook idempotency** and **practical DDD layering** for SaaS subscription billing (Stripe mocked).

Detailed specs live under `docs/`. This file is the **domain glossary** and **implementation traps** for agents— not a spec, not a scratch pad.

**Agents (Cursor, Gemini, others):** read this file + `docs/agents/` before non-trivial work. Committed docs beat chat-only decisions.

---

## Domain Language

**Subscription**:
Paid access entitlement for one customer and one plan. Holds `status`, local id, and optional provider id (`externalSubscriptionId`).
_Avoid_: calling Stripe objects "subscription" inside domain code without mapping.

**Plan**:
Marketed SKU (`starter` | `growth` | `scale`). Not a price table of its own in this demo.
_Avoid_: free-form plan strings.

**Billing event**:
Provider-agnostic signal after a payment side effect (`checkout.session.completed`, etc.). Produced by infrastructure parsers.
_Avoid_: forwarding raw Stripe JSON into use cases.

**Processed event**:
Record that a provider `event.id` was applied successfully. Basis of **idempotency**.
_Avoid_: treating entity identity alone as enough to skip retries.

**Checkout session (mock)**:
Synthetic Stripe Checkout result returned by the mock adapter for the pricing CTA.
_Avoid_: real secret keys or live charges in this sample.

---

## Relationships

- 1 Customer → 0..1 active Subscription (demo stores latest by customer / external id)
- 1 Subscription → 1 Plan
- 1 Billing event → 0..1 Subscription mutation after idempotency gate
- 1 Processed event id → at most one successful application of side effects

---

## System Architecture & Constraints

**Stack** (see ADR 0001; overrides machine FastAPI default):

| Layer | Choice |
|-------|--------|
| Runtime | Next.js App Router (UI + Route Handlers) · TypeScript strict |
| Layers | `domain` / `usecase` / `infrastructure` / `app/api` controllers |
| UI | Tailwind CSS · shadcn-style Card/Button · Sonner toasts |
| Payments | **Mock Stripe** adapter (no live keys) |
| Persistence | **In-memory** ports (process-local) for demo |
| Validation | Zod at HTTP boundaries |
| Packages | **pnpm** |
| Tests | Vitest (idempotency use case) |
| Hosting target | Vercel (single app) |
| Agent host | WSL Ubuntu |

**Layout:**

```
src/app/           # Next routes + API controllers
src/domain/        # entities, VOs, repository ports
src/usecase/       # application services
src/infrastructure/# Stripe mock, in-memory repos, composition root
docs/              # agents · en · ja · adr
```

Full detail: [docs/agents/stack.md](docs/agents/stack.md).

**Environment defaults:** no Docker Postgres for this sample (ADR). Web `3000`. Health `GET /api/health`.

---

## Common Ambiguities

- **Subscribe and webhook share one write path** — `registerSubscription` creates a mock checkout, then calls `handleStripeWebhook` (never a second “save active” shortcut).
- **Duplicate webhooks must return HTTP 200** — retries are expected; invalid body → 400; domain reject (e.g. missing sub) → 422; unexpected → 500.
- Route handlers are **controllers only** — do not put idempotency sets inside `route.ts`.
- Use cases depend on domain **ports** only (`PaymentCheckoutPort`, repositories). Adapters live under `infrastructure/`.
- Mock Stripe is intentional; adding live Stripe requires secrets + ADR updates.
- **checkout.session.completed without planId is rejected** — no silent plan default.

---

## Security Guardrails

See [docs/agents/security.md](docs/agents/security.md). Summary:

### Public API & secrets

- Demo APIs are unauthenticated; do not deploy with writable public internet state without auth.
- No Stripe secret keys in repo or `NEXT_PUBLIC_*`.
- Validate webhook JSON with Zod before use-case calls.

### Public security baselines

- **OWASP Top 10 (latest)** — validate inputs; fail closed on parse errors.
- **IPA secure website guidance** — keep XSS risk low (React escaping); no `dangerouslySetInnerHTML`.
- **No `any`** in TypeScript application code.

---

## Architecture decisions

- [ADR 0001](docs/adr/0001-nextjs-monolith-mock-stripe.md) — Next monolith + in-memory + mock Stripe for portfolio demo.

---

## Flagged ambiguities (open)

- Real Postgres + unique index on `event_id` when this graduates beyond mock.
- Stripe signature verification (`Stripe-Signature`) not implemented (demo-only).

---

## Decision log

| Date | Decision | Status |
|------|----------|--------|
| 2026-08-04 | Portfolio sample name Solidpath; target webhook idempotency + DDD visuals | Accepted |
| 2026-08-04 | Stack exception: Next monorepo/in-memory vs default FastAPI+Postgres | Accepted (ADR 0001) |
| 2026-08-04 | Single activation path via handleStripeWebhook; PaymentCheckoutPort in domain | Accepted |
