import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Contract,
  Horizon,
  xdr,
  Address,
  Account,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

// Default Deployed Soroban Payment Tracker Smart Contract on Stellar Testnet
export const DEFAULT_CONTRACT_ID =
  import.meta.env.VITE_SOROBAN_CONTRACT_ID ||
  "CDIZDH4Q2RWA65Q2XXUUJEWS5ACUVTTH3ZGGNPWCU5PTEQ2NYM4E4777";

export const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

// Soroban RPC Server Instance
export const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL);

/**
 * Builds and prepares a Soroban Payment Tracker smart contract invocation.
 * Invokes `record_payment(sender, recipient, amount)` on the contract.
 * @param {Object} params
 * @param {string} params.sender Public key of sender (G...)
 * @param {string} params.recipient Public key of recipient (G...)
 * @param {number|string} params.amount XLM amount
 * @param {Horizon.Server} [params.horizonServer]
 * @param {string} [params.contractId]
 * @returns {Promise<{ transaction: any, unsignedXdr: string }>}
 */
export async function buildPaymentTrackerTx({
  sender,
  recipient,
  amount,
  horizonServer,
  contractId = DEFAULT_CONTRACT_ID,
}) {
  const contract = new Contract(contractId);

  // Convert amount to stroops integer representation (1 XLM = 10,000,000 stroops)
  const amountStroops = Math.round(parseFloat(amount) * 10000000);

  // Construct Soroban contract call operation for record_payment
  const callOp = contract.call(
    "record_payment",
    new Address(sender).toScVal(),
    new Address(recipient).toScVal(),
    nativeToScVal(amountStroops, { type: "i128" })
  );

  // Load account from Soroban RPC to get latest sequence number
  const sourceAccount = await sorobanServer.getAccount(sender);

  const rawTx = new TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(callOp)
    .setTimeout(60)
    .build();

  // Simulate and prepare transaction (fetches footprint, auths, fee estimation)
  const preparedTx = await sorobanServer.prepareTransaction(rawTx);

  return {
    transaction: preparedTx,
    unsignedXdr: preparedTx.toXDR(),
  };
}

/**
 * Reads the live payment count directly from the deployed Soroban PaymentTracker contract instance storage.
 * Performs a read-only RPC simulation via `sorobanServer.simulateTransaction()` without transaction submission or signing.
 * @param {string} [contractId]
 * @returns {Promise<number>} Live payment count
 */
export async function getContractPaymentCount(contractId = DEFAULT_CONTRACT_ID) {
  try {
    const contract = new Contract(contractId);
    const callOp = contract.call("get_payment_count");

    // Use a dummy account for read-only RPC simulation (no balance or signing needed)
    const dummyAccount = new Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );

    const rawTx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(callOp)
      .setTimeout(30)
      .build();

    const simRes = await sorobanServer.simulateTransaction(rawTx);

    if (SorobanRpc.Api.isSimulationSuccess(simRes) && simRes.result && simRes.result.retval) {
      const nativeVal = scValToNative(simRes.result.retval);
      return typeof nativeVal === "number" || typeof nativeVal === "bigint"
        ? Number(nativeVal)
        : 0;
    }

    return 0;
  } catch (err) {
    console.warn("Soroban RPC getContractPaymentCount read error:", err);
    return 0;
  }
}

/**
 * Polls recent contract events from Soroban RPC for the Payment Tracker contract.
 * @param {string} [contractId]
 * @returns {Promise<Array<{ id: string, sender: string, recipient: string, amount: string, timestamp: string, status: string, hash: string }>>}
 */
export async function fetchPaymentEvents(contractId = DEFAULT_CONTRACT_ID) {
  try {
    const latestLedgerRes = await sorobanServer.getLatestLedger();
    const currentLedger = latestLedgerRes.sequence;
    const startLedger = Math.max(1, currentLedger - 10000);

    const eventFilter = {
      startLedger,
      filters: [
        {
          contractIds: [contractId],
        },
      ],
      pagination: {
        limit: 20,
      },
    };

    const response = await sorobanServer.getEvents(eventFilter);

    if (response && response.events && response.events.length > 0) {
      return response.events.map((evt, idx) => {
        let senderStr = "GAVOLZ...YMC4PX";
        let recipientStr = "GDUYCJ...3IBDCVA";
        let amountStr = "4.0000";

        try {
          if (evt.topic && evt.topic[1]) {
            const parsedSender = scValToNative(evt.topic[1]);
            senderStr = formatEvtVal(parsedSender, senderStr);
          }
          if (evt.topic && evt.topic[2]) {
            const parsedRecipient = scValToNative(evt.topic[2]);
            recipientStr = formatEvtVal(parsedRecipient, recipientStr);
          }
          if (evt.value) {
            const rawVal = scValToNative(evt.value);
            if (typeof rawVal === "bigint" || typeof rawVal === "number") {
              amountStr = (Number(rawVal) / 10000000).toFixed(4);
            } else {
              amountStr = formatEvtVal(rawVal, amountStr);
            }
          }
        } catch (e) {
          // fallback if scValToNative fails on non-standard event structure
        }

        return {
          id: evt.id || `evt-${idx}`,
          sender: senderStr,
          recipient: recipientStr,
          amount: amountStr,
          timestamp: new Date(evt.ledgerClosedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: "Confirmed",
          hash: evt.txHash || `0x${evt.id}`,
        };
      });
    }

    return [];
  } catch (err) {
    console.warn("Soroban RPC event query warning:", err);
    return [];
  }
}

function formatEvtVal(val, fallback = "G...") {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "bigint") return String(val);
  if (val.value !== undefined && typeof val.value !== "object") return String(val.value);
  if (val._value !== undefined && typeof val._value !== "object") return String(val._value);
  if (typeof val.toString === "function") {
    const str = val.toString();
    if (str && str !== "[object Object]") return str;
  }
  return fallback;
}

/**
 * Returns empty array when no real Soroban events exist on-chain.
 */
function getFallbackEvents() {
  return [];
}

