# ローカルのデータベース

英語版: [../en/local-database.md](../en/local-database.md)

## 本サンプル（Solidpath）

| 項目 | 内容 |
|------|------|
| データの置き場 | **アプリを動かしているプロセスのメモリだけ**（Docker のデータベースは使わない） |
| 理由 | 設計の分け方と「同じお知らせは1回だけ」に集中するため |
| 決定の記録 | [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md) |

料金ページや「支払い完了」通知のAPIを動かすために `docker compose up` は **不要**です。

## 将来本物のデータベースを入れる場合

よく使う既定は Docker Compose 上の PostgreSQL 16（サービス名 `db`）です。そのときは新しい決定記録と [../agents/stack.md](../agents/stack.md) の更新が必要です。複数サーバでも「同じお知らせは1回だけ」にするには、処理済みのお知らせ番号をデータベースで重複しないようにします。

エージェント向けの正本: [../agents/stack.md](../agents/stack.md)
