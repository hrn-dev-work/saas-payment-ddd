import type { Subscription } from "@/domain/subscription/entities/subscription";
import type { PaymentCheckoutPort } from "@/domain/subscription/ports/payment-checkout-port";
import type { ProcessedEventRepository } from "@/domain/subscription/repositories/processed-event-repository";
import type { SubscriptionRepository } from "@/domain/subscription/repositories/subscription-repository";
import type { PlanId } from "@/domain/subscription/value-objects/plan-id";
import {
  handleStripeWebhook,
  type WebhookHandleResult,
} from "@/usecase/subscription/handle-stripe-webhook";

export type RegisterSubscriptionInput = {
  customerId: string;
  planId: PlanId;
  customerEmail: string;
};

export type RegisterSubscriptionResult = {
  subscription: Subscription;
  checkoutSessionId: string;
  mockPaymentIntentId: string;
  eventId: string;
  webhook: Extract<WebhookHandleResult, { outcome: "processed" }>;
};

export type RegisterSubscriptionDeps = {
  subscriptions: SubscriptionRepository;
  processedEvents: ProcessedEventRepository;
  paymentCheckout: PaymentCheckoutPort;
  idGenerator: () => string;
  now?: () => Date;
};

/**
 * Pricing CTA → mock provider checkout → apply the same use case as the Stripe webhook.
 *
 * Why one path: production activation is webhook-driven. The demo must exercise
 * idempotent subscription writes there, not a second "save as active" shortcut.
 * Replaying the same synthetic eventId is a no-op (duplicate), matching Stripe retries.
 */
export async function registerSubscription(
  input: RegisterSubscriptionInput,
  deps: RegisterSubscriptionDeps,
): Promise<RegisterSubscriptionResult> {
  const now = deps.now ?? (() => new Date());

  const session = await deps.paymentCheckout.createCheckoutSession({
    customerEmail: input.customerEmail,
    planId: input.planId,
    customerId: input.customerId,
  });

  const webhookResult = await handleStripeWebhook(
    {
      eventId: session.eventId,
      type: "checkout.session.completed",
      customerId: input.customerId,
      externalSubscriptionId: session.subscriptionId,
      planId: input.planId,
      status: null,
      occurredAt: now(),
    },
    {
      subscriptions: deps.subscriptions,
      processedEvents: deps.processedEvents,
      idGenerator: deps.idGenerator,
      now,
    },
  );

  if (webhookResult.outcome === "rejected") {
    throw new Error(webhookResult.reason);
  }

  if (webhookResult.outcome === "duplicate") {
    throw new Error(
      `Unexpected duplicate event during register: ${webhookResult.eventId}`,
    );
  }

  const subscription = await deps.subscriptions.findById(
    webhookResult.subscriptionId,
  );
  if (!subscription) {
    throw new Error("Subscription missing after webhook processing");
  }

  return {
    subscription,
    checkoutSessionId: session.sessionId,
    mockPaymentIntentId: session.paymentIntentId,
    eventId: session.eventId,
    webhook: webhookResult,
  };
}
