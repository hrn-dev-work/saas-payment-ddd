# saas-payment-ddd（日本語）

[![日本語](https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-0969da?style=for-the-badge)](./README.md) [![English](https://img.shields.io/badge/English-57606a?style=for-the-badge)](./README.en.md)

**ひとことで:**\
決済会社から **同じ「支払い完了」のお知らせが2回来ても、契約を2つ作らない** ための設計を見せるデモです。実際のお金は動きません（ポートフォリオ用）。

**想定読者:** 決済・SaaSのバックエンドを見るクライアント、プロジェクトマネージャ、エンジニア。

---

## 非エンジニア向け

### 解けているビジネス課題

決済サービス（例: Stripe）は、通信の失敗や再送のせいで **同じ「支払い完了」のお知らせを2回送る** ことがあります。

アプリの作りが甘いと:

- 同じプランが二重に始まり、または\
- お客様の契約状態と、実際の入金がずれる\

このサンプルは、**一度処理したお知らせの番号を覚え、同じ番号がまた来たら何もしない** 設計です。\
あわせて **お知らせに署名があること** と、機械向けAPIには鍵が必要なことも入れ、インターネット上で誰でも「支払い完了」をでっち上げられないようにしています。

### 触れる画面

| 画面 | やること | 期待する結果 |
|------|----------|--------------|
| [ホーム](http://localhost:3000) | 短い紹介を読む | ブランド名 **Solidpath**、料金ページへのリンク |
| [料金](http://localhost:3000/pricing) | プランの「申し込み」ボタンを押す | 画面上に成功メッセージ（**カード課金なし**） |

### わざとやっていないこと

- 本物のカード決済や本番用の秘密キー\
- ログインや、複数顧客向けの本格 SaaS 一式\
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

- **タイトル例（35文字以内）:** 再送でも契約が二重にならないSaaS課金設計\
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

**セキュリティ（必須）:**\
- 機械向け `POST /api/subscriptions` は `Authorization: Bearer $BILLING_API_KEY`（または `X-Api-Key`）\
- `POST /api/webhooks/stripe` は `$STRIPE_WEBHOOK_SECRET` による署名が必要\
- 秘密が未設定なら HTTP **503**（開けっ放しにしない）。[ADR 0002](docs/adr/0002-billing-access-control-and-webhook-signatures.md)

**契約が始まる経路:**\
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

---

## スキルセット

| 領域 | スキル |
|------|--------|
| Backend | Next.js Route Handlers · 実践的 DDD（domain / usecase / infrastructure） |
| API | REST（`/api/subscriptions`, `/api/webhooks/stripe`, `/api/health`）· 認証ゲート後の Zod |
| Access control | 機械向け書き込みの API キー · webhook HMAC · UI は Server Action |
| Data | インメモリ repository（デモ） |
| Integrations | Mock Stripe checkout · 署名検証付き webhook · 同一通知は1回だけ |
| Quality | Vitest（security · parse · HTTP · use cases）· `pnpm lint` · `pnpm build` |
| Local ops | `pnpm dev` · サンプルでは Docker DB なし · `.env.example` のキーのみ · `.cursorignore` |

**対象外:** 本番 Stripe 課金、本格認証/SSO、マルチテナント課金、請求書 PDF。

エージェント向け詳細（英語）: [docs/agents/skill-set.md](docs/agents/skill-set.md)。
