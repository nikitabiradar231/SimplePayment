const { rpc, Horizon, Contract, Keypair } = require('@stellar/stellar-sdk');

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');
const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

async function main() {
  console.log("Checking Soroban RPC connection...");
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    console.log("Soroban RPC Latest Ledger:", latestLedger.sequence);
    
    // Query recent contract events on Testnet
    const events = await sorobanServer.getEvents({
      startLedger: latestLedger.sequence - 1000,
      pagination: { limit: 10 }
    });
    
    console.log("Found Soroban Events Count:", events.events ? events.events.length : 0);
    if (events.events && events.events.length > 0) {
      console.log("Sample Event Contract ID:", events.events[0].contractId);
      console.log("Sample Event Ledger:", events.events[0].ledger);
    }
  } catch (err) {
    console.error("Soroban RPC error:", err.message);
  }
}

main();
