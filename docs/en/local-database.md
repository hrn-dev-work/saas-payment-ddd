# Local database

Japanese version: [../ja/local-database.md](../ja/local-database.md)

## This sample (Solidpath)

| Item | Value |
|------|-------|
| Where data lives | **In the app process memory** only (not a Docker database) |
| Why | Keeps the demo focused on design structure and “same notice once” behavior |
| Decision write-up | [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md) |

You do **not** need `docker compose up` to run pricing or the payment-notice API.

## If you later add a real database

The usual machine default is PostgreSQL 16 in Docker Compose (`db` service). That needs a new decision record and an update to [../agents/stack.md](../agents/stack.md). To keep “same notice once” safe across several servers, store each processed notice id with a unique database rule.

Agent reference: [../agents/stack.md](../agents/stack.md)
