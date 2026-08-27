import {
  isConnected,
  getAddress,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";

/**
 * Checks if the Freighter browser extension is installed and accessible.
 * @returns {Promise<boolean>}
 */
export async function isFreighterAvailable() {
  try {
    const connectedResult = await isConnected();
    // Freighter returns an object { isConnected: boolean } or a boolean depending on version
    if (typeof connectedResult === "object" && connectedResult !== null) {
      return Boolean(connectedResult.isConnected);
    }
    return Boolean(connectedResult);
  } catch (error) {
    console.warn("Freighter check error:", error);
    return false;
  }
}

/**
 * Connects to Freighter wallet and retrieves the active public address.
 * Never stores or requests private keys.
 * @returns {Promise<string>} Stellar public address (G...)
 */
export async function connectFreighterWallet() {
  const installed = await isFreighterAvailable();
  if (!installed) {
    throw new Error(
      "Freighter extension is not installed. Please install Freighter from https://www.freighter.app to continue."
    );
  }

  try {
    // Request access to Freighter if not already permitted
    if (typeof requestAccess === "function") {
      const accessRes = await requestAccess();
      if (accessRes && accessRes.error) {
        throw new Error(accessRes.error);
      }
    }

    // Retrieve active wallet address
    const addressResult = await getAddress();
    
    // Normalize address string from response object or string
    let publicKey = "";
    if (typeof addressResult === "string") {
      publicKey = addressResult;
    } else if (addressResult && addressResult.address) {
      publicKey = addressResult.address;
    } else if (addressResult && addressResult.publicKey) {
      publicKey = addressResult.publicKey;
    }

    if (!publicKey) {
      throw new Error("Failed to retrieve public key from Freighter wallet.");
    }

    return publicKey;
  } catch (err) {
    console.error("Failed to connect Freighter:", err);
    if (err.message && err.message.includes("User rejected")) {
      throw new Error("Connection request was rejected in Freighter wallet.");
    }
    throw new Error(err.message || "Failed to connect to Freighter Wallet.");
  }
}

/**
 * Signs a transaction XDR via Freighter wallet on Stellar Testnet.
 * @param {string} unsignedXdr Base64 encoded transaction XDR
 * @returns {Promise<string>} Signed Base64 transaction XDR
 */
export async function signTxWithFreighter(unsignedXdr) {
  try {
    // Prompt Freighter to sign the transaction XDR
    const result = await signTransaction(unsignedXdr, {
      network: "TESTNET",
      networkPassphrase: Networks.TESTNET,
    });

    if (!result) {
      throw new Error("User rejected transaction or closed Freighter popup.");
    }

    if (typeof result === "object" && result.error) {
      throw new Error(result.error.message || result.error);
    }

    // Handle returned structure: string or { signedTxXdr }
    let signedXdr = "";
    if (typeof result === "string") {
      signedXdr = result;
    } else if (result.signedTxXdr) {
      signedXdr = result.signedTxXdr;
    }

    if (!signedXdr) {
      throw new Error("Freighter did not return a valid signed transaction.");
    }

    return signedXdr;
  } catch (err) {
    console.error("Freighter signing error:", err);
    if (
      err.message &&
      (err.message.includes("User rejected") ||
        err.message.includes("Declined") ||
        err.message.includes("closed"))
    ) {
      throw new Error("Transaction signing was cancelled by the user in Freighter.");
    }
    throw new Error(err.message || "Failed to sign transaction with Freighter.");
  }
}
