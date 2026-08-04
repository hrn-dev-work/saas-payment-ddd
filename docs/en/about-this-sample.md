# About this sample (for non-engineers)

Japanese: [../ja/about-this-sample.md](../ja/about-this-sample.md)

## Why this project exists

Clients hiring for **Stripe / subscription / API refactor** work often need evidence of two things:

1. **Idempotent webhooks** — the system survives retries without double-applying payment events.  
2. **Clear separation of concerns** — payment-provider details do not leak into the whole codebase.

Solidpath is a **portfolio mock**, not a live billing product.

## Storyboard (what happens when you click Subscribe)

```text
You choose a plan on /pricing
        ↓
App calls POST /api/subscriptions
        ↓
Mock “Stripe Checkout” returns fake IDs (no card form, no charge)
        ↓
Same internal routine used for Stripe webhooks activates the subscription
        ↓
Success toast in the browser
```

If the **same event id** is delivered again (simulated with curl), the server answers **already processed** and does not create a second subscription.

## How to evaluate in 5 minutes

1. Open pricing, press Subscribe, confirm the success message.  
2. Optionally ask an engineer to send the same webhook body twice (README curl).  
3. In the repository tree, glance at folders: `domain` / `usecase` / `infrastructure` / `app/api`.

## Safety

- Demo APIs are unauthenticated — do not expose a public writable deployment without a security review.  
- No live Stripe secrets are required or stored.

## Technical notes (short)

- Stack and layout: [../agents/stack.md](../agents/stack.md)  
- Decision record: [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md)
