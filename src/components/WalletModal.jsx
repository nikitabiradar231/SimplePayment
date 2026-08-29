import React from "react";
import { X, Wallet, Shield, Check, ExternalLink, AlertCircle } from "lucide-react";
import { SUPPORTED_WALLETS } from "../services/walletKit";

export default function WalletModal({
  isOpen,
  onClose,
  onSelectWallet,
  isConnecting,
  connectingWalletId,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(5, 7, 15, 0.8)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-card" style={{
        maxWidth: "520px",
        width: "100%",
        padding: "28px",
        position: "relative",
        border: "1px solid rgba(99, 102, 241, 0.4)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)"
      }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Wallet size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="heading-font" style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                Select Wallet
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Connect your preferred Stellar wallet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isConnecting}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Friendly Error Display */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "0.85rem",
            color: "#fca5a5"
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        {/* Supported Wallet Options Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {SUPPORTED_WALLETS.map((w) => {
            const isThisConnecting = isConnecting && connectingWalletId === w.id;

            return (
              <button
                key={w.id}
                onClick={() => onSelectWallet(w.id)}
                disabled={isConnecting}
                style={{
                  background: "rgba(13, 16, 32, 0.7)",
                  border: w.recommended ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: isConnecting ? "not-allowed" : "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
                className="wallet-option-btn"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}>
                    <Wallet size={20} color={w.recommended ? "#818cf8" : "#94a3b8"} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-main)" }}>
                        {w.name}
                      </span>
                      {w.recommended && (
                        <span className="badge badge-testnet" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                          Recommended
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      {w.description}
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {isThisConnecting ? (
                    <span className="pulse-dot"></span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(255, 255, 255, 0.05)", padding: "4px 8px", borderRadius: "6px" }}>
                      {w.type}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Security Assurance */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.78rem",
          color: "var(--text-dim)",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <Shield size={14} color="#34d399" />
          <span>Zero Private Key Exposure. All signing happens securely inside your wallet.</span>
        </div>

      </div>
    </div>
  );
}
