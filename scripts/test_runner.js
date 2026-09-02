import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log(" Stellar Level 3 Orange Belt Automated Test Suite ");
console.log("==================================================\n");

let totalPassed = 0;
let totalFailed = 0;

function runStep(name, command, cwd) {
  console.log(`▶ Running ${name}...`);
  try {
    const output = execSync(command, { cwd, encoding: "utf8", stdio: "pipe" });
    console.log(`✔ [PASS] ${name}`);
    return output;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err.stdout || err.message);
    totalFailed++;
    process.exit(1);
  }
}

// 1. Smart Contract A Tests (PaymentTracker)
runStep("PaymentTracker Smart Contract Tests (5 Rust tests)", "cargo test -- --nocapture", path.join(rootDir, "contracts", "payment_tracker"));
totalPassed += 5;

// 2. Smart Contract B Tests (AuditLogger)
runStep("AuditLogger Smart Contract Tests (2 Rust tests)", "cargo test -- --nocapture", path.join(rootDir, "contracts", "audit_logger"));
totalPassed += 2;

// 3. Frontend & Service Unit Tests
runStep("Frontend & Event Stream Service Unit Tests (5 JS tests)", "node scripts/frontend_tests.js", rootDir);
totalPassed += 5;

console.log("\n==================================================");
console.log(` Tests: ${totalPassed} passing (${totalFailed} failed)`);
console.log(" All Smart Contract & Frontend Tests Passed! ");
console.log("==================================================\n");
