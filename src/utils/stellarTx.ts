/**
 * Stellar testnet transaction builder for donations.
 * Builds a self-payment with a memo so it appears in Freighter's history.
 */
import {
    Horizon,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    Operation,
    Asset,
    Memo,
} from '@stellar/stellar-sdk';

const TESTNET_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(TESTNET_URL);

export interface DonationTxResult {
    hash: string;
    ledger: number;
}

/**
 * Build, sign (via Freighter), and submit a real Stellar testnet donation.
 *
 * Uses a self-payment of 0.0000001 XLM with a memo recording the donation
 * so it appears in Freighter's transaction history without requiring the
 * campaign creator's account to exist on testnet.
 *
 * @param donor       Donor's Stellar public key
 * @param amount      Donation amount in XLM (recorded in memo)
 * @param campaignTitle  Campaign name (truncated to fit memo)
 * @param signTx      Freighter signTransaction callback
 */
export async function buildAndSubmitDonationTx(
    donor: string,
    amount: number,
    campaignTitle: string,
    signTx: (xdr: string) => Promise<string>
): Promise<DonationTxResult> {
    // Load donor account
    let account;
    try {
        account = await server.loadAccount(donor);
    } catch (e) {
        throw new Error(`Account not found on Stellar Testnet. Fund your wallet at https://friendbot.stellar.org — ${String(e)}`);
    }

    // Build memo using ASCII only (Stellar memo max = 28 bytes)
    const label = `${amount} XLM -> ${campaignTitle}`;
    const memoText = label.length > 28 ? label.slice(0, 28) : label;

    const tx = new TransactionBuilder(account, {
        fee: String(Number(BASE_FEE) * 10), // 10x base fee to ensure quick inclusion
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(
            Operation.payment({
                destination: donor,   // self-payment, no recipient account needed
                asset: Asset.native(),
                amount: '0.0000001',  // 1 stroop — minimal valid amount
            })
        )
        .addMemo(Memo.text(memoText))
        .setTimeout(60)
        .build();

    const xdr = tx.toXDR();
    console.log('[StellarFund] Built tx XDR, sending to Freighter for signing...');

    // Sign with Freighter
    let signedXdr: string;
    try {
        signedXdr = await signTx(xdr);
    } catch (e) {
        throw new Error(`Freighter signing failed: ${String(e)}`);
    }

    if (!signedXdr) throw new Error('Freighter returned empty XDR. Make sure Freighter is on Testnet and you approved the transaction.');
    console.log('[StellarFund] Signed XDR received, submitting to Horizon...');

    // Submit to Stellar testnet
    let result;
    try {
        const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
        result = await server.submitTransaction(signedTx);
    } catch (e: unknown) {
        // Horizon wraps errors — extract result_codes if available
        const he = e as { response?: { data?: { extras?: { result_codes?: unknown } } } };
        const codes = he?.response?.data?.extras?.result_codes;
        if (codes) {
            throw new Error(`Horizon rejected transaction: ${JSON.stringify(codes)}`);
        }
        throw new Error(`Horizon submission failed: ${String(e)}`);
    }

    console.log('[StellarFund] Transaction submitted! Hash:', result.hash);
    return {
        hash: result.hash,
        ledger: (result as unknown as { ledger: number }).ledger ?? 0,
    };
}

/**
 * Try to fund a testnet account using Friendbot (only works on testnet).
 * Silent fail — returns false if funding not needed or fails.
 */
export async function ensureFunded(publicKey: string): Promise<boolean> {
    try {
        await server.loadAccount(publicKey);
        return true; // already exists
    } catch {
        try {
            await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
            return true;
        } catch {
            return false;
        }
    }
}
