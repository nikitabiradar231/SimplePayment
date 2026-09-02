import { sorobanServer, fetchPaymentEvents, DEFAULT_CONTRACT_ID } from "./soroban.js";

/**
 * Event Stream Subscription Manager
 * Handles continuous polling of Soroban contract events, reconnection logic, error handling,
 * deduplication, and cleanup listeners to prevent memory leaks.
 */
export function subscribeToContractEvents(
  contractId = DEFAULT_CONTRACT_ID,
  onEventsUpdate,
  onError,
  options = { intervalMs: 5000 }
) {
  let isSubscribed = true;
  let timerId = null;
  let retryCount = 0;
  const seenEventIds = new Set();

  const poll = async () => {
    if (!isSubscribed) return;

    try {
      const events = await fetchPaymentEvents(contractId);
      if (!isSubscribed) return;

      // Filter out duplicate events
      const newEvents = events.filter((evt) => {
        if (!evt.id || seenEventIds.has(evt.id)) {
          return false;
        }
        seenEventIds.add(evt.id);
        return true;
      });

      if (newEvents.length > 0) {
        onEventsUpdate(events, newEvents);
      } else {
        onEventsUpdate(events, []);
      }

      // Reset retry count on success
      retryCount = 0;
    } catch (err) {
      console.warn("[EventStream] Error polling contract events:", err);
      retryCount++;
      if (onError) {
        onError(err, retryCount);
      }
    } finally {
      if (isSubscribed) {
        // Backoff slightly if error occurred
        const delay = Math.min(options.intervalMs * Math.pow(1.5, retryCount), 15000);
        timerId = setTimeout(poll, delay);
      }
    }
  };

  // Start polling immediately
  poll();

  // Return unsubscribe function to clean up timer and listeners
  return function unsubscribe() {
    isSubscribed = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
}
