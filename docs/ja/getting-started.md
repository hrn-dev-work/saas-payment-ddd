# はじめに

英語版: [../en/getting-started.md](../en/getting-started.md)

**ビジネスの説明だけ知りたい方:** 先に [about-this-sample.md](./about-this-sample.md) を読んでください。

## デモの起動

必要なもの: Node.js 20 以上、pnpm。Linux / macOS / WSL を推奨します。

```bash
cd /path/to/saas-payment-ddd
pnpm install
cp .env.example .env
# BILLING_API_KEY と STRIPE_WEBHOOK_SECRET に16文字以上を設定
pnpm dev
```

ポート **3000** がほかで使われている場合:

```bash
pnpm dev -- --port 3001
```

開く場所:

- http://localhost:3000（または `:3001`）— ホーム  
- http://localhost:3000/pricing — プラン選択  

画面に成功メッセージが出れば大丈夫です。カード課金は発生しません。

## エンジニアがよく通す確認

```bash
pnpm test   # 自動テスト
pnpm lint
pnpm build
```

## データベース

本サンプルは **Docker 上のデータベースを使いません。** データはアプリを動かしている間だけメモリにあります。  
詳細: [local-database.md](./local-database.md)。

## ドキュメントの分け方

- 人向け: このフォルダ（`docs/ja/`）と英語（`docs/en/`）— 1ファイル1言語  
- AI・エージェント向け: `CONTEXT.md`、`docs/agents/`、`docs/adr/` — 英語のみ
