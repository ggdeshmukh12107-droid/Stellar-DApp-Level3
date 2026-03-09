import { useState, useCallback, useEffect } from 'react';
import type { Campaign, Donation, CreateCampaignInput, DonateInput } from '../types';
import { cache } from '../utils/cache';
import { generateId, formatXLM } from '../utils/stellar';
import { buildAndSubmitDonationTx, ensureFunded } from '../utils/stellarTx';

const CACHE_KEY_CAMPAIGNS = 'campaigns';
const CACHE_TTL = 30_000; // 30 seconds
const STORAGE_KEY = 'stellar_campaigns';

// Seed data for demonstration
const SEED_CAMPAIGNS: Campaign[] = [
    {
        id: 'seed-1',
        title: 'DeFi Education Fund',
        description: 'Help us educate the next generation of blockchain developers with free courses, workshops, and mentorship programs across emerging markets.',
        creator: 'GAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLM',
        goal: 5000,
        raised: 3250,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        donations: [
            { id: 'd1', campaignId: 'seed-1', donor: 'GBPQ...RK2A', amount: 500, timestamp: Date.now() - 60 * 60 * 1000 },
            { id: 'd2', campaignId: 'seed-1', donor: 'GD5Z...MN9X', amount: 1500, timestamp: Date.now() - 2 * 60 * 60 * 1000 },
        ],
    },
    {
        id: 'seed-2',
        title: 'Open Source Stellar Tools',
        description: 'Building a suite of developer tools for the Stellar ecosystem: CLI utilities, SDK extensions, and monitoring dashboards — all open source.',
        creator: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
        goal: 2500,
        raised: 800,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        donations: [
            { id: 'd3', campaignId: 'seed-2', donor: 'GBHI...QM8V', amount: 800, timestamp: Date.now() - 30 * 60 * 1000 },
        ],
    },
    {
        id: 'seed-3',
        title: 'Community Hackathon',
        description: 'Organizing a 48-hour Stellar hackathon with $10,000 in prizes, mentors from the SDF, and access to Soroban smart contract workshops.',
        creator: 'GCC2RJSQBH3B5P6S6JGURPKW4IVKZ5CRZPBG6LGQPDHXG2ZQYVMZSM',
        goal: 10000,
        raised: 9800,
        deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        donations: [],
    },
];

function loadCampaigns(): Campaign[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as Campaign[];
            return parsed;
        }
    } catch {
        // ignore parse errors
    }
    // Initialize with seed data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CAMPAIGNS));
    return SEED_CAMPAIGNS;
}

function saveCampaigns(campaigns: Campaign[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    cache.clear(CACHE_KEY_CAMPAIGNS);
}

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        // Try cache first
        const cached = cache.get<Campaign[]>(CACHE_KEY_CAMPAIGNS);
        if (cached) {
            setCampaigns(cached);
            return;
        }

        setIsLoading(true);
        try {
            // Simulate async fetch latency
            await new Promise(res => setTimeout(res, 300));
            const data = loadCampaigns();
            cache.set(CACHE_KEY_CAMPAIGNS, data, CACHE_TTL);
            setCampaigns(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load campaigns');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const createCampaign = useCallback(
        async (input: CreateCampaignInput, creator: string): Promise<Campaign> => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise(res => setTimeout(res, 500));
                const newCampaign: Campaign = {
                    id: generateId(),
                    title: input.title,
                    description: input.description,
                    creator,
                    goal: input.goal,
                    raised: 0,
                    deadline: input.deadline.getTime(),
                    createdAt: Date.now(),
                    donations: [],
                };
                const current = loadCampaigns();
                const updated = [newCampaign, ...current];
                saveCampaigns(updated);
                setCampaigns(updated);
                return newCampaign;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const donate = useCallback(
        async (
            input: DonateInput,
            donor: string,
            signTx?: (xdr: string) => Promise<string>
        ): Promise<Donation> => {
            setIsLoading(true);
            setError(null);

            let txHash = `DEMO_${generateId().toUpperCase()}`;
            let isRealTx = false;

            // Find campaign title for memo
            const current = loadCampaigns();
            const campaign = current.find(c => c.id === input.campaignId);
            const campaignTitle = campaign?.title ?? 'Campaign';

            // Try real Stellar testnet transaction if wallet is connected
            if (signTx && donor && donor !== 'Anonymous') {
                // Auto-fund from Friendbot if account doesn't exist yet
                await ensureFunded(donor);
                const result = await buildAndSubmitDonationTx(
                    donor,
                    input.amount,
                    campaignTitle,
                    signTx
                );
                txHash = result.hash;
                isRealTx = true;
            }

            const donation: Donation = {
                id: generateId(),
                campaignId: input.campaignId,
                donor: donor || 'Anonymous',
                amount: input.amount,
                timestamp: Date.now(),
                txHash: isRealTx
                    ? txHash  // real Stellar tx hash
                    : `DEMO_${txHash.slice(-8)}`, // clearly labelled as demo
            };

            const updated = current.map(c => {
                if (c.id !== input.campaignId) return c;
                return {
                    ...c,
                    raised: c.raised + input.amount,
                    donations: [donation, ...c.donations],
                };
            });
            saveCampaigns(updated);
            setCampaigns(updated);
            setIsLoading(false);
            return donation;
        },
        []
    );

    // All donations across all campaigns, most recent first
    const allDonations: (Donation & { campaignTitle: string })[] = campaigns
        .flatMap(c => c.donations.map(d => ({ ...d, campaignTitle: c.title })))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

    return {
        campaigns,
        isLoading,
        error,
        fetchCampaigns,
        createCampaign,
        donate,
        allDonations,
        formatXLM,
    };
}
