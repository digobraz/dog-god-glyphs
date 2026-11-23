// Drobné pomocníky chatu v2: texty (EN záloha + i18n), hodnosti, skloňovanie kreditov, hlasové konštanty.
import { useT, useLang } from '@/i18n/LanguageContext';
import { IS_APP } from '@/lib/isApp';
import { V2_EN, type V2Key } from './v2CopyEn';
import type { V2Effort, V2RankId, V2Tier } from './v2Api';

/** Texty chatu v2: `ainubis.chat.v2.<kľúč>` v locales, chýbajúci preklad padá na EN (nikdy holý kľúč). */
export function useV2Copy() {
  const t = useT();
  return (key: V2Key, vars?: Record<string, string | number>): string => {
    const raw = t(`ainubis.chat.v2.${key}`);
    let s = raw === `ainubis.chat.v2.${key}` ? V2_EN[key] : raw;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}
export type V2Copy = ReturnType<typeof useV2Copy>;

/** 🔁 AINUBIS LITE v natívnej appke 1.0 (Matej 23. 11.: „dajme to bez a každý bude mať len haiku“): do obchodov ide appka
 *  bez nákupov, takže hodnosť kúpená na webe v nej nesmie nič odomykať (Apple 3.1.3b). Každý = Rýchly, bez „Pre koho“,
 *  bez panela hodnosti a ponuky Bystrého, jedna veta o rýchlom režime. Web ostáva podľa hodností.
 *  NÁVRAT s 1.1 (IAP): `AI_LITE = false` · plná verzia = git tag `appka-ainubis-plny-2026-11-23`. */
export const AI_LITE: boolean = IS_APP;

/** Meno hodnosti (`pack.seal.*`, to isté ako pečať) s EN zálohou. */
export function useRankName() {
  const t = useT();
  const EN: Record<V2RankId, string> = { veriaci: 'Believer', akolyta: 'Preacher', knaz: 'Apostle', vezir: 'Prophet', farao: 'Vizier', zakladatel: 'Founder' };
  return (r: V2RankId) => { const v = t(`pack.seal.${r}`); return v === `pack.seal.${r}` ? EN[r] : v; };
}

/** Cena členstva podľa nákresu (kolo 5). Je to produkt, nie nastavenie servera, preto tu.
 *  🔴 V natívnej appke (IS_APP) žiadna cena ani cesta k platbe (Apple 3.1.1, stráž `check:appka`) —
 *  rebrík ukáže len model a kredity, CTA sa neukáže. */
export const RANK_PRICE: Record<V2RankId, { eur: string; from?: boolean }> = IS_APP
  ? { veriaci: { eur: '' }, akolyta: { eur: '' }, knaz: { eur: '' }, vezir: { eur: '' }, farao: { eur: '' }, zakladatel: { eur: '' } }
  : {
    veriaci: { eur: '' },
    akolyta: { eur: '3,99 €' },
    knaz: { eur: '7,99 €' },
    vezir: { eur: '11,99 €' },
    farao: { eur: '111 €', from: true },
    zakladatel: { eur: '' },
  };

/** Obrazovka hodností / vstupného (heroflow „Vstupné"). V natívnej appke prázdne = CTA sa nevykreslí (IS_APP). */
export const RANK_CTA_ROUTE = IS_APP ? '' : '/heroglyph/vstupne';

/** Ikonka mikrofónu z továrne (`plany/ikonky/varianty/app-mikrofon/k60-a..d.webp` → `/icons/sys/mikrofon-a..d.webp`).
 *  Matej ešte vyberá A–D (23. 11. 2026): výber = tento JEDEN znak. */
export const AINUBIS_MIC: 'a' | 'b' | 'c' | 'd' = 'a';
export const micSrc = () => `/icons/sys/mikrofon-${AINUBIS_MIC}.webp`;

export const EFFORT_IDX: Record<V2Effort, number> = { low: 0, medium: 1, high: 2, max: 4 };
export const TIER_IDX: Record<V2Tier, number> = { rychly: 0, bystry: 1, hlboky: 2 };

/** kredit · kredity · kreditov (SK pravidlo; EN má jednotné číslo len pri 1). */
export function creditsWord(n: number, lang: string, c: V2Copy): string {
  const one = Math.round(n) === 1;
  if (lang === 'sk' || lang === 'cs') {
    if (one) return c('creditsOne');
    return n >= 2 && n <= 4 ? c('creditsFew') : c('creditsMany');
  }
  return one ? c('creditsOne') : c('creditsMany');
}

/** Jazyk pre dátumy/čísla. */
export function useV2Lang() { return useLang().lang; }

/** Hlas AINUBISA, ktorý server nemá pre daný jazyk (odpovedal `no_voice`); pamätá sa do konca session. */
// Dabing AINUBISA existuje len pre tieto jazyky (`plany/ainubis/dabing/register.json`, `ainubis-hlas` VOICES) —
// inde sa tlačidlo Vypočuť vôbec neukáže. Nový jazyk = pridať sem aj do VOICES na serveri.
const VOICE_LANGS = new Set(['sk', 'cs', 'en', 'de']);
const NO_VOICE = new Set<string>();
export const noVoiceLang = (lang: string) => !VOICE_LANGS.has(lang.slice(0, 2)) || NO_VOICE.has(lang);
export const markNoVoice = (lang: string) => { NO_VOICE.add(lang); };

export const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
