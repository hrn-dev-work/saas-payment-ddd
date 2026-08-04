# saas-payment-ddd (Solidpath)

**What this is (one sentence):**  
A portfolio demo of **subscription billing that does not activate the same plan twice** when a payment provider sends the same “payment completed” notice more than once. No real money moves.

**Who it is for:** Clients, project managers, and engineers reviewing payment / backend work samples.

---

## For non-engineers

### The business problem

Payment companies (for example Stripe) sometimes **send the same “payment completed” notice twice** — because of timeouts, retries, or flaky networks.

If the app is careless:

- the same plan can start twice, or  
- the customer’s plan status no longer matches money already collected.

This sample **remembers each notice id the first time it is applied**, and **skips a second copy** of the same id.  
It also **checks that payment notices are signed** and that machine APIs need a key — so the open internet cannot invent “paid” events at will.

### What you can click

| Page | What to do | What you should see |
|------|------------|---------------------|
| [Home](http://localhost:3000) | Read the short product intro | Brand name **Solidpath**, link to pricing |
| [Pricing](http://localhost:3000/pricing) | Press the plan **Subscribe** button | A success message on screen; **no real card charge** |

### What this sample deliberately does *not* do

- Real card payment or live Stripe secret keys  
- Login or a full multi-customer SaaS product  
- A production database (demo data lives only while the app process is running)

### Skills this repo is meant to demonstrate

| Skill | In plain language |
|-------|-------------------|
| Design structure | Business rules stay separate from “talking to the payment company” and from the screen |
| Reliability | The same notice id is applied only once |
| Access control | Signed payment notices + API key for machine writers; UI uses server-side actions |
| Payment flow (demo) | Plan signup and the “payment completed” notice share one internal path |
| UI | Simple plan list with success feedback |

Machine-oriented skill list (English): [docs/agents/skill-set.md](docs/agents/skill-set.md).

### Human guides (start here)

| Guide | Audience |
|-------|----------|
| [About this sample](docs/en/about-this-sample.md) | Reviewers without deep tech background |
| [Getting started](docs/en/getting-started.md) | Running the demo on your machine |
| [docs/en/](docs/en/) | All English human guides |
| [docs/ja/](docs/ja/) | Japanese human guides (separate files) |

Architecture notes for agents stay English-only: [CONTEXT.md](CONTEXT.md), [docs/agents/](docs/agents/), [docs/adr/](docs/adr/).

---

## For engineers — quick start

```bash
pnpm install
cp .env.example .env
# Set long random values (≥16 chars) for BILLING_API_KEY and STRIPE_WEBHOOK_SECRET
pnpm dev
# If port 3000 is already in use:
# pnpm dev -- --port 3001
```

| URL | Role |
|-----|------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/pricing | Plan selection UI (Server Action — no API key in the browser) |
| http://localhost:3000/api/health | Health check (public) |

**Security (required):**  
- Machine `POST /api/subscriptions` needs `Authorization: Bearer $BILLING_API_KEY` (or `X-Api-Key`).  
- `POST /api/webhooks/stripe` needs a valid `Stripe-Signature` for `$STRIPE_WEBHOOK_SECRET`.  
- Missing secrets → HTTP **503** (fail closed). Details: [ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md).

**Activation path:**  
UI Server Action or authorized `POST /api/subscriptions` → mock checkout → **same** `handleStripeWebhook` function as the webhook route.

### Demo: signed webhook, same notice twice

```bash
export STRIPE_WEBHOOK_SECRET='replace-with-your-local-secret'
export BILLING_API_KEY='replace-with-your-local-key'
BODY='{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'
SIG=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG" \
  -d "$BODY"
# Same body + new signature still same event id → already_processed
SIG2=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG2" \
  -d "$BODY"
```

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local development server |
| `pnpm build` | Production build |
| `pnpm test` | Automated tests (security, business rules, HTTP) |
| `pnpm lint` | Lint |

Stack decisions: [ADR 0001](docs/adr/0001-nextjs-monolith-mock-stripe.md) · [ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md).

---

# saas-payment-ddd（Solidpath）

**ひとことで:**  
決済会社から **同じ「支払い完了」のお知らせが2回来ても、契約を2つ作らない** ための設計を見せるデモです。実際のお金は動きません（ポートフォリオ用）。

**想定読者:** 決済・SaaSのバックエンドを見るクライアント、プロジェクトマネージャ、エンジニア。

---

## 非エンジニア向け

### 解けているビジネス課題

決済サービス（例: Stripe）は、通信の失敗や再送のせいで **同じ「支払い完了」のお知らせを2回送る** ことがあります。

アプリの作りが甘いと:

- 同じプランが二重に始まり、または  
- お客様の契約状態と、実際の入金がずれる  

このサンプルは、**一度処理したお知らせの番号を覚え、同じ番号がまた来たら何もしない** 設計です。  
あわせて **お知らせに署名があること** と、機械向けAPIには鍵が必要なことも入れ、インターネット上で誰でも「支払い完了」をでっち上げられないようにしています。

### 触れる画面

| 画面 | やること | 期待する結果 |
|------|----------|--------------|
| [ホーム](http://localhost:3000) | 短い紹介を読む | ブランド名 **Solidpath**、料金ページへのリンク |
| [料金](http://localhost:3000/pricing) | プランの「申し込み」ボタンを押す | 画面上に成功メッセージ（**カード課金なし**） |

### わざとやっていないこと

- 本物のカード決済や本番用の秘密キー  
- ログインや、複数顧客向けの本格 SaaS 一式  
- 本番用データベース（デモ中のデータはアプリを動かしている間だけ）

### この作品で示したいこと

| 領域 | やさしい言い方 |
|------|----------------|
| 設計の分け方 | 「業務ルール」「決済会社とのやりとり」「画面」が混ざらない |
| 安心できる動き | 同じお知らせ番号は1回だけ反映する |
| アクセス制御 | 通知の署名確認と機械向けAPIキー。画面はサーバ側処理 |
| 決済の流れ（デモ） | 申し込みと「支払い完了」通知が、同じ内部の道を通る |
| 画面 | プラン一覧と成功フィードバック |

パソコン向けの詳細一覧（英語）: [docs/agents/skill-set.md](docs/agents/skill-set.md)。

### クラウドワークスなどへの掲載文案（短文）

評価者向けの平易な言い方です。

- **タイトル例（35文字以内）:** 再送でも契約が二重にならないSaaS課金設計  
- **概要例:** 決済完了の通知が2回来ても契約を1回だけ反映するサーバ設計と、画面と決済処理の切り分けを、デモで示します。実課金はありません。

### 人向けドキュメント（まずここ）

| ガイド | 想定読者 |
|--------|----------|
| [このサンプルについて](docs/ja/about-this-sample.md) | 技術に明るくない方・評価する方 |
| [はじめに](docs/ja/getting-started.md) | 自分のパソコンで動かす方 |
| [docs/ja/](docs/ja/) | 日本語の人向けガイド |
| [docs/en/](docs/en/) | 英語の人向けガイド（別ファイル） |

エージェント（AI）向けのメモは英語のみです: [CONTEXT.md](CONTEXT.md)、[docs/agents/](docs/agents/)、[docs/adr/](docs/adr/)。

---

## エンジニア向け — クイックスタート

```bash
pnpm install
cp .env.example .env
# BILLING_API_KEY と STRIPE_WEBHOOK_SECRET に16文字以上のランダム値を入れる
pnpm dev
# ポート 3000 が使用中なら:
# pnpm dev -- --port 3001
```

| URL | 役割 |
|-----|------|
| http://localhost:3000 | 紹介ページ |
| http://localhost:3000/pricing | プラン選択（Server Action。ブラウザに秘密鍵なし） |
| http://localhost:3000/api/health | 稼働確認（公開でよい） |

**セキュリティ（必須）:**  
- 機械向け `POST /api/subscriptions` は `Authorization: Bearer $BILLING_API_KEY`（または `X-Api-Key`）  
- `POST /api/webhooks/stripe` は `$STRIPE_WEBHOOK_SECRET` による署名が必要  
- 秘密が未設定なら HTTP **503**（開けっ放しにしない）。[ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md)

**契約が始まる経路:**  
画面の Server Action、または認証付き API → モック Checkout → Webhook と **同じ**内部処理。

### デモ: 署名付きお知らせを2回送る

```bash
export STRIPE_WEBHOOK_SECRET='ローカル用の長い秘密'
export BILLING_API_KEY='ローカル用の長いキー'
BODY='{"id":"evt_demo_1","type":"checkout.session.completed","data":{"object":{"id":"sub_1","customer":"cus_1","subscription":"sub_1","metadata":{"planId":"growth"}}}}'
SIG=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG" \
  -d "$BODY"
SIG2=$(node scripts/sign-webhook.mjs "$BODY")
curl -s -X POST http://localhost:3000/api/webhooks/stripe \
  -H 'content-type: application/json' \
  -H "stripe-signature: $SIG2" \
  -d "$BODY"
```

| コマンド | 用途 |
|----------|------|
| `pnpm dev` | ローカル起動 |
| `pnpm build` | 本番向けビルド |
| `pnpm test` | 自動テスト（セキュリティ・業務・HTTP） |
| `pnpm lint` | 静的チェック |

決定記録: [ADR 0001](docs/adr/0001-nextjs-monolith-mock-stripe.md) · [ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md)。
