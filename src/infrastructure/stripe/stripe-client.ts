import type {
  PaymentCheckoutPort,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
} from "@/domain/subscription/ports/payment-checkout-port";

export type MockStripeClientOptions = {
  idGenerator: () => string;
  log?: (message: string, meta?: Record<string, string>) => void;
};

/**
 * Infrastructure adapter: fake Stripe Checkout (implements PaymentCheckoutPort).
 *
 * Emits a stable synthetic eventId so registerSubscription and POST /webhooks/stripe
 * share the same idempotency identity space in demos.
 */
export function createMockStripeClient(
  options: MockStripeClientOptions,
): PaymentCheckoutPort {
  const log = options.log ?? (() => undefined);

  return {
    async createCheckoutSession(
      input: CreateCheckoutSessionInput,
    ): Promise<CreateCheckoutSessionResult> {
      const sessionId = `cs_test_${options.idGenerator()}`;
      const subscriptionId = `sub_test_${options.idGenerator()}`;
      const paymentIntentId = `pi_test_${options.idGenerator()}`;
      const eventId = `evt_test_${options.idGenerator()}`;

      log("mock_stripe.checkout_session_created", {
        sessionId,
        subscriptionId,
        paymentIntentId,
        eventId,
        planId: input.planId,
        customerId: input.customerId,
      });

      return { sessionId, subscriptionId, paymentIntentId, eventId };
    },
  };
}
