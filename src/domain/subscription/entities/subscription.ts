import type { PlanId } from "../value-objects/plan-id";
import type { SubscriptionStatus } from "../value-objects/subscription-status";

/**
 * Subscription aggregate root (minimal for the demo).
 *
 * Design choice: keep money/customer identity as value fields, not nested entities,
 * so the portfolio sample emphasizes boundaries (domain vs Stripe) over enterprise fullness.
 */
export type Subscription = {
  readonly id: string;
  readonly customerId: string;
  readonly planId: PlanId;
  readonly status: SubscriptionStatus;
  readonly externalSubscriptionId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type CreateSubscriptionInput = {
  id: string;
  customerId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  externalSubscriptionId?: string | null;
  now?: Date;
};

/**
 * Factory for a new Subscription in a valid initial state.
 */
export function createSubscription(
  input: CreateSubscriptionInput,
): Subscription {
  const now = input.now ?? new Date();
  return {
    id: input.id,
    customerId: input.customerId,
    planId: input.planId,
    status: input.status,
    externalSubscriptionId: input.externalSubscriptionId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Apply a status transition after a verified billing event.
 */
export function withStatus(
  subscription: Subscription,
  status: SubscriptionStatus,
  now: Date = new Date(),
): Subscription {
  return {
    ...subscription,
    status,
    updatedAt: now,
  };
}

/**
 * Change plan without altering status (e.g. mid-cycle upgrade via provider event).
 */
export function withPlan(
  subscription: Subscription,
  planId: PlanId,
  now: Date = new Date(),
): Subscription {
  return {
    ...subscription,
    planId,
    updatedAt: now,
  };
}
