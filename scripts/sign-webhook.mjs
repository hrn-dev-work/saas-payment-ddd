/**
 * Demo helper: print a Stripe-compatible signature for a JSON payload.
 * Usage (WSL):
 *   BILLING… not needed
 *   STRIPE_WEBHOOK_SECRET='your-secret' node scripts/sign-webhook.mjs '{"id":"evt_1",...}'
 */
import { createHmac } from "node:crypto";

const secret = process.env.STRIPE_WEBHOOK_SECRET;
const body = process.argv[2];

if (!secret || secret.length < 16) {
  console.error("Set STRIPE_WEBHOOK_SECRET (≥16 chars)");
  process.exit(1);
}
if (!body) {
  console.error("Pass JSON body as argv[2]");
  process.exit(1);
}

const t = Math.floor(Date.now() / 1000);
const v1 = createHmac("sha256", secret).update(`${t}.${body}`, "utf8").digest("hex");
console.log(`t=${t},v1=${v1}`);
