// ZÁPIS DŇA v4 — nahrádza AINUBIS okno „Dnešok" v appke (`APP_NEW`), 31. 10. 2026.
// Zadanie `plany/zadanie-zapis-dna-v4-2026-10-31.md`, nákres `plany/nakresy/dennik-2026-10-30/tpl3.html`.
//
// Matej 31. 10. v testovacej appke: *„zapíš dnešok je tam stále ainubis a nie to čo tam má byť"*.
// Pripomienky k v3 (30. 10.): *„tých 21 dlaždíc je ok, ale musíme to nejak rozumne rozložiť, aby to nebolo cez celú
// obrazovku"* · *„zápis textový dajme ako prvý"* · *„animácia ok"*  →  POPUP (šuplík zdola), nie celá obrazovka.
//
//   hore    DNES + dátum + kruhy psov (multidog, ťuk = s kým)
//   veta    textové pole PRVÉ (nepovinné) + fotoaparát (fotka do priečinka psa, ako DiaryEntry)
//   RUTINA  4 veľké dlaždice v rade
//   záložky DEŇ · ZDRAVIE · ĎALŠIE — rad menších dlaždíc, jedna záložka otvorená
//   dole    lapis ZAPÍSAŤ DEŇ → pečať s číslom dňa → pásy odznakov → šuplík zbehne, deň v kalendári dostane ✓
//
// 🔴 Každý ťuk = riadok `devotion_events` (`grant-devotion`, kind 'claim'; body 0 — ☥ body sú zrušené, level = roky).
//    Text → `dog_events` diary.note, míľnik → diary.milestone, váha → health.weightKg (existujúci zápis váhy).
//    Výlet sa NEŤUKÁ: odznak VÝLETY ide len zo zapísaného výletu (`trip_walked`), dlaždica vedie do „Zapíš výlet".
// ⚠️ `supabase.rpc` volať VIAZANE (nie `const { rpc } = supabase`) a FileList z inputu skopírovať `Array.from` PRED await.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackPopup } from '@/components/pack/PackPopup';
import { useBackClose } from '@/components/pack/diary/useBackClose';
import { useKeyboardLift, kbLiftCSS } from '@/components/pack/diary/useKeyboardLift';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, BRAND_GOLD_BTN, MODAL_MAX_H, PF_FIELD_CSS, PHOTO_CSS, PROGRESS_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { HandCamera } from '@/components/pack/HandIcons';
import { supabase } from '@/integrations/supabase/client';
import { grantDevotion } from '@/lib/devotionGrant';
import { appendDogEvents } from '@/lib/dogEvents';
import { chipOf, diaryEvent, todayKey } from '@/components/pack/diary/diaryModel';
import { compressFile } from '@/lib/photoIntake';
import { sizedUrl, uploadDogDiaryPhoto } from '@/services/cloudinaryService';
import { readTriplist } from '@/components/pack/triplist/triplist';
import { toast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { BADGE_FAMILIES } from './badgeRegister';
import { KIND_FAMILY, loadMyActivity, badgeCounts } from './badgeShelf';
import { ZTILES, type ZTile, type TileGroup } from './zapisDnaModel';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

interface TodayDog { id: string; name: string | null; photo: string | null; diet: 'kibble' | 'barf' | null; done: Record<string, number> }
interface Today { day: string; dogs: TodayDog[] }

const GROUPS: Array<[TileGroup, string, string]> = [
  ['den', 'pack.zd.tab.den', 'Day'],
  ['zdravie', 'pack.zd.tab.zdravie', 'Health'],
  ['dalsie', 'pack.zd.tab.dalsie', 'More'],
];

const CSS = `
.ppu-sheet.zd-pop{overflow:hidden;}
.zd-pop .ppu-body{padding:0;display:flex;flex-direction:column;min-height:0;overflow:hidden;}
.zd-sheet{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;color:${T.inkStrong};font-family:${FONT_UI};}
.zd-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px ${S.md}px;}
.zd-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:${S.xs}px;padding:0 0 ${S.md}px;}
.zd-day{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};} /* písmo: nadpis */
.zd-date{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${TX.label}px;color:${T.inkWarm};}
.zd-dogs{display:flex;justify-content:center;gap:${S.sm}px;margin-top:${S.sm}px;}
.zd-dog{appearance:none;display:grid;place-items:center;width:40px;height:40px;padding:0;border-radius:${PACK_R.pill}px;cursor:pointer;overflow:hidden;
  border:2px solid ${T.border};background:${T.tileBg};opacity:.5;transition:opacity .15s,border-color .15s,transform .15s;}
.zd-dog img{width:100%;height:100%;object-fit:cover;display:block;}
.zd-dog i{font-style:normal;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;color:${T.inkStrong};} /* písmo: meno */
.zd-dog.on{opacity:1;border-color:${LAPIS.edge};}
.zd-dog:active{transform:scale(.94);}
.zd-q{display:flex;align-items:flex-start;gap:${S.sm}px;margin:0 0 ${S.sm}px;}
.zd-q textarea{flex:1;min-width:0;min-height:48px;resize:none;}
.zd-cam{appearance:none;flex:none;display:grid;place-items:center;width:48px;height:48px;padding:0;border-radius:${PACK_R.field}px;cursor:pointer;
  border:1px solid ${T.border};background:${T.tileBg};}
.zd-cam:disabled{opacity:.5;cursor:default;}
.zd-photo{display:flex;align-items:center;gap:${S.md}px;margin:0 0 ${S.sm}px;}
.zd-photo p{margin:0;font-size:${TX.label}px;color:${T.inkWarm};}
.zd-link{appearance:none;border:0;background:none;padding:0;cursor:pointer;font:inherit;font-weight:600;font-size:${TX.label}px;color:${PICK_INK.lapis};text-decoration:underline;}
.zd-sec{margin:${S.md}px 0 ${S.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${T.inkWarm};}
.zd-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${S.sm}px;}
.zd-tile{appearance:none;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;min-width:0;
  height:80px;padding:${S.xs}px 2px ${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkStrong};
  font:inherit;font-weight:500;font-size:${TX.micro}px;line-height:1.1;text-align:center;cursor:pointer;user-select:none;
  transition:transform .15s,background .15s,border-color .15s;-webkit-tap-highlight-color:transparent;}
.zd-tile:active:not(:disabled){transform:scale(.94);}
.zd-tile em{font-style:normal;font-size:${TX.h2}px;line-height:1;font-family:${EMOJI_FONT};}
.zd-tile b{font-weight:500;max-width:100%;overflow-wrap:anywhere;}
.zd-tile.big{height:96px;padding-bottom:${S.lg}px;}
.zd-tile.big em{font-size:${TX.h1}px;}
.zd-tile.big b{font-size:${TX.label}px;}
.zd-tile.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.zd-tile.got{opacity:.5;cursor:default;}
.zd-tile .n{position:absolute;top:${S.xs}px;right:${S.xs}px;min-width:18px;height:18px;padding:0 ${S.xs}px;border-radius:${PACK_R.pill}px;box-sizing:border-box;
  border:1px solid ${LAPIS.edge};background:${LAPIS.fill};color:${PICK_INK.lapis};font-family:${FONT_UI};font-weight:600;font-size:${TX.micro}px;line-height:16px;}
.zd-tile .bg{position:absolute;bottom:${S.xs}px;left:0;right:0;font-weight:500;font-size:${TX.micro}px;color:${T.inkWarm};white-space:nowrap;}
.zd-tile.on .bg{color:${PICK_INK.lapis};}
.zd-tabs{display:flex;gap:${S.xs}px;margin:${S.lg}px 0 ${S.sm}px;padding:${S.xs}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.border};background:${T.tileBg};}
.zd-tab{appearance:none;flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:${S.xs}px;height:40px;padding:0;border-radius:${PACK_R.field}px;
  border:1px solid transparent;background:none;cursor:pointer;color:${T.inkWarm};
  font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;}
.zd-tab.on{border-color:${T.cardEdge};background:${T.card};color:${T.inkStrong};}
.zd-tab i{font-style:normal;min-width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${LAPIS.fill};border:1px solid ${LAPIS.edge};
  color:${PICK_INK.lapis};font-size:${TX.micro}px;line-height:14px;letter-spacing:0;}
.zd-subs{display:flex;flex-wrap:wrap;align-items:center;gap:${S.sm}px;margin:${S.sm}px 0 0;}
.zd-subs > b{font-family:${FONT_UI};font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.zd-chip{appearance:none;height:32px;padding:0 ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.tileBg};cursor:pointer;
  font:inherit;font-weight:500;font-size:${TX.label}px;color:${T.inkStrong};}
.zd-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.zd-ask{display:flex;align-items:center;gap:${S.sm}px;margin:${S.sm}px 0 0;}
.zd-ask input{flex:1;min-width:0;}
.zd-ask b{font-family:${FONT_UI};font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.zd-foot{flex:none;padding:${S.md}px ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.md}px);border-top:1px solid ${T.hairline};}
.zd-save{display:flex;align-items:center;justify-content:center;width:100%;height:52px;padding:0 ${S.lg}px;border-radius:${PACK_R.field}px;cursor:pointer;
  border:1px solid ${LAPIS.edge};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: cta */
.zd-save:hover:not(:disabled){background:${LAPIS.gradHover};}
.zd-save:disabled{opacity:.4;cursor:default;}
.zd-empty{padding:${S.xl}px 0;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}

/* RITUÁL — emoji vyletia z dlaždíc do stredu → pečať s dňom → pásy odznakov → šuplík zbehne */
.zd-rit{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xl}px;padding:${S.lg}px;
  background:${T.cardGrad};opacity:0;pointer-events:none;transition:opacity .25s;}
.zd-rit.on{opacity:1;pointer-events:auto;}
.zd-seal{position:relative;width:132px;height:132px;border-radius:${PACK_R.pill}px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:${BRAND_GOLD_BTN.grad};color:${BRAND_GOLD_BTN.ink};transform:scale(0);border:3px solid ${T.card};}
.zd-seal b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h1}px;line-height:1;transform:scale(1.6);} /* písmo: nadpis */
.zd-seal small{margin-top:${S.xs}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.micro}px;letter-spacing:.14em;} /* písmo: nadpis */
.zd-seal.in{animation:zd-seal .7s cubic-bezier(.3,1.5,.5,1) forwards;}
.zd-rays{position:absolute;inset:-34px;z-index:-1;border-radius:${PACK_R.pill}px;opacity:0;
  background:repeating-conic-gradient(rgba(201,154,63,.30) 0 6deg,transparent 6deg 18deg);animation:zd-spin 6s linear infinite;}
.zd-seal.in .zd-rays{opacity:1;transition:opacity .6s .3s;}
.zd-prog{width:min(100%,300px);display:flex;flex-direction:column;gap:${S.sm}px;min-height:${S.xl}px;}
.zd-pg{display:flex;align-items:center;gap:${S.sm}px;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s;}
.zd-pg.in{opacity:1;transform:none;}
.zd-pg em{font-style:normal;width:${S.xl}px;text-align:center;font-size:${TX.h2}px;font-family:${EMOJI_FONT};}
.zd-pg .nm{flex:0 0 96px;font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.zd-pg .bar{flex:1;height:8px;}
.zd-pg .bar .pk-progress__fill{display:block;transition:width .9s cubic-bezier(.3,.8,.3,1);}
.zd-pg .v{flex:0 0 52px;text-align:right;font-weight:600;font-size:${TX.label}px;}
.zd-pg.new .v{color:#3D7A4E;}
.zd-fly{position:absolute;z-index:6;pointer-events:none;font-size:${TX.h1}px;font-family:${EMOJI_FONT};}
@keyframes zd-seal{to{transform:scale(1);}}
@keyframes zd-spin{to{transform:rotate(360deg);}}
@media (min-width:768px){
  .ppu-sheet.zd-pop{width:640px;}
  .zd-tile{height:88px;}
}
@media (prefers-reduced-motion:reduce){
  .zd-seal.in,.zd-rays{animation:none;}
  .zd-seal{transform:scale(1);}
  .zd-pg,.zd-pg .bar .pk-progress__fill{display:block;transition:none;}
}
`;

/** Šírka v percentách — ten istý pomocník ako `pctW` v `DevotionToday` (recept `.pk-progress`). */
const pctW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { width: w };
};
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const buzz = () => { try { navigator.vibrate?.(12); } catch { /* iOS web nevie */ } };
const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface PhotoState { preview: string; url: string | null; busy: boolean; blob: Blob; forDog: string }
interface Row { fam: string; emoji: string; before: number; after: number; lo: number; nx: number; hit: boolean }

