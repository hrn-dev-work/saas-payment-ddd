# Local database

Japanese: [../ja/local-database.md](../ja/local-database.md)

## This sample (Solidpath)

| Item | Value |
|------|-------|
| Persistence | **In-memory** (process local), not Docker Postgres |
| Why | Portfolio demo focuses on DDD + webhook idempotency without ops cost |
| ADR | [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md) |

You do **not** need `docker compose up` to run `/pricing` or the webhook API.

## If you later add a real database

Default machine policy is PostgreSQL 16 in Compose (`db` service). That would require a new ADR and updates to [../agents/stack.md](../agents/stack.md). For multi-instance idempotency, store processed `event_id` with a unique constraint.

Agent SSOT: [../agents/stack.md](../agents/stack.md)
