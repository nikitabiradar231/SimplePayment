import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  StrKey,
} from "@stellar/stellar-sdk";

// Stellar Horizon Testnet Server URL
export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_EXPERT_TESTNET_URL = "https://stellar.expert/explorer/testnet/tx";

// Initialize Horizon Server for Testnet
export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Validates whether a given string is a valid Stellar public key (Ed25519).
 * @param {string} address
 * @returns {boolean}
 */
export function isValidStellarAddress(address) {
  if (!address || typeof address !== "string") return false;
  return StrKey.isValidEd25519PublicKey(address.trim());
}

/**
 * Fetches the native XLM balance for a given Stellar public key from Horizon Testnet.
 * @param {string} publicKey Stellar Public Key (G...)
 * @returns {Promise<{ balance: string, exists: boolean }>}
 */
export async function getXlmBalance(publicKey) {
  if (!isValidStellarAddress(publicKey)) {
    throw new Error("Invalid Stellar public address.");
  }

  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeAsset = account.balances.find(
      (b) => b.asset_type === "native"
    );

    return {
      balance: nativeAsset ? parseFloat(nativeAsset.balance).toFixed(4) : "0.0000",
      rawBalance: nativeAsset ? nativeAsset.balance : "0",
      exists: true,
    };
  } catch (error) {
    // 404 means the account has not been funded on Testnet yet
    if (error.response && error.response.status === 404) {
      return {
        balance: "0.0000",
        rawBalance: "0",
        exists: false,
      };
    }
    console.error("Error loading Stellar account balance:", error);
    throw new Error(
      error.message || "Failed to fetch wallet balance from Stellar Testnet."
    );
  }
}

/**
 * Funds an account on Stellar Testnet using the official Friendbot faucet.
 * Useful for new Level 1 test accounts that are unfunded.
 * @param {string} publicKey
 * @returns {Promise<boolean>}
 */
export async function fundAccountWithFriendbot(publicKey) {
  if (!isValidStellarAddress(publicKey)) {
    throw new Error("Invalid Stellar address for Friendbot funding.");
  }

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();
    if (response.ok || data.hash) {
      return true;
    }
    throw new Error(data.detail || "Friendbot funding request failed.");
  } catch (err) {
    console.error("Friendbot funding error:", err);
    throw new Error(err.message || "Failed to fund test account via Friendbot.");
  }
}

/**
 * Builds, signs via Freighter, and submits an XLM payment transaction to Stellar Testnet.
 * @param {Object} params
 * @param {string} params.senderAddress - Connected user public address (G...)
 * @param {string} params.recipientAddress - Destination public address (G...)
 * @param {string|number} params.amount - Amount in XLM
 * @param {Function} params.signWithFreighter - Async function that signs the XDR with Freighter
 * @returns {Promise<{ hash: string, ledger: number }>}
 */
