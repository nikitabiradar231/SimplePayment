/**
 * Formats technical blockchain, wallet, and Soroban contract errors into clean, user-friendly messages.
 * @param {Error|object|string} error
 * @returns {string} Human readable error explanation
 */
export function formatUserFriendlyError(error) {
  if (!error) return "An unexpected error occurred.";

  const msg = typeof error === "string" ? error : error.message || String(error);

  // Wallet user cancellation / rejection
  if (
    msg.includes("rejected") ||
    msg.includes("declined") ||
    msg.includes("cancelled") ||
    msg.includes("User rejected")
  ) {
    return "Transaction was cancelled or rejected in your wallet.";
  }

  // Address validation
  if (msg.includes("invalid address") || msg.includes("Address is invalid")) {
    return "Invalid Stellar recipient address. Please verify the public key format (starts with G).";
  }

  if (msg.includes("SameSenderRecipient") || msg.includes("identical")) {
    return "Sender and recipient addresses cannot be identical.";
  }

  // Balance issues
  if (msg.includes("tx_insufficient_balance") || msg.includes("Insufficient balance")) {
    return "Insufficient XLM balance to complete this transaction and pay network fees.";
  }

  // Contract specific error codes (panic host errors)
  if (msg.includes("Error(Contract, #1)") || msg.includes("InvalidAmount")) {
    return "Contract Error: Payment amount must be greater than 0 XLM.";
  }
  if (msg.includes("Error(Contract, #2)") || msg.includes("SameSenderRecipient")) {
    return "Contract Error: Cannot send payment to your own wallet address.";
  }
  if (msg.includes("Error(Contract, #3)") || msg.includes("ContractPaused")) {
    return "Contract Error: Smart contract is currently paused by admin.";
  }
  if (msg.includes("Error(Contract, #4)") || msg.includes("Unauthorized")) {
    return "Contract Error: Unauthorized action. Only contract admin can perform this operation.";
  }

  // Network or RPC failures
  if (msg.includes("Network Error") || msg.includes("FETCH_ERROR") || msg.includes("Failed to fetch")) {
    return "Network connection issue or Soroban RPC timeout. Please retry in a few moments.";
  }

  // Default fallback if unknown
  return msg.length > 120 ? `${msg.slice(0, 117)}...` : msg;
}
