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
          デモ用の支払い手続き · 実課金なし
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <section className="mb-10 max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
            料金プラン
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            「申し込み」を押すと、デモ用の支払い手続きのあと、支払い完了のお知らせと同じ内部処理で契約が有効になります。
            同じお知らせ番号がもう一度来ても、契約は二重になりません。
          </p>
        </section>

        <PricingPlans />

        <section className="mt-16 max-w-2xl border-t border-[var(--line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            設計の見せ場
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            <li>
              <code className="text-[var(--accent)]">domain/</code> —
              プランや契約など、業務の言葉だけ
            </li>
            <li>
              <code className="text-[var(--accent)]">usecase/</code> —
              申し込みと「お知らせ1回だけ反映」の流れ
            </li>
            <li>
              <code className="text-[var(--accent)]">infrastructure/stripe</code>{" "}
              — 決済会社のまね（デモ）と通知の取り込み
            </li>
            <li>
              <code className="text-[var(--accent)]">
                POST /api/webhooks/stripe
              </code>{" "}
              — 同じお知らせ番号なら二重処理しない
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
