import { NextResponse } from "next/server";
import {
  loadBillingSecrets,
  verifyStripeCompatibleSignature,
} from "@/infrastructure/security/billing-secrets";

/**
 * Read raw body + verify payment-provider signature before trusting JSON.
 * Caller must use the returned rawBody for JSON.parse (body stream is consumed once).
 */
export async function readAndVerifyWebhookRequest(
  request: Request,
): Promise<
  | { ok: true; rawBody: string }
  | { ok: false; response: Response }
> {
  const loaded = loadBillingSecrets();
  if (!loaded.ok) {
    console.error("[webhook-auth] missing secrets", loaded.missing);
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Server misconfigured: billing secrets are not set",
          missing: loaded.missing,
        },
        { status: 503 },
      ),
    };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unable to read request body" },
        { status: 400 },
      ),
    };
  }

  if (rawBody.length === 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Empty request body" },
        { status: 400 },
      ),
    };
  }

  const signature = request.headers.get("stripe-signature");
  const verified = verifyStripeCompatibleSignature(
    rawBody,
    signature,
    loaded.secrets.stripeWebhookSecret,
  );

  if (!verified.ok) {
    console.warn("[webhook-auth] rejected", verified.error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      ),
    };
  }

  return { ok: true, rawBody };
}
