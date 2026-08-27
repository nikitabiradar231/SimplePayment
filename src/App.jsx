import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WalletConnect from "./components/WalletConnect";
import WalletCard from "./components/WalletCard";
import SendPaymentForm from "./components/SendPaymentForm";
import TransactionStatus from "./components/TransactionStatus";
import TransactionHistory from "./components/TransactionHistory";

import {
  isFreighterAvailable,
  connectFreighterWallet,
  signTxWithFreighter,
} from "./services/freighter";
import {
  getXlmBalance,
  sendXlmPayment,
  fundAccountWithFriendbot,
} from "./services/stellar";

export default function App() {
  // State management
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [isAccountFunded, setIsAccountFunded] = useState(true);

  // Loading states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Feedback & history
  const [connectError, setConnectError] = useState("");
  const [txResult, setTxResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Check Freighter availability on mount
  useEffect(() => {
    async function checkAvailability() {
      const installed = await isFreighterAvailable();
      setIsFreighterInstalled(installed);
    }
    checkAvailability();
  }, []);

  // Fetch balance for connected address
  const fetchBalance = async (pubKey) => {
    if (!pubKey) return;
    setIsLoadingBalance(true);
    try {
      const res = await getXlmBalance(pubKey);
      setBalance(res.balance);
      setIsAccountFunded(res.exists);
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Step 2: Connect Wallet Handler
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setConnectError("");
    setTxResult(null);

    try {
      const pubKey = await connectFreighterWallet();
      setWalletAddress(pubKey);
      await fetchBalance(pubKey);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setConnectError(err.message || "Failed to connect Freighter Wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Step 7: Disconnect Wallet Handler
  const handleDisconnectWallet = () => {
    setWalletAddress("");
    setBalance("0.0000");
    setIsAccountFunded(true);
    setTxResult(null);
    setConnectError("");
  };

  // Helper: Fund unfunded Testnet account via Friendbot
  const handleFundFriendbot = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setTxResult(null);

    try {
      await fundAccountWithFriendbot(walletAddress);
      await fetchBalance(walletAddress);
      setTxResult({
        success: true,
        amount: "10000",
        recipient: walletAddress,
        hash: "Friendbot Testnet Faucet Activation",
        error: null,
      });
    } catch (err) {
      setTxResult({
        success: false,
        error: err.message || "Friendbot funding failed.",
        rawError: err,
      });
    } finally {
      setIsFunding(false);
    }
  };

  // Step 4 & 5: Send Payment Handler
  const handleSendPayment = async ({ recipientAddress, amount }) => {
    if (!walletAddress) return;

    setIsSubmitting(true);
    setTxResult(null);
    setStatusMessage("1/3 Building Stellar Testnet transaction...");

    try {
      // Step 4 execution: Build, sign via Freighter, submit to Horizon
      setStatusMessage("2/3 Waiting for Freighter signature approval...");
      const result = await sendXlmPayment({
        senderAddress: walletAddress,
        recipientAddress,
        amount,
        signWithFreighter: async (unsignedXdr) => {
          setStatusMessage("2/3 Please approve the transaction in Freighter popup...");
          return await signTxWithFreighter(unsignedXdr);
        },
      });

      setStatusMessage("3/3 Submitting transaction to Horizon Testnet...");

      // Step 5: Success state
      const successFeedback = {
        success: true,
        amount: amount.toString(),
        recipient: recipientAddress,
        hash: result.hash,
        ledger: result.ledger,
        error: null,
      };

      setTxResult(successFeedback);

      // Add to session history
      setHistory((prev) => [
        {
          amount: amount.toString(),
          recipient: recipientAddress,
          hash: result.hash,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev,
      ]);

      // Auto-refresh balance after successful payment (Step 5 requirement)
      await fetchBalance(walletAddress);
    } catch (err) {
      console.error("Payment submission failed:", err);
      // Step 6: Failure state
      setTxResult({
        success: false,
        amount: amount.toString(),
        recipient: recipientAddress,
        error: err.message || "Transaction failed to process on Stellar Testnet.",
        rawError: err,
      });
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Bar */}
      <Navbar isFreighterInstalled={isFreighterInstalled} />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: "900px", width: "100%", margin: "0 auto", padding: "32px 16px" }}>
        
        {/* Step 1: Initial view when wallet is not connected */}
        {!walletAddress ? (
          <WalletConnect
            onConnect={handleConnectWallet}
            isConnecting={isConnecting}
            isFreighterInstalled={isFreighterInstalled}
            error={connectError}
          />
        ) : (
          /* Connected State: Wallet card + Payment form + Feedback + History */
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Step 2, 3 & 7: Connected Wallet & Balance Card */}
            <WalletCard
              address={walletAddress}
              balance={balance}
              isLoadingBalance={isLoadingBalance}
              isAccountFunded={isAccountFunded}
              onRefreshBalance={() => fetchBalance(walletAddress)}
              onDisconnect={handleDisconnectWallet}
              onFundWithFriendbot={handleFundFriendbot}
              isFunding={isFunding}
            />

            {/* Step 5 & 6: Transaction Result Feedback (Success / Failure) */}
            <TransactionStatus
              result={txResult}
              onDismiss={() => setTxResult(null)}
            />

            {/* Step 4: Send XLM Payment Form */}
            <SendPaymentForm
              senderAddress={walletAddress}
              currentBalance={balance}
              onSendPayment={handleSendPayment}
              isSubmitting={isSubmitting}
              statusMessage={statusMessage}
            />

            {/* Session History List */}
            <TransactionHistory transactions={history} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "20px 0", textAlign: "center", fontSize: "0.8rem", color: "var(--text-dim)" }}>
        Stellar Level 1 White Belt Payment dApp • Testnet Environment • Powered by Freighter & Stellar SDK
      </footer>
    </div>
  );
}
