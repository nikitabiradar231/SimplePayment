import React from "react";
import { ShieldCheck, Orbit, ExternalLink, FileCode } from "lucide-react";
import { DEFAULT_CONTRACT_ID } from "../services/soroban";

export default function Navbar({ activeWalletName, isWalletConnected }) {
  const contractShort = `${DEFAULT_CONTRACT_ID.slice(0, 5)}...${DEFAULT_CONTRACT_ID.slice(-5)}`;

  return (
    <header style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(11, 13, 23, 0.75)", backdropFilter: "blur(12px)", sticky: "top" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
          }}>
            <Orbit size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 className="heading-font text-gradient" style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                StellarPay
              </h1>
              <span className="badge badge-testnet">
                <span className="pulse-dot"></span> Testnet
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: 0, fontWeight: 500 }}>
              Multi-Wallet Payment Tracker & Soroban Contract
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          
          {/* Deployed Soroban Contract Address Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            color: "#38bdf8",
            background: "rgba(6, 182, 212, 0.1)",
            padding: "6px 12px",
            borderRadius: "9999px",
            border: "1px solid rgba(6, 182, 212, 0.25)"
          }} title={`Soroban Payment Tracker Contract Address: ${DEFAULT_CONTRACT_ID}`}>
            <FileCode size={13} />
            <span className="mono-font">Contract: {contractShort}</span>
          </div>

          {/* Active Wallet Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8rem",
            color: isWalletConnected ? "#34d399" : "#a5b4fc",
            background: isWalletConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)",
            padding: "6px 12px",
            borderRadius: "9999px",
            border: isWalletConnected ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(99, 102, 241, 0.2)"
          }}>
            <ShieldCheck size={14} />
            <span>{isWalletConnected ? `${activeWalletName} Connected` : "Multi-Wallet Ready"}</span>
          </div>

          <a
            href="https://laboratory.stellar.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
          >
            Stellar Lab <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}
