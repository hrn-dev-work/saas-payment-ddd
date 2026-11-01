# saas-payment-ddd (Solidpath)

[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-57606a?style=for-the-badge)](./README.md) [![English](https://img.shields.io/badge/English-0969da?style=for-the-badge)](./README.en.md)

**What this is (one sentence):**\
A portfolio demo of **subscription billing that does not activate the same plan twice** when a payment provider sends the same “payment completed” notice more than once. No real money moves.

**Who it is for:** Clients, project managers, and engineers reviewing payment / backend work samples.

---

## For non-engineers

### The business problem

Payment companies (for example Stripe) sometimes **send the same “payment completed” notice twice** — because of timeouts, retries, or flaky networks.

If the app is careless:

- the same plan can start twice, or\
- the customer’s plan status no longer matches money already collected.

This sample **remembers each notice id the first time it is applied**, and **skips a second copy** of the same id.\
It also **checks that payment notices are signed** and that machine APIs need a key — so the open internet cannot invent “paid” events at will.

### What you can click

| Page | What to do | What you should see |
|------|------------|---------------------|
| [Home](http://localhost:3000) | Read the short product intro | Brand name **Solidpath**, link to pricing |
| [Pricing](http://localhost:3000/pricing) | Press the plan **Subscribe** button | A success message on screen; **no real card charge** |

### What this sample deliberately does *not* do

- Real card payment or live Stripe secret keys\
- Login or a full multi-customer SaaS product\
- A production database (demo data lives only while the app process is running)

### Skills this repo is meant to demonstrate

| Skill | In plain language |
|-------|-------------------|
| Design structure | Business rules stay separate from “talking to the payment company” and from the screen |
| Reliability | The same notice id is applied only once |
| Access control | Signed payment notices + API key for machine writers; UI uses server-side actions |
| Payment flow (demo) | Plan signup and the “payment completed” notice share one internal path |
| UI | Simple plan list with success feedback |

Machine-oriented skill list (English): [docs/agents/skill-set.md](docs/agents/skill-set.md).

### Human guides (start here)

| Guide | Audience |
|-------|----------|
| [About this sample](docs/en/about-this-sample.md) | Reviewers without deep tech background |
| [Getting started](docs/en/getting-started.md) | Running the demo on your machine |
| [docs/en/](docs/en/) | All English human guides |
| [docs/ja/](docs/ja/) | Japanese human guides (separate files) |

Architecture notes for agents stay English-only: [CONTEXT.md](CONTEXT.md), [docs/agents/](docs/agents/), [docs/adr/](docs/adr/).

---

## For engineers — quick start

```bash
pnpm install
cp .env.example .env
# Set long random values (≥16 chars) for BILLING_API_KEY and STRIPE_WEBHOOK_SECRET
pnpm dev
# If port 3000 is already in use:
# pnpm dev -- --port 3001
```

| URL | Role |
|-----|------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/pricing | Plan selection UI (Server Action — no API key in the browser) |
| http://localhost:3000/api/health | Health check (public) |

**Security (required):**\
- Machine `POST /api/subscriptions` needs `Authorization: Bearer $BILLING_API_KEY` (or `X-Api-Key`).\
- `POST /api/webhooks/stripe` needs a valid `Stripe-Signature` for `$STRIPE_WEBHOOK_SECRET`.\
- Missing secrets → HTTP **503** (fail closed). Details: [ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md).

**Activation path:**\
UI Server Action or authorized `POST /api/subscriptions` → mock checkout → **same** `handleStripeWebhook` function as the webhook route.

### Demo: signed webhook, same notice twice

```bash
export STRIPE_WEBHOOK_SECRET='replace-with-your-local-secret'
export BILLING_API_KEY='replace-with-your-local-key'
BODY='{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'
SIG=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG" \
  -d "$BODY"
# Same body + new signature still same event id → already_processed
SIG2=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG2" \
  -d "$BODY"
```

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local development server |
| `pnpm build` | Production build |
| `pnpm test` | Automated tests (security, business rules, HTTP) |
| `pnpm lint` | Lint |

Stack decisions: [ADR 0001](docs/adr/0001-nextjs-monolith-mock-stripe.md) · [ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md).

---

## Skill set

| Area | Skills |
|------|--------|
| Backend | Next.js Route Handlers · practical DDD (domain / usecase / infrastructure) |
| API | REST (`/api/subscriptions`, `/api/webhooks/stripe`, `/api/health`) · Zod after auth gates |
| Access control | API key on machine writes · webhook HMAC signatures · Server Action for UI |
| Data | In-memory repository adapters (demo) |
| Integrations | Mock Stripe checkout · verified webhook intake · same-notice-once processing |
| Quality | Vitest (security · parse · HTTP · use cases) · `pnpm lint` · `pnpm build` |
| Local ops | `pnpm dev` · no Docker DB for sample · `.env.example` keys only · `.cursorignore` |

**Out of scope:** live Stripe charges, full auth/SSO, multi-tenant billing, real invoice PDF.

Agent detail: [docs/agents/skill-set.md](docs/agents/skill-set.md).
