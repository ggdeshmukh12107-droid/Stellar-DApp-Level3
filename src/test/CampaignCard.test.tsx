import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignCard } from '../components/CampaignCard';
import type { Campaign } from '../types';

const mockCampaign: Campaign = {
    id: 'test-1',
    title: 'Test Campaign',
    description: 'A test campaign description for testing purposes in unit tests.',
    creator: 'GAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLM',
    goal: 1000,
    raised: 350,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    donations: [],
};

describe('CampaignCard', () => {
    it('renders the campaign title', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });

    it('renders the campaign description', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText(/A test campaign description/)).toBeInTheDocument();
    });

    it('shows "Active" badge for active campaigns', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('shows donate button when wallet connected', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText('Donate XLM')).toBeInTheDocument();
    });

    it('shows lock message when wallet not connected', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected={false} />);
        expect(screen.getByText('🔒 Connect to Donate')).toBeInTheDocument();
    });

    it('donate button is disabled when not connected', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected={false} />);
        const btn = screen.getByRole('button', { name: /connect to donate/i });
        expect(btn).toBeDisabled();
    });

    it('calls onDonate when donate button clicked', async () => {
        const onDonate = vi.fn();
        render(<CampaignCard campaign={mockCampaign} onDonate={onDonate} isConnected />);
        await userEvent.click(screen.getByText('Donate XLM'));
        expect(onDonate).toHaveBeenCalledWith(mockCampaign);
    });

    it('shows loading overlay when isLoading', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected isLoading />);
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('shows donor count', () => {
        render(<CampaignCard campaign={mockCampaign} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('donors')).toBeInTheDocument();
    });

    it('shows "Ended" badge for expired campaign', () => {
        const ended: Campaign = { ...mockCampaign, deadline: Date.now() - 1000 };
        render(<CampaignCard campaign={ended} onDonate={vi.fn()} isConnected />);
        expect(screen.getByText('Ended')).toBeInTheDocument();
    });
});
