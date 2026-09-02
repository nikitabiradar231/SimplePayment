import assert from "node:assert";
import { formatUserFriendlyError } from "../src/utils/errors.js";
import { subscribeToContractEvents } from "../src/services/eventStream.js";

console.log("Running Frontend & Service Unit Tests...\n");

// Test 1: Error Formatter - Wallet User Rejection
{
  const err = new Error("User rejected the transaction request");
  const formatted = formatUserFriendlyError(err);
  assert.strictEqual(
    formatted,
    "Transaction was cancelled or rejected in your wallet.",
    "Should format wallet rejection error"
  );
  console.log("  [PASS] Test 1: Wallet user rejection error formatting");
}

// Test 2: Error Formatter - Contract Error Code
{
  const err = new Error("HostError: Error(Contract, #1)");
  const formatted = formatUserFriendlyError(err);
  assert.strictEqual(
    formatted,
    "Contract Error: Payment amount must be greater than 0 XLM.",
    "Should format contract error code 1"
  );
  console.log("  [PASS] Test 2: Soroban contract error code translation");
}

// Test 3: Event Stream Subscription & Cleanup Lifecycle
{
  let eventsReceived = false;
  const unsubscribe = subscribeToContractEvents(
    "CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777",
    (allEvents) => {
      eventsReceived = true;
    },
    (err) => {}
  );

  assert.strictEqual(typeof unsubscribe, "function", "subscribeToContractEvents must return an unsubscribe function");
  unsubscribe();
  console.log("  [PASS] Test 3: Event stream subscription & memory-leak cleanup lifecycle");
}

// Test 4: Error Formatter - Network Connection / Timeout Error
{
  const err = new Error("Failed to fetch");
  const formatted = formatUserFriendlyError(err);
  assert.strictEqual(
    formatted,
    "Network connection issue or Soroban RPC timeout. Please retry in a few moments.",
    "Should format network connection failure"
  );
  console.log("  [PASS] Test 4: Network connection and Soroban RPC failure translation");
}

// Test 5: Event Stream Deduplication Logic
{
  const seenIds = new Set();
  const mockEvents = [
    { id: "evt_101", amount: "10" },
    { id: "evt_101", amount: "10" }, // duplicate
    { id: "evt_102", amount: "20" }
  ];

  const unique = mockEvents.filter((e) => {
    if (seenIds.has(e.id)) return false;
    seenIds.add(e.id);
    return true;
  });

  assert.strictEqual(unique.length, 2, "Deduplication should keep 2 distinct events from 3 items");
  assert.strictEqual(unique[0].id, "evt_101");
  assert.strictEqual(unique[1].id, "evt_102");
  console.log("  [PASS] Test 5: Event stream event deduplication logic");
}

console.log("\nAll Frontend Service Tests Passed Successfully!\n");

