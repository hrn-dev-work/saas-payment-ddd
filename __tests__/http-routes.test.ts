import { beforeEach, describe, expect, it } from "vitest";
import { POST as postSubscriptions } from "../src/app/api/subscriptions/route";
import { POST as postWebhook } from "../src/app/api/webhooks/stripe/route";
import { GET as getHealth } from "../src/app/api/health/route";
import { resetContainerForTests } from "../src/infrastructure/composition/container";
import { resetInMemoryProcessedEventsForTests } from "../src/infrastructure/persistence/in-memory-processed-event-repository";
import { resetInMemorySubscriptionsForTests } from "../src/infrastructure/persistence/in-memory-subscription-repository";

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetInMemorySubscriptionsForTests();
  resetInMemoryProcessedEventsForTests();
  resetContainerForTests();
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });
});

describe("POST /api/webhooks/stripe", () => {
  const checkoutBody = {
    id: "evt_http_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "sub_http_1",
        customer: "cus_http_1",
        subscription: "sub_http_1",
        metadata: { planId: "growth" },
      },
    },
  };

  it("returns 200 processed for a new event", async () => {
    const res = await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", checkoutBody),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      eventId: string;
    };
    expect(body.status).toBe("processed");
    expect(body.eventId).toBe("evt_http_1");
  });

  it("returns 200 already_processed on duplicate event id", async () => {
    await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", checkoutBody),
    );
    const res = await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", checkoutBody),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("already_processed");
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await postWebhook(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for unsupported event type", async () => {
    const res = await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", {
        id: "evt_bad",
        type: "ping",
        data: { object: { customer: "c", subscription: "s" } },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 422 when update has no matching subscription", async () => {
    const res = await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", {
        id: "evt_orphan",
        type: "invoice.payment_failed",
        data: {
          object: {
            id: "sub_missing",
            customer: "cus_x",
            subscription: "sub_missing",
          },
        },
      }),
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("rejected");
  });
});

describe("POST /api/subscriptions", () => {
  it("returns 201 and activates via webhook path", async () => {
    const res = await postSubscriptions(
      jsonRequest("http://localhost/api/subscriptions", {
        planId: "starter",
      }),
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      status: string;
      planId: string;
      eventId: string;
      subscriptionId: string;
    };
    expect(body.status).toBe("subscribed");
    expect(body.planId).toBe("starter");
    expect(body.eventId.length).toBeGreaterThan(0);
    expect(body.subscriptionId.length).toBeGreaterThan(0);
  });

  it("returns 400 for invalid planId", async () => {
    const res = await postSubscriptions(
      jsonRequest("http://localhost/api/subscriptions", {
        planId: "enterprise",
      }),
    );
    expect(res.status).toBe(400);
  });
});
