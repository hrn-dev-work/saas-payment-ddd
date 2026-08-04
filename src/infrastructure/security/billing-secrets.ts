import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server-only secrets. Never expose via NEXT_PUBLIC_*.
 *
 * Fail closed: missing or too-short secrets mean the app refuses writes / webhooks.
 */
export type BillingSecrets = {
  /** Bearer / X-Api-Key for machine callers of POST /api/subscriptions */
  billingApiKey: string;
  /** HMAC secret for Stripe-compatible webhook signatures */
  stripeWebhookSecret: string;
};

const MIN_SECRET_LEN = 16;

export function loadBillingSecrets(
  env: NodeJS.ProcessEnv = process.env,
):
  | { ok: true; secrets: BillingSecrets }
  | { ok: false; missing: readonly string[] } {
  const billingApiKey = env.BILLING_API_KEY?.trim() ?? "";
  const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  const missing: string[] = [];

  if (billingApiKey.length < MIN_SECRET_LEN) {
    missing.push("BILLING_API_KEY");
  }
  if (stripeWebhookSecret.length < MIN_SECRET_LEN) {
    missing.push("STRIPE_WEBHOOK_SECRET");
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    secrets: { billingApiKey, stripeWebhookSecret },
  };
}

/** Constant-time compare of arbitrary UTF-8 secrets (via SHA-256 prehash). */
export function secretsEqual(left: string, right: string): boolean {
  const a = createHash("sha256").update(left, "utf8").digest();
  const b = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Stripe-compatible signing: header `t=<unix>,v1=<hex hmac>` of `${t}.${rawBody}`.
 * Demo secrets are raw UTF-8 HMAC keys (not Stripe-console whsec decoding).
 */
export function signStripeCompatiblePayload(
  rawBody: string,
  secret: string,
  timestampSec: number = Math.floor(Date.now() / 1000),
): string {
  const signedPayload = `${timestampSec}.${rawBody}`;
  const v1 = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  return `t=${timestampSec},v1=${v1}`;
}

export type VerifySignatureResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Verify Stripe-compatible webhook signatures.
 *
 * Why before JSON parse use-case: only trust bodies the payment provider could sign.
 * Tolerance rejects replay of old signed payloads outside the window.
 */
export function verifyStripeCompatibleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  options?: {
    toleranceSec?: number;
    nowSec?: number;
  },
): VerifySignatureResult {
  if (!signatureHeader) {
    return { ok: false, error: "Missing Stripe-Signature header" };
  }

  const pairs = parseSignatureHeader(signatureHeader);
  const timestamp = pairs.get("t");
  const v1 = pairs.get("v1");
  if (!timestamp || !v1) {
    return { ok: false, error: "Invalid Stripe-Signature format" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, error: "Invalid signature timestamp" };
  }

  const nowSec = options?.nowSec ?? Math.floor(Date.now() / 1000);
  const tolerance = options?.toleranceSec ?? 300;
  if (Math.abs(nowSec - ts) > tolerance) {
    return { ok: false, error: "Signature timestamp outside tolerance" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  if (!hexSecretsEqual(expected, v1)) {
    return { ok: false, error: "Signature mismatch" };
  }

  return { ok: true };
}

function parseSignatureHeader(header: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    // First v1 wins (Stripe may send multiple; one match is enough in full SDK — here require the first to match for simplicity)
    if (!map.has(key)) {
      map.set(key, value);
    }
  }
  return map;
}

function hexSecretsEqual(leftHex: string, rightHex: string): boolean {
  try {
    const a = Buffer.from(leftHex, "hex");
    const b = Buffer.from(rightHex, "hex");
    if (a.length === 0 || a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
