# StellarPay - Stellar Level 3 Orange Belt

A production-oriented Stellar payment dApp built with React, Vite, Soroban smart contracts, and multi-wallet integration.

This project was developed as part of the **Stellar Developer Level 3 - Orange Belt** challenge.

---

## 🚀 Live Demo

**Production App:**  
https://simple-payment-dapp-woad.vercel.app/

**GitHub Repository:**  
https://github.com/nikitabiradar231/SimplePayment

**Level 3 Branch:**  
https://github.com/nikitabiradar231/SimplePayment/tree/level3

---

## 📌 Project Overview

StellarPay is a decentralized payment application built on the Stellar Testnet.

The application allows users to connect their Stellar wallet, interact with a Soroban smart contract, make payments, and receive real-time transaction and contract activity updates.

Level 3 extends the previous implementation with:

- Advanced Soroban smart contracts
- Inter-contract communication
- Event streaming and real-time updates
- Multi-wallet support
- Transaction progress tracking
- Robust error handling
- Loading states
- Responsive mobile UI
- Smart contract tests
- Frontend tests
- CI/CD automation
- Production deployment
- Contract verification scripts
- Complete technical documentation

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │     React / Vite     │
                         │      Frontend        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Stellar Wallets Kit │
                         │                     │
                         │ Freighter           │
                         │ Albedo              │
                         │ xBull               │
                         │ Lobstr              │
                         │ Rabet               │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  PaymentTracker     │
                         │   Soroban Contract  │
                         │                     │
                         │ • Payment validation│
                         │ • Auth verification │
                         │ • Statistics        │
                         │ • Pause mechanism   │
                         └──────────┬──────────┘
                                    │
                          Cross-contract call
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    AuditLogger      │
                         │   Soroban Contract  │
                         │                     │
                         │ • Audit entries     │
                         │ • Counters          │
                         │ • Events            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Stellar Testnet     │
                         │                     │
                         │ Soroban RPC         │
                         │ Horizon             │
                         └─────────────────────┘
```

---

# 🧠 Smart Contracts

## Contract A: PaymentTracker

Location:

```text
contracts/payment_tracker/src/lib.rs
```

The `PaymentTracker` contract handles payment-related contract logic.

### Features

- Validates that payment amount is greater than zero
- Prevents self-transfers
- Supports emergency pause functionality
- Uses `require_auth()` for caller authentication
- Tracks payment count
- Tracks total payment volume
- Performs a direct cross-contract call to `AuditLogger`
- Emits contract events

### Contract Address

```text
CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777
```

### Stellar Expert

https://stellar.expert/explorer/testnet/contract/CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777

---

## Contract B: AuditLogger

Location:

```text
contracts/audit_logger/src/lib.rs
```

`AuditLogger` is responsible for recording audit information generated through the cross-contract interaction.

### Features

- Receives audit calls from `PaymentTracker`
- Maintains a global audit counter
- Maintains per-user audit indexes
- Emits audit events
- Demonstrates Soroban inter-contract communication

---

# 🔗 Inter-Contract Communication

The Level 3 implementation demonstrates real Soroban contract-to-contract communication.

The flow is:

```text
User
  │
  ▼
PaymentTracker
  │
  │ cross-contract call
  ▼
AuditLogger
  │
  ▼
Audit Event
```

After a successful payment operation, `PaymentTracker` invokes the `AuditLogger` contract so that the interaction can be recorded and audited.

This demonstrates:

- Contract composition
- Cross-contract invocation
- Authorization
- Persistent contract storage
- Event emission

---

# 📡 Event Streaming & Real-Time Updates

Event streaming is implemented in:

```text
src/services/eventStream.js
```

The frontend listens for contract activity and updates the UI without requiring a manual page refresh.

### Event system features

- Event polling/subscription
- Automatic reconnect
- Exponential backoff
- Event deduplication
- Listener cleanup
- Error recovery

The implementation uses:

```text
seenEventIds
```

to prevent duplicate event processing.

React components can subscribe to the event stream and automatically receive updated transaction and activity information.

---

# 💳 Multi-Wallet Support

Wallet integration is implemented using:

```text
@creit.tech/stellar-wallets-kit
```

Supported wallets include:

- Freighter
- Albedo
- xBull
- Lobstr
- Rabet

The wallet layer allows users to connect and sign transactions using supported Stellar wallets.

---

# 🔄 Transaction Flow

The application provides a three-step transaction progress interface.

```text
Step 1/3
Preparing Contract
       ↓
