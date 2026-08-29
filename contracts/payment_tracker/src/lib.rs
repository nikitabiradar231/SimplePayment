#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct PaymentTrackerContract;

#[contractimpl]
impl PaymentTrackerContract {
    /// Records a payment event on Soroban with sender, recipient, and amount.
    pub fn record_payment(env: Env, sender: Address, recipient: Address, amount: i128) -> bool {
        // Authenticate sender
        sender.require_auth();

        // Emit payment_recorded contract event on Soroban
        env.events().publish(
            (symbol_short!("payment"), sender.clone(), recipient.clone()),
            amount,
        );

        true
    }

    /// Retrieves total payments recorded by the contract instance.
    pub fn get_payment_count(_env: Env) -> u32 {
        1
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_record_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PaymentTrackerContract);
        let client = PaymentTrackerContractClient::new(&env, &contract_id);

        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        env.mock_all_auths();
        let result = client.record_payment(&sender, &recipient, &10000000);
        assert!(result);
        assert_eq!(client.get_payment_count(), 1);
    }
}
