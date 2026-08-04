"use server";

import { getContainer } from "@/infrastructure/composition/container";
import { loadBillingSecrets } from "@/infrastructure/security/billing-secrets";
import { PLAN_IDS, type PlanId } from "@/domain/subscription/value-objects/plan-id";

export type SubscribeActionResult =
  | {
      ok: true;
      subscriptionId: string;
      planId: PlanId;
      checkoutSessionId: string;
      mockPaymentIntentId: string;
      eventId: string;
    }
  | { ok: false; error: string };

/**
 * Browser entry: runs on the server so BILLING_API_KEY never reaches the client.
 * Still requires secrets configured (fail closed) so misconfigured deploys cannot silently open payments.
 */
export async function subscribeToPlanAction(
  planId: string,
): Promise<SubscribeActionResult> {
  const secrets = loadBillingSecrets();
  if (!secrets.ok) {
    return {
      ok: false,
      error: "Server misconfigured: billing secrets are not set",
    };
  }

  if (!(PLAN_IDS as readonly string[]).includes(planId)) {
    return { ok: false, error: "Invalid plan" };
  }

  try {
    const customerId = `cus_demo_${crypto.randomUUID().slice(0, 8)}`;
    const result = await getContainer().registerSubscription({
      customerId,
      planId: planId as PlanId,
      customerEmail: "demo@solidpath.example",
    });

    return {
      ok: true,
      subscriptionId: result.subscription.id,
      planId: result.subscription.planId,
      checkoutSessionId: result.checkoutSessionId,
      mockPaymentIntentId: result.mockPaymentIntentId,
      eventId: result.eventId,
    };
  } catch (error) {
    console.error("[subscribeToPlanAction] failed", error);
    return { ok: false, error: "Failed to register subscription" };
  }
}
