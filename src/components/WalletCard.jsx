import React, { useState } from "react";
import {
  Wallet,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sparkles,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";

export default function WalletCard({
  address,
  walletName,
  balance,
  isLoadingBalance,
  isAccountFunded,
  onRefreshBalance,
  onDisconnect,
  onOpenModal,
  onFundWithFriendbot,
  isFunding,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : "";

  return (
    <div className="glass-card" style={{ padding: "28px", position: "relative" }}>
      {/* Card Header: Network & Wallet Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Wallet size={20} color="#818cf8" />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              Connected Wallet ({walletName || "Stellar Wallet"})
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="pulse-dot" style={{ width: "6px", height: "6px" }}></span>
              <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 500 }}>
                {walletName || "Stellar"} • Testnet
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onOpenModal}
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            title="Switch connected wallet"
          >
            <ArrowRightLeft size={14} /> Switch Wallet
          </button>
          <button
            onClick={onDisconnect}
            className="btn-outline-danger"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            title="Disconnect wallet"
          >
            <LogOut size={14} /> Disconnect
          </button>
        </div>
      </div>

      {/* Stellar Public Key Display */}
      <div style={{
        background: "rgba(13, 16, 32, 0.6)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        marginBottom: "24px",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "2px" }}>
            Public Key Address
          </div>
          <div className="mono-font" style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 500, letterSpacing: "0.02em" }}>
            {truncatedAddress}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: "8px 12px", fontSize: "0.8rem" }}
          title="Copy address"
        >
          {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Balance Section */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        borderRadius: "var(--radius-md)",
        padding: "20px 24px",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
            Wallet Balance
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span className="heading-font text-gradient" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
              {isLoadingBalance ? "..." : balance}
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#a5b4fc" }}>
              XLM
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={onRefreshBalance}
            disabled={isLoadingBalance}
            className="btn-secondary"
            style={{ padding: "10px 14px", fontSize: "0.85rem" }}
            title="Refresh Testnet Balance"
          >
            <RefreshCw size={14} className={isLoadingBalance ? "pulse-dot" : ""} />
            Refresh
          </button>

          {(!isAccountFunded || parseFloat(balance || "0") < 2) && (
            <button
              onClick={onFundWithFriendbot}
              disabled={isFunding}
              className="btn-secondary"
              style={{
                padding: "10px 14px",
                fontSize: "0.85rem",
                background: "rgba(6, 182, 212, 0.15)",
                borderColor: "rgba(6, 182, 212, 0.3)",
                color: "#22d3ee"
              }}
              title="Fund 10,000 test XLM via Stellar Friendbot"
            >
              <Sparkles size={14} />
              {isFunding ? "Funding..." : "Get Test XLM"}
            </button>
          )}
        </div>
      </div>

      {!isAccountFunded && !isLoadingBalance && (
        <div style={{
          marginTop: "16px",
          padding: "10px 14px",
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "0.825rem",
          color: "#fbbf24"
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            This Testnet account is unactivated. Click <strong>Get Test XLM</strong> to receive 10,000 free XLM via Friendbot.
          </span>
        </div>
      )}
    </div>
  );
}
