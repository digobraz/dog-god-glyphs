import { useDogyptStore } from '@/store/dogyptStore';
import { buildHeroglyphCode, countryISO3 } from '@/lib/heroglyphCode';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';
import { EDGE_BASE } from '@/lib/env';

const SAVE_DRAFT_URL = `${EDGE_BASE}/save-checkout-draft`;

// Uloženie rozrobeného psa. Pôvodne žilo vnútri CheckoutScreen; 28. 8. 2026 dostal
// e-mail vlastný krok hneď za menom (/heroglyph/email), takže tú istú cestu volajú
// dve obrazovky — a dve kópie tohto tela by sa rozišli pri prvej zmene schémy.
//
// Draft je best-effort: nikdy nesmie zhodiť ani zdržať krok, v ktorom stojí človek.
// Na `draftId` sa nespoliehaj ako na jedinú ochranu pred duplicitou — edge funkcia
// má vlastný dedupe na (e-mail + meno psa + 24 h). Ref je len zrýchlenie.
export function saveCheckoutDraft(emailVal: string, lang: string): void {
  const s = useDogyptStore.getState();
  // Bez mena psa draft nemá čo uložiť — a práve preto e-mail vo flow nikdy
  // nesmie stáť pred menom.
  if (!s.dogName) return;

  const heroglyphCode = buildHeroglyphCode({
    dogName: s.dogName,
    ownerName: s.ownerName,
    patronSvg: s.patronSvg,
    breed: s.selections?.breed,
    patronCategory: s.selections?.patronCategory,
    country: s.selections?.country,
    selections: s.selections,
  });
  const iso3 = countryISO3(s.selections?.country);

  fetch(SAVE_DRAFT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draftId: s.draftId ?? undefined,
      dogName: s.dogName,
      ownerName: s.ownerName,
      email: emailVal.trim(),
      selections: s.selections,
      dogPhotoUrl: s.dogPhotoUrl,
      cloudinaryExtras: s.extraPhotos.filter((u) => u && !u.startsWith('blob:')),
      patronSvg: s.patronSvg,
      patronSvg2: s.patronSvg2,
      breed: s.selections?.breed || undefined,
      country: iso3 !== 'XXX' ? iso3 : undefined,
      heroglyphCode,
      refCode: getStoredRef(),
      language: lang,
      lifeStatus: s.lifeStatus,
      deathDate: s.deathDate,
      ...getAttribution(),
    }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d?.draftId) useDogyptStore.getState().setDraftId(d.draftId); })
    .catch(() => { /* draft je best-effort, flow nesmie trpieť */ });
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
