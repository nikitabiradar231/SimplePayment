#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, Address, Env,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidAmount = 1,
    SameSenderRecipient = 2,
    ContractPaused = 3,
    Unauthorized = 4,
    AlreadyInitialized = 5,
}

// Client interface for Inter-Contract Communication with Secondary AuditLogger Contract
#[soroban_sdk::contractclient(name = "AuditLoggerClient")]
pub trait AuditLoggerInterface {
    fn log_audit(env: Env, sender: Address, recipient: Address, amount: i128) -> u32;
}

#[contract]
pub struct PaymentTrackerContract;

#[contractimpl]
impl PaymentTrackerContract {
    /// Initializes contract admin and optional secondary audit contract address.
    pub fn initialize(env: Env, admin: Address, audit_contract: Option<Address>) -> Result<bool, Error> {
        if env.storage().instance().has(&symbol_short!("admin")) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        if let Some(audit_addr) = audit_contract {
            env.storage().instance().set(&symbol_short!("audit_c"), &audit_addr);
        }
        env.storage().instance().set(&symbol_short!("paused"), &false);
        Ok(true)
    }

    /// Updates secondary audit logger contract address (Admin only).
    pub fn set_audit_contract(env: Env, admin: Address, audit_contract: Address) -> Result<bool, Error> {
        admin.require_auth();
        Self::verify_admin(&env, &admin)?;
        env.storage().instance().set(&symbol_short!("audit_c"), &audit_contract);
        Ok(true)
    }

    /// Toggles contract pause state (Admin only).
    pub fn set_pause(env: Env, admin: Address, paused: bool) -> Result<bool, Error> {
        admin.require_auth();
        Self::verify_admin(&env, &admin)?;
        env.storage().instance().set(&symbol_short!("paused"), &paused);
        Ok(true)
    }

    /// Records payment, performs validations, calls secondary AuditLogger contract, updates state & emits events.
    pub fn record_payment(env: Env, sender: Address, recipient: Address, amount: i128) -> Result<bool, Error> {
        // 1. Validation: Check pause state
        let paused: bool = env.storage().instance().get(&symbol_short!("paused")).unwrap_or(false);
        if paused {
            return Err(Error::ContractPaused);
        }

        // 2. Validation: Check positive payment amount
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // 3. Validation: Check sender != recipient
        if sender == recipient {
            return Err(Error::SameSenderRecipient);
        }

        // 4. Authenticate sender signature
        sender.require_auth();

        // 5. Update total payment count
        let count: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        let new_count = count.saturating_add(1);
        env.storage().instance().set(&symbol_short!("count"), &new_count);

        // 6. Update total payment volume in stroops
        let volume: i128 = env.storage().instance().get(&symbol_short!("volume")).unwrap_or(0);
        let new_volume = volume.saturating_add(amount);
        env.storage().instance().set(&symbol_short!("volume"), &new_volume);

        // 7. Inter-Contract Communication: Call secondary AuditLogger Contract B if set
        if let Some(audit_addr) = env.storage().instance().get::<_, Address>(&symbol_short!("audit_c")) {
            let audit_client = AuditLoggerClient::new(&env, &audit_addr);
            audit_client.log_audit(&sender, &recipient, &amount);
        }

        // 8. Emit payment_recorded event on Soroban
        env.events().publish(
            (symbol_short!("payment"), sender.clone(), recipient.clone()),
            amount,
        );

        Ok(true)
    }

    /// Retrieves total payment count.
    pub fn get_payment_count(env: Env) -> u32 {
        env.storage().instance().get(&symbol_short!("count")).unwrap_or(0)
    }

    /// Retrieves total volume recorded (in stroops).
    pub fn get_total_volume(env: Env) -> i128 {
        env.storage().instance().get(&symbol_short!("volume")).unwrap_or(0)
    }

