/**
 * Port for webhook idempotency storage.
 *
 * Why a dedicated repository (not a flag on Subscription):
 * Stripe may deliver the same event.id multiple times (timeouts, network). Recording
 * processed provider event IDs at the integration boundary guarantees "exactly once"
 * side effects even when business entities would not change on a replay.
 */
export interface ProcessedEventRepository {
  hasProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string, processedAt?: Date): Promise<void>;
}