export async function sendXlmPayment({
  senderAddress,
  recipientAddress,
  amount,
  signWithFreighter,
}) {
  // 1. Inputs validation
  const cleanSender = senderAddress ? senderAddress.trim() : "";
  const cleanRecipient = recipientAddress ? recipientAddress.trim() : "";
  const numAmount = parseFloat(amount);

  if (!isValidStellarAddress(cleanSender)) {
    throw new Error("Connected wallet address is invalid.");
  }
  if (!cleanRecipient) {
    throw new Error("Recipient Stellar address is required.");
  }
  if (!isValidStellarAddress(cleanRecipient)) {
    throw new Error("Recipient address is not a valid Stellar public key (starts with G).");
  }
  if (cleanSender === cleanRecipient) {
    throw new Error("Recipient address cannot be the same as sender address.");
  }
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("XLM amount must be a positive number greater than 0.");
  }

  // 2. Fetch sender account details and sequence number from Horizon
  let sourceAccount;
  try {
    sourceAccount = await horizonServer.loadAccount(cleanSender);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error(
        "Your account is not funded on Stellar Testnet yet. Use the 'Fund with Friendbot' button to activate your account."
      );
    }
    throw new Error(`Failed to load sender account from Testnet: ${err.message}`);
  }

  // Check native XLM balance
  const nativeBalance = sourceAccount.balances.find((b) => b.asset_type === "native");
  const currentXlm = nativeBalance ? parseFloat(nativeBalance.balance) : 0;

  if (currentXlm < numAmount) {
    throw new Error(
      `Insufficient balance. You have ${currentXlm.toFixed(4)} XLM, but tried to send ${numAmount} XLM.`
    );
  }

  // 3. Fetch recommended network base fee
  let baseFee = Horizon.BASE_FEE;
  try {
    baseFee = await horizonServer.fetchBaseFee();
  } catch (e) {
    console.warn("Using default base fee 100 stroops:", e);
  }

  // 4. Build Payment Transaction
  let transaction;
  try {
    transaction = new TransactionBuilder(sourceAccount, {
      fee: String(baseFee),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: cleanRecipient,
          asset: Asset.native(),
          amount: String(numAmount),
        })
      )
      .setTimeout(60) // 60 seconds timeout
      .build();
  } catch (buildErr) {
    console.error("Transaction construction error:", buildErr);
    throw new Error(`Failed to build transaction: ${buildErr.message}`);
  }

  // 5. Get unsigned XDR string
  const unsignedXdr = transaction.toXDR();

  // 6. Sign transaction via Freighter Wallet
  let signedXdr;
  try {
    signedXdr = await signWithFreighter(unsignedXdr, cleanSender);
  } catch (signErr) {
    throw signErr; // Rethrow formatted freighter error
  }

  // 7. Parse signed XDR back into transaction object
  let signedTransaction;
  try {
    signedTransaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  } catch (parseErr) {
    console.error("Error parsing signed XDR:", parseErr);
    throw new Error("Invalid signed transaction format returned from wallet.");
  }

  // 8. Submit signed transaction to Horizon Testnet
  try {
    const submissionResult = await horizonServer.submitTransaction(signedTransaction);
    return {
      hash: submissionResult.hash,
      ledger: submissionResult.ledger,
      successful: true,
    };
  } catch (submitError) {
    console.error("Horizon transaction submission error:", submitError);
    
    // Parse Horizon result codes if available
    let userMsg = "Transaction submission failed on Stellar Testnet.";
    
    if (submitError.response && submitError.response.data) {
      const data = submitError.response.data;
      const resultCode = data.extras && data.extras.result_codes;

      if (resultCode) {
        const txCode = resultCode.transaction;
        const opCodes = resultCode.operations || [];

        if (txCode === "tx_bad_auth") {
          userMsg = "Signature authentication failed (tx_bad_auth). Please check that your Freighter wallet network is set to TESTNET and that the active account in Freighter matches your connected public address.";
        } else if (txCode === "tx_bad_seq") {
          userMsg = "Transaction sequence error (outdated sequence number). Please try again.";
        } else if (txCode === "tx_insufficient_fee") {
          userMsg = "Insufficient transaction fee provided for Testnet network congestion.";
        } else if (opCodes.includes("op_no_destination")) {
          userMsg = "The recipient account does not exist on Testnet. Destination accounts must be activated with XLM before receiving payments.";
        } else if (opCodes.includes("op_underfunded")) {
          userMsg = "Insufficient XLM balance to complete payment and required minimum reserve.";
        } else if (opCodes.includes("op_src_not_authorized")) {
          userMsg = "Source account is not authorized to send payments.";
        }
      }
    } else if (submitError.message && submitError.message.includes("timeout")) {
      userMsg = "Network request timed out. Please check your internet connection and retry.";
    }

    const errObj = new Error(userMsg);
    errObj.raw = submitError.response ? submitError.response.data : submitError.message;
    throw errObj;
  }
}
