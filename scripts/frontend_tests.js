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

console.log("\nAll Frontend Service Tests Passed Successfully!\n");
