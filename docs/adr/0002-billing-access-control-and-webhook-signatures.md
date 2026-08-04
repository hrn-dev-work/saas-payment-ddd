# ADR 0002: Billing API access control and webhook signature verification

## Status

Accepted — 2026-08-04

## Context

ADR 0001 shipped an open demo API useful for architecture narrative, but
security review found:

- Unauthenticated `POST /api/subscriptions` and webhooks
- No payment-provider message authentication

Portfolio samples that touch payments must still demonstrate **production-shaped
controls**, even with mock Stripe adapters.

## Decision

1. **Fail closed on secrets** — require `BILLING_API_KEY` and `STRIPE_WEBHOOK_SECRET` (≥16 chars). Missing → HTTP 503.
2. **Webhook authentication** — `POST /api/webhooks/stripe` verifies Stripe-compatible `Stripe-Signature` (`t` + `v1` HMAC-SHA256 over `t.rawBody`) before parsing JSON.
3. **Machine API authentication** — `POST /api/subscriptions` requires `Authorization: Bearer …` or `X-Api-Key`.
4. **Browser path without client secrets** — pricing uses a **Server Action** so keys never enter `NEXT_PUBLIC_*` or browser JS.
5. **Health remains public** — `GET /api/health` for probes only.

## Consequences

### Positive

- Unauthorized internet clients cannot invent paid plans or inject fake payment notices without the secrets.
- Matches grilling questions: exposure, secrets placement, provider trust boundary.

### Trade-offs

- Local `.env` must be set before demos and automated tests set env in-process.
- Signature scheme is Stripe-compatible for education; live Stripe secrets may need the official SDK / `whsec_` decoding when graduating beyond the mock.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Origin-only CSRF checks | Spoofable; not a substitute for API keys / signatures |
| `NEXT_PUBLIC_BILLING_API_KEY` for the client | Secrets would be public |
| Leave APIs open for “demo ease” | Violates project security.md and misleads portfolio reviewers |
