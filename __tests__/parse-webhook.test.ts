import { describe, expect, it } from "vitest";
import { parseStripeWebhookPayload } from "../src/infrastructure/stripe/parse-webhook";

describe("parseStripeWebhookPayload", () => {
  it("accepts a valid checkout.session.completed body", () => {
    const result = parseStripeWebhookPayload({
      id: "evt_ok",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_1",
          customer: "cus_1",
          subscription: "sub_1",
          metadata: { planId: "growth" },
        },
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.eventId).toBe("evt_ok");
      expect(result.event.planId).toBe("growth");
      expect(result.event.externalSubscriptionId).toBe("sub_1");
      expect(result.event.customerId).toBe("cus_1");
    }
  });

  it("rejects unknown event type", () => {
    const result = parseStripeWebhookPayload({
      id: "evt_x",
      type: "customer.created",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
        },
      },
    });

    expect(result.ok).toBe(false);
  });

  it("rejects missing customer", () => {
    const result = parseStripeWebhookPayload({
      id: "evt_x",
      type: "checkout.session.completed",
      data: {
        object: {
          subscription: "sub_1",
          metadata: { planId: "starter" },
        },
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/customer|subscription/i);
    }
  });

  it("rejects invalid planId string", () => {
    const result = parseStripeWebhookPayload({
      id: "evt_x",
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_1",
          subscription: "sub_1",
          metadata: { planId: "enterprise" },
        },
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/planId/i);
    }
  });

  it("rejects non-json-shaped body", () => {
    const result = parseStripeWebhookPayload(null);
    expect(result.ok).toBe(false);
  });
});
