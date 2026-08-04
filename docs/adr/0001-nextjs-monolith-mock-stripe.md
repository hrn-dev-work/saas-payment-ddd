# ADR 0001: Next.js monolith with mock Stripe and in-memory stores

## Status

Accepted — 2026-08-04

## Context

Machine / foundation default is FastAPI + Next split + PostgreSQL 16. This repository is a **freelance portfolio sample** meant to show:

1. **Webhook idempotency** (Stripe-style event replay safety)
2. **Practical DDD layering** (domain / usecase / infrastructure) in a readable tree

Stakeholders need a single cloneable app with a `/pricing` UI and `POST /api/webhooks/stripe`, not a full production billing platform.

## Decision

- Ship a **single Next.js App Router** app hosting both UI and Route Handler APIs.
- Implement DDD folders under `src/domain`, `src/usecase`, `src/infrastructure`.
- Use a **mock Stripe client** and **in-memory repositories** (globalThis-backed for dev stability).
- Package manager: **pnpm** (matches default Node preference).
- Defer real Stripe signatures, Postgres unique indexes, and Compose `db` until a follow-up ADR.

## Consequences

### Positive

- One command to demo architecture and UI.
- Idempotency logic is unit-testable without Docker.
- Layer boundaries stay obvious in GitHub file tree for client review.

### Negative / trade-offs

- Deviates from default FE/BE split and Postgres mandate.
- Multi-instance deployments would lose in-memory state (demo only).
- No cryptographic webhook verification yet.

## Alternatives considered

| Option | Why not |
|--------|---------|
| FastAPI + Next (default) | Heavier for a visual DDD folder story on one PR |
| NestJS API-only (ops-inbox style) | UI pricing path is part of the sales artifact |
| Live Stripe + Postgres | Requires secrets and hosting cost before story is proven |
