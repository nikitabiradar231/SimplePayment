const hash = "5b864bb8ce0ebcb63c0c6952c47443cfe4a74037ad2f02dad35d37e87ab368f3";

async function testExplorerUrls() {
  console.log("=== TESTING STELLAR EXPERT URL VARIATIONS ===");

  const urls = [
    `https://stellar.expert/explorer/testnet/tx/${hash}`,
    `https://stellar.expert/explorer/testnet/search?term=${hash}`,
    `https://stellar.expert/explorer/public/tx/${hash}`,
    `https://horizon-testnet.stellar.org/transactions/${hash}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch(e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}

testExplorerUrls();
