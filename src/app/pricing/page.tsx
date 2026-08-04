import Link from "next/link";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export default function PricingPage(): React.ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight"
        >
          Solidpath
        </Link>
        <p className="text-xs text-[var(--muted)] sm:text-sm">
          Mock checkout · no real charges
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <section className="mb-10 max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Subscribe を押すとモック Checkout のあと、本番と同じ Webhook 用ユースケースで契約を有効化します。
            同じ event.id を再送しても二重適用されません。
          </p>
        </section>

        <PricingPlans />

        <section className="mt-16 max-w-2xl border-t border-[var(--line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            アーキテクチャの見せ場
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            <li>
              <code className="text-[var(--accent)]">domain/</code> —
              プラン・サブスク・リポジトリポートのみ
            </li>
            <li>
              <code className="text-[var(--accent)]">usecase/</code> —
              登録と Webhook 冪等適用
            </li>
            <li>
              <code className="text-[var(--accent)]">infrastructure/stripe</code>{" "}
              — モック SDK とペイロード変換
            </li>
            <li>
              <code className="text-[var(--accent)]">
                POST /api/webhooks/stripe
              </code>{" "}
              — 同一 event.id は 200 でスキップ
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
