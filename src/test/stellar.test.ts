import { describe, it, expect } from 'vitest';
import {
    formatXLM,
    truncateAddress,
    validateStellarAddress,
    xlmToStroops,
    stroopsToXlm,
    calcProgress,
} from '../utils/stellar';

describe('formatXLM', () => {
    it('formats 1234.5 to 2 decimal places', () => {
        expect(formatXLM(1234.5)).toBe('1234.50');
    });

    it('formats 0 as 0.00', () => {
        expect(formatXLM(0)).toBe('0.00');
    });

    it('respects custom decimal places', () => {
        expect(formatXLM(50, 4)).toBe('50.0000');
    });
});

describe('truncateAddress', () => {
    // exactly 56 chars
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV';
    it('truncates a long address with 4 chars', () => {
        const result = truncateAddress(addr, 4);
        expect(result).toBe('GABC...STUV');
    });

    it('returns short address unchanged', () => {
        expect(truncateAddress('GAB', 4)).toBe('GAB');
    });

    it('returns empty string unchanged', () => {
        expect(truncateAddress('', 4)).toBe('');
    });
});

describe('validateStellarAddress', () => {
    // Exactly 56 chars, all base32: [A-Z2-7]
    const validKey = 'GAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLMA';

    it('accepts a valid 56-char G-key', () => {
        expect(validateStellarAddress(validKey)).toBe(true);
    });

    it('rejects address not starting with G', () => {
        expect(validateStellarAddress('SAHTJDZ7NKQPKBKIQULQBQF6ADUHB3IXIFRJPJUSJFPWPKSJYDWVGLM')).toBe(false);
    });

    it('rejects address shorter than 56 chars', () => {
        expect(validateStellarAddress('GABCD')).toBe(false);
    });

    it('rejects empty string', () => {
        expect(validateStellarAddress('')).toBe(false);
    });
});

describe('xlmToStroops', () => {
    it('converts 1 XLM to 10,000,000 stroops', () => {
        expect(xlmToStroops(1)).toBe(10_000_000);
    });

    it('converts 0.5 XLM to 5,000,000 stroops', () => {
        expect(xlmToStroops(0.5)).toBe(5_000_000);
    });

    it('converts 0 XLM to 0 stroops', () => {
        expect(xlmToStroops(0)).toBe(0);
    });
});

describe('stroopsToXlm', () => {
    it('converts 10,000,000 stroops to 1 XLM', () => {
        expect(stroopsToXlm(10_000_000)).toBe(1);
    });

    it('converts 5,000,000 stroops to 0.5 XLM', () => {
        expect(stroopsToXlm(5_000_000)).toBe(0.5);
    });
});

describe('calcProgress', () => {
    it('calculates 50% progress correctly', () => {
        expect(calcProgress(50, 100)).toBe(50);
    });

    it('clamps progress at 100%', () => {
        expect(calcProgress(150, 100)).toBe(100);
    });

    it('returns 0 for zero goal', () => {
        expect(calcProgress(50, 0)).toBe(0);
    });

    it('returns 0 for zero raised', () => {
        expect(calcProgress(0, 100)).toBe(0);
    });
});
