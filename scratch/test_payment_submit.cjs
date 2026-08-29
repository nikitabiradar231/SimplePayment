const { Horizon, TransactionBuilder, Networks, Operation, Asset, Keypair } = require('@stellar/stellar-sdk');

const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

async function testSubmit() {
  console.log("=== TESTING STELLAR TRANSACTION SUBMISSION & HASH VERIFICATION ===");
  try {
    // Generate temporary Testnet keypair for test
    const pair = Keypair.random();
    console.log("Test account:", pair.publicKey());

    // Fund account via Friendbot
    const friendbotRes = await fetch(`https://friendbot.stellar.org?addr=${pair.publicKey()}`);
    console.log("Friendbot funded account.");

    // Load account
    const sourceAccount = await horizonServer.loadAccount(pair.publicKey());

    // Build simple payment transaction to self
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({
        destination: pair.publicKey(),
        asset: Asset.native(),
        amount: "1",
      }))
      .setTimeout(60)
      .build();

    // Sign transaction with private key
    tx.sign(pair);

    console.log("Local transaction hash:", tx.hash().toString('hex'));

    // Submit to Horizon
    const res = await horizonServer.submitTransaction(tx);
    console.log("Horizon submission response hash:", res.hash);
    console.log("Horizon ledger sequence:", res.ledger);

    // Verify querying Horizon immediately for this transaction hash
    const txDetails = await horizonServer.transactions().transaction(res.hash).call();
    console.log("Successfully fetched tx details from Horizon! Ledger:", txDetails.ledger_attr);

    // Check Stellar Expert URL
    console.log("Stellar Expert URL:", `https://stellar.expert/explorer/testnet/tx/${res.hash}`);
  } catch (err) {
    console.error("Submission test error:", err);
  }
}

testSubmit();