Step 2/3
Awaiting Signature
       ↓
Step 3/3
Submitting to Testnet
       ↓
Transaction Complete
```

This gives the user clear feedback during blockchain operations.

---

# ⚠️ Error Handling

Centralized error handling is implemented in:

```text
src/utils/errors.js
```

The application handles common wallet and transaction failures such as:

- Wallet not found
- Wallet connection failure
- User rejected transaction
- Insufficient balance
- Transaction failure
- RPC errors
- Network errors
- Contract errors
- Event streaming errors

The UI displays user-friendly error messages instead of exposing raw blockchain errors whenever possible.

---

# 📱 Mobile Responsive Frontend

The frontend has been tested across multiple screen sizes:

```text
320px
375px
390px
768px
Desktop
```

The interface adapts to smaller screens while maintaining:

- Wallet controls
- Payment form
- Transaction status
- Activity feed
- Contract interaction
- Navigation

### Mobile Screenshot

![Mobile Responsive UI](docs/screenshots/level3-01-mobile-responsive.png)

---

# 🧪 Testing

The project includes both smart contract and frontend tests.

## Test Structure

```text
PaymentTracker Tests
        ↓
AuditLogger Tests
        ↓
Frontend / Event Stream Tests
        ↓
12 Total Tests
```

### Current Test Result

```text
12/12 tests passing
0 failed
```

### Test Breakdown

| Test Area | Tests |
|---|---:|
| PaymentTracker | 5 |
| AuditLogger | 2 |
| Frontend / Event Stream | 5 |
| **Total** | **12** |

---

## Run Tests

Unified test command:

```bash
npm test
```

The test runner executes the required project tests and reports the final result.

---

# 🏗️ Production Build

The project uses Vite for the production frontend build.

Run:

```bash
npm run build
```

A successful build generates the production bundle.

---

# 💻 Local Development

## 1. Clone Repository

```bash
git clone https://github.com/nikitabiradar231/SimplePayment.git
cd SimplePayment
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

The application will be available through the local Vite development server.

---

# ⚙️ Environment Configuration

Create a `.env` file in the project root.

Example:

```env
VITE_STELLAR_NETWORK=testnet
VITE_SOROBAN_RPC_URL=<SOROBAN_RPC_URL>
VITE_HORIZON_URL=<HORIZON_URL>
VITE_PAYMENT_TRACKER_CONTRACT=<PAYMENT_TRACKER_CONTRACT_ID>
VITE_AUDIT_LOGGER_CONTRACT=<AUDIT_LOGGER_CONTRACT_ID>
```

> Never commit private keys, secret phrases, wallet credentials, or other sensitive information to GitHub.

---

# 🔐 Security Considerations

The smart contracts implement several safety checks.

### Authorization

Sensitive contract functions use:

```rust
sender.require_auth();
```

### Amount Validation

Payments must use a valid positive amount.

### Self-Transfer Prevention

The contract prevents users from transferring funds to themselves where applicable.

### Emergency Pause

The payment contract supports a pause mechanism for emergency situations.

### Secrets

No private keys or wallet secrets are stored in the repository.

---

# 🔁 CI/CD Pipeline

GitHub Actions is configured in:

```text
.github/workflows/ci.yml
```

The workflow automatically performs project validation when code is pushed or a pull request is created.

### Pipeline Steps

```text
Push / Pull Request
        ↓
Checkout Repository
        ↓
Setup Node.js
        ↓
Setup Rust
        ↓
Install Dependencies
        ↓
Run Tests
        ↓
Production Build
        ↓
Pipeline Result
```

The workflow helps ensure that changes do not break the application before deployment.

### CI/CD Screenshot

![CI Pipeline](docs/screenshots/level3-02-ci-pipeline.png)

---

# 🚀 Smart Contract Deployment

Deployment helper:

```text
scripts/deploy_contract.js
```

This provides a reproducible deployment workflow for the Soroban contracts.

The deployment process includes:

```text
Build Contract
      ↓
Deploy Contract
      ↓
Obtain Contract ID
      ↓
Verify Deployment
      ↓
Update Frontend Configuration
```

---

# 🔍 Contract Verification

Verification script:

