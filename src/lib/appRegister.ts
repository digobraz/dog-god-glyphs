import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { useDogyptStore } from '@/store/dogyptStore';
import { readSvorka, svorkaDogPayload, waitForStablePhotos } from '@/lib/flowSvorka';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';

// ════════════════════════════════════════════════════════════════════════════
// APPKA: REGISTRÁCIA ZADARMO (7. 11. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Zadanie `plany/zadanie-appka-free-registracia-iap-2026-11-07.md`, nákres
// `plany/nakresy/registracia-appka-2026-11-07/index.html` (obrazovky roz, kod).
// V appke sa heroflow NEKONČÍ pokladňou: odhalenie zapíše psov ako hosťa
// (`create-checkout tier:'guest'`, rovnaké telo ako `FlowStayScreen`), pošle kód
// na e-mail (`app-login send`) a krok KÓD v `AppEntry` založí účet.
// Spoločné veci prvého otvorenia (volanie `app-login`, rozpracovaný kód) žijú
// tu, aby ich flow nemusel ťahať celý `AppEntry`.
// ════════════════════════════════════════════════════════════════════════════

export type PubDog = { n: number; name: string | null; photo: string | null };
export type Sent = {
  masked: string; codeLength: number; dogs: PubDog[]; entered?: number; email?: string;
  /** Kód potvrdzuje uloženie heroglyfu z flowu (krok „Ulož heroglyf“), nie obyčajný vstup. */
  save?: boolean;
};

export async function callLogin(body: Record<string, unknown>): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${EDGE_BASE}/app-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* prázdne telo */ }
  return { status: res.status, data };
}

/** ROZPRACOVANÝ KÓD PREŽIJE ODCHOD DO MAILU (Matej 20. 10. 2026: „vždy keď odídem zo safari a prídem,
 *  tak stratím postup a kód tam nedokážem dať"). Človek MUSÍ odísť do schránky — a keď sa medzitým
 *  stránka či WebView načíta znova, krok KÓD sa vráti sám. Platí hodinu (dlhšie kód aj tak neplatí).
 *  Ukladá sa len zamaskovaný mail a verejné psy; pri ceste mailom aj zadaný mail — ten je človekov. */
const PENDING_KEY = 'dogypt_app_pending_v1';
const PENDING_MS = 60 * 60_000;
export const savePending = (s: Sent | null) => {
  try {
    if (s) localStorage.setItem(PENDING_KEY, JSON.stringify({ s, at: Date.now() }));
    else localStorage.removeItem(PENDING_KEY);
  } catch { /* súkromné okno */ }
};
export const readPending = (): Sent | null => {
  try {
    const j = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') as { s: Sent; at: number } | null;
    return j && Date.now() - j.at < PENDING_MS ? j.s : null;
  } catch { return null; }
};

export type RegisterError = 'photo' | 'email' | 'save' | 'send' | 'lost';

/** Zapíše psov z flowu ako hostí a pošle kód na e-mail z flowu. Store NEČISTÍ — to až po overení kódu
 *  (kým človek nezadá kód, môže sa vrátiť opraviť e-mail a flow má ešte dáta). */
export async function registerFreeInApp(lang: string): Promise<{ ok: boolean; error?: RegisterError }> {
  const s = useDogyptStore.getState();
  const email = s.email.trim();
  if (!s.dogName) return { ok: false, error: 'lost' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'email' };
  try {
    const dogs = readSvorka();
    track('app_register_guest', { dogs: dogs.length });
    const stable = await waitForStablePhotos();
    if (stable.some((d) => d.photo?.startsWith('blob:'))) return { ok: false, error: 'photo' };
    const res = await fetch(`${EDGE_BASE}/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'guest',
        newsConsent: false,
        email,
        // Pôvodný e-mail zápisu: pri OPRAVE preklepu ním edge preukáže, že riadok psa je náš (viď create-checkout).
        guestEmail: s.guestEmail || undefined,
        ownerName: s.ownerName,
        dogs: stable.map((d) => svorkaDogPayload(d, s.ownerName, 0)),
        cloudinaryExtras: s.extraPhotos.filter((u) => u && !u.startsWith('blob:')),
        refCode: getStoredRef(),
        language: lang,
        ...getAttribution(),
      }),
    });
    const data = res.ok ? await res.json() : null;
    if (data?.tier !== 'guest') {
      const err = res.ok ? null : await res.json().catch(() => null);
      console.error('create-checkout (app guest) failed:', res.status, err?.error);
      return { ok: false, error: err?.error === 'invalid_input' ? 'email' : 'save' };
    }
    const ids: string[] = Array.isArray(data.dogIds) ? data.dogIds : [];
    useDogyptStore.getState().setGuest(
      Object.fromEntries(stable.map((d, i) => [d.flowId, ids[i]]).filter(([, id]) => !!id)),
      email,
    );
  } catch (e) {
    console.error('app register (guest) error:', e);
    return { ok: false, error: 'save' };
  }
  try {
    const { data } = await callLogin({ action: 'send', email: email.toLowerCase(), lang });
    if (!data.ok) return { ok: false, error: 'send' };
    savePending({
      masked: String(data.masked), codeLength: Number(data.codeLength) || 6, dogs: [], email: email.toLowerCase(), save: true,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'send' };
  }
}
