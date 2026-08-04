# Getting started

Japanese version: [../ja/getting-started.md](../ja/getting-started.md)

**If you only need the business story:** start with [about-this-sample.md](./about-this-sample.md).

## Run the demo

Needs: Node.js 20+, pnpm. Linux / macOS / WSL is recommended.

```bash
cd /path/to/saas-payment-ddd
pnpm install
cp .env.example .env
# Set BILLING_API_KEY and STRIPE_WEBHOOK_SECRET (≥16 random chars each)
pnpm dev
```

If something else already uses port **3000**:

```bash
pnpm dev -- --port 3001
```

Then open:

- http://localhost:3000 (or `:3001`) — home  
- http://localhost:3000/pricing — plan selection  

Confirm the on-screen success message. No card is charged.

## Checks engineers usually run

```bash
pnpm test   # automated tests
pnpm lint
pnpm build
```

## Database

This sample **does not use a Docker database**. Data stays in memory for as long as the process runs.  
Details: [local-database.md](./local-database.md).

## How documentation is split

- Human guides: this folder (`docs/en/`) and Japanese (`docs/ja/`) — one language per file  
- Agent notes: `CONTEXT.md`, `docs/agents/`, `docs/adr/` — English only
