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
<img width="1497" height="797" alt="Screenshot 2026-03-08 191542" src="https://github.com/user-attachments/assets/f90b6185-dcbc-4c98-9f7d-e779d5d0c5b8" />

### Connected — Testnet Badge
<img width="1525" height="885" alt="Screenshot 2026-03-08 191608" src="https://github.com/user-attachments/assets/4db92909-c6fc-4dc5-862f-6c6802b8e080" />

### Campaign Grid & Progress Bars
<img width="730" height="606" alt="Screenshot 2026-03-08 191902" src="https://github.com/user-attachments/assets/369e0c35-4a11-419b-98e9-e238115a86c5" />

### Donate Modal
<img width="643" height="413" alt="Screenshot 2026-03-08 191923 - Copy" src="https://github.com/user-attachments/assets/24046d4d-395e-4e12-933e-ed8772b80066" />

### Freighter Signing Popup
<img width="1294" height="1006" alt="Screenshot 2026-03-08 192113" src="https://github.com/user-attachments/assets/fb5b6974-a146-4151-bde4-d4e827a2a9bb" />

### Donation Success ✅
<img width="775" height="673" alt="Screenshot 2026-03-08 192140" src="https://github.com/user-attachments/assets/4bd31693-011e-40b6-9871-8e79a7a9bfda" />



## 🎥 Demo Video

> 📹 <video controls src="level-3 - Google Chrome 2026-03-09 12-06-33.mp4" title="Title"></video>

---

## 🔗 Links

- 🌐 Live App: *https://stellarfund.netlify.app*
- 📜 Contract: https://stellar.expert/explorer/testnet/contract/CDEPLOY_YOUR_CONTRACT_ADDRESS_ON_STELLAR_TESTNET
- 💧 Testnet Faucet: https://friendbot.stellar.org
