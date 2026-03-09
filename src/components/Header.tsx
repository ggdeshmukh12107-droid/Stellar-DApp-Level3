import { WalletConnect } from './WalletConnect';
import type { WalletState } from '../types';

interface HeaderProps {
    walletState: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
    onCreateCampaign: () => void;
}

export function Header({ walletState, onConnect, onDisconnect, onCreateCampaign }: HeaderProps) {
    const wrongNetwork = walletState.isConnected && walletState.network !== 'testnet';

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <div className="header-logo">
                        <div className="logo-icon">✦</div>
                        <div className="logo-text">
                            <span className="logo-name">StellarFund</span>
                            <span className="logo-sub">Decentralized Crowdfunding</span>
                        </div>
                    </div>
                    <nav className="header-nav">
                        <a href="#campaigns" className="nav-link">Campaigns</a>
                        <a href="#activity" className="nav-link">Activity</a>
                        {walletState.isConnected && (
                            <button
                                id="create-campaign-btn"
                                className="btn btn-secondary btn-sm"
                                onClick={onCreateCampaign}
                            >
                                + Create
                            </button>
                        )}
                    </nav>
                    <WalletConnect
                        walletState={walletState}
                        onConnect={onConnect}
                        onDisconnect={onDisconnect}
                    />
                </div>
            </header>
            {wrongNetwork && (
                <div className="network-warning" role="alert">
                    ⚠️ <strong>Wrong Network:</strong> Freighter is on Mainnet. Open Freighter → Settings → Network → switch to <strong>Testnet</strong> to use this app.
                </div>
            )}
        </>
    );
}

export default Header;
