import type { Subscription } from "../entities/subscription";

/**
 * Port for subscription persistence.
 *
 * Infrastructure (in-memory, Postgres, etc.) implements this interface —
 * use cases never import concrete stores. That separation is what clients buy when specs change.
 */
export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(id: string): Promise<Subscription | null>;
  findByExternalId(
    externalSubscriptionId: string,
  ): Promise<Subscription | null>;
  findByCustomerId(customerId: string): Promise<Subscription | null>;
  list(): Promise<readonly Subscription[]>;
}