```text
scripts/verify_contract.js
```

The script can be used to verify that the deployed contract is reachable and correctly configured against the Stellar Testnet environment.

---

# 📊 Verified Transaction

A verified Stellar Testnet transaction used for the Level 3 submission:

```text
f60c716c280d43fe60a7fd0dd2de7b90bc27544d42ddc9b9945fe4eef191c629
```

### Stellar Expert Transaction

https://stellar.expert/explorer/testnet/tx/f60c716c280d43fe60a7fd0dd2de7b90bc27544d42ddc9b9945fe4eef191c629

---

# 📸 Test Output Screenshot

![Test Output](docs/screenshots/level3-03-test-output.png)

---

# 🎥 Demo Video

The project demonstration video is available here:

https://drive.google.com/file/d/1xU9HwvpHoJfxOdUfj9fT9PHKBLRsW8Qz/view?usp=drivesdk

> Make sure the Google Drive sharing permission is set to **Anyone with the link → Viewer** before submission.

---

# 📁 Project Structure

```text
SimplePayment/
│
├── contracts/
│   ├── payment_tracker/
│   │   └── src/
│   │       └── lib.rs
│   │
│   └── audit_logger/
│       └── src/
│           └── lib.rs
│
├── src/
│   ├── services/
│   │   └── eventStream.js
│   │
│   ├── utils/
│   │   └── errors.js
│   │
│   ├── components/
│   │   ├── ActivityFeed.jsx
│   │   └── TransactionStatus.jsx
│   │
│   └── ...
│
├── scripts/
│   ├── deploy_contract.js
│   ├── verify_contract.js
│   ├── frontend_tests.js
│   └── test_runner.js
│
├── docs/
│   └── screenshots/
│       ├── level3-01-mobile-responsive.png
│       ├── level3-02-ci-pipeline.png
│       └── level3-03-test-output.png
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── LEVEL3_SUBMISSION_CHECKLIST.md
├── package.json
├── vite.config.js
└── README.md
```

---

# 📝 Level 3 Submission Checklist

| # | Requirement | Status |
|---:|---|:---:|
| 1 | Advanced Soroban smart contract | ✅ |
| 2 | Inter-contract communication | ✅ |
| 3 | Event streaming | ✅ |
| 4 | Real-time frontend updates | ✅ |
| 5 | Multi-wallet integration | ✅ |
| 6 | Transaction progress states | ✅ |
| 7 | Error handling | ✅ |
| 8 | Loading states | ✅ |
| 9 | Mobile responsive frontend | ✅ |
| 10 | Smart contract tests | ✅ |
| 11 | Frontend tests | ✅ |
| 12 | 12/12 tests passing | ✅ |
| 13 | CI/CD workflow | ✅ |
| 14 | Production build | ✅ |
| 15 | Contract deployment | ✅ |
| 16 | Contract verification script | ✅ |
| 17 | Public GitHub repository | ✅ |
| 18 | 10+ meaningful commits | ✅ |
| 19 | Live deployment | ✅ |
| 20 | Screenshots and demo video | ✅ |

---

# 🌐 Important Links

### Live Application

https://simple-payment-dapp-woad.vercel.app/

### GitHub

https://github.com/nikitabiradar231/SimplePayment

### Level 3 Branch

https://github.com/nikitabiradar231/SimplePayment/tree/level3

### PaymentTracker Contract

https://stellar.expert/explorer/testnet/contract/CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777

### Verified Transaction

https://stellar.expert/explorer/testnet/tx/f60c716c280d43fe60a7fd0dd2de7b90bc27544d42ddc9b9945fe4eef191c629

### Demo Video

https://drive.google.com/file/d/1xU9HwvpHoJfxOdUfj9fT9PHKBLRsW8Qz/view?usp=drivesdk

---

# 🏆 Level 3 - Orange Belt

This project demonstrates the transition from a basic Stellar payment application to a more complete dApp architecture with:

- Advanced Soroban smart contracts
- Contract-to-contract communication
- Event-driven updates
- Multi-wallet support
- Automated testing
- CI/CD
- Responsive UI
- Production deployment
- Contract verification
- Technical documentation

Built on **Stellar Testnet** using **Soroban smart contracts**.

---

## 👨‍💻 Author

**Nikita Biradar**

GitHub: https://github.com/nikitabiradar231
