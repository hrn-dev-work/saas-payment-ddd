import { NextResponse } from "next/server";
import { z } from "zod";
import { getContainer } from "@/infrastructure/composition/container";
import { PLAN_IDS } from "@/domain/subscription/value-objects/plan-id";

const bodySchema = z.object({
  planId: z.enum(PLAN_IDS),
  customerEmail: z.string().email().optional(),
});

/**
 * POST /api/subscriptions
 *
 * Pricing "Subscribe": mock checkout then activation via handleStripeWebhook
 * (same code path as POST /api/webhooks/stripe).
 */
export async function POST(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  try {
    const customerId = `cus_demo_${crypto.randomUUID().slice(0, 8)}`;
    const result = await getContainer().registerSubscription({
      customerId,
      planId: parsed.data.planId,
      customerEmail:
        parsed.data.customerEmail ?? "demo@solidpath.example",
    });

    return NextResponse.json(
      {
        status: "subscribed",
        subscriptionId: result.subscription.id,
        planId: result.subscription.planId,
        checkoutSessionId: result.checkoutSessionId,
        mockPaymentIntentId: result.mockPaymentIntentId,
        eventId: result.eventId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[subscriptions] failed", error);
    return NextResponse.json(
      { error: "Failed to register subscription" },
      { status: 500 },
    );
  }
}
