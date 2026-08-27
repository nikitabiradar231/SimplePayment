import React from "react";
import { History, ExternalLink, ArrowUpRight } from "lucide-react";
import { STELLAR_EXPERT_TESTNET_URL } from "../services/stellar";

export default function TransactionHistory({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: "28px", marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <History size={20} color="#818cf8" />
        <h3 className="heading-font" style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
          Recent Session Activity
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {transactions.map((tx, idx) => (
          <div
            key={tx.hash || idx}
            style={{
              background: "rgba(13, 16, 32, 0.6)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "14px 16px",
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ArrowUpRight size={18} color="#34d399" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Sent {tx.amount} XLM
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  To: <span className="mono-font">{tx.recipient.slice(0, 8)}...{tx.recipient.slice(-6)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {tx.timestamp}
              </span>
              <a
                href={`${STELLAR_EXPERT_TESTNET_URL}/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: "6px 10px", fontSize: "0.75rem", display: "inline-flex", gap: "4px" }}
              >
                Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
