import type { BillingEvent } from "@/domain/subscription/events/billing-event";
import type { ProcessedEventRepository } from "@/domain/subscription/repositories/processed-event-repository";
import type { SubscriptionRepository } from "@/domain/subscription/repositories/subscription-repository";
import {
  createSubscription,
  withPlan,
  withStatus,
} from "@/domain/subscription/entities/subscription";
import type { PlanId } from "@/domain/subscription/value-objects/plan-id";
import type { SubscriptionStatus } from "@/domain/subscription/value-objects/subscription-status";

export type WebhookHandleResult =
  | { outcome: "duplicate"; eventId: string }
  | { outcome: "rejected"; eventId: string; reason: string }
  | { outcome: "processed"; eventId: string; subscriptionId: string };

export type HandleStripeWebhookDeps = {
  processedEvents: ProcessedEventRepository;
  subscriptions: SubscriptionRepository;
  idGenerator: () => string;
  now?: () => Date;
};

/**
 * Apply a verified billing event with strict idempotency.
 *
 * Why this order:
 * 1. Look up eventId — if already processed, return without side effects
 *    (Stripe retries on non-2xx; callers map duplicate/processed to HTTP 200).
 * 2. Mutate domain state only after the uniqueness gate.
 * 3. markProcessed only after successful persist — crashes mid-way leave the event
 *    reprocessable (preferred to "silent skip after partial write").
 *
 * Fail-closed rules:
 * - New subscription from checkout requires an explicit planId (no silent default).
 * - Update / fail / cancel events require an existing subscription by external id.
 */
export async function handleStripeWebhook(
  event: BillingEvent,
  deps: HandleStripeWebhookDeps,
): Promise<WebhookHandleResult> {
  const now = deps.now ?? (() => new Date());

  if (await deps.processedEvents.hasProcessed(event.eventId)) {
    return { outcome: "duplicate", eventId: event.eventId };
  }

  const status = statusForEvent(event);
  const existing = await deps.subscriptions.findByExternalId(
    event.externalSubscriptionId,
  );

  if (event.type === "checkout.session.completed") {
    return applyCheckoutCompleted(event, existing, status, deps, now);
  }

  if (!existing) {
    // Do not mark processed: publisher may resend after we store the missing sub later.
    return {
      outcome: "rejected",
      eventId: event.eventId,
      reason: `No subscription for external id ${event.externalSubscriptionId}`,
    };
  }

  let next = withStatus(existing, status, now());
  if (event.planId !== null) {
    next = withPlan(next, event.planId, now());
  }
  await deps.subscriptions.save(next);
  await deps.processedEvents.markProcessed(event.eventId, now());

  return {
    outcome: "processed",
    eventId: event.eventId,
    subscriptionId: next.id,
  };
}

async function applyCheckoutCompleted(
  event: BillingEvent,
  existing: Awaited<
    ReturnType<SubscriptionRepository["findByExternalId"]>
  >,
  status: SubscriptionStatus,
  deps: HandleStripeWebhookDeps,
  now: () => Date,
): Promise<WebhookHandleResult> {
  if (event.planId === null) {
    return {
      outcome: "rejected",
      eventId: event.eventId,
      reason: "checkout.session.completed requires planId",
    };
  }

  const planId: PlanId = event.planId;

  if (existing) {
    let next = withStatus(existing, status, now());
    next = withPlan(next, planId, now());
    await deps.subscriptions.save(next);
    await deps.processedEvents.markProcessed(event.eventId, now());
    return {
      outcome: "processed",
      eventId: event.eventId,
      subscriptionId: next.id,
    };
  }

  const created = createSubscription({
    id: deps.idGenerator(),
    customerId: event.customerId,
    planId,
    status,
    externalSubscriptionId: event.externalSubscriptionId,
    now: now(),
  });
  await deps.subscriptions.save(created);
  await deps.processedEvents.markProcessed(event.eventId, now());

  return {
    outcome: "processed",
    eventId: event.eventId,
    subscriptionId: created.id,
  };
}

/**
 * Maps a closed BillingEventType set to a domain status.
 * Exhaustive: TypeScript errors if a new event type is added without a branch.
 */
function statusForEvent(event: BillingEvent): SubscriptionStatus {
  switch (event.type) {
    case "checkout.session.completed":
      return "active";
    case "customer.subscription.updated":
      return event.status ?? "active";
    case "customer.subscription.deleted":
      return "canceled";
    case "invoice.payment_failed":
      return "past_due";
    default: {
      const _exhaustive: never = event.type;
      return _exhaustive;
    }
  }
}
