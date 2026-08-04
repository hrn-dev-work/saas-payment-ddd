# Standard stack (this repository)

**Source of truth for agents.** Override of the machine FastAPI default — see [ADR 0001](../adr/0001-nextjs-monolith-mock-stripe.md).

## Choices

| Layer | Choice |
|-------|--------|
| App | Next.js (App Router) + TypeScript (strict) |
| Architecture | Practical DDD — `domain` / `usecase` / `infrastructure` |
| API | Route Handlers under `src/app/api/*` (controller layer) |
| Frontend | React · Tailwind CSS · shadcn-style Card/Button · Lucide · Sonner |
| Payments | Mock Stripe client (`src/infrastructure/stripe`) |
| DB | None for demo (in-memory repositories) |
| Validation | Zod at HTTP boundaries |
| Packages | pnpm |
| Tests | Vitest |
| Hosting | Vercel (single deploy) · GitHub |
| Locale UI | Japanese primary (`lang=ja`) |

## Environment

| Concern | Default |
|---------|---------|
| Local DB | **Off** (ADR 0001) — use in-memory ports |
| Redis | Off |
| Local ports | web `3000` |
| Health | `GET /api/health` |
| Env files | `.env` gitignored; `.env.example` keys only |
| Agent host | WSL Ubuntu |

## Layout

```
src/app/                 # pages + API controllers
src/domain/subscription/ # model + ports
src/usecase/subscription/
src/infrastructure/      # stripe mock, persistence, composition
docs/                    # agents (EN) · en/ · ja/ · adr/
```

## Exceptions

1. User confirms the exception  
2. Add an ADR under `docs/adr/`  
3. Update this file and `CONTEXT.md`
