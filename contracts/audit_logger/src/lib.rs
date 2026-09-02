#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct AuditLoggerContract;

#[contractimpl]
impl AuditLoggerContract {
    /// Logs a payment audit entry called by Contract A (or direct authorized callers).
    /// Increments global audit count and user-specific audit count.
    /// Emits `audit` event on Soroban.
    pub fn log_audit(env: Env, sender: Address, recipient: Address, amount: i128) -> u32 {
        // Read current audit count from instance storage
        let count: u32 = env.storage().instance().get(&symbol_short!("aud_cnt")).unwrap_or(0);
        let new_count = count.saturating_add(1);

        // Update global count
        env.storage().instance().set(&symbol_short!("aud_cnt"), &new_count);

        // Update sender audit count
        let sender_key = (symbol_short!("user_cnt"), sender.clone());
        let sender_cnt: u32 = env.storage().persistent().get(&sender_key).unwrap_or(0);
        env.storage().persistent().set(&sender_key, &(sender_cnt.saturating_add(1)));

        // Emit audit event
        env.events().publish(
            (symbol_short!("audit"), sender.clone(), recipient.clone()),
            amount,
        );

        new_count
    }

    /// Retrieves total audit entries recorded.
    pub fn get_audit_count(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("aud_cnt")).unwrap_or(0)
    }

    /// Retrieves audit entry count for a specific user address.
    pub fn get_user_audit_count(env: Env, user: Address) -> u32 {
        let user_key = (symbol_short!("user_cnt"), user);
        env.storage().persistent().get(&user_key).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_audit_logger_standalone() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AuditLoggerContract);
        let client = AuditLoggerContractClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        assert_eq!(client.get_audit_count(), 0);
        assert_eq!(client.get_user_audit_count(&sender), 0);

        let idx1 = client.log_audit(&sender, &recipient, &5000000);
        assert_eq!(idx1, 1);
        assert_eq!(client.get_audit_count(), 1);
        assert_eq!(client.get_user_audit_count(&sender), 1);

        let idx2 = client.log_audit(&sender, &recipient, &10000000);
        assert_eq!(idx2, 2);
        assert_eq!(client.get_audit_count(), 2);
        assert_eq!(client.get_user_audit_count(&sender), 2);
    }

    #[test]
    fn test_audit_logger_per_user_counters() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AuditLoggerContract);
        let client = AuditLoggerContractClient::new(&env, &contract_id);

        let user_a = Address::generate(&env);
        let user_b = Address::generate(&env);
        let recipient = Address::generate(&env);

        // User A performs 2 audits
        client.log_audit(&user_a, &recipient, &1_000_000);
        client.log_audit(&user_a, &recipient, &2_000_000);

        // User B performs 1 audit
        client.log_audit(&user_b, &recipient, &5_000_000);

        // Verify independent user counters
        assert_eq!(client.get_audit_count(), 3);
        assert_eq!(client.get_user_audit_count(&user_a), 2);
        assert_eq!(client.get_user_audit_count(&user_b), 1);
    }
}

