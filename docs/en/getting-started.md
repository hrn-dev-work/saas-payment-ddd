# Getting started

Japanese: [../ja/getting-started.md](../ja/getting-started.md)

**Non-engineers:** start with [about-this-sample.md](./about-this-sample.md) if you only need the business story.

## Run the demo

Needs: Node.js 20+, pnpm, WSL/Linux or macOS path recommended.

```bash
cd /path/to/saas-payment-ddd
pnpm install
pnpm dev
```

If something else already uses port **3000**:

```bash
pnpm dev -- --port 3001
```

Then open:

- http://localhost:3000 (or `:3001`) — home  
- http://localhost:3000/pricing — Subscribe  

Confirm the success toast. No card is charged.

## Checks engineers usually run

```bash
pnpm test   # use case + parse + HTTP status contracts
pnpm lint
pnpm build
```

## Database

This sample **does not use Docker Postgres**. Data is in-memory for the process lifetime.  
See [local-database.md](./local-database.md).

## Doc languages

- Humans: `docs/en/` (this tree) and `docs/ja/`  
- Agents: `CONTEXT.md`, `docs/agents/`, `docs/adr/` — English only
