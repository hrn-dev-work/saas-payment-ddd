"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import type { PlanId } from "@/domain/subscription/value-objects/plan-id";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  blurb: string;
  features: readonly string[];
  highlighted?: boolean;
};

const PLANS: readonly Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "¥9,800",
    blurb: "ひとつのサービス向けの基本プラン。",
    features: ["同じ完了通知は1回だけ反映", "月ごとの請求", "メールでの問い合わせ"],
  },
  {
    id: "growth",
    name: "Growth",
    priceLabel: "¥29,800",
    blurb: "成長期のサービス向け。責務を分けやすい標準構成。",
    features: ["業務と決済の役割分け", "通知の再送に強い設計", "処理履歴を残せる"],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    priceLabel: "¥79,800",
    blurb: "高単価のSaaSや大規模な作り直し向け。",
    features: ["優先度の高い設計枠", "稼働の見立て支援", "設計レビューの伴走"],
  },
] as const;

type SubscribeResponse = {
  status: string;
  subscriptionId: string;
  planId: PlanId;
  checkoutSessionId: string;
  mockPaymentIntentId: string;
};

/**
 * Pricing grid: pure presentation + thin fetch to mock backend.
 * Domain status never lives in the button handler beyond HTTP orchestration.
 */
export function PricingPlans(): React.ReactElement {
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubscribe(planId: PlanId): void {
    startTransition(async () => {
      setPendingPlan(planId);
      try {
        const response = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        if (!response.ok) {
          const err = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(err?.error ?? "Subscribe failed");
        }

        const data = (await response.json()) as SubscribeResponse;
        console.info("[pricing] mock payment success", data);
        toast.success("デモの申し込みが完了しました", {
          description: `プラン ${data.planId} · 契約番号 ${data.subscriptionId.slice(0, 8)}…`,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "不明なエラー";
        toast.error("申し込みに失敗しました", { description: message });
      } finally {
        setPendingPlan(null);
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={
            plan.highlighted
              ? "relative rounded-[10px] border-[var(--accent)]/40 ring-1 ring-[var(--accent)]/25"
              : "rounded-[10px]"
          }
        >
          {plan.highlighted ? (
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--accent-ink)]">
              <ShieldCheck className="size-3.5" aria-hidden />
              おすすめ
            </div>
          ) : null}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.blurb}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight tabular-nums">
              {plan.priceLabel}
              <span className="ml-1 text-base font-sans text-[var(--muted)]">
                /月
              </span>
            </p>
            <ul className="space-y-2 text-sm text-[var(--ink-soft)]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full rounded-[6px]"
              disabled={isPending}
              onClick={() => onSubscribe(plan.id)}
            >
              {pendingPlan === plan.id ? "処理中…" : "申し込み"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
