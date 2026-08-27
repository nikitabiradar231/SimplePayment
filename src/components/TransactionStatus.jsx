import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { STELLAR_EXPERT_TESTNET_URL } from "../services/stellar";

export default function TransactionStatus({ result, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!result) return null;

  const { success, amount, recipient, hash, ledger, error, rawError } = result;

  const handleCopyHash = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = hash ? `${STELLAR_EXPERT_TESTNET_URL}/${hash}` : "";

  return (
    <div style={{ marginTop: "24px" }}>
      {success ? (
        /* STEP 5: SUCCESS STATE */
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
                {amount} XLM Sent Successfully
              </h3>

              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Recipient: <span className="mono-font" style={{ color: "var(--text-main)" }}>{recipient}</span>
                {ledger && <span style={{ marginLeft: "12px", color: "var(--text-dim)" }}>(Ledger #{ledger})</span>}
              </p>

              {/* Transaction Hash Display */}
              <div style={{
                background: "rgba(13, 16, 32, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                  Transaction Hash:
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <span className="mono-font" style={{ fontSize: "0.825rem", color: "#a5b4fc", wordBreak: "break-all" }}>
                    {hash}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="btn-secondary"
                    style={{ padding: "6px 10px", fontSize: "0.75rem", flexShrink: 0 }}
                  >
                    {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Stellar Explorer Button */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: "0.875rem" }}
                >
                  View Transaction on Explorer <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 6: FAILURE STATE */
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
                  Transaction Failed
                </span>
                <button
                  onClick={onDismiss}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Dismiss
                </button>
              </div>

              <h3 className="heading-font" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "#fca5a5" }}>
                Payment Could Not Be Completed
              </h3>

              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "16px", lineHeight: 1.5 }}>
                {error || "An unexpected error occurred while processing the transaction."}
              </p>

              {/* Technical Details Accordion */}
              {rawError && (
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
                    <span>Technical Debug Info</span>
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
                      {typeof rawError === "object" ? JSON.stringify(rawError, null, 2) : String(rawError)}
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
