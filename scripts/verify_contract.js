import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  Contract,
  Horizon,
  Address,
  Account,
  scValToNative,
} from "@stellar/stellar-sdk";

const DEFAULT_CONTRACT_ID =
  process.env.VITE_SOROBAN_CONTRACT_ID ||
  "CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777";
const VERIFIED_CALL_TX =
  "f60c716c280d43fe60a7fd0dd2de7b90bc27544d42ddc9b9945fe4eef191c629";
const SOROBAN_RPC_URL =
  process.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const HORIZON_URL =
  process.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";

async function runVerification() {
  console.log("=================================================");
  console.log("   STELLAR SOROBAN CONTRACT LEVEL 2 VERIFIER     ");
  console.log("=================================================\n");

  const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL);
  const horizonServer = new Horizon.Server(HORIZON_URL);

  // 1. Verify RPC Connectivity & Latest Ledger
  console.log("[1/5] Checking Soroban RPC Endpoint Connectivity...");
  try {
    const health = await sorobanServer.getHealth();
    console.log(`  ✓ Soroban RPC Health: ${health.status}`);
    const latestLedger = await sorobanServer.getLatestLedger();
    console.log(`  ✓ Latest Testnet Ledger Sequence: ${latestLedger.sequence}`);
  } catch (err) {
    console.error("  ❌ Soroban RPC connectivity failed:", err.message);
    process.exit(1);
  }

  // 2. Verify Contract ID & Format
  console.log("\n[2/5] Validating Target Smart Contract Address...");
  console.log(`  Target Contract ID: ${DEFAULT_CONTRACT_ID}`);
  if (
    typeof DEFAULT_CONTRACT_ID !== "string" ||
    DEFAULT_CONTRACT_ID.length !== 56 ||
    !DEFAULT_CONTRACT_ID.startsWith("C")
  ) {
    console.error("  ❌ Invalid Soroban Contract ID format!");
    process.exit(1);
  }
  console.log("  ✓ Valid 56-character Soroban Contract C... StrKey format.");

  // 3. Verify Read-Only Contract Method (get_payment_count) via RPC Simulation
  console.log(
    "\n[3/5] Simulating Read-Only Contract Method `get_payment_count`..."
  );
  try {
    const contract = new Contract(DEFAULT_CONTRACT_ID);
    const callOp = contract.call("get_payment_count");

    const dummyAccount = new Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );

    const rawTx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(callOp)
      .setTimeout(30)
      .build();

    const simRes = await sorobanServer.simulateTransaction(rawTx);

    if (
      SorobanRpc.Api.isSimulationSuccess(simRes) &&
      simRes.result &&
      simRes.result.retval
    ) {
      const liveCount = scValToNative(simRes.result.retval);
      console.log(`  ✓ Live On-Chain Contract Payment Count: ${liveCount}`);
    } else {
      console.error(
        "  ❌ Simulation failed or returned unexpected result:",
        simRes
      );
      process.exit(1);
    }
  } catch (err) {
    console.error("  ❌ `get_payment_count` RPC simulation error:", err.message);
    process.exit(1);
  }

  // 4. Verify Soroban Contract Events RPC Query
  console.log("\n[4/5] Polling On-Chain Soroban Event Subscriptions...");
  try {
    const latestLedgerRes = await sorobanServer.getLatestLedger();
    const currentLedger = latestLedgerRes.sequence;
    const startLedger = Math.max(1, currentLedger - 10000);

    const eventFilter = {
      startLedger,
      filters: [{ contractIds: [DEFAULT_CONTRACT_ID] }],
      pagination: { limit: 10 },
    };

    const eventRes = await sorobanServer.getEvents(eventFilter);
    console.log(
      `  ✓ Query succeeded. Filtered Events Returned: ${
        eventRes && eventRes.events ? eventRes.events.length : 0
      }`
    );
  } catch (err) {
    console.error("  ❌ Soroban event query failed:", err.message);
    process.exit(1);
  }

  // 5. Verify Verified Contract-Call Tx Hash on Horizon
  console.log(
    "\n[5/5] Checking Verified Contract-Call Transaction Hash on Horizon..."
  );
  console.log(`  Tx Hash: ${VERIFIED_CALL_TX}`);
  try {
    const txData = await horizonServer
      .transactions()
      .transaction(VERIFIED_CALL_TX)
      .call();
    console.log(`  ✓ Transaction Status: ${txData.successful ? "SUCCESS" : "FAILED"}`);
    console.log(`  ✓ Recorded Ledger: ${txData.ledger_attr || txData.ledger}`);
    console.log(`  ✓ Timestamp: ${txData.created_at}`);
  } catch (err) {
    console.error("  ❌ Horizon transaction query failed:", err.message);
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log("  ✅ ALL LEVEL 2 SOROBAN VERIFICATIONS PASSED!  ");
  console.log("=================================================\n");
}

runVerification().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
