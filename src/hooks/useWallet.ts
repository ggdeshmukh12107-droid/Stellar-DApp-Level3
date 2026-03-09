import { useState, useCallback } from 'react';
import {
    requestAccess,
    getAddress,
    getNetwork,
    signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import type { WalletState } from '../types';

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

const initialState: WalletState = {
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: false,
    error: null,
};

export function useWallet() {
    const [walletState, setWalletState] = useState<WalletState>(initialState);

    const connect = useCallback(async () => {
        setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Directly call requestAccess — this opens the Freighter popup
            // and works even when isConnected() gives a false negative on localhost.
            // If the extension is not installed at all, it will throw/return an error.
            let address = '';

            // First try silent getAddress (works if site already approved)
            const silent = await getAddress();
            if (silent.address && !silent.error) {
                address = silent.address;
            } else {
                // No address yet — open the Freighter approval popup
                const access = await requestAccess();
                if (access.error) {
                    throw new Error(String(access.error));
                }
                address = access.address;
            }

            if (!address) {
                throw new Error(
                    'Freighter returned an empty address. ' +
                    'Please make sure your wallet is unlocked and try again.'
                );
            }

            // Get network details
            const netResult = await getNetwork();
            const networkPassphrase = netResult.networkPassphrase || '';
            const network = networkPassphrase === TESTNET_PASSPHRASE ? 'testnet' : 'mainnet';

            // ⛔ Block mainnet — this app is Testnet only
            if (network !== 'testnet') {
                throw new Error('WRONG_NETWORK');
            }

            setWalletState({
                isConnected: true,
                publicKey: address,
                network,
                isLoading: false,
                error: null,
            });
        } catch (err) {
            const raw = err instanceof Error ? err.message : String(err);
            let message = raw;

            if (/reject|denied|cancel|User declined/i.test(raw)) {
                message = 'Connection rejected. Please approve the connection in Freighter and try again.';
            } else if (/WRONG_NETWORK/.test(raw)) {
                message = '⚠️ Freighter is set to Mainnet. Open Freighter → Settings → Network → switch to Testnet, then try again.';
            } else if (/locked|unlock/i.test(raw)) {
                message = 'Freighter is locked. Please open and unlock your wallet first.';
            } else if (/not installed|not found|not detected/i.test(raw)) {
                message = 'Freighter extension not found. Please install it and refresh the page.';
            } else if (/failed to fetch|network|timeout/i.test(raw)) {
                message = 'Could not communicate with Freighter. Please refresh the page and try again.';
            }

            setWalletState(prev => ({
                ...prev,
                isConnected: false,
                publicKey: null,
                network: null,
                isLoading: false,
                error: message,
            }));
        }
    }, []);

    const disconnect = useCallback(() => {
        setWalletState(initialState);
    }, []);

    const signTransaction = useCallback(
        async (xdr: string): Promise<string> => {
            if (!walletState.isConnected) throw new Error('Wallet not connected');
            // ⛔ Hard Testnet-only guard
            if (walletState.network !== 'testnet') {
                throw new Error('⚠️ Freighter is on Mainnet. Open Freighter → Settings → Network → switch to Testnet before donating.');
            }
            const result = await freighterSignTransaction(xdr, {
                networkPassphrase: TESTNET_PASSPHRASE,
            });
            if (result.error) throw new Error(String(result.error));
            // Freighter v6 returns { signedTxXdr: string } — extract it safely
            const signed =
                (result as unknown as { signedTxXdr?: string }).signedTxXdr ??
                (result as unknown as { result?: string }).result ??
                '';
            if (!signed) throw new Error('Freighter returned an empty signed transaction. Make sure Freighter is set to Testnet and has enough XLM.');
            return signed;
        },
        [walletState.isConnected, walletState.network]
    );

    return {
        ...walletState,
        connect,
        disconnect,
        signTransaction,
    };
}
