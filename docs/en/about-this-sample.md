# About this sample (for non-engineers)

Japanese version: [../ja/about-this-sample.md](../ja/about-this-sample.md)

## Why this project exists

When someone hires for **subscription billing, payment company integration, or API cleanup**, they often want proof of two things:

1. **Same payment notice, applied once** — if the provider retries the same “payment completed” message, the plan does not start twice.  
2. **Clear separation of roles** — code that talks to the payment company does not sprawl through the whole app.

Solidpath is a **portfolio mock**, not a live billing product. It still uses **access keys and signed notices** so the sample is not a free-for-all on the open internet.

## Storyboard (what happens when you click Subscribe)

```text
You choose a plan on the pricing page
        ↓
The app starts a fake checkout on the server (no card form, no charge, no secret keys in the browser)
        ↓
The same internal step used for “payment completed” notices activates the plan
        ↓
You see a success message in the browser
```

If the **same notice id** arrives again **with a valid signature** (an engineer can simulate this with the README commands), the server answers **already processed** and does **not** create a second subscription.

## How to evaluate in 5 minutes

1. Open pricing, press Subscribe, confirm the success message.  
2. Optionally ask an engineer to send the **same signed notice** twice (README).  
3. In the repository, glance at folders that separate business rules, use cases, payment adapters, and web routes (`domain` / `usecase` / `infrastructure` / `app/api`).

## Safety

- Writable HTTP APIs require secrets (API key and webhook signature). Do not run with an empty `.env` on a public host.  
- No live payment secrets ship in git; configure your own keys locally or in the host env store.  
- The browser never receives the billing API key (server-side path).

## Short technical notes

- Stack and layout: [../agents/stack.md](../agents/stack.md)  
- Access control decision: [../adr/0002-billing-access-control-and-webhook-signatures.md](../adr/0002-billing-access-control-and-webhook-signatures.md)  
- Layout decision: [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md)
