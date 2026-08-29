const { rpc, StrKey, Contract } = require('@stellar/stellar-sdk');

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');

async function verify() {
  console.log("=== VERIFYING SOROBAN RPC CONTRACT ID STRING FORMAT ===");
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    console.log("Current Ledger:", latestLedger.sequence);

    const events = await sorobanServer.getEvents({
      startLedger: Math.max(1, latestLedger.sequence - 1000),
      pagination: { limit: 10 }
    });

    if (events.events && events.events.length > 0) {
      const firstEvt = events.events[0];
      
      let contractIdStr = "";
      if (typeof firstEvt.contractId === "string") {
        contractIdStr = firstEvt.contractId;
      } else if (firstEvt.contractId && firstEvt.contractId._id) {
        contractIdStr = StrKey.encodeContract(firstEvt.contractId._id);
      } else if (firstEvt.contractId && typeof firstEvt.contractId.contractId === "function") {
        contractIdStr = firstEvt.contractId.contractId();
      }

      console.log("Encoded Contract ID (C...):", contractIdStr);

      if (contractIdStr) {
        const filteredRes = await sorobanServer.getEvents({
          startLedger: Math.max(1, latestLedger.sequence - 2000),
          filters: [{ contractIds: [contractIdStr] }],
          pagination: { limit: 5 }
        });

        console.log("\n✅ SUCCESS! Query with contractIdStr returned events count:", filteredRes.events ? filteredRes.events.length : 0);
        if (filteredRes.events && filteredRes.events.length > 0) {
          console.log("Sample Event Ledger:", filteredRes.events[0].ledger);
          console.log("Sample Event ID:", filteredRes.events[0].id);
        }
      }
    }
  } catch (err) {
    console.error("RPC Error:", err);
  }
}

verify();
