import { useState } from 'react';
import { Header } from './components/Header';
import { CampaignCard } from './components/CampaignCard';
import { CreateCampaign } from './components/CreateCampaign';
import { DonateModal } from './components/DonateModal';
import { ActivityFeed } from './components/ActivityFeed';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useWallet } from './hooks/useWallet';
import { useCampaigns } from './hooks/useCampaigns';
import type { Campaign, CreateCampaignInput, Toast } from './types';
import { generateId } from './utils/stellar';
import './App.css';

function App() {
  const wallet = useWallet();
  const { campaigns, isLoading, createCampaign, donate, allDonations } = useCampaigns();
  const [showCreate, setShowCreate] = useState(false);
  const [donatingTo, setDonatingTo] = useState<Campaign | null>(null);
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleCreateCampaign = async (input: CreateCampaignInput) => {
    try {
      await createCampaign(input, wallet.publicKey || 'ANONYMOUS');
      setShowCreate(false);
      addToast('🚀 Campaign created successfully!', 'success');
    } catch {
      addToast('Failed to create campaign. Please try again.', 'error');
    }
  };

  const handleDonate = async (amount: number) => {
    if (!donatingTo) return;
    setLoadingCampaignId(donatingTo.id);
    try {
      // Pass signTransaction so a real Stellar testnet tx is submitted
      // (appears in Freighter history).
      await donate(
        { campaignId: donatingTo.id, amount },
        wallet.publicKey || 'Anonymous',
        wallet.isConnected ? wallet.signTransaction : undefined
      );
      setDonatingTo(null);
      addToast(`💫 Donated ${amount} XLM to "${donatingTo.title}"! Check Freighter history.`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Surface the real error so user knows exactly what went wrong
      if (/already voted|already donated/i.test(msg)) {
        addToast('❌ You already donated to this campaign.', 'error');
      } else if (/network|horizon|submit/i.test(msg)) {
        addToast(`❌ Network error: ${msg}`, 'error');
      } else if (/freighter|signed|empty/i.test(msg)) {
        addToast(`❌ Wallet error: ${msg}`, 'error');
      } else {
        addToast(`❌ Transaction failed: ${msg}`, 'error');
      }
    } finally {
      setLoadingCampaignId(null);
    }
  };


  return (
    <div className="app">
      <Header
        walletState={wallet}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onCreateCampaign={() => setShowCreate(true)}
      />

      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <h1 className="hero-title">
              Fund the<br />
              <span className="gradient-text">Stellar Future</span>
            </h1>
            <p className="hero-sub">
              Decentralized crowdfunding powered by the Stellar blockchain.
              Support projects you believe in — transparent, fast, and borderless.
            </p>
            <div className="hero-actions">
              {!wallet.isConnected ? (
                <button id="hero-connect-btn" className="btn btn-primary btn-lg" onClick={wallet.connect}>
                  Connect Wallet →
                </button>
              ) : (
                <button id="hero-create-btn" className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
                  + Launch Campaign
                </button>
              )}
              <a href="#campaigns" className="btn btn-outline btn-lg">Explore Projects</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{campaigns.length}</strong>
                <small>Campaigns</small>
              </div>
              <div className="hero-stat">
                <strong>{allDonations.length}</strong>
                <small>Donations</small>
              </div>
              <div className="hero-stat">
                <strong>
                  {campaigns.reduce((s, c) => s + c.raised, 0).toFixed(0)} XLM
                </strong>
                <small>Total Raised</small>
              </div>
            </div>
          </div>
          <div className="hero-glow" aria-hidden="true" />
        </section>

        {/* Campaigns Grid */}
        <section className="campaigns-section" id="campaigns">
          <div className="section-header">
            <h2 className="section-title">Active Campaigns</h2>
            {isLoading && <LoadingSpinner size="sm" label="Refreshing..." />}
          </div>
          {isLoading && campaigns.length === 0 ? (
            <div className="full-loader">
              <LoadingSpinner size="lg" label="Loading campaigns..." />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌟</div>
              <p>No campaigns yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="campaign-grid">
              {campaigns.map(c => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onDonate={setDonatingTo}
                  isConnected={wallet.isConnected}
                  isLoading={loadingCampaignId === c.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Activity Feed */}
        <ActivityFeed donations={allDonations} />
      </main>

      {/* Modals */}
      <CreateCampaign
        isOpen={showCreate}
        isLoading={isLoading}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateCampaign}
      />
      <DonateModal
        campaign={donatingTo}
        isOpen={!!donatingTo}
        isLoading={loadingCampaignId !== null}
        onClose={() => setDonatingTo(null)}
        onDonate={handleDonate}
      />

      {/* Toast Notifications */}
      <div className="toast-container" role="alert" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
