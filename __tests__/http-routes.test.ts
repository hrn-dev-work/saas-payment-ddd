import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as postSubscriptions } from "../src/app/api/subscriptions/route";
import { POST as postWebhook } from "../src/app/api/webhooks/stripe/route";
import { GET as getHealth } from "../src/app/api/health/route";
import { resetContainerForTests } from "../src/infrastructure/composition/container";
import { resetInMemoryProcessedEventsForTests } from "../src/infrastructure/persistence/in-memory-processed-event-repository";
import { resetInMemorySubscriptionsForTests } from "../src/infrastructure/persistence/in-memory-subscription-repository";
import { signStripeCompatiblePayload } from "../src/infrastructure/security/billing-secrets";

const API_KEY = "test-billing-api-key-xx";
const WEBHOOK_SECRET = "test-webhook-secret-xx";

function jsonRequest(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function signedWebhookRequest(body: unknown): Request {
  const raw = JSON.stringify(body);
  const signature = signStripeCompatiblePayload(raw, WEBHOOK_SECRET);
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
    body: raw,
  });
}

const envSnapshot = { ...process.env };

beforeEach(() => {
  process.env.BILLING_API_KEY = API_KEY;
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  resetInMemorySubscriptionsForTests();
  resetInMemoryProcessedEventsForTests();
  resetContainerForTests();
});

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("GET /api/health", () => {
  it("returns ok without secrets", async () => {
    delete process.env.BILLING_API_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await getHealth();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/webhooks/stripe security", () => {
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

  it("returns 401 without signature", async () => {
    const res = await postWebhook(
      jsonRequest("http://localhost/api/webhooks/stripe", checkoutBody),
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 processed when signature is valid", async () => {
    const res = await postWebhook(signedWebhookRequest(checkoutBody));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("processed");
  });

  it("returns 200 already_processed on duplicate event id", async () => {
    await postWebhook(signedWebhookRequest(checkoutBody));
    const res = await postWebhook(signedWebhookRequest(checkoutBody));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("already_processed");
  });

  it("returns 400 for unsupported event type (signed)", async () => {
    const res = await postWebhook(
      signedWebhookRequest({
        id: "evt_bad",
        type: "ping",
        data: { object: { customer: "c", subscription: "s" } },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 422 when update has no matching subscription", async () => {
    const res = await postWebhook(
      signedWebhookRequest({
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
  });

  it("returns 503 when webhook secret is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await postWebhook(signedWebhookRequest(checkoutBody));
    expect(res.status).toBe(503);
  });
});

describe("POST /api/subscriptions security", () => {
  it("returns 401 without API key", async () => {
    const res = await postSubscriptions(
      jsonRequest("http://localhost/api/subscriptions", {
        planId: "starter",
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 201 with Bearer token", async () => {
    const res = await postSubscriptions(
      jsonRequest(
        "http://localhost/api/subscriptions",
        { planId: "starter" },
        { authorization: `Bearer ${API_KEY}` },
      ),
    );
    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid planId when authorized", async () => {
    const res = await postSubscriptions(
      jsonRequest(
        "http://localhost/api/subscriptions",
        { planId: "enterprise" },
        { "x-api-key": API_KEY },
      ),
    );
    expect(res.status).toBe(400);
  });
});
