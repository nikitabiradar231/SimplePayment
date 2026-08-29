const { Horizon } = require('@stellar/stellar-sdk');
const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

const targetHash = "5b864bb8ce0ebcb63c0c6952c47443cfe4a74037ad2f02dad35d37e87ab368f3";

async function checkHash() {
  console.log("=== CHECKING USER HASH ON HORIZON ===");
  try {
    const tx = await horizonServer.transactions().transaction(targetHash).call();
    console.log("✅ FOUND TX ON HORIZON!");
    console.log("Ledger:", tx.ledger_attr);
    console.log("Created at:", tx.created_at);
    console.log("Source Account:", tx.source_account);
    console.log("Fee Paid:", tx.fee_charged);
  } catch (err) {
    console.log("❌ Horizon Error:", err.message || err);
    if (err.response && err.response.data) {
      console.log("Horizon Data:", JSON.stringify(err.response.data));
    }
  }
}

checkHash();
