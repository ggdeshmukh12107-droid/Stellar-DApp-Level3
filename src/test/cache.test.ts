import { describe, it, expect, beforeEach } from 'vitest';
import { cache, DEFAULT_TTL_MS } from '../utils/cache';

describe('TTL Cache', () => {
    beforeEach(() => {
        cache.clear();
    });

    it('stores and retrieves a value', () => {
        cache.set('key1', { hello: 'world' });
        expect(cache.get('key1')).toEqual({ hello: 'world' });
    });

    it('returns null for unknown key', () => {
        expect(cache.get('nonexistent')).toBeNull();
    });

    it('has() returns true for existing key', () => {
        cache.set('k', 42);
        expect(cache.has('k')).toBe(true);
    });

    it('has() returns false for missing key', () => {
        expect(cache.has('missing')).toBe(false);
    });

    it('expires entries after TTL', async () => {
        cache.set('expiring', 'value', 50); // 50ms TTL
        await new Promise(r => setTimeout(r, 80));
        expect(cache.get('expiring')).toBeNull();
    });

    it('has() returns false after expiry', async () => {
        cache.set('exp2', 'val', 50);
        await new Promise(r => setTimeout(r, 80));
        expect(cache.has('exp2')).toBe(false);
    });

    it('clear() removes all entries', () => {
        cache.set('a', 1);
        cache.set('b', 2);
        cache.clear();
        expect(cache.get('a')).toBeNull();
        expect(cache.get('b')).toBeNull();
    });

    it('clear(key) removes only that key', () => {
        cache.set('x', 10);
        cache.set('y', 20);
        cache.clear('x');
        expect(cache.get('x')).toBeNull();
        expect(cache.get('y')).toBe(20);
    });

    it('default TTL is 30 seconds', () => {
        expect(DEFAULT_TTL_MS).toBe(30_000);
    });

    it('entry does not expire before TTL', async () => {
        cache.set('fresh', 'still-here', 500);
        await new Promise(r => setTimeout(r, 50));
        expect(cache.get('fresh')).toBe('still-here');
    });
});
