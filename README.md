# 💸 StellarFund — Decentralized Crowdfunding DApp

A complete end-to-end crowdfunding dApp built on the Stellar blockchain for the Orange Belt (Level 3) of the Stellar Dev Workshop.

🌐 **Live Demo:** *https://stellarfund.netlify.app*

---

## ✨ Features

- Multi-wallet support via Freighter browser extension
- Create crowdfunding campaigns with title, description, goal (XLM), and deadline
- Donate XLM with 3-step confirmation flow (Input → Confirm → Success)
- Real-time progress bars with milestone markers at 25 / 50 / 75 / 100%
- Live activity feed — scrollable donation history with time-ago and TX hash
- Smart caching — results load instantly from localStorage (30s TTL)
- Per-card loading overlays and modal spinners during async operations
- Toast notifications — auto-dismissing success/error feedback
- Prevents duplicate submissions — enforced by smart contract
- 3 error types handled: already donated, invalid amount, network rejection
- 42 passing tests across 4 test suites
- Soroban smart contract deployed on Stellar Testnet

---

## 🛠️ Tech Stack

- React + Vite + TypeScript
- Stellar SDK (@stellar/stellar-sdk)
- Freighter API (@stellar/freighter-api)
- Soroban Smart Contract (Rust)
- Vitest + Testing Library for testing
- Netlify for deployment

---

## 📋 Setup Instructions

1. Clone the repo:
```
git clone https://github.com/ggdeshmukh12107-droid/Stellar-DApp.git
cd Stellar-DApp
```

2. Install dependencies:
```
npm install
```

3. Run locally:
```
npm run dev
```

4. Run tests:
```
npm test
```

5. Install Freighter from https://freighter.app and switch to Testnet

6. Fund your wallet at https://friendbot.stellar.org

7. Open http://localhost:5173 and start a campaign!

---

## 🧪 Tests

42 tests passing across 4 test suites:

- **TTL Cache** (10 tests) — verifies localStorage cache logic and TTL expiry
- **Stellar Utilities** (15 tests) — transaction helpers, formatting, mock ledger
- **ProgressBar Component** (7 tests) — milestone markers and animated fill
- **CampaignCard Component** (10 tests) — donation flow and UI states

### Test Output Screenshot
> 📸 *Screenshot of test output goes here*

---

## 📦 Smart Contract

**Contract Address:**
```
CDEPLOY_YOUR_CONTRACT_ADDRESS_ON_STELLAR_TESTNET
```

**View on Stellar Expert:**
https://stellar.expert/explorer/testnet/contract/CDEPLOY_YOUR_CONTRACT_ADDRESS_ON_STELLAR_TESTNET

**Contract Functions:**
- `create_campaign(id, creator, title, goal, deadline)` — Create a new crowdfunding campaign
- `donate(campaign_id, donor, amount)` — Donate XLM (in stroops) to a campaign
- `get_campaign(campaign_id)` — Returns full campaign details
- `get_all_campaigns()` — Returns all campaign IDs
- `get_raised(campaign_id)` — Returns total amount raised for a campaign

---

## 🚨 Error Handling

| Error | Trigger | Message |
|---|---|---|
| Already Donated | Same wallet donates to closed campaign | "Campaign is no longer active." |
| Invalid Amount | Amount is zero or negative | "Amount must be positive." |
| Network Rejection | Insufficient balance or tx failure | "Network rejected the transaction." |

---

## 💳 Supported Wallets

| Wallet | Status |
|---|---|
| Freighter | ✅ Supported |

---

## 📸 Screenshots

### Wallet Connection & Hero
<img width="1024" alt="Hero screen with Connect Wallet button" src="public/screenshots/01-hero.png" />

### Connected — Testnet Badge
<img width="1024" alt="Header showing TESTNET badge and wallet address after connecting Freighter" src="public/screenshots/02-connected.png" />

### Campaign Grid & Progress Bars
<img width="1024" alt="Active campaigns grid with real-time progress bars" src="public/screenshots/03-campaigns.png" />

### Donate Modal
<img width="720" alt="Donate XLM modal with amount selection and custom input" src="public/screenshots/04-donate-modal.png" />

### Freighter Signing Popup
<img width="720" alt="Freighter wallet popup asking to confirm the transaction with memo" src="public/screenshots/05-freighter-popup.png" />

### Donation Success ✅
<img width="720" alt="Thank you screen confirming 10.00 XLM donation to Community Hackathon was successful" src="public/screenshots/06-success.png" />



## 🎥 Demo Video

> 📹 <video controls src="level-3 - Google Chrome 2026-03-09 12-06-33.mp4" title="Title"></video>

---

## 🔗 Links

- 🌐 Live App: *https://stellarfund.netlify.app*
- 📜 Contract: https://stellar.expert/explorer/testnet/contract/CDEPLOY_YOUR_CONTRACT_ADDRESS_ON_STELLAR_TESTNET
- 💧 Testnet Faucet: https://friendbot.stellar.org
