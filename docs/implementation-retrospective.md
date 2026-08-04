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

### 2026-08-04 — Solidpath portfolio sample (DDD + webhook idempotency)

- **変更**: Next.js monorepo sample with domain/usecase/infrastructure, mock Stripe, `/pricing`, docs EN+JA, Vitest (18)
- **良かった点**: Single activation path via `handleStripeWebhook`; PaymentCheckoutPort boundary; non-engineer README half
- **改善点**: First pass used create-next-app defaults before foundation bootstrap and had usecase→infra import + dual write path; fixed before ship
- **ルール更新**: 無 (process: bootstrap foundation before scaffolding)
- **次回テスト**: Hosted deploy smoke if Vercel/Render URL is added; browser-smoke on free port

<!-- 以下、新しいエントリをこの行の上に追加 -->
