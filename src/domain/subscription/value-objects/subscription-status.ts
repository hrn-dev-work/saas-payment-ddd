/**
 * Lifecycle of a customer subscription after payment provider signals.
 *
 * Mapped from Stripe-like events in the application layer — domain stays provider-agnostic.
 */
export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
