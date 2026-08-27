import React from "react";
import { Wallet, AlertCircle, ArrowRight, Download, CheckCircle2, Shield } from "lucide-react";

export default function WalletConnect({
  onConnect,
  isConnecting,
  isFreighterInstalled,
  error,
}) {
  return (
    <div style={{ maxWidth: "640px", margin: "40px auto 0", padding: "0 16px" }}>
      <div className="glass-card" style={{ padding: "40px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        
        {/* Glow backdrop accent */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header Hero Icon */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px"
        }}>
          <Wallet size={36} color="#818cf8" />
        </div>

        {/* Title & Description */}
        <h2 className="heading-font" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.02em" }}>
          Simple Payment dApp
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "32px" }}>
          Connect your <strong>Freighter Wallet</strong> to send native XLM payments seamlessly on the <strong>Stellar Testnet</strong>.
        </p>

        {/* Warning if Freighter is Not Installed */}
        {!isFreighterInstalled && (
          <div style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: "28px",
            textAlign: "left",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}>
            <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ color: "#fbbf24", fontSize: "0.95rem", fontWeight: 600, marginBottom: "4px" }}>
                Freighter Wallet Not Detected
              </h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                To interact with this Stellar Testnet dApp, please install the official Freighter browser extension.
              </p>
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: "0.825rem", padding: "6px 12px", display: "inline-flex", gap: "6px" }}
              >
                <Download size={14} /> Install Freighter Extension
              </a>
            </div>
          </div>
        )}

        {/* Connection Error Alert */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fca5a5",
            fontSize: "0.9rem",
            textAlign: "left"
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="btn-primary"
          style={{ width: "100%", padding: "16px", fontSize: "1.05rem" }}
        >
          {isConnecting ? (
            <>
              <span className="pulse-dot" style={{ backgroundColor: "#ffffff" }}></span>
              Connecting Wallet...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Connect Freighter Wallet
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Security & Feature Badges */}
        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            <Shield size={14} color="#818cf8" />
            <span>Zero Key Access</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            <CheckCircle2 size={14} color="#34d399" />
            <span>Stellar Testnet Only</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            <CheckCircle2 size={14} color="#34d399" />
            <span>Level 1 Standard</span>
          </div>
        </div>

      </div>
    </div>
  );
}
