import * as FreighterApi from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";

/**
 * Safely retrieves a function from @stellar/freighter-api module or window.freighterApi
 */
function getApiFn(fnName) {
  if (typeof FreighterApi[fnName] === "function") {
    return FreighterApi[fnName];
  }
  if (FreighterApi.default && typeof FreighterApi.default[fnName] === "function") {
    return FreighterApi.default[fnName];
  }
  if (typeof window !== "undefined" && window.freighterApi && typeof window.freighterApi[fnName] === "function") {
    return window.freighterApi[fnName];
  }
  return null;
}

/**
 * Checks if the Freighter browser extension is installed and accessible.
 * @returns {Promise<boolean>}
 */
export async function isFreighterAvailable() {
  try {
    const isConnFn = getApiFn("isConnected");
    if (isConnFn) {
      const connectedResult = await isConnFn();
      if (typeof connectedResult === "object" && connectedResult !== null) {
        return Boolean(connectedResult.isConnected);
      }
      return Boolean(connectedResult);
    }
    // Fallback: check window object directly
    return typeof window !== "undefined" && Boolean(window.freighterApi || window.freighter);
  } catch (error) {
    console.warn("Freighter check error:", error);
    return false;
  }
}

/**
 * Connects to Freighter wallet and retrieves the active public address.
 * Uses requestAccess() / getPublicKey() from @stellar/freighter-api.
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
    let publicKey = "";

    // 1. Try requestAccess() first (prompts user for permission & returns public key)
    const requestAccessFn = getApiFn("requestAccess");
    if (requestAccessFn) {
      const accessRes = await requestAccessFn();
      if (typeof accessRes === "string" && accessRes) {
        publicKey = accessRes;
      } else if (accessRes && accessRes.address) {
        publicKey = accessRes.address;
      } else if (accessRes && accessRes.publicKey) {
        publicKey = accessRes.publicKey;
      } else if (accessRes && accessRes.error) {
        throw new Error(accessRes.error);
      }
    }

    // 2. Fallback to getPublicKey() or getAddress() if requestAccess didn't return address
    if (!publicKey) {
      const getPubKeyFn = getApiFn("getPublicKey") || getApiFn("getAddress");
      if (getPubKeyFn) {
        const keyRes = await getPubKeyFn();
        if (typeof keyRes === "string") {
          publicKey = keyRes;
        } else if (keyRes && keyRes.address) {
          publicKey = keyRes.address;
        } else if (keyRes && keyRes.publicKey) {
          publicKey = keyRes.publicKey;
        }
      }
    }

    if (!publicKey) {
      throw new Error("Could not retrieve public key from Freighter. Please make sure Freighter is unlocked.");
    }

    return publicKey;
  } catch (err) {
    console.error("Failed to connect Freighter:", err);
    if (err.message && (err.message.includes("rejected") || err.message.includes("Declined"))) {
      throw new Error("Connection request was rejected in Freighter wallet.");
    }
    throw new Error(err.message || "Failed to connect to Freighter Wallet.");
  }
}

/**
 * Signs a transaction XDR via Freighter wallet on Stellar Testnet.
 * @param {string} unsignedXdr Base64 encoded transaction XDR
 * @param {string} [accountToSign] Connected public key address
 * @returns {Promise<string>} Signed Base64 transaction XDR
 */
export async function signTxWithFreighter(unsignedXdr, accountToSign) {
  try {
    const signTxFn = getApiFn("signTransaction");
    if (!signTxFn) {
      throw new Error("Freighter signTransaction method is not available.");
    }

    const opts = {
      network: "TESTNET",
      networkPassphrase: Networks.TESTNET,
    };
    if (accountToSign) {
      opts.accountToSign = accountToSign;
    }

    const result = await signTxFn(unsignedXdr, opts);

    if (!result) {
      throw new Error("User rejected transaction or closed Freighter popup.");
    }

    if (typeof result === "object" && result.error) {
      throw new Error(result.error.message || result.error);
    }

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
      (err.message.includes("rejected") ||
        err.message.includes("Declined") ||
        err.message.includes("closed"))
    ) {
      throw new Error("Transaction signing was cancelled by the user in Freighter.");
    }
    throw new Error(err.message || "Failed to sign transaction with Freighter.");
  }
}
