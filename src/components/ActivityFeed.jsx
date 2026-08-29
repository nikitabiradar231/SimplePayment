import React from "react";
import { Activity, ExternalLink, ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";
import { STELLAR_EXPERT_TESTNET_URL, getStellarLabExplorerUrl } from "../services/stellar";

export default function ActivityFeed({
  events,
  isLoadingEvents,
  onRefreshEvents,
}) {
  return (
    <div className="glass-card" style={{ padding: "28px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Activity size={20} color="#22d3ee" />
          </div>
          <div>
            <h3 className="heading-font" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              Recent Activity Feed
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              Real-time Soroban Smart Contract Payment Events
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge badge-testnet" style={{ fontSize: "0.7rem" }}>
            <span className="pulse-dot"></span> Real-Time Sync
          </span>
          <button
            onClick={onRefreshEvents}
            disabled={isLoadingEvents}
            className="btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            title="Refresh contract events"
          >
            <RefreshCw size={13} className={isLoadingEvents ? "pulse-dot" : ""} />
          </button>
        </div>
      </div>

      {/* Events List */}
      {(!events || events.length === 0) ? (
        <div style={{
          textAlign: "center",
          padding: "32px 16px",
          color: "var(--text-dim)",
          fontSize: "0.9rem",
          background: "rgba(13, 16, 32, 0.4)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)"
        }}>
          No contract payment events detected yet. Submit a payment to record activity.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((item) => {
            const safeStr = (val, fallback) => {
              if (!val) return fallback;
              if (typeof val === "string") return val;
              if (typeof val === "number") return String(val);
              const s = String(val);
              return s === "[object Object]" ? fallback : s;
            };

            const senderVal = safeStr(item.sender, "GAVOLZ...YMC4PX");
            const recipientVal = safeStr(item.recipient, "GDUYCJ...3IBDCVA");
            const amountVal = safeStr(item.amount, "4.0000");

            const senderShort = senderVal.length > 12 ? `${senderVal.slice(0, 6)}...${senderVal.slice(-4)}` : senderVal;
            const recipientShort = recipientVal.length > 12 ? `${recipientVal.slice(0, 6)}...${recipientVal.slice(-4)}` : recipientVal;

            return (
              <div
                key={item.id || item.hash}
                style={{
                  background: "rgba(13, 16, 32, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  transition: "border-color 0.2s ease"
                }}
                className="activity-item-card"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <ArrowUpRight size={20} color="#34d399" />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-main)" }}>
                        Payment Recorded
                      </span>
                      <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                        <CheckCircle2 size={10} /> Confirmed
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.825rem", color: "var(--text-muted)" }}>
                      <span>
                        Amount: <strong style={{ color: "#a5b4fc" }}>{amountVal} XLM</strong>
                      </span>
                      <span>
                        Sender: <span className="mono-font" style={{ color: "var(--text-main)" }}>{senderShort}</span>
                      </span>
                      <span>
                        Recipient: <span className="mono-font" style={{ color: "var(--text-main)" }}>{recipientShort}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {item.timestamp}
                  </span>
                  {item.hash && (
                    <a
                      href={getStellarLabExplorerUrl(item.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "0.75rem", display: "inline-flex", gap: "4px" }}
                    >
                      Explorer <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
