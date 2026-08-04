import { z } from "zod";
import type {
  BillingEvent,
  BillingEventType,
} from "@/domain/subscription/events/billing-event";
import { isPlanId } from "@/domain/subscription/value-objects/plan-id";
import {
  SUBSCRIPTION_STATUSES,
  type SubscriptionStatus,
} from "@/domain/subscription/value-objects/subscription-status";

const BILLING_EVENT_TYPES = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
] as const satisfies readonly BillingEventType[];

/**
 * Stripe Event body subset accepted by the demo webhook.
 * Real deployments verify signature headers first; this sample focuses on
 * idempotency and DDD wiring after a trusted payload.
 */
const stripeEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum(BILLING_EVENT_TYPES),
  created: z.number().optional(),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
});

/**
 * Parse and translate a raw Stripe-like JSON body into a domain BillingEvent.
 *
 * Fails closed on validation errors so route handlers can return HTTP 400
 * without partial writes.
 */
export function parseStripeWebhookPayload(
  raw: unknown,
): { ok: true; event: BillingEvent } | { ok: false; error: string } {
  const parsed = stripeEventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid body",
    };
  }

  const body = parsed.data;
  const obj = body.data.object;

  const customerId = asString(obj.customer) ?? asString(obj.customer_id);
  // Prefer explicit subscription id; fall back to object id for subscription.* events.
  const externalSubscriptionId =
    asString(obj.subscription) ?? asString(obj.id);

  if (!customerId || !externalSubscriptionId) {
    return {
      ok: false,
      error: "Missing customer or subscription identifiers in event data",
    };
  }

  const planRaw =
    asString(obj.plan_id) ??
    readMetadataString(obj.metadata, "planId") ??
    readMetadataString(obj.metadata, "plan_id");

  const planId = planRaw !== null && isPlanId(planRaw) ? planRaw : null;
  if (planRaw !== null && planId === null) {
    return {
      ok: false,
      error: `Invalid planId: ${planRaw}`,
    };
  }

  const statusRaw = asString(obj.status);
  const status =
    statusRaw !== null && isSubscriptionStatus(statusRaw) ? statusRaw : null;

  if (statusRaw !== null && status === null) {
    return {
      ok: false,
      error: `Invalid subscription status: ${statusRaw}`,
    };
  }

  return {
    ok: true,
    event: {
      eventId: body.id,
      type: body.type,
      customerId,
      externalSubscriptionId,
      planId,
      status,
      occurredAt: body.created
        ? new Date(body.created * 1000)
        : new Date(),
    },
  };
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readMetadataString(
  metadata: unknown,
  key: string,
): string | null {
  if (metadata === null || typeof metadata !== "object") {
    return null;
  }
  return asString((metadata as Record<string, unknown>)[key]);
}

function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);
}
