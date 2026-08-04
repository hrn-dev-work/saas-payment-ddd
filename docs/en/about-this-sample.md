# About this sample (for non-engineers)

Japanese version: [../ja/about-this-sample.md](../ja/about-this-sample.md)

## Why this project exists

When someone hires for **subscription billing, payment company integration, or API cleanup**, they often want proof of two things:

1. **Same payment notice, applied once** — if the provider retries the same “payment completed” message, the plan does not start twice.  
2. **Clear separation of roles** — code that talks to the payment company does not sprawl through the whole app.

Solidpath is a **portfolio mock**, not a live billing product.

## Storyboard (what happens when you click Subscribe)

```text
You choose a plan on the pricing page
        ↓
The app starts a fake checkout (no card form, no charge)
        ↓
The same internal step used for “payment completed” notices activates the plan
        ↓
You see a success message in the browser
```

If the **same notice id** arrives again (an engineer can simulate this with the README commands), the server answers **already processed** and does **not** create a second subscription.

## How to evaluate in 5 minutes

1. Open pricing, press Subscribe, confirm the success message.  
2. Optionally ask an engineer to send the same notice body twice (see README).  
3. In the repository, glance at folders that separate business rules, use cases, payment adapters, and web routes (`domain` / `usecase` / `infrastructure` / `app/api`).

## Safety

- Demo APIs have no login — do not put a writable public deployment on the open internet without a security review.  
- No live payment secrets are required or stored in this repo.

## Short technical notes

- Stack and layout: [../agents/stack.md](../agents/stack.md)  
- Decision record: [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md)
