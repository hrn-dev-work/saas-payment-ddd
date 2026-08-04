# 実装反省会ログ

コード実装後の振り返りを蓄積する。エージェントは `.cursor/rules/implementation-retrospective.mdc` に従い **新しいエントリを先頭に追記** する。

再発防止に効く改善は `.cursor/rules/*.mdc` へ反映する（本ログに「→ ルール更新: xxx」と書く）。

---

## テンプレート（コピー用）

```markdown
### YYYY-MM-DD — （変更概要 1 行）

- **変更**: （ファイル / 機能）
- **良かった点**:
- **改善点**:
- **ルール更新**: 無 / `implementation-core.mdc` §…
- **次回テスト**: Component / integration / system のどれを足すか
```

---

### 2026-08-04 — Session closeout (saas-payment-ddd full sample ship)

- **変更**: Solidpath portfolio end-to-end (scaffold → DDD fix → plain docs → security → public GitHub) + session LEARN into skills
- **良かった点**: User course-corrected early (conventions before setup prefs); third-party review found real gaps; shipping security before calling sample production-shaped
- **改善点**: (1) Scaffolded Next before foundation (2) shipped open payment APIs first (3) human docs mixed locale/jargon (4) usecase→infra + dual activation path mid-stream
- **ルール更新**: bootstrap hard order · docs-language plain/non-mix · portfolio-sample-ship 6a/6b/7b/lessons · project-foundation pre-scaffold · wsl-agent-invoke PS quoting · (prior) security payments stack
- **次回テスト**: Hosted deploy + browser-smoke when port free; live Stripe signature decode when graduating mock

### 2026-08-04 — Billing access control + signed webhooks

- **変更**: API key on machine POSTs, Stripe-compatible signatures, Server Action UI, ADR 0002, global skill/rule prevention
- **良かった点**: Fail-closed secrets; no client-side keys; tests for 401/503/signed happy path
- **改善点**: First ship left payment endpoints anonymous for demo narrative — fixed
- **ルール更新**: portfolio-sample-ship §6b · portfolio-conventions-audit B5c · default-stack payments · foundation security.md · security-git payments note · repo payment-security.mdc
- **次回テスト**: Hosted deploy with env secrets; optional full stripe SDK whsec decode when live

### 2026-08-04 — Solidpath portfolio sample (DDD + webhook idempotency)

- **変更**: Next.js monorepo sample with domain/usecase/infrastructure, mock Stripe, `/pricing`, docs EN+JA, Vitest (18)
- **良かった点**: Single activation path via `handleStripeWebhook`; PaymentCheckoutPort boundary; non-engineer README half
- **改善点**: First pass used create-next-app defaults before foundation bootstrap and had usecase→infra import + dual write path; fixed before ship
- **ルール更新**: 無 (process: bootstrap foundation before scaffolding)
- **次回テスト**: Hosted deploy smoke if Vercel/Render URL is added; browser-smoke on free port

<!-- 以下、新しいエントリをこの行の上に追加 -->
