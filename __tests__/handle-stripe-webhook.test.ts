import { describe, expect, it } from "vitest";
import { createSubscription } from "../src/domain/subscription/entities/subscription";
import type { PaymentCheckoutPort } from "../src/domain/subscription/ports/payment-checkout-port";
import type { ProcessedEventRepository } from "../src/domain/subscription/repositories/processed-event-repository";
import type { SubscriptionRepository } from "../src/domain/subscription/repositories/subscription-repository";
import type { Subscription } from "../src/domain/subscription/entities/subscription";
import type { BillingEvent } from "../src/domain/subscription/events/billing-event";
import { handleStripeWebhook } from "../src/usecase/subscription/handle-stripe-webhook";
import { registerSubscription } from "../src/usecase/subscription/register-subscription";

function createMemorySubscriptions(): SubscriptionRepository {
  const map = new Map<string, Subscription>();
  return {
    async save(s) {
      map.set(s.id, s);
    },
    async findById(id) {
      return map.get(id) ?? null;
    },
    async findByExternalId(externalId) {
      for (const s of map.values()) {
        if (s.externalSubscriptionId === externalId) return s;
      }
      return null;
    },
    async findByCustomerId(customerId) {
      for (const s of map.values()) {
        if (s.customerId === customerId) return s;
      }
      return null;
    },
    async list() {
      return [...map.values()];
    },
  };
}

function createMemoryEvents(): ProcessedEventRepository {
  const ids = new Set<string>();
  return {
    async hasProcessed(id) {
      return ids.has(id);
    },
    async markProcessed(id) {
      ids.add(id);
    },
  };
}

describe("handleStripeWebhook idempotency", () => {
  it("processes once and skips duplicate event ids", async () => {
    const subscriptions = createMemorySubscriptions();
    const processedEvents = createMemoryEvents();
    let n = 0;

    const event: BillingEvent = {
      eventId: "evt_test_1",
      type: "checkout.session.completed",
      customerId: "cus_1",
      externalSubscriptionId: "sub_1",
      planId: "growth",
      status: null,
      occurredAt: new Date("2026-01-01T00:00:00Z"),
    };

    const deps = {
      subscriptions,
      processedEvents,
      idGenerator: () => `id_${++n}`,
      now: () => new Date("2026-01-01T00:00:00Z"),
    };

    const first = await handleStripeWebhook(event, deps);
    const second = await handleStripeWebhook(event, deps);

    expect(first.outcome).toBe("processed");
    expect(second.outcome).toBe("duplicate");
    expect(await subscriptions.list()).toHaveLength(1);
  });

  it("updates existing subscription without creating a second row", async () => {
    const subscriptions = createMemorySubscriptions();
    const processedEvents = createMemoryEvents();

    await subscriptions.save(
      createSubscription({
        id: "local_1",
        customerId: "cus_1",
        planId: "starter",
        status: "active",
        externalSubscriptionId: "sub_1",
      }),
    );

    const event: BillingEvent = {
      eventId: "evt_fail_1",
      type: "invoice.payment_failed",
      customerId: "cus_1",
      externalSubscriptionId: "sub_1",
      planId: null,
      status: null,
      occurredAt: new Date(),
    };

    const result = await handleStripeWebhook(event, {
      subscriptions,
      processedEvents,
      idGenerator: () => "never",
    });

    expect(result.outcome).toBe("processed");
    const list = await subscriptions.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.status).toBe("past_due");
  });

  it("rejects checkout.completed without planId", async () => {
    const result = await handleStripeWebhook(
      {
        eventId: "evt_no_plan",
        type: "checkout.session.completed",
        customerId: "cus_1",
        externalSubscriptionId: "sub_x",
        planId: null,
        status: null,
        occurredAt: new Date(),
      },
      {
        subscriptions: createMemorySubscriptions(),
        processedEvents: createMemoryEvents(),
        idGenerator: () => "id",
      },
    );

    expect(result.outcome).toBe("rejected");
    if (result.outcome === "rejected") {
      expect(result.reason).toMatch(/planId/);
    }
  });

  it("rejects payment_failed when subscription is missing", async () => {
    const result = await handleStripeWebhook(
      {
        eventId: "evt_orphan",
        type: "invoice.payment_failed",
        customerId: "cus_1",
        externalSubscriptionId: "sub_missing",
        planId: null,
        status: null,
        occurredAt: new Date(),
      },
      {
        subscriptions: createMemorySubscriptions(),
        processedEvents: createMemoryEvents(),
        idGenerator: () => "id",
      },
    );

    expect(result.outcome).toBe("rejected");
  });
});

describe("registerSubscription uses webhook path", () => {
  it("activates via handleStripeWebhook and is idempotent on same eventId", async () => {
    const subscriptions = createMemorySubscriptions();
    const processedEvents = createMemoryEvents();
    let n = 0;

    const paymentCheckout: PaymentCheckoutPort = {
      async createCheckoutSession() {
        return {
          sessionId: "cs_1",
          subscriptionId: "sub_reg_1",
          paymentIntentId: "pi_1",
          eventId: "evt_reg_1",
        };
      },
    };

    const deps = {
      subscriptions,
      processedEvents,
      paymentCheckout,
      idGenerator: () => `id_${++n}`,
      now: () => new Date("2026-02-01T00:00:00Z"),
    };

    const registered = await registerSubscription(
      {
        customerId: "cus_reg",
        planId: "growth",
        customerEmail: "a@example.com",
      },
      deps,
    );

    expect(registered.subscription.status).toBe("active");
    expect(registered.eventId).toBe("evt_reg_1");
    expect(await subscriptions.list()).toHaveLength(1);

    const replay = await handleStripeWebhook(
      {
        eventId: "evt_reg_1",
        type: "checkout.session.completed",
        customerId: "cus_reg",
        externalSubscriptionId: "sub_reg_1",
        planId: "growth",
        status: null,
        occurredAt: new Date(),
      },
      {
        subscriptions,
        processedEvents,
        idGenerator: () => "unused",
      },
    );

    expect(replay.outcome).toBe("duplicate");
    expect(await subscriptions.list()).toHaveLength(1);
  });
});
