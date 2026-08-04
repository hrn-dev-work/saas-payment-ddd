# はじめに

English: [../en/getting-started.md](../en/getting-started.md)

**非エンジニアの方:** ビジネス説明だけなら先に [about-this-sample.md](./about-this-sample.md) を読んでください。

## デモの起動

必要: Node.js 20+、pnpm（WSL / Linux / macOS を推奨）。

```bash
cd /path/to/saas-payment-ddd
pnpm install
pnpm dev
```

ポート **3000** が埋まっている場合:

```bash
pnpm dev -- --port 3001
```

開く URL:

- http://localhost:3000（または `:3001`）— ホーム  
- http://localhost:3000/pricing — Subscribe  

成功トーストが出れば OK です。カード課金は発生しません。

## エンジニアがよく通す確認

```bash
pnpm test   # ユースケース + parse + HTTP ステータス
pnpm lint
pnpm build
```

## データベース

本サンプルは **Docker の Postgres を使いません。** データはプロセス内のメモリです。  
詳細: [local-database.md](./local-database.md)。

## ドキュメントの言語

- 人間: `docs/en/` と `docs/ja/`  
- エージェント: `CONTEXT.md`、`docs/agents/`、`docs/adr/` は英語のみ
