const hash = "b837e14f4d6919eea3d74cea3eea8fa80684640610e6bb93b464fc1d8f963ddc";

async function testExplorers() {
  console.log("=== TESTING ALL EXPLORER ENDPOINTS FOR TESTNET TRANSACTION ===");
  console.log("Tx Hash:", hash);

  // 1. Stellar Expert Testnet URL
  const expertUrl = `https://stellar.expert/explorer/testnet/tx/${hash}`;
  console.log("\n1. Stellar Expert Testnet URL:", expertUrl);

  // 2. Official Stellar Laboratory Transaction Endpoint
  const labUrl = `https://laboratory.stellar.org/#explorer?resource=transactions&endpoint=single&values=${encodeURIComponent(JSON.stringify({transaction_id: hash}))}&network=test`;
  console.log("2. Stellar Laboratory URL:", labUrl);

  // 3. Stellar Horizon Testnet API Endpoint
  const horizonUrl = `https://horizon-testnet.stellar.org/transactions/${hash}`;
  console.log("3. Horizon Testnet API URL:", horizonUrl);

  try {
    const res = await fetch(expertUrl);
    console.log("Stellar Expert fetch status:", res.status);
    const html = await res.text();
    console.log("Stellar Expert contains 'Transaction not found'?:", html.includes("Transaction not found"));
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

testExplorers();
