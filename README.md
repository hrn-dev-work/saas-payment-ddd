# saas-payment-ddd (Solidpath)

**What this is (one sentence):**  
A portfolio demo that shows how to design **subscription billing that does not double-charge or double-apply** when payment events are sent twice — using clean layering (DDD-style), without real money.

**Who it is for:** people evaluating backend / SaaS payment skills (clients, PMs, engineers).

---

## For non-engineers

### The business problem

Payment providers (like Stripe) sometimes **send the same “payment succeeded” notice more than once** (timeouts, retries, network glitches).  
If the system is careless, that can mean:

- the same plan is activated twice, or  
- billing state drifts from money already taken.

This sample shows a design that **records each provider event id once**, so a second copy is safely ignored.

### What you can click

| Page | What to do | What you should see |
|------|------------|---------------------|
| [Home](http://localhost:3000) | Read the product pitch | Brand **Solidpath**, link to pricing |
| [Pricing](http://localhost:3000/pricing) | Press **Subscribe** on a plan | Success toast (“決済モックが成功しました”); **no real charge** |

### What the sample deliberately does *not* do

- No real card charges, no live Stripe keys  
- No login / multi-tenant SaaS product  
- No production database (data lives only in the running process for the demo)

### Skills this repo is meant to demonstrate

| Skill | In plain language |
|-------|-------------------|
| Architecture | Business rules are separated from payment-provider details and from UI screens |
| Reliability | Same event id processed only once (idempotency) |
| Payments (mock) | Checkout + webhook-style activation on one shared path |
| UI | Simple plan picker with success feedback |

Details for agents: [docs/agents/skill-set.md](docs/agents/skill-set.md).

### Portfolio blurb (Japanese marketplaces)

- **Title (≤35 chars):** DDD準拠：SaaS向け堅牢なAPI設計と決済基盤構築  
- **Summary:** 拡張性と保守性を重視したDDDに基づくSaaSバックエンドAPI。Stripe決済連携をモックで示し、Webhook冪等性と関心事の分離を実装。

### Human docs (start here)

| Guide | Audience |
|-------|----------|
| [About this sample](docs/en/about-this-sample.md) | Non-engineers / reviewers |
| [Getting started](docs/en/getting-started.md) | Run the demo on your machine |
| [docs/en/](docs/en/) · [docs/ja/](docs/ja/) | All human-facing guides |

Agents and architecture notes stay in English: [CONTEXT.md](CONTEXT.md), [docs/agents/](docs/agents/), [docs/adr/](docs/adr/).

---

## For engineers — quick start

```bash
pnpm install
pnpm dev
# If port 3000 is already in use:
# pnpm dev -- --port 3001
```

| URL | Role |
|-----|------|
| http://localhost:3000 | Landing |
| http://localhost:3000/pricing | Subscribe UI |
| http://localhost:3000/api/health | Health check |

**Activation path (important):**  
`POST /api/subscriptions` → mock checkout → **same** `handleStripeWebhook` use case as `POST /api/webhooks/stripe`.

### Webhook demo (idempotency)

```bash
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'

# Same id again → already_processed
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'
```

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Vitest (idempotency, parse, HTTP) |
| `pnpm lint` | ESLint |

Stack exception (no Compose Postgres for this sample): [docs/adr/0001-nextjs-monolith-mock-stripe.md](docs/adr/0001-nextjs-monolith-mock-stripe.md).

---

# saas-payment-ddd（Solidpath）

**ひとことで:**  
「決済のお知らせが二重に届いても、契約を二重に作らない」ようにした **SaaS 課金の設計デモ**（実課金なし・ポートフォリオ用）。

**想定読者:** 決済・SaaS バックエンドを評価する方（クライアント、PM、エンジニア）。

---

## 非エンジニア向け

### 解けているビジネス課題

決済サービス（Stripe など）は、通信の失敗や再送のせいで **同じ「支払い完了」通知を複数回送る**ことがあります。  
設計が甘いと次のような事故になります。

- 同じプランが二重に有効化される  
- 課金状態と実際の入金がずれる  

このサンプルは、**プロバイダのイベント ID を1度だけ適用する**仕組み（冪等性）を見せます。

### 触れる画面

| 画面 | やること | 期待する結果 |
|------|----------|--------------|
| [ホーム](http://localhost:3000) | 説明を読む | ブランド **Solidpath**、料金ページへの導線 |
| [料金](http://localhost:3000/pricing) | **Subscribe** を押す | 成功トースト（**実課金なし**） |

### わざとやっていないこと

- 本物のカード決済・本番 Stripe キー  
- ログインや本格的な SaaS 全機能  
- 本番データベース（デモ中はプロセス内の一時データ）

### この作品で示したいスキル

| 領域 | 平たい言い方 |
|------|--------------|
| 設計 | 業務ルールと決済業者・画面を分けている |
| 信頼性 | 同じイベント ID は1回だけ処理する |
| 決済（モック） | Checkout と Webhook 相当を同じ道筋で通す |
| UI | プラン選択と成功フィードバック |

エージェント向け詳細: [docs/agents/skill-set.md](docs/agents/skill-set.md)。

### ポートフォリオ掲載文案

- **タイトル（35文字以内）:** DDD準拠：SaaS向け堅牢なAPI設計と決済基盤構築  
- **概要:** 拡張性と保守性を重視したDDDに基づくSaaSバックエンドAPI。Stripe決済連携をモックで示し、Webhook冪等性と関心事の分離を実装。

### 人向けドキュメント（まずここ）

| ガイド | 想定読者 |
|--------|----------|
| [このサンプルについて](docs/ja/about-this-sample.md) | 非エンジニア / 評価者 |
| [はじめに](docs/ja/getting-started.md) | 手元で動かす人 |
| [docs/ja/](docs/ja/) · [docs/en/](docs/en/) | 人向けガイド一式 |

エージェント向けは英語のみ: [CONTEXT.md](CONTEXT.md)、[docs/agents/](docs/agents/)、[docs/adr/](docs/adr/)。

---

## エンジニア向け — クイックスタート

```bash
pnpm install
pnpm dev
# ポート 3000 が使用中なら:
# pnpm dev -- --port 3001
```

| URL | 役割 |
|-----|------|
| http://localhost:3000 | ランディング |
| http://localhost:3000/pricing | 申込 UI |
| http://localhost:3000/api/health | ヘルスチェック |

**有効化の経路（重要）:**  
`POST /api/subscriptions` → モック Checkout → **`handleStripeWebhook` は Webhook API と同一**。

### Webhook デモ（冪等性）

```bash
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'

# 同じ id をもう一度 → already_processed
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'
```

| コマンド | 用途 |
|----------|------|
| `pnpm dev` | 開発サーバ |
| `pnpm build` | 本番ビルド |
| `pnpm test` | Vitest（冪等・parse・HTTP） |
| `pnpm lint` | ESLint |

スタック例外（本サンプルは Compose Postgres なし）: [docs/adr/0001-nextjs-monolith-mock-stripe.md](docs/adr/0001-nextjs-monolith-mock-stripe.md)。
