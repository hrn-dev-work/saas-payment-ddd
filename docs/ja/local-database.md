# ローカル DB

English: [../en/local-database.md](../en/local-database.md)

## 本サンプル（Solidpath）

| 項目 | 内容 |
|------|------|
| 永続化 | **メモリ内**（プロセス限定）。Docker Postgres は使わない |
| 理由 | ポートフォリオで DDD と Webhook 冪等性に集中するため |
| ADR | [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md) |

`/pricing` や Webhook API を動かすために `docker compose up` は **不要**です。

## 将来リアルな DB を入れる場合

マシン既定は Compose 上の PostgreSQL 16（`db`）です。そのときは新しい ADR と [../agents/stack.md](../agents/stack.md) の更新が必要です。マルチインスタンスの冪等性には、処理済み `event_id` のユニーク制約が必要になります。

エージェント正本: [../agents/stack.md](../agents/stack.md)
