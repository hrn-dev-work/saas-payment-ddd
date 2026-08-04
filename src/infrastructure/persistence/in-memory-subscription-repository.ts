import type { Subscription } from "@/domain/subscription/entities/subscription";
import type { SubscriptionRepository } from "@/domain/subscription/repositories/subscription-repository";

/**
 * Process-local subscription store for demos (no Docker DB).
 * Survives Next.js hot reload via globalThis (dev convenience).
 */
type Store = {
  byId: Map<string, Subscription>;
};

const globalKey = "__saas_payment_ddd_subscriptions__";

function getStore(): Store {
  const g = globalThis as typeof globalThis & {
    [globalKey]?: Store;
  };
  if (!g[globalKey]) {
    g[globalKey] = { byId: new Map() };
  }
  return g[globalKey];
}

export function createInMemorySubscriptionRepository(): SubscriptionRepository {
  const store = getStore();

  return {
    async save(subscription) {
      store.byId.set(subscription.id, subscription);
    },
    async findById(id) {
      return store.byId.get(id) ?? null;
    },
    async findByExternalId(externalSubscriptionId) {
      for (const sub of store.byId.values()) {
        if (sub.externalSubscriptionId === externalSubscriptionId) {
          return sub;
        }
      }
      return null;
    },
    async findByCustomerId(customerId) {
      for (const sub of store.byId.values()) {
        if (sub.customerId === customerId) {
          return sub;
        }
      }
      return null;
    },
    async list() {
      return [...store.byId.values()];
    },
  };
}

/** Clears demo store — for unit/API tests only. */
export function resetInMemorySubscriptionsForTests(): void {
  getStore().byId.clear();
}
