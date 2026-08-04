import { createInMemoryProcessedEventRepository } from "@/infrastructure/persistence/in-memory-processed-event-repository";
import { createInMemorySubscriptionRepository } from "@/infrastructure/persistence/in-memory-subscription-repository";
import { createMockStripeClient } from "@/infrastructure/stripe/stripe-client";
import { handleStripeWebhook } from "@/usecase/subscription/handle-stripe-webhook";
import { registerSubscription } from "@/usecase/subscription/register-subscription";

/**
 * Composition root: wire ports to concrete adapters once.
 *
 * Controllers (route handlers) only call these facades — they never construct
 * infrastructure directly, so adapter swaps stay localized.
 */
function newId(): string {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}

function buildContainer() {
  const subscriptions = createInMemorySubscriptionRepository();
  const processedEvents = createInMemoryProcessedEventRepository();
  const paymentCheckout = createMockStripeClient({
    idGenerator: newId,
    log: (message, meta) => {
      console.info(`[stripe-mock] ${message}`, meta ?? {});
    },
  });

  return {
    subscriptions,
    processedEvents,
    paymentCheckout,
    registerSubscription: (
      input: Parameters<typeof registerSubscription>[0],
    ) =>
      registerSubscription(input, {
        subscriptions,
        processedEvents,
        paymentCheckout,
        idGenerator: newId,
      }),
    handleWebhook: (event: Parameters<typeof handleStripeWebhook>[0]) =>
      handleStripeWebhook(event, {
        subscriptions,
        processedEvents,
        idGenerator: newId,
      }),
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;

const containerKey = "__saas_payment_ddd_container__";

export function getContainer(): AppContainer {
  const g = globalThis as typeof globalThis & {
    [containerKey]?: AppContainer;
  };
  if (!g[containerKey]) {
    g[containerKey] = buildContainer();
  }
  return g[containerKey];
}

/**
 * Drop container singleton so the next getContainer() rebuilds wiring.
 * Pair with in-memory store resets between HTTP tests.
 */
export function resetContainerForTests(): void {
  const g = globalThis as typeof globalThis & {
    [containerKey]?: AppContainer;
  };
  delete g[containerKey];
}
