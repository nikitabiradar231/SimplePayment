/**
 * StellarPay Soroban Smart Contract Deployment Guide & Automation Script
 *
 * Requirements:
 * - Rust & soroban-cli (or stellar-cli) installed locally
 * - Node.js v18+
 *
 * NOTE: This script displays instructions and executes pre-deployment checks.
 * It will NOT automatically deploy without an explicitly configured secret identity.
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("  Stellar Soroban Deployment Guide & Helper Tool  ");
console.log("==================================================\n");

console.log("📋 Step 1: Building WebAssembly (WASM) Smart Contracts...\n");

try {
  console.log("  Building Contract A: PaymentTracker...");
  execSync("cargo build --target wasm32-unknown-unknown --release", {
    cwd: path.join(rootDir, "contracts", "payment_tracker"),
    stdio: "inherit",
  });
  console.log("  ✓ PaymentTracker WASM built successfully.\n");

  console.log("  Building Contract B: AuditLogger...");
  execSync("cargo build --target wasm32-unknown-unknown --release", {
    cwd: path.join(rootDir, "contracts", "audit_logger"),
    stdio: "inherit",
  });
  console.log("  ✓ AuditLogger WASM built successfully.\n");
} catch (err) {
  console.error("  ❌ WASM compilation failed:", err.message);
  process.exit(1);
}

console.log("==================================================");
console.log("📋 Step 2: Deployment Commands (Stellar CLI)");
console.log("==================================================\n");
console.log("To deploy to Stellar Testnet manually using Stellar CLI, execute:\n");
console.log("1. Add Testnet Network:");
console.log(
  '   stellar network add --global testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"\n'
);
console.log("2. Generate Deployer Account:");
console.log("   stellar keys generate --global deployer --network testnet\n");
console.log("3. Deploy AuditLogger Contract B:");
console.log(
  "   stellar contract deploy --wasm contracts/audit_logger/target/wasm32-unknown-unknown/release/audit_logger_contract.wasm --source deployer --network testnet\n"
);
console.log("4. Deploy PaymentTracker Contract A:");
console.log(
  "   stellar contract deploy --wasm contracts/payment_tracker/target/wasm32-unknown-unknown/release/payment_tracker_contract.wasm --source deployer --network testnet\n"
);
console.log("5. Link Contract B to Contract A:");
console.log(
  '   stellar contract invoke --id <PAYMENT_TRACKER_ID> --source deployer --network testnet -- set_audit_contract --admin <DEPLOYER_PUBKEY> --audit_contract <AUDIT_LOGGER_ID>\n'
);
console.log("==================================================");
console.log("  ✓ WASM binaries ready for deployment!");
console.log("==================================================\n");
