async function checkStellarExpert() {
  console.log("=== CHECKING STELLAR EXPERT EXPLORER DATA ===");
  try {
    const res = await fetch("https://stellar.expert/explorer/testnet/tx/5b864bb8ce0ebcb63c0c6952c47443cfe4a74037ad2f02dad35d37e87ab368f3");
    console.log("Stellar Expert HTTP Status:", res.status);
    const text = await res.text();
    console.log("Response length:", text.length);
    console.log("Contains 'Transaction not found'?:", text.includes("Transaction not found"));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}
checkStellarExpert();
