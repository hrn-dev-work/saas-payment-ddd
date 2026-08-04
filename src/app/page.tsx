import Link from "next/link";
import { ArrowRight, Layers, Shield } from "lucide-react";

/**
 * Portfolio entry: brand-first first viewport, single CTA to pricing.
 */
export default function HomePage(): React.ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          Solidpath
        </p>
        <nav className="flex items-center gap-6 text-sm text-[var(--ink-soft)]">
          <Link href="/pricing" className="hover:text-[var(--ink)]">
            Pricing
          </Link>
          <a
            href="/api/health"
            className="hover:text-[var(--ink)]"
          >
            Health
          </a>
        </nav>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-20 pt-8">
        <div
          className="pointer-events-none absolute inset-x-6 top-4 bottom-12 -z-10 overflow-hidden rounded-[14px] border border-[var(--line)]/60 bg-[var(--surface)]/40"
          aria-hidden
        >
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-3xl motion-safe:animate-pulse" />
        </div>

        <p className="mb-4 max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
          Solidpath
        </p>
        <h1 className="max-w-xl text-lg font-medium text-[var(--ink-soft)] sm:text-xl">
          落ちない課金レールのための DDD サンプル
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Webhook の冪等性とドメイン境界の分離を、Stripe
          モック上でそのまま読めるようにしたポートフォリオ実装です。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            プランを見る
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
            <Shield className="size-3.5" aria-hidden />
            Idempotent webhooks
            <Layers className="ml-2 size-3.5" aria-hidden />
            Domain / Usecase / Infra
          </span>
        </div>
      </main>
    </div>
  );
}
