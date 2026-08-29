const { rpc, StrKey } = require('@stellar/stellar-sdk');

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');

async function main() {
  console.log("=== EXTRACTING REAL SOROBAN CONTRACT IDS ON TESTNET ===");
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    console.log("Current Testnet Ledger:", latestLedger.sequence);
    
    const eventsRes = await sorobanServer.getEvents({
      startLedger: Math.max(1, latestLedger.sequence - 5000),
      pagination: { limit: 10 }
    });
    
    if (eventsRes.events && eventsRes.events.length > 0) {
      const contractIds = new Set();
      eventsRes.events.forEach((evt) => {
        if (evt.contractId) {
          let str = "";
          if (typeof evt.contractId === "string") {
            str = evt.contractId;
          } else if (evt.contractId.contractId) {
            str = StrKey.encodeContract(evt.contractId.contractId());
          } else if (evt.contractId._id) {
            str = StrKey.encodeContract(evt.contractId._id);
          }
          if (str) contractIds.add(str);
        }
      });

      console.log("\nFOUND REAL ACTIVE SOROBAN CONTRACT ADDRESSES (C...):");
      contractIds.forEach((c) => console.log("->", c));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
