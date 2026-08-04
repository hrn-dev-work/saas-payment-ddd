import { NextResponse } from "next/server";

/**
 * GET /api/health — liveness for local and hosted smoke checks.
 */
export async function GET(): Promise<Response> {
  return NextResponse.json({
    status: "ok",
    service: "saas-payment-ddd",
    mode: "mock-stripe",
  });
}
