#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: String,
    pub creator: Address,
    pub title: String,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Campaign(String),
    Campaigns,
    Donations(String),
}

#[contract]
pub struct StellarFundContract;

#[contractimpl]
impl StellarFundContract {
    /// Create a new crowdfunding campaign
    pub fn create_campaign(
        env: Env,
        id: String,
        creator: Address,
        title: String,
        goal: i128,
        deadline: u64,
    ) -> Campaign {
        creator.require_auth();
        let campaign = Campaign {
            id: id.clone(),
            creator,
            title,
            goal,
            raised: 0,
            deadline,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Campaign(id.clone()), &campaign);

        let mut campaigns: Vec<String> = env
            .storage()
            .persistent()
            .get(&DataKey::Campaigns)
            .unwrap_or(Vec::new(&env));
        campaigns.push_back(id);
        env.storage().persistent().set(&DataKey::Campaigns, &campaigns);

        campaign
    }

    /// Donate XLM (in stroops) to a campaign
    pub fn donate(env: Env, campaign_id: String, donor: Address, amount: i128) {
        donor.require_auth();
        assert!(amount > 0, "Amount must be positive");

        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id.clone()))
            .expect("Campaign not found");

        assert!(campaign.active, "Campaign is no longer active");
        assert!(
            env.ledger().timestamp() < campaign.deadline,
            "Campaign has ended"
        );

        campaign.raised += amount;
        if campaign.raised >= campaign.goal {
            campaign.active = false;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id.clone()), &campaign);

        let mut donations: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::Donations(campaign_id.clone()))
            .unwrap_or(Map::new(&env));
        let prev = donations.get(donor.clone()).unwrap_or(0);
        donations.set(donor, prev + amount);
        env.storage()
            .persistent()
            .set(&DataKey::Donations(campaign_id), &donations);
    }

    /// Get campaign details by ID
    pub fn get_campaign(env: Env, campaign_id: String) -> Campaign {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found")
    }

    /// Get all campaign IDs
    pub fn get_all_campaigns(env: Env) -> Vec<String> {
        env.storage()
            .persistent()
            .get(&DataKey::Campaigns)
            .unwrap_or(Vec::new(&env))
    }

    /// Get total raised for a campaign
    pub fn get_raised(env: Env, campaign_id: String) -> i128 {
        let campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");
        campaign.raised
    }
}
