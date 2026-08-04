import type { PlanId } from "../value-objects/plan-id";

/**
 * Port for starting a provider checkout session.
 *
 * Lives in the domain layer so use cases never import infrastructure adapters.
 * Mock Stripe (and a future stripe-node client) implement this interface.
 */
export type CreateCheckoutSessionInput = {
  customerId: string;
  customerEmail: string;
  planId: PlanId;
};

export type CreateCheckoutSessionResult = {
  sessionId: string;
  subscriptionId: string;
  /** Stable id for the synthetic / real provider event that finalizes activation. */
  eventId: string;
  paymentIntentId: string;
};

export interface PaymentCheckoutPort {
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionResult>;
}
