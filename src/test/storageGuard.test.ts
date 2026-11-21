// Plná schránka v telefóne (21. 11. 2026): zápis nesmie padnúť, kým sú v localStorage kópie zo servera,
// a rozpracovaná práca sa pri upratovaní nesmie zmazať. jsdom má kvótu 5 M znakov ako WebKit.
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
// jsdom nemá IndexedDB: sklad nahradí mapa, ktorá sa správa ako úspešný zápis.
vi.mock('@/lib/bigStore', () => {
  const m = new Map<string, unknown>();
  return { bigSet: async (k: string, v: unknown) => { m.set(k, v); return true; }, bigGet: async (k: string) => m.get(k) ?? null };
});

import { installStorageGuard, storageHousekeeping, withStorageRoom } from '@/lib/storageGuard';
import { bigGet } from '@/lib/bigStore';
import { track } from '@/lib/analytics';

installStorageGuard();

describe('stráž localStorage', () => {
  beforeEach(() => { localStorage.clear(); vi.mocked(track).mockClear(); });

  it('pri plnom úložisku zahodí kópie zo servera a zápis prejde', () => {
    localStorage.setItem('trp-sync-queue-v1', '["rozpracované"]');
    localStorage.setItem('vault-list-v1', 'v'.repeat(2_000_000));
    localStorage.setItem('dogypt.ecard.cache.u.d', 'c'.repeat(2_500_000));
    localStorage.setItem('trp-local-trails', 't'.repeat(1_000_000));
    expect(localStorage.getItem('trp-local-trails')?.length).toBe(1_000_000);
    expect(localStorage.getItem('trp-sync-queue-v1')).toBe('["rozpracované"]');
    expect(localStorage.getItem('vault-list-v1')).toBeNull();
    expect(track).toHaveBeenCalledWith('storage_full', expect.objectContaining({ totalK: expect.any(Number) }));
    expect(JSON.parse(localStorage.getItem('trp-storage-report')!).top[0]).toMatch(/^dogypt\.ecard\.cache\.u\.d:/);
  });

  it('rozpracovanú prácu nemaže — keď nie je čo zahodiť, zápis padne a volajúci dostane false', () => {
    localStorage.setItem('trp-local-trails', 't'.repeat(4_900_000));
    expect(() => localStorage.setItem('trp-plans', 'p'.repeat(500_000))).toThrow();
    expect(withStorageRoom(() => localStorage.setItem('trp-plans', 'p'.repeat(500_000)))).toBe(false);
    expect(localStorage.getItem('trp-local-trails')?.length).toBe(4_900_000);
  });

  it('pri štarte presťahuje fotky kartičiek do IndexedDB', async () => {
    localStorage.setItem('dogypt.ecard.photo.u.d', JSON.stringify({ url: 'https://x', src: 'data:image/jpeg;base64,AAA' }));
    await storageHousekeeping();
    expect(localStorage.getItem('dogypt.ecard.photo.u.d')).toBeNull();
    expect(await bigGet('dogypt.ecard.photo.u.d')).toEqual({ url: 'https://x', src: 'data:image/jpeg;base64,AAA' });
  });

  it('pri štarte vytiahne vlastnú fotku z konceptu SOS kartičky do IndexedDB', async () => {
    localStorage.setItem('dogypt.ecard.u.d', JSON.stringify({ edited: {}, photo: { x: 1, y: 2, zoom: 1, src: 'data:image/jpeg;base64,BBB' } }));
    await storageHousekeeping();
    expect(JSON.parse(localStorage.getItem('dogypt.ecard.u.d')!)).toEqual({ edited: {}, photo: { x: 1, y: 2, zoom: 1, big: true } });
    expect(await bigGet('dogypt.ecard.u.d.src')).toBe('data:image/jpeg;base64,BBB');
  });

  it('veľký zápis nahlási (fotka v localStorage = chyba v kóde)', () => {
    localStorage.setItem('nieco-velke', 'x'.repeat(300_000));
    expect(track).toHaveBeenCalledWith('storage_big_write', { key: 'nieco-velke', k: 293 });
  });
});
