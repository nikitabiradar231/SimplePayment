import React, { useState, useEffect } from "react";
import { Send, ArrowUpRight, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { isValidStellarAddress } from "../services/stellar";

export default function SendPaymentForm({
  senderAddress,
  currentBalance,
  onSendPayment,
  isSubmitting,
  statusMessage,
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    const numAmount = parseFloat(amount);
    const balanceNum = parseFloat(currentBalance || "0");

    if (touched.recipient) {
      if (!recipient.trim()) {
        newErrors.recipient = "Recipient Stellar address is required.";
      } else if (!isValidStellarAddress(recipient.trim())) {
        newErrors.recipient = "Invalid Stellar public address (must start with 'G' and be 56 chars).";
      } else if (senderAddress && recipient.trim() === senderAddress.trim()) {
        newErrors.recipient = "Recipient cannot be your own wallet address.";
      }
    }

    if (touched.amount) {
      if (!amount) {
        newErrors.amount = "XLM amount is required.";
      } else if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = "Amount must be a positive number greater than 0.";
      } else if (numAmount > balanceNum) {
        newErrors.amount = `Insufficient funds. Your available balance is ${balanceNum} XLM.`;
      }
    }

    setErrors(newErrors);
  }, [recipient, amount, senderAddress, currentBalance, touched]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSetMax = () => {
    const balanceNum = parseFloat(currentBalance || "0");
    // Leave 0.001 XLM for standard transaction base fee
    const maxAmount = Math.max(0, balanceNum - 0.01).toFixed(4);
    setAmount(maxAmount.toString());
    setTouched((prev) => ({ ...prev, amount: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ recipient: true, amount: true });

    const cleanRecipient = recipient.trim();
    const numAmount = parseFloat(amount);
    const balanceNum = parseFloat(currentBalance || "0");

    if (!cleanRecipient || !isValidStellarAddress(cleanRecipient)) return;
    if (cleanRecipient === senderAddress) return;
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > balanceNum) return;

    onSendPayment({
      recipientAddress: cleanRecipient,
      amount: numAmount,
    });
  };

  const isValid =
    recipient.trim() &&
    isValidStellarAddress(recipient.trim()) &&
    recipient.trim() !== senderAddress &&
    amount &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(currentBalance || "0");

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <ArrowUpRight size={20} color="#38bdf8" />
        </div>
        <div>
          <h3 className="heading-font" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
            Send XLM Payment
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            Transfer native XLM on Stellar Testnet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Recipient Stellar Address Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="recipient-address">
            <span>Recipient Stellar Address</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Starts with 'G'</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="recipient-address"
              type="text"
              className={`form-input mono-font ${errors.recipient ? "is-invalid" : ""}`}
              placeholder="e.g. GABC1234567890..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onBlur={() => handleBlur("recipient")}
              disabled={isSubmitting}
              aria-label="Recipient Stellar Address"
              aria-invalid={Boolean(errors.recipient)}
              aria-describedby={errors.recipient ? "recipient-error" : undefined}
              style={{ fontSize: "0.875rem", paddingRight: "40px" }}
            />
            {touched.recipient && !errors.recipient && recipient.trim() && (
              <CheckCircle2
                size={18}
                color="#34d399"
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
            )}
          </div>
          {errors.recipient && (
            <div id="recipient-error" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#fca5a5" }}>
              <AlertCircle size={14} color="#ef4444" />
              <span>{errors.recipient}</span>
            </div>
          )}
        </div>

        {/* XLM Amount Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="xlm-amount">
            <span>XLM Amount</span>
            <button
              type="button"
              onClick={handleSetMax}
              style={{ background: "none", border: "none", color: "#818cf8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              aria-label="Set maximum XLM amount"
            >
              Use Max
            </button>
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="xlm-amount"
              type="number"
              step="any"
              min="0.0000001"
              className={`form-input ${errors.amount ? "is-invalid" : ""}`}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => handleBlur("amount")}
              disabled={isSubmitting}
              aria-label="XLM Amount"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "amount-error" : undefined}
              style={{ fontSize: "1.1rem", fontWeight: 600, paddingRight: "70px" }}
            />
            <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#a5b4fc", fontSize: "0.9rem" }}>
              XLM
            </span>
          </div>
          {errors.amount && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#fca5a5" }}>
              <AlertCircle size={14} color="#ef4444" />
              <span>{errors.amount}</span>
            </div>
          )}
        </div>

        {/* Base Fee Info Note */}
        <div style={{
          background: "rgba(13, 16, 32, 0.5)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          border: "1px solid var(--border-subtle)"
        }}>
          <span>Estimated Network Fee:</span>
          <span className="mono-font" style={{ color: "#a5b4fc" }}>0.00001 XLM (100 stroops)</span>
        </div>

        {/* Processing status text */}
        {isSubmitting && statusMessage && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.875rem",
            color: "#a5b4fc"
          }}>
            <span className="pulse-dot"></span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "4px" }}
        >
          {isSubmitting ? (
            <>
              <span className="pulse-dot" style={{ backgroundColor: "#ffffff" }}></span>
              Processing Transaction...
            </>
          ) : (
            <>
              <Send size={18} />
              Send XLM Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
}
