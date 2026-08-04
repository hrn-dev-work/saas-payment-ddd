# このサンプルについて（非エンジニア向け）

English: [../en/about-this-sample.md](../en/about-this-sample.md)

## なぜこの作品があるか

**Stripe 連携・サブスク基盤・API リファクタ**を依頼する側が確認したいのは、だいたい次の2点です。

1. **Webhook の冪等性** — 決済通知が再送されても二重に適用されない  
2. **関心事の分離** — 決済業者の都合がアプリ全体に染み出さない

Solidpath は **ポートフォリオ用のモック** であり、本番の課金サービスそのものではありません。

## 操作から見た流れ（Subscribe を押すと）

```text
/pricing でプランを選ぶ
        ↓
POST /api/subscriptions が呼ばれる
        ↓
モックの「Stripe Checkout」が偽物の ID を返す（カード入力・実課金なし）
        ↓
Stripe Webhook と同じ内部処理で契約を有効化する
        ↓
画面に成功トースト
```

**同じイベント ID** がもう一度届いた場合（README の curl で再現できます）、サーバは **already_processed（処理済み）** と答え、契約を2つ目は作りません。

## 5分で見る評価ポイント

1. 料金ページで Subscribe → 成功メッセージを確認する  
2. 可能ならエンジニアに同じ Webhook 本文を2回送ってもらう  
3. リポジトリの `domain` / `usecase` / `infrastructure` / `app/api` フォルダ構成をざっと見る  

## 安全について

- デモ API に認証はありません。公開ネットへの安易なデプロイはしないでください。  
- 本番 Stripe シークレットは不要・未保管です。

## 技術メモ（短い）

- スタック: [../agents/stack.md](../agents/stack.md)  
- 決定記録: [../adr/0001-nextjs-monolith-mock-stripe.md](../adr/0001-nextjs-monolith-mock-stripe.md)
