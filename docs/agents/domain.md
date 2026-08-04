# Domain notes (agents)

SSOT glossary: root [CONTEXT.md](../../CONTEXT.md).

## Idempotency

- Stripe (and mocks) use stable `event.id`.
- `ProcessedEventRepository` records ids **after** successful domain write.
- Controllers return **200** for duplicates so providers stop retrying while still logging skip.

## Layer imports

Allowed directions:

```
app/api → usecase + infrastructure composition
usecase → domain ports/entities
infrastructure → domain ports (implements)
```

Forbidden: domain importing Next.js / Stripe SDK / React.
