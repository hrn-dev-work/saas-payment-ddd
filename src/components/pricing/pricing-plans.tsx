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
    blurb: "単一プロダクト向けの基本サブスク。",
    features: ["Webhook 冪等ログ", "月次請求", "メールサポート"],
  },
  {
    id: "growth",
    name: "Growth",
    priceLabel: "¥29,800",
    blurb: "複数環境と拡張ポイントを視野に入れた標準構成。",
    features: ["DDD レイヤ分離", "失敗時の再送耐性", "監査向けイベント履歴"],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    priceLabel: "¥79,800",
    blurb: "高単価 SaaS / リプレイス案件向けの堅牢プラン。",
    features: ["優先キュー設計枠", "SLA 診断", "ドメインレビュー伴走"],
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
        toast.success("決済モックが成功しました", {
          description: `${data.planId} · sub ${data.subscriptionId.slice(0, 8)}…`,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error("登録に失敗しました", { description: message });
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
              Recommended
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
              {pendingPlan === plan.id ? "Processing…" : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