    /// Retrieves contract pause status.
    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&symbol_short!("paused")).unwrap_or(false)
    }

    /// Helper to verify stored admin address.
    fn verify_admin(env: &Env, admin: &Address) -> Result<(), Error> {
        if let Some(stored_admin) = env.storage().instance().get::<_, Address>(&symbol_short!("admin")) {
            if stored_admin != *admin {
                return Err(Error::Unauthorized);
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    // Mock implementation of AuditLoggerContract for testing inter-contract call
    #[contract]
    pub struct MockAuditLoggerContract;

    #[contractimpl]
    impl MockAuditLoggerContract {
        pub fn log_audit(env: Env, _sender: Address, _recipient: Address, _amount: i128) -> u32 {
            let count: u32 = env.storage().instance().get(&symbol_short!("aud_cnt")).unwrap_or(0);
            let new_count = count + 1;
            env.storage().instance().set(&symbol_short!("aud_cnt"), &new_count);
            new_count
        }

        pub fn get_audit_count(env: Env) -> u32 {
            env.storage().instance().get(&symbol_short!("aud_cnt")).unwrap_or(0)
        }
    }

    #[test]
    fn test_payment_count_and_inter_contract_call() {
        let env = Env::default();
        env.mock_all_auths();

        // Register Contract A (PaymentTracker) and Contract B (MockAuditLogger)
        let tracker_id = env.register_contract(None, PaymentTrackerContract);
        let audit_id = env.register_contract(None, MockAuditLoggerContract);

        let tracker_client = PaymentTrackerContractClient::new(&env, &tracker_id);
        let audit_client = MockAuditLoggerContractClient::new(&env, &audit_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        // Initialize contract with audit contract address
        assert!(tracker_client.initialize(&admin, &Some(audit_id.clone())));

        // Initial count checks
        assert_eq!(tracker_client.get_payment_count(), 0);
        assert_eq!(tracker_client.get_total_volume(), 0);
        assert_eq!(audit_client.get_audit_count(), 0);

        // Record 1st payment: 10 XLM (100,000,000 stroops)
        let res1 = tracker_client.record_payment(&sender, &recipient, &100_000_000);
        assert!(res1);
        assert_eq!(tracker_client.get_payment_count(), 1);
        assert_eq!(tracker_client.get_total_volume(), 100_000_000);
        // Verify Inter-Contract call reached Contract B!
        assert_eq!(audit_client.get_audit_count(), 1);

        // Record 2nd payment: 20 XLM (200,000,000 stroops)
        let res2 = tracker_client.record_payment(&sender, &recipient, &200_000_000);
        assert!(res2);
        assert_eq!(tracker_client.get_payment_count(), 2);
        assert_eq!(tracker_client.get_total_volume(), 300_000_000);
        assert_eq!(audit_client.get_audit_count(), 2);
    }

    #[test]
    fn test_reject_zero_amount() {
        let env = Env::default();
        env.mock_all_auths();
        let tracker_id = env.register_contract(None, PaymentTrackerContract);
        let client = PaymentTrackerContractClient::new(&env, &tracker_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let res = client.try_record_payment(&sender, &recipient, &0);
        assert!(res.is_err());
    }

    #[test]
    fn test_reject_same_sender_recipient() {
        let env = Env::default();
        env.mock_all_auths();
        let tracker_id = env.register_contract(None, PaymentTrackerContract);
        let client = PaymentTrackerContractClient::new(&env, &tracker_id);

        let sender = Address::generate(&env);

        let res = client.try_record_payment(&sender, &sender, &10_000_000);
        assert!(res.is_err());
    }

    #[test]
    fn test_pause_contract_blocks_payments() {
        let env = Env::default();
        env.mock_all_auths();
        let tracker_id = env.register_contract(None, PaymentTrackerContract);
        let client = PaymentTrackerContractClient::new(&env, &tracker_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        assert!(client.initialize(&admin, &None));
        assert!(!client.is_paused());

        // Admin pauses contract
        assert!(client.set_pause(&admin, &true));
        assert!(client.is_paused());

        // Attempt payment while paused should return error
        let res = client.try_record_payment(&sender, &recipient, &10_000_000);
        assert!(res.is_err());
    }

    #[test]
    fn test_admin_authorization_and_unauthorized_reject() {
        let env = Env::default();
        env.mock_all_auths();
        let tracker_id = env.register_contract(None, PaymentTrackerContract);
        let client = PaymentTrackerContractClient::new(&env, &tracker_id);

        let admin = Address::generate(&env);
        let stranger = Address::generate(&env);
        let audit_addr = Address::generate(&env);

        // Initialize contract
        assert!(client.initialize(&admin, &None));

        // Re-initialization attempt should fail with error
        let re_init = client.try_initialize(&stranger, &None);
        assert!(re_init.is_err());

        // Non-admin attempting to set pause state should fail
        let pause_res = client.try_set_pause(&stranger, &true);
        assert!(pause_res.is_err());

        // Admin setting pause succeeds
        assert!(client.set_pause(&admin, &true));

        // Admin configuring audit contract succeeds
        assert!(client.set_audit_contract(&admin, &audit_addr));
    }
}

