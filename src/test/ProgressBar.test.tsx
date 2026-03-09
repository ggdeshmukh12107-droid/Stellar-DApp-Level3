import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../components/ProgressBar';

describe('ProgressBar', () => {
    it('renders percentage text', () => {
        render(<ProgressBar raised={50} goal={100} />);
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders 0% when not raised anything', () => {
        render(<ProgressBar raised={0} goal={100} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('clamps display to 100% when over-raised', () => {
        render(<ProgressBar raised={200} goal={100} />);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders raised amount label', () => {
        render(<ProgressBar raised={250} goal={1000} />);
        expect(screen.getByText('250.00 XLM raised')).toBeInTheDocument();
    });

    it('renders goal label', () => {
        render(<ProgressBar raised={250} goal={1000} />);
        expect(screen.getByText('Goal: 1000.00 XLM')).toBeInTheDocument();
    });

    it('has correct aria attributes', () => {
        render(<ProgressBar raised={75} goal={100} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuenow', '75');
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('hides labels when showLabels=false', () => {
        render(<ProgressBar raised={50} goal={100} showLabels={false} />);
        expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
});
