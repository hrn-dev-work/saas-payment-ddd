# Skill set (agents)

**English only.** Human-facing skill tables belong in both halves of root `README.md` (`docs-language` — EN top / JA bottom).  
Stack SSOT: [stack.md](./stack.md). Routing: `.cursor/rules/project-entry.mdc` + `~/.cursor/rules/global-agent-routing.mdc`.

---

## A. Product skills (this repo demonstrates)

| Area | Skills |
|------|--------|
| Backend | Next.js Route Handlers · practical DDD (domain / usecase / infrastructure) |
| API | REST (`/api/subscriptions`, `/api/webhooks/stripe`, `/api/health`) · Zod boundary validation |
| Data | In-memory repository adapters (demo) |
| Integrations | Mock Stripe checkout · Stripe-like webhook parse · **idempotent event processing** |
| Quality | Vitest (webhook idempotency · parse · HTTP status contracts) · `pnpm lint` · `pnpm build` |
| Local ops | `pnpm dev` · no Docker DB for sample · `.env.example` keys only · `.cursorignore` |

**Out of scope:** live Stripe charges, full auth/SSO, multi-tenant billing, real invoice PDF.

---

## B. Cursor skills (procedures — read when the situation matches)

| Skill | When |
|-------|------|
| `docs-language` | README.md EN top + JA bottom; `docs/en|ja` one locale; this directory stays English |
| `wsl-agent-invoke` | Shell, git, gh on `\\wsl.localhost\` / WSL Ubuntu workspace |
| `bootstrap-project-foundation` | Missing `CONTEXT.md` or `project-entry.mdc` |
| `distinctive-ui` | Pricing / landing UI |
| `verification-before-done` | Before claiming done |
| `portfolio-conventions-audit` | Sample DoD / convention check |
| `agent-session-closeout` | Substantial work finished |
| `skill-learning-retrospective` | User asks for retrospective / skill updates |
| `conventional-pr-title` | Creating or editing GitHub PR titles |

---

## C. Rules (invariants)

### Repo (`.cursor/rules/`)

| Rule | When |
|------|------|
| `project-entry.mdc` | Always |
| `implementation-core.mdc` | Code edits |
| `implementation-review.mdc` | Explicit implementation-review / pre-commit |
| `testing-istqb.mdc` | Tests |
| `security-git.mdc` | Secrets · Git safety |
| `implementation-retrospective.mdc` | After implementation — append `docs/implementation-retrospective.md` |

### Global (`~/.cursor/rules/`)

| Rule | When |
|------|------|
| `project-foundation.mdc` | Before non-trivial work · CONTEXT · grilling · security |
| `default-stack.mdc` | Defaults; prefer this repo’s [stack.md](./stack.md) + ADR 0001 |
| `global-balanced-defaults.mdc` | Minimal change · quality · safety |
| `agent-wsl-git.mdc` | WSL / UNC shell and git |
| `git-commit-boundary.mdc` | Before commit / push / PR |

---

## D. Hooks (automation, not skills)

| Location | Event | Role |
|----------|-------|------|
| `~/.cursor/hooks.json` → `ensure-project-bootstrapped.sh` | `sessionStart` | Auto foundation bootstrap if CONTEXT / project-entry missing |
| `.cursor/hooks/track-code-edit.sh` | `afterFileEdit` | Track edits for retrospective |
| `.cursor/hooks/stop-retrospective.sh` | `stop` | Prompt post-work retrospective loop |

---

## E. Maintenance

When stack or demonstrated skills change: update section A here, both README halves, and ADR/stack if needed.
