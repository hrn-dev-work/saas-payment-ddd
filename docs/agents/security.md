# Security guardrails (all projects)

Agents and contributors: **read before** adding API surface, env vars, user input handling, or auth.

Detailed project traps: **`CONTEXT.md` § Security Guardrails** (if present).

## Secrets & configuration

- Never commit `.env`, API keys, tokens, `credentials.json`, or private keys.
- `.env.example`: **key names only** — empty or dummy values.
- Server-only secrets stay on the backend. **`NEXT_PUBLIC_*` / browser-exposed env is public** — never put PA-API, Gemini, DB, or Sheets credentials there.
- Keep production dumps / CSV exports out of the repo. Use root `.cursorignore` so Cursor does not index `.env*`, keys, logs, or dump files.
- Prefer Faker (or equivalent) seeds for local DB data — never hardcode real PII in seed scripts.

## Grilling — security (Round 1 extension)

When scope touches API, forms, URLs, file I/O, or deployment, also confirm:

1. **Exposure** — Who can call this unauthenticated? New public endpoints?
2. **Input** — Untrusted strings (URLs, IDs, HTML)? Injection/SSRF/XSS paths?
3. **Env** — New variable server-side or client-side?

## Public standards (mandatory baseline)

Code generation and design **must** align with:

| Standard | Apply |
|----------|--------|
| **[OWASP Top 10](https://owasp.org/www-project-top-ten/)** (latest) | Eliminate injection, broken access control, misconfiguration, SSRF, vulnerable components, etc. |
| **[IPA — 安全なウェブサイトの作り方](https://www.ipa.go.jp/security/vuln/websecurity.html)** | XSS, SQLi, CSRF, session issues — implement controls at code level, not “document only”. |
| **Static analysis** | Do not merge code that fails configured linters/scanners (ESLint, Ruff, CodeQL, gitleaks, Trivy secret, Dependabot alerts you touch). |
| **TypeScript** | No careless `any` or unsafe casts that bypass validation; use `strict` patterns. |

If a scanner flags a finding, **fix or document accepted risk in an ADR** — do not silence without review.

## Repo tooling (add when missing)

| Layer | Target |
|-------|--------|
| pre-commit | Secret block (`pre-commit-secret-check.sh` or gitleaks) |
| CI | `secret-audit` job (gitleaks + Trivy secret) |
| GitHub | Secret Scanning + Push Protection (org/repo settings) |
| Dependencies | Dependabot or equivalent |

Copy patterns from a reference repo (e.g. SmartResearch-HQ) when bootstrapping production apps.

## References

- Project ADRs under `docs/adr/` — especially auth and public-API decisions.
- [domain.md](./domain.md) — CONTEXT / ADR update rules.
