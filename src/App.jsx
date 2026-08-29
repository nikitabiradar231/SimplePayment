import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WalletConnect from "./components/WalletConnect";
import WalletModal from "./components/WalletModal";
import WalletCard from "./components/WalletCard";
import SendPaymentForm from "./components/SendPaymentForm";
import TransactionStatus from "./components/TransactionStatus";
import ActivityFeed from "./components/ActivityFeed";
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";

import {
  connectSelectedWallet,
  signWithSelectedWallet,
  FREIGHTER_ID,
  SUPPORTED_WALLETS,
} from "./services/walletKit";
import {
  getXlmBalance,
  fundAccountWithFriendbot,
  horizonServer,
} from "./services/stellar";
import {
  buildPaymentTrackerTx,
  fetchPaymentEvents,
  DEFAULT_CONTRACT_ID,
  sorobanServer,
} from "./services/soroban";

export default function App() {
  // Wallet State
  const [walletAddress, setWalletAddress] = useState("");
  const [activeWalletId, setActiveWalletId] = useState(FREIGHTER_ID);
  const [activeWalletName, setActiveWalletName] = useState("Freighter Wallet");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Balance & Account State
  const [balance, setBalance] = useState("0.0000");
  const [isAccountFunded, setIsAccountFunded] = useState(true);

  // Loading States
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Transaction Status Workflow: 'Ready' | 'Pending' | 'Success' | 'Failed'
  const [txStatus, setTxStatus] = useState("Ready");
  const [txResult, setTxResult] = useState(null);
  const [modalError, setModalError] = useState("");
  const [connectError, setConnectError] = useState("");

  // Contract Activity Feed Events
  const [events, setEvents] = useState([]);

  // Balance Query
  const fetchBalance = async (pubKey) => {
    if (!pubKey) return;
    setIsLoadingBalance(true);
    try {
      const res = await getXlmBalance(pubKey);
      setBalance(res.balance);
      setIsAccountFunded(res.exists);
    } catch (err) {
      console.error("Balance query error:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Poll Soroban Contract Events for Real-time Activity Feed
  const loadContractEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const liveEvents = await fetchPaymentEvents(DEFAULT_CONTRACT_ID);
      setEvents(liveEvents);
    } catch (err) {
      console.warn("Event query error:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Initial event fetch & periodic 6-second polling for real-time activity feed
  useEffect(() => {
    loadContractEvents();
    const interval = setInterval(() => {
      loadContractEvents();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Multi-Wallet Connection Handler
  const handleSelectWallet = async (walletId) => {
    setIsConnecting(true);
    setConnectingWalletId(walletId);
    setModalError("");
    setConnectError("");

    try {
      const res = await connectSelectedWallet(walletId);
      setWalletAddress(res.address);
      setActiveWalletId(res.walletId);
      setActiveWalletName(res.walletName);
      setIsModalOpen(false);
      await fetchBalance(res.address);
    } catch (err) {
      setModalError(err.message || "Failed to connect selected wallet.");
      setConnectError(err.message || "Failed to connect selected wallet.");
    } finally {
      setIsConnecting(false);
      setConnectingWalletId("");
    }
  };

  // Disconnect Handler
  const handleDisconnect = () => {
    setWalletAddress("");
    setBalance("0.0000");
    setIsAccountFunded(true);
    setTxStatus("Ready");
    setTxResult(null);
    setConnectError("");
  };

  // Friendbot Funding Handler
  const handleFundFriendbot = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setTxStatus("Pending");

    try {
      await fundAccountWithFriendbot(walletAddress);
      await fetchBalance(walletAddress);
      setTxStatus("Success");
      setTxResult({
        amount: "10000",
        sender: "Stellar Friendbot Faucet",
        recipient: walletAddress,
        hash: "Friendbot Testnet Faucet Activation",
        contractId: DEFAULT_CONTRACT_ID,
      });
    } catch (err) {
      setTxStatus("Failed");
      setTxResult({
        error: err.message || "Friendbot funding failed.",
        rawError: err,
      });
    } finally {
      setIsFunding(false);
    }
  };

  // Level 2 Contract & Payment Execution Flow
  const handleSendPayment = async ({ recipientAddress, amount }) => {
    if (!walletAddress) return;

    setIsSubmitting(true);
    setTxStatus("Pending");
    setStatusMessage("1/3 Building Soroban Contract payment transaction...");

    try {
      // 1. Build payment & Soroban tracker transaction
      const { unsignedXdr } = await buildPaymentTrackerTx({
        sender: walletAddress,
        recipient: recipientAddress,
        amount,
        horizonServer,
      });

      // 2. Request signature from active wallet
      setStatusMessage(`2/3 Please approve transaction in ${activeWalletName}...`);
      const signedXdr = await signWithSelectedWallet(
        unsignedXdr,
        activeWalletId,
        walletAddress
      );

      // 3. Submit transaction to Stellar Testnet
      setStatusMessage("3/3 Submitting transaction & recording contract event...");
      const signedTransaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
      let txHash = "";
      try {
        const submission = await horizonServer.submitTransaction(signedTransaction);
        txHash = submission.hash;
      } catch (subErr) {
        console.log("Horizon submit info, attempting Soroban RPC send:", subErr.message);
        const sendRes = await sorobanServer.sendTransaction(signedTransaction);
        txHash = sendRes.hash;
      }

      // 4. Update Status to Success
      setTxStatus("Success");
      const successData = {
        amount: amount.toString(),
        sender: walletAddress,
        recipient: recipientAddress,
        hash: txHash || "Transaction Submitted",
        contractId: DEFAULT_CONTRACT_ID,
      };
      setTxResult(successData);

      // 5. Instantly prepend new event to Activity Feed (real-time update without refresh)
      const newFeedItem = {
        id: txHash || `tx-${Date.now()}`,
        sender: walletAddress,
        recipient: recipientAddress,
        amount: amount.toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: "Confirmed",
        hash: txHash || `tx-${Date.now()}`,
      };
      setEvents((prev) => [newFeedItem, ...prev]);

      // 6. Refresh XLM balance
      await fetchBalance(walletAddress);
    } catch (err) {
      console.error("Payment submission failed:", err);
      setTxStatus("Failed");
      setTxResult({
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
      <Navbar
        activeWalletName={activeWalletName}
        isWalletConnected={Boolean(walletAddress)}
      />

      {/* Multi-Wallet Selection Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        isConnecting={isConnecting}
        connectingWalletId={connectingWalletId}
        error={modalError}
      />

      {/* Main App Body */}
      <main style={{ flex: 1, maxWidth: "920px", width: "100%", margin: "0 auto", padding: "32px 16px" }}>
        
        {!walletAddress ? (
          /* Step 1: Initial Multi-Wallet Screen */
          <WalletConnect
            onConnect={() => setIsModalOpen(true)}
            isConnecting={isConnecting}
            isFreighterInstalled={true}
            error={connectError}
          />
        ) : (
          /* Connected State */
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Wallet Info Card */}
            <WalletCard
              address={walletAddress}
              walletName={activeWalletName}
              balance={balance}
              isLoadingBalance={isLoadingBalance}
              isAccountFunded={isAccountFunded}
              onRefreshBalance={() => fetchBalance(walletAddress)}
              onDisconnect={handleDisconnect}
              onOpenModal={() => setIsModalOpen(true)}
              onFundWithFriendbot={handleFundFriendbot}
              isFunding={isFunding}
            />

            {/* Real-time Transaction Status Tracker (Ready, Pending, Success, Failed) */}
            <TransactionStatus
              status={txStatus}
              result={txResult}
              onDismiss={() => {
                setTxStatus("Ready");
                setTxResult(null);
              }}
            />

            {/* Send Payment Form */}
            <SendPaymentForm
              senderAddress={walletAddress}
              currentBalance={balance}
              onSendPayment={handleSendPayment}
              isSubmitting={isSubmitting}
              statusMessage={statusMessage}
            />

            {/* Real-Time Soroban Contract Activity Feed */}
            <ActivityFeed
              events={events}
              isLoadingEvents={isLoadingEvents}
              onRefreshEvents={loadContractEvents}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "20px 0", textAlign: "center", fontSize: "0.8rem", color: "var(--text-dim)" }}>
        Stellar Level 2 Multi-Wallet Payment Tracker • Soroban Smart Contract: <span className="mono-font" style={{ color: "#38bdf8" }}>{DEFAULT_CONTRACT_ID.slice(0, 8)}...</span>
      </footer>
    </div>
  );
}
