import type { PlanId } from "../value-objects/plan-id";
import type { SubscriptionStatus } from "../value-objects/subscription-status";

/**
 * Provider-agnostic billing signal consumed by the application layer.
 * Stripe payloads are translated into this shape in infrastructure.
 */
export type BillingEventType =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed";

export type BillingEvent = {
  readonly eventId: string;
  readonly type: BillingEventType;
  readonly customerId: string;
  readonly externalSubscriptionId: string;
  readonly planId: PlanId | null;
  readonly status: SubscriptionStatus | null;
  readonly occurredAt: Date;
};
