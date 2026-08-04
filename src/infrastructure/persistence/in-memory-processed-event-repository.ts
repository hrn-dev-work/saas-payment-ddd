import type { ProcessedEventRepository } from "@/domain/subscription/repositories/processed-event-repository";

/**
 * In-memory set of processed Stripe event IDs.
 *
 * Production: unique constraint on `stripe_event_id` (or equivalent) ensures
 * the same guarantee under multi-instance deploys.
 */
type Store = {
  ids: Map<string, Date>;
};

const globalKey = "__saas_payment_ddd_processed_events__";

function getStore(): Store {
  const g = globalThis as typeof globalThis & {
    [globalKey]?: Store;
  };
  if (!g[globalKey]) {
    g[globalKey] = { ids: new Map() };
  }
  return g[globalKey];
}

export function createInMemoryProcessedEventRepository(): ProcessedEventRepository {
  const store = getStore();

  return {
    async hasProcessed(eventId) {
      return store.ids.has(eventId);
    },
    async markProcessed(eventId, processedAt = new Date()) {
      store.ids.set(eventId, processedAt);
    },
  };
}

/** Clears demo store — for unit/API tests only. */
export function resetInMemoryProcessedEventsForTests(): void {
  getStore().ids.clear();
}
