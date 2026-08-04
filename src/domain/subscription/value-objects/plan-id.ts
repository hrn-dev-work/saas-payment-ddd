/**
 * Plan identifiers offered by the product.
 *
 * Why a branded string union instead of free-form string:
 * subscription changes must only reference marketed SKUs; invalid plans fail at the boundary.
 */
export const PLAN_IDS = ["starter", "growth", "scale"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}
