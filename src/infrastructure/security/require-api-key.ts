import { NextResponse } from "next/server";
import {
  loadBillingSecrets,
  secretsEqual,
} from "@/infrastructure/security/billing-secrets";

/**
 * Require machine credentials for writable HTTP APIs.
 * Returns a Response to send, or null if authorized.
 */
export function unauthorizedIfMissingApiKey(
  request: Request,
): Response | null {
  const loaded = loadBillingSecrets();
  if (!loaded.ok) {
    console.error("[auth] missing secrets", loaded.missing);
    return NextResponse.json(
      {
        error: "Server misconfigured: billing secrets are not set",
        missing: loaded.missing,
      },
      { status: 503 },
    );
  }

  const presented = extractApiKey(request);
  if (
    presented === null ||
    !secretsEqual(presented, loaded.secrets.billingApiKey)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function extractApiKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice("bearer ".length).trim();
    return token.length > 0 ? token : null;
  }
  const headerKey = request.headers.get("x-api-key")?.trim();
  return headerKey && headerKey.length > 0 ? headerKey : null;
}
