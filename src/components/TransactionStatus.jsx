import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
} from "lucide-react";
import { STELLAR_EXPERT_TESTNET_URL, getStellarLabExplorerUrl, getStellarExpertExplorerUrl } from "../services/stellar";
import { DEFAULT_CONTRACT_ID } from "../services/soroban";

export default function TransactionStatus({ status, result, onDismiss }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // If status is 'Ready' and there's no result, hide status banner
  if (status === "Ready" && !result) return null;

  const handleCopyHash = () => {
    if (!result || !result.hash) return;
    navigator.clipboard.writeText(result.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyContract = () => {
    const contractId = (result && result.contractId) || DEFAULT_CONTRACT_ID;
    navigator.clipboard.writeText(contractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const contractAddress = (result && result.contractId) || DEFAULT_CONTRACT_ID;

  return (
    <div style={{ marginTop: "24px" }}>
      
      {/* 1. PENDING STATE */}
      {status === "Pending" && (
        <div
          className="glass-card"
          style={{
            padding: "24px",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, rgba(18, 22, 41, 0.9) 70%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Clock size={24} color="#818cf8" className="pulse-dot" />
            </div>

            <div>
              <span className="badge badge-warning" style={{ marginBottom: "6px" }}>
                Status: Pending
              </span>
              <h4 className="heading-font" style={{ fontSize: "1.15rem", fontWeight: 700, margin: "4px 0" }}>
                Transaction pending. Waiting for confirmation...
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Please approve in your wallet and wait for Stellar Testnet ledger confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS STATE */}
      {status === "Success" && result && (
        <div
          className="glass-card"
          style={{
            padding: "28px",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            background: "radial-gradient(circle at top right, rgba(16, 185, 129, 0.15) 0%, rgba(18, 22, 41, 0.9) 70%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <CheckCircle size={28} color="#34d399" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="badge badge-success">Transaction Successful</span>
                <button
                  onClick={onDismiss}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Dismiss
                </button>
              </div>

              <h3 className="heading-font" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>
                {result.amount} XLM Sent & Contract Recorded
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                <div>
                  Sender: <span className="mono-font" style={{ color: "var(--text-main)" }}>{result.sender}</span>
                </div>
                <div>
                  Recipient: <span className="mono-font" style={{ color: "var(--text-main)" }}>{result.recipient}</span>
                </div>
              </div>

              {/* Transaction Hash */}
              <div style={{
                background: "rgba(13, 16, 32, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                marginBottom: "10px",
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "2px" }}>
                  Transaction Hash:
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <span className="mono-font" style={{ fontSize: "0.8rem", color: "#a5b4fc", wordBreak: "break-all" }}>
                    {result.hash}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "0.75rem", flexShrink: 0 }}
                  >
                    {copiedHash ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                    {copiedHash ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Contract Address */}
              <div style={{
                background: "rgba(13, 16, 32, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileCode size={12} color="#38bdf8" /> Soroban Contract Address:
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <span className="mono-font" style={{ fontSize: "0.8rem", color: "#38bdf8", wordBreak: "break-all" }}>
                    {contractAddress}
                  </span>
                  <button
                    onClick={handleCopyContract}
                    className="btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "0.75rem", flexShrink: 0 }}
                  >
                    {copiedContract ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                    {copiedContract ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Stellar Explorer & Horizon Links */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <a
                  href={getStellarLabExplorerUrl(result.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: "0.875rem", display: "inline-flex" }}
                >
                  View on Stellar Explorer <ExternalLink size={14} />
                </a>

                <a
                  href={getStellarExpertExplorerUrl(result.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: "10px 14px", fontSize: "0.85rem", display: "inline-flex" }}
                >
                  Stellar Expert <ExternalLink size={12} />
                </a>

                <a
                  href={`https://horizon-testnet.stellar.org/transactions/${result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: "10px 14px", fontSize: "0.85rem", display: "inline-flex" }}
                >
                  Horizon API <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
                * Note: Stellar Explorer (Laboratory) reads live Testnet data instantly. Third-party crawlers (Stellar Expert) index Testnet blocks asynchronously.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FAILED STATE */}
      {status === "Failed" && (
        <div
          className="glass-card"
          style={{
            padding: "28px",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            background: "radial-gradient(circle at top right, rgba(239, 68, 68, 0.12) 0%, rgba(18, 22, 41, 0.9) 70%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <XCircle size={28} color="#ef4444" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                  Status: Failed
                </span>
                <button
                  onClick={onDismiss}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Dismiss
                </button>
              </div>

              <h3 className="heading-font" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "#fca5a5" }}>
                Transaction failed. Please try again.
              </h3>

              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "14px", lineHeight: 1.5 }}>
                {result && result.error ? result.error : "Transaction could not be submitted to Stellar Testnet."}
              </p>

              {/* Technical Accordion */}
              {result && result.rawError && (
                <div>
                  <button
                    onClick={() => setShowTechDetails(!showTechDetails)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                      marginBottom: "8px"
                    }}
                  >
                    <span>Technical Debug Log</span>
                    {showTechDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showTechDetails && (
                    <pre className="mono-font" style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px",
                      fontSize: "0.75rem",
                      color: "#fca5a5",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap"
                    }}>
                      {typeof result.rawError === "object" ? JSON.stringify(result.rawError, null, 2) : String(result.rawError)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
