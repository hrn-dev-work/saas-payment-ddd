import { afterEach, describe, expect, it } from "vitest";
import {
  loadBillingSecrets,
  signStripeCompatiblePayload,
  verifyStripeCompatibleSignature,
} from "../src/infrastructure/security/billing-secrets";

describe("billing secrets loader", () => {
  const api = process.env.BILLING_API_KEY;
  const wh = process.env.STRIPE_WEBHOOK_SECRET;

  afterEach(() => {
    if (api === undefined) delete process.env.BILLING_API_KEY;
    else process.env.BILLING_API_KEY = api;
    if (wh === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = wh;
  });

  it("fails closed when secrets are missing", () => {
    delete process.env.BILLING_API_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const result = loadBillingSecrets(process.env);
    expect(result.ok).toBe(false);
  });

  it("loads when both secrets meet minimum length", () => {
    process.env.BILLING_API_KEY = "billing-key-16chars";
    process.env.STRIPE_WEBHOOK_SECRET = "webhook-secret-16";
    const result = loadBillingSecrets(process.env);
    expect(result.ok).toBe(true);
  });
});

describe("stripe-compatible signatures", () => {
  const secret = "webhook-secret-16";
  const body = '{"id":"evt_1"}';

  it("accepts a valid signature", () => {
    const header = signStripeCompatiblePayload(body, secret, 1_700_000_000);
    const result = verifyStripeCompatibleSignature(body, header, secret, {
      nowSec: 1_700_000_000,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects tampered body", () => {
    const header = signStripeCompatiblePayload(body, secret, 1_700_000_000);
    const result = verifyStripeCompatibleSignature(
      '{"id":"evt_2"}',
      header,
      secret,
      { nowSec: 1_700_000_000 },
    );
    expect(result.ok).toBe(false);
  });

  it("rejects missing header", () => {
    const result = verifyStripeCompatibleSignature(body, null, secret);
    expect(result.ok).toBe(false);
  });
});
