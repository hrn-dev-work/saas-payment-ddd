import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/composition/container";
import { parseStripeWebhookPayload } from "@/infrastructure/stripe/parse-webhook";

/**
 * POST /api/webhooks/stripe
 *
 * Controller role only: parse HTTP → call use case → map result to status codes.
 * Business rules and idempotency live in `handleStripeWebhook`.
 *
 * Status mapping (Stripe retry semantics):
 * - 200: processed or duplicate — do not retry
 * - 400: invalid payload — do not retry
 * - 422: domain rejected (e.g. missing subscription) — fix data; demo does not auto-retry as 500
 * - 500: unexpected failure — Stripe should retry
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
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
