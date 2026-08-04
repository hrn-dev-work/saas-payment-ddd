import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/composition/container";
import { parseStripeWebhookPayload } from "@/infrastructure/stripe/parse-webhook";
import { readAndVerifyWebhookRequest } from "@/infrastructure/security/verify-webhook-request";

/**
 * POST /api/webhooks/stripe
 *
 * 1. Verify Stripe-compatible signature (payment-provider trust boundary)
 * 2. Parse + Zod / domain validation
 * 3. Idempotent use case
 */
export async function POST(request: Request): Promise<Response> {
  const verified = await readAndVerifyWebhookRequest(request);
  if (!verified.ok) {
    return verified.response;
  }

  let body: unknown;
  try {
    body = JSON.parse(verified.rawBody) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = parseStripeWebhookPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await getContainer().handleWebhook(parsed.event);

    if (result.outcome === "duplicate") {
      console.info("[webhook] skipped duplicate event", {
        eventId: result.eventId,
      });
      return NextResponse.json(
        {
          status: "already_processed",
          eventId: result.eventId,
        },
        { status: 200 },
      );
    }

    if (result.outcome === "rejected") {
      console.warn("[webhook] rejected", result);
      return NextResponse.json(
        {
          status: "rejected",
          eventId: result.eventId,
          reason: result.reason,
        },
        { status: 422 },
      );
    }

    console.info("[webhook] processed", result);
    return NextResponse.json(
      {
        status: "processed",
        eventId: result.eventId,
        subscriptionId: result.subscriptionId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[webhook] failed", error);
    return NextResponse.json(
      { error: "Internal error while handling webhook" },
      { status: 500 },
    );
  }
}
