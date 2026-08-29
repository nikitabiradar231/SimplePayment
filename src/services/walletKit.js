import {
  StellarWalletsKit,
  FreighterModule,
  AlbedoModule,
  xBullModule,
  RabetModule,
  LobstrModule,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
  RABET_ID,
  LOBSTR_ID,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import { Networks } from "@stellar/stellar-sdk";

export {
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
  RABET_ID,
  LOBSTR_ID,
};

// Initialize StellarWalletsKit instance configured for Stellar Testnet
export const walletKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new AlbedoModule(),
    new xBullModule(),
    new RabetModule(),
    new LobstrModule(),
  ],
});

// Supported wallet options metadata for UI selection
export const SUPPORTED_WALLETS = [
  {
    id: FREIGHTER_ID,
    name: "Freighter Wallet",
    type: "Browser Extension",
    description: "Official SDF extension wallet for Stellar",
    icon: "https://www.freighter.app/favicon.ico",
    recommended: true,
  },
  {
    id: ALBEDO_ID,
    name: "Albedo Wallet",
    type: "Web Browser Link",
    description: "Secure delegated web signer for Stellar",
    icon: "https://albedo.link/favicon.ico",
    recommended: false,
  },
  {
    id: XBULL_ID,
    name: "xBull Wallet",
    type: "Extension / Mobile",
    description: "Feature-rich multi-account Stellar wallet",
    icon: "https://xbull.app/favicon.ico",
    recommended: false,
  },
  {
    id: LOBSTR_ID,
    name: "Lobstr Wallet",
    type: "Mobile / Web",
    description: "Popular Stellar wallet for iOS & Android",
    icon: "https://lobstr.co/favicon.ico",
    recommended: false,
  },
  {
    id: RABET_ID,
    name: "Rabet Wallet",
    type: "Browser Extension",
    description: "Desktop & extension wallet for Stellar",
    icon: "https://rabet.io/favicon.ico",
    recommended: false,
  },
];

/**
 * Connects to a selected wallet option using StellarWalletsKit.
 * @param {string} walletId Selected wallet identifier
 * @returns {Promise<{ address: string, walletId: string, walletName: string }>}
 */
export async function connectSelectedWallet(walletId) {
  try {
    const targetWallet = SUPPORTED_WALLETS.find((w) => w.id === walletId) || SUPPORTED_WALLETS[0];
    walletKit.setWallet(walletId);

    // Prompt user for public key access
    const { address } = await walletKit.getAddress();

    if (!address) {
      throw new Error(`Could not retrieve public key address from ${targetWallet.name}.`);
    }

    return {
      address,
      walletId: targetWallet.id,
      walletName: targetWallet.name,
    };
  } catch (err) {
    console.error("Wallet connection error:", err);
    throw parseWalletError(err, walletId);
  }
}

/**
 * Signs a transaction XDR with the currently connected wallet.
 * @param {string} unsignedXdr Base64 transaction XDR
 * @param {string} walletId Currently active wallet ID
 * @param {string} userAddress Connected public key address
 * @returns {Promise<string>} Signed Base64 transaction XDR
 */
export async function signWithSelectedWallet(unsignedXdr, walletId, userAddress) {
  try {
    if (walletId) {
      walletKit.setWallet(walletId);
    }

    // Direct Freighter signing fallback for high reliability
    if (walletId === FREIGHTER_ID || walletId === "freighter") {
      try {
        const { signTransaction: freighterSign } = await import("@stellar/freighter-api");
        const freighterRes = await freighterSign(unsignedXdr, {
          network: "TESTNET",
          networkPassphrase: Networks.TESTNET,
          accountToSign: userAddress,
        });

        let signedResult = typeof freighterRes === "string" ? freighterRes : (freighterRes && (freighterRes.signedTxXdr || freighterRes.result));
        if (signedResult) {
          return signedResult;
        }
      } catch (freighterErr) {
        console.warn("Freighter direct sign warning, trying walletKit:", freighterErr);
      }
    }

    // Standard StellarWalletsKit signTransaction method
    const res = await walletKit.signTransaction(unsignedXdr, {
      address: userAddress,
      networkPassphrase: Networks.TESTNET,
    });

    let signedXdr = "";
    if (typeof res === "string") {
      signedXdr = res;
    } else if (res && res.signedTxXdr) {
      signedXdr = res.signedTxXdr;
    } else if (res && res.result) {
      signedXdr = res.result;
    }

    if (!signedXdr) {
      throw new Error("Wallet did not return a valid signed transaction.");
    }

    return signedXdr;
  } catch (err) {
    console.error("Wallet signing error:", err);
    throw parseWalletError(err, walletId);
  }
}

/**
 * Translates raw wallet SDK errors into user-friendly error messages.
 */
export function parseWalletError(err, walletId) {
  const targetWallet = SUPPORTED_WALLETS.find((w) => w.id === walletId);
  const name = targetWallet ? targetWallet.name : "Selected wallet";
  const msg = err ? err.message || String(err) : "";

  // 1. Wallet Not Installed / Not Found
  if (
    msg.includes("not installed") ||
    msg.includes("not found") ||
    msg.includes("is not available") ||
    msg.includes("extension missing")
  ) {
    return new Error(`${name} is not installed or enabled in your browser. Please install ${name} or choose another wallet.`);
  }

  // 2. User Rejected Connection / Transaction
  if (
    msg.includes("rejected") ||
    msg.includes("Declined") ||
    msg.includes("user denied") ||
    msg.includes("closed popup") ||
    msg.includes("User canceled")
  ) {
    return new Error(`Action was cancelled by the user in ${name}.`);
  }

  // 3. Insufficient Balance
  if (msg.includes("underfunded") || msg.includes("Insufficient")) {
    return new Error("Insufficient XLM balance in your connected wallet.");
  }

  return new Error(msg || `Failed to connect or interact with ${name}. Please try again.`);
}
