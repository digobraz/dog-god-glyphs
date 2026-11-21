// SPOLOČNÉ POMôCKY formulárov „Nahlásiť nebezpečenstvo“ (21. 11. 2026, nálezy testu): rozpísaný text v `sessionStorage`
// (späť → vpred a obnovenie stránky ho nestratia), validácia telefónu a kontaktu, bezpečné pridávanie fotiek, počítadlo znakov.
// Žiadny backend: ten je len v `lib/danger.ts`.
import { PACK_SPACE as S, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';

// ── ROZPÍSANÉ V sessionStorage ──────────────────────────────────────────────────────────────────
// Všetko v try/catch: súkromný režim a plné úložisko nesmú zhodiť formulár.
const DRAFT_PREFIX = 'dogypt.danger.draft.';

export function loadDraft<D>(key: string): Partial<D> | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_PREFIX + key);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === 'object' ? (v as Partial<D>) : null;
  } catch { return null; }
}

export function saveDraft(key: string, value: unknown) {
  try { window.sessionStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(value)); } catch { /* úložisko nedostupné: formulár beží ďalej */ }
}

export function clearDraft(key: string) {
  try { window.sessionStorage.removeItem(DRAFT_PREFIX + key); } catch { /* nič */ }
}

// ── TELEFÓN A KONTAKT ───────────────────────────────────────────────────────────────────────────
/** Jedno číslo: 9 až 15 číslic, povolené `+`, medzery, pomlčky, zátvorky a bodky. Vráti číslice s predvoľbou `+`, inak `null`. */
export function cleanPhone(raw: string): string | null {
  const t = raw.trim();
  if (!t || !/^\+?[\d\s().\-/]+$/.test(t)) return null;
  const digits = t.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  return (t.startsWith('+') ? '+' : '') + digits;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (raw: string) => EMAIL_RE.test(raw.trim());

/** „Iná krajina“: kontakt je platný telefón ALEBO e-mail. Vráti text, ktorý sa pošle, alebo `null`. */
export function cleanContact(raw: string): string | null {
  const t = raw.trim();
  if (isEmail(t)) return t;
  return cleanPhone(t);
}

// ── FOTKY ───────────────────────────────────────────────────────────────────────────────────────
const IMG_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i;
export const isImageFile = (f: File) => f.type.startsWith('image/') || (!f.type && IMG_EXT.test(f.name));

export interface AddResult { files: File[]; notImage: number; tooMany: number }

/**
 * Pridá vybrané súbory k tým, čo už sú. 🔴 `picked` MUSÍ byť pole skopírované z `FileList` ešte PRED tým, než sa vyčistí
 * `input.value` (živý `FileList` sa vyčistením vyprázdni a fotka by sa ticho nepridala).
 */
export function addImageFiles(current: File[], picked: File[], max: number): AddResult {
  const images = picked.filter(isImageFile);
  const merged = [...current, ...images];
  return { files: merged.slice(0, max), notImage: picked.length - images.length, tooMany: Math.max(0, merged.length - max) };
}

// ── POČÍTADLO ZNAKOV: ukáže sa, keď sa človek blíži k limitu ────────────────────────────────────
export function CharCount({ len, max }: { len: number; max: number }) {
  if (len < Math.floor(max * 0.8)) return null;
  const full = len >= max;
  return (
    <small className="dgr-count" aria-live="polite" style={{ display: 'block', textAlign: 'right', marginTop: S.xs, fontSize: PACK_TEXT.label, color: full ? T.sosRed : T.inkWarm, fontWeight: full ? 600 : 400 }}>
      {len} / {max}
    </small>
  );
}