export function ZapisDna({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [today, setToday] = useState<Today | null>(null);
  const [pick, setPick] = useState<string[]>([]);
  const [sel, setSel] = useState<Record<string, number>>({});
  const [sub, setSub] = useState<Record<string, string | null>>({});
  const [text, setText] = useState('');
  const [kg, setKg] = useState('');
  const [miles, setMiles] = useState('');
  const [tab, setTab] = useState<TileGroup>('den');
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [plans, setPlans] = useState<Array<{ slug: string; name: string; href: string }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [ritual, setRitual] = useState<{ day: number } | null>(null);
  const rowsRef = useRef<Row[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const photoSeq = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  busyRef.current = busy;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useFlowKeyboardFix();
  useKeyboardLift();
  const popClose = useCallback(() => { if (!busyRef.current) closeRef.current(); }, []);
  useBackClose(popClose);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('devotion_today' as never);
    if (error || !data) { setToday({ day: '', dogs: [] }); return; }
    const d = data as unknown as Today;
    setToday(d);
    setPick((p) => (p.length ? p.filter((id) => d.dogs.some((g) => g.id === id)) : d.dogs.map((g) => g.id)));
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let alive = true;
    loadMyActivity().then((a) => { if (alive && a) setCounts(badgeCounts(a, 0, 0, 'SK')); }).catch(() => { /* bez čísiel — dlaždice ostanú bez x/y */ });
    return () => { alive = false; };
  }, []);

  const dogs = today?.dogs ?? [];
  const picked = dogs.filter((g) => pick.includes(g.id));
  const primary = picked[0] ?? null;

  /** Koľko ťukov ešte smie pribudnúť = miesto u psa, ktorý ho má NAJVIAC. */
  const room = (tile: ZTile) => (picked.length ? Math.max(...picked.map((g) => (tile.multi ?? 1) - (g.done[tile.id] ?? 0))) : 0);
  /** Vybraný počet, zrezaný o miesto (pri zmene psov sa výber nezahadzuje, len skracuje). */
  const eff = (tile: ZTile) => (tile.special ? 0 : Math.min(sel[tile.id] ?? 0, Math.max(0, room(tile))));
  const kgNum = parseFloat(kg.replace(',', '.'));
  const kgOk = !Number.isNaN(kgNum) && kgNum > 0 && kgNum < 200;

  /** Dnešné plány výletov (tripliste s dnešným dátumom) — názvy z datasetu trás, ťahá sa až na ťuk. */
  const loadPlans = async () => {
    const day = todayKey();
    const mine = Object.entries(readTriplist()).filter(([, tr]) => tr.date === day);
    if (!mine.length) { setPlans([]); return; }
    try {
      const mod = await import('@/data/heroTrails.generated');
      const byId = new Map(mod.HERO_TRAILS.map((x) => [x.id, x]));
      setPlans(mine.map(([slug]) => {
        const tr = byId.get(slug);
        return { slug, name: tr?.name || slug, href: tr ? `/pack/map/${tr.country ? tr.country.toLowerCase() : 'svk'}/${slug}` : '/pack/add' };
      }));
    } catch { setPlans([]); }
  };

  const hit = (tile: ZTile) => {
    if (tile.special === 'trip') {
      setSel((p) => ({ ...p, trip: p.trip ? 0 : 1 }));
      if (!plans) void loadPlans();
      return;
    }
    if (tile.special) { setSel((p) => ({ ...p, [tile.id]: p[tile.id] ? 0 : 1 })); buzz(); return; }
    const max = room(tile);
    if (max <= 0) return;
    const n = eff(tile);
    const cap = tile.multi ? Math.min(tile.multi, max) : 1;
    setSel((p) => ({ ...p, [tile.id]: n >= cap ? 0 : n + 1 }));
    if (n >= cap) setSub((p) => ({ ...p, [tile.id]: null }));
    buzz();
  };

  // ── FOTKA — príloha zápisu do priečinka psa (ako DiaryEntry) ────────────────
  async function uploadFor(blob: Blob, preview: string, forDog: string): Promise<void> {
    const seq = ++photoSeq.current;
    setPhoto({ preview, url: null, busy: true, blob, forDog });
    try {
      const { secureUrl } = await uploadDogDiaryPhoto(blob, forDog, `${todayKey()}-${Date.now()}`);
      if (seq === photoSeq.current) setPhoto({ preview, url: secureUrl, busy: false, blob, forDog });
    } catch {
      if (seq !== photoSeq.current) return;
      setPhoto({ preview, url: null, busy: false, blob, forDog });
      toast({ title: tx('pack.diary.photoFailed', 'The photo could not be uploaded. You can save the entry without it.'), variant: 'destructive' });
    }
  }
  async function pickPhoto(file: File): Promise<void> {
    if (!primary) return;
    let c: { url: string; blob: Blob };
    try { c = await compressFile(file); } catch {
      toast({ title: tx('pack.diary.photoPrep', 'The photo could not be prepared. Try another one.'), variant: 'destructive' });
      return;
    }
    await uploadFor(c.blob, c.url, primary.id);
  }
  useEffect(() => () => { if (photo?.preview.startsWith('blob:')) URL.revokeObjectURL(photo.preview); }, [photo?.preview]);

  // ── ČO SA ZAPISUJE ──────────────────────────────────────────────────────────
  const chosen = ZTILES.filter((x) => !x.special && eff(x) > 0);
  const hasMile = (sel.milestone ?? 0) > 0;
  const hasWeight = (sel.weight ?? 0) > 0 && kgOk;
  const hasText = text.trim().length > 0 || !!photo;
  const any = chosen.length > 0 || hasMile || hasWeight || hasText;
  const ready = any && picked.length > 0 && !busy && !photo?.busy;

  const badgeLine = (tile: ZTile): { have: number; nx: number } | null => {
    const fam = KIND_FAMILY[tile.id] ?? (tile.id === 'abroad' ? 'zahranicie' : tile.id === 'trip' ? 'vylety' : null);
    const f = fam ? BADGE_FAMILIES.find((x) => x.id === fam) : null;
    if (!f || !counts) return null;
    const have = (counts[f.id] ?? 0) + (KIND_FAMILY[tile.id] ? eff(tile) : 0);
    const nx = f.prahy.find((p) => p > have) ?? f.prahy[f.prahy.length - 1];
    return { have, nx };
  };

  // ── ZAPÍSAŤ DEŇ ─────────────────────────────────────────────────────────────
  const save = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      const ids = picked.map((g) => g.id);
      const items = chosen.map((x) => ({ kind: x.id, n: eff(x), ...(sub[x.id] ? { sub: sub[x.id] as string } : {}) }));
      if (items.length) await grantDevotion({ kind: 'claim', dog_ids: ids, items });
      // 📖 text, míľnik a váha → `dog_events` (Kronika a kalendár). Zlyhanie nezhodí zápis dlaždíc — vlastná hláška.
      const events = [];
      let url = photo?.url ?? null;
      if (photo && primary && photo.forDog !== primary.id) {   // pes sa medzitým zmenil → fotka do priečinka toho správneho
        try { url = (await uploadDogDiaryPhoto(photo.blob, primary.id, `${todayKey()}-${Date.now()}`)).secureUrl; } catch { url = null; }
      }
      const noteOn = !!(text.trim() || url);
      if (noteOn) for (const id of ids) events.push(diaryEvent(id, chipOf('note'), todayKey(), { text: text.trim(), photo: url ?? undefined }));
      if (hasMile) for (const id of ids) events.push(diaryEvent(id, chipOf('milestone'), todayKey(), { text: miles.trim() }));
      if (hasWeight && primary) events.push(diaryEvent(primary.id, chipOf('weight'), todayKey(), { text: '', number: kgNum }));
      if (events.length) {
        try { await appendDogEvents(events); } catch {
          toast({ title: tx('pack.zd.diaryFail', 'Saved, but the note did not reach the chronicle.'), variant: 'destructive' });
        }
      }
      buzz();
      // Odznaky: čo sa pohlo (ťuky + veta/míľnik do KRONIKY).
      const added: Record<string, number> = {};
      for (const x of chosen) { const f = KIND_FAMILY[x.id]; if (f) added[f] = (added[f] ?? 0) + eff(x); }
      const diaryN = (noteOn ? ids.length : 0) + (hasMile ? ids.length : 0);
      if (diaryN) added.kronika = diaryN;
      rowsRef.current = Object.entries(added).flatMap(([fam, c]): Row[] => {
        const f = BADGE_FAMILIES.find((x) => x.id === fam);
        if (!f || !counts) return [];
        const before = counts[fam] ?? 0, after = before + c;
        const lo = [0, ...f.prahy].filter((p) => p <= before).pop() ?? 0;
        const nx = f.prahy.find((p) => p > before) ?? f.prahy[f.prahy.length - 1];
        const emoji = fam === 'kronika' ? '✍️' : ZTILES.find((x) => KIND_FAMILY[x.id] === fam)?.emoji ?? '';
        return [{ fam, emoji, before, after, lo, nx, hit: f.prahy.some((p) => before < p && after >= p) }];
      }).sort((a, b) => Number(b.hit) - Number(a.hit)).slice(0, 5);
      await ritualRun(rowsRef.current);
      window.dispatchEvent(new CustomEvent('dogypt:zapis', { detail: { day: todayKey() } }));
      closeRef.current();
    } catch {
      toast({ title: tx('pack.dog.toastCouldntLog', 'Could not save'), variant: 'destructive' });
      setBusy(false);
    }
  };

  async function ritualRun(rows: Row[]) {
    const sheet = sheetRef.current;
    setRitual({ day: new Date().getDate() });
    if (!sheet) return;
    const fast = reduced();
    await wait(60);
    const sr = sheet.getBoundingClientRect();
    const cx = sr.width / 2, cy = sr.height / 2 - 40;
    // 1 · emoji vyletia z vybraných dlaždíc do stredu
    if (!fast) {
      const flies: HTMLElement[] = [];
      sheet.querySelectorAll<HTMLElement>('.zd-tile.on').forEach((tile) => {
        const em = tile.querySelector('em');
        if (!em) return;
        const r = tile.getBoundingClientRect();
        const f = document.createElement('span');
        f.className = 'zd-fly';
        f.textContent = em.textContent;
        f.style.left = `${r.left - sr.left + r.width / 2 - 13}px`;
        f.style.top = `${r.top - sr.top + r.height / 2 - 16}px`;
        sheet.appendChild(f);
        flies.push(f);
      });
      await Promise.all(flies.map((f, i) => f.animate(
        [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${cx - parseFloat(f.style.left) - 13}px,${cy - parseFloat(f.style.top)}px) scale(.4)`, opacity: 0.2 }],
        { duration: 650, delay: i * 60, easing: 'cubic-bezier(.5,0,.7,1)', fill: 'forwards' },
      ).finished.catch(() => undefined)));
      flies.forEach((f) => f.remove());
    }
    // 2 · pečať
    sheet.querySelector('.zd-seal')?.classList.add('in');
    await wait(fast ? 150 : 500);
    // 3 · pásy odznakov sa posunú
    const els = [...sheet.querySelectorAll<HTMLElement>('.zd-prog .zd-pg')];
    for (let i = 0; i < els.length && i < rows.length; i++) {
      const el = els[i], r = rows[i];
      el.classList.add('in');
      await wait(fast ? 0 : 140);
      const fill = el.querySelector<HTMLElement>('.bar .pk-progress__fill'), v = el.querySelector<HTMLElement>('.v');
      const span = Math.max(1, r.nx - r.lo);
      if (fill) fill.style.width = pctW(((r.after - r.lo) / span) * 100).width;
      if (v) v.textContent = r.hit ? tx('pack.zd.new', 'NEW!') : `${r.after}/${r.nx}`;
    }
    await wait(fast ? 600 : 1600);
    // 4 · šuplík zbehne (zatvorí rodič); kalendár dostane signál `dogypt:zapis` → ✓ + pop
  }

  const dateText = useMemo(() => {
    try { return new Intl.DateTimeFormat(intlLocale(lang), { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); } catch { return ''; }
  }, [lang]);
  const tabCount = (g: TileGroup) => ZTILES.filter((x) => x.group === g)
    .filter((x) => (x.special ? (sel[x.id] ?? 0) > 0 && (x.special !== 'weight' || kgOk) && x.special !== 'trip' : eff(x) > 0)).length;

  const tileBtn = (tile: ZTile, big = false) => {
    const n = eff(tile);
    const selected = tile.special ? (sel[tile.id] ?? 0) > 0 : n > 0;
    const got = !tile.special && room(tile) <= 0;
    const bl = badgeLine(tile);
    return (
      <button key={tile.id} type="button" className={`zd-tile${big ? ' big' : ''}${selected ? ' on' : ''}${got ? ' got' : ''}`}
        disabled={got || !picked.length} aria-pressed={selected} onClick={() => hit(tile)}>
        {n > 1 && <span className="n">{n}</span>}
        <em>{tile.emoji}</em>
        <b>{tx(`pack.zd.t.${tile.id}`, tile.name)}</b>
        {bl && <span className="bg">{bl.have}/{bl.nx}</span>}
      </button>
    );
  };

  const groupTiles = ZTILES.filter((x) => x.group === tab);
  const subTiles = groupTiles.filter((x) => x.subs && eff(x) > 0);

  return (
    <PackPopup label={tx('pack.zd.title', 'Log today')} onClose={popClose} className="zd-pop">
      <style>{PF_FIELD_CSS}{PHOTO_CSS}{PROGRESS_CSS}{CSS}{kbLiftCSS('zd-pop', MODAL_MAX_H)}</style>
      <div className="zd-sheet" ref={sheetRef}>
        <div className="zd-body">
          <div className="zd-top">
            <h2 className="zd-day">{tx('pack.zd.today', 'Today')}</h2>
            <p className="zd-date">{dateText}</p>
            {dogs.length > 0 && (
              <div className="zd-dogs">
                {dogs.map((g) => (
                  <button key={g.id} type="button" className={`zd-dog${pick.includes(g.id) ? ' on' : ''}`} aria-pressed={pick.includes(g.id)} aria-label={g.name ?? ''}
                    onClick={() => setPick((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}>
                    {g.photo ? <img src={sizedUrl(g.photo, 120)} alt="" /> : <i>{(g.name || '?').slice(0, 1)}</i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {today === null ? <div className="zd-empty">…</div> : dogs.length === 0 ? (
            <div className="zd-empty">{tx('pack.zd.noDogs', 'The log is kept for living dogs in the pack.')}</div>
          ) : (<>
            <div className="zd-q">
              <textarea className="pf-field" rows={2} maxLength={500} value={text} onChange={(e) => setText(e.target.value)}
                placeholder={tx('pack.zd.sentence', 'A sentence for the chronicle (optional)')} />
              <input ref={fileRef} type="file" accept="image/*" hidden data-testid="zd-file"
                onChange={(e) => {
                  const f = Array.from(e.target.files ?? [])[0];   // FileList skopírovať PRED await — po vynulovaní inputu je prázdny
                  e.target.value = '';
                  if (f) void pickPhoto(f);
                }} />
              <button type="button" className="zd-cam" disabled={!primary} aria-label={tx('pack.diary.photoAdd', 'Add a photo')} onClick={() => fileRef.current?.click()}>
                <HandCamera size={24} />
              </button>
            </div>
            {photo && (
              <div className="zd-photo">
                <div className="pk-photo" style={{ width: 56, height: 56, flex: '0 0 auto' }}><img src={photo.preview} alt="" /></div>
                <div style={{ minWidth: 0 }}>
                  <p>{photo.busy ? tx('pack.diary.photoBusy', 'Uploading…') : photo.url ? tx('pack.diary.photoReady', 'Photo attached.') : tx('pack.diary.photoOff', 'Not uploaded — the entry will be saved without it.')}</p>
                  <button type="button" className="zd-link" onClick={() => { photoSeq.current++; setPhoto(null); }}>{tx('pack.diary.photoRemove', 'Remove')}</button>
                </div>
              </div>
            )}

            <div className="zd-sec">{tx('pack.zd.rutina', 'Routine')}</div>
            <div className="zd-grid">{ZTILES.filter((x) => x.group === 'rutina').map((x) => tileBtn(x, true))}</div>

            <div className="zd-tabs" role="tablist">
              {GROUPS.map(([g, k, fb]) => (
                <button key={g} type="button" role="tab" aria-selected={tab === g} className={`zd-tab${tab === g ? ' on' : ''}`} onClick={() => setTab(g)}>
                  {tx(k, fb)}{tabCount(g) > 0 && <i>{tabCount(g)}</i>}
                </button>
              ))}
            </div>
            <div className="zd-grid">{groupTiles.map((x) => tileBtn(x))}</div>

            {subTiles.map((x) => (
              <div className="zd-subs" key={x.id}>
                <b>{x.emoji} {tx(`pack.zd.t.${x.id}`, x.name)}</b>
                {x.subs!.map(([code, label]) => (
                  <button key={code} type="button" className={`zd-chip${sub[x.id] === code ? ' on' : ''}`}
                    onClick={() => setSub((p) => ({ ...p, [x.id]: p[x.id] === code ? null : code }))}>{tx(`pack.zd.s.${code}`, label)}</button>
                ))}
              </div>
            ))}
            {tab === 'zdravie' && (sel.weight ?? 0) > 0 && (
              <div className="zd-ask">
                <b>{primary?.name ?? ''}</b>
                <input className="pf-field" inputMode="decimal" value={kg} placeholder={tx('pack.zd.kg', 'Weight in kg')} onChange={(e) => setKg(e.target.value)} />
              </div>
            )}
            {tab === 'dalsie' && hasMile && (
              <div className="zd-ask">
                <input className="pf-field" maxLength={200} value={miles} placeholder={tx('pack.zd.mile', 'What was the milestone?')} onChange={(e) => setMiles(e.target.value)} />
              </div>
            )}
            {tab === 'dalsie' && (sel.trip ?? 0) > 0 && (
              <div className="zd-subs">
                {(plans ?? []).map((p) => (
                  <button key={p.slug} type="button" className="zd-chip" onClick={() => { onClose(); navigate(p.href); }}>{p.name}</button>
                ))}
                <button type="button" className="zd-chip on" onClick={() => { onClose(); navigate('/pack/add'); }}>{tx('pack.zd.newTrip', '+ New trip')}</button>
              </div>
            )}
          </>)}
        </div>
        <div className="zd-foot">
          <button type="button" className="zd-save" disabled={!ready} onClick={() => void save()}>{tx('pack.zd.save', 'Log the day')}</button>
        </div>

        <div className={`zd-rit${ritual ? ' on' : ''}`} aria-hidden={!ritual}>
          {ritual && (<>
            <div className="zd-seal"><span className="zd-rays" /><b>{ritual.day}</b><small>{tx('pack.zd.sealToday', 'TODAY')} · {tx('pack.zd.sealDone', 'LOGGED')}</small></div>
            <div className="zd-prog">
              {rowsRef.current.map((r) => (
                <div key={r.fam} className={`zd-pg${r.hit ? ' new' : ''}`}>
                  <em>{r.emoji}</em><span className="nm">{tx(`pack.badge.${r.fam}`, r.fam)}</span>
                  <span className="bar pk-progress"><span className="pk-progress__fill" style={pctW(Math.max(3, ((r.before - r.lo) / Math.max(1, r.nx - r.lo)) * 100))} /></span>
                  <span className="v">{r.before}/{r.nx}</span>
                </div>
              ))}
            </div>
          </>)}
        </div>
      </div>
    </PackPopup>
  );
}
