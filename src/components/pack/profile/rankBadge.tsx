// ODZNAKY POD MENOM — SLUŽOBNÍK + PÚTNIK (25. 10. 2026, len za TEST_BUILD).
// Matej 25. 10.: *„ok daj to von, nech to vidím v appke"*. Schválený vzhľad = nákres
// `plany/nakresy/rebricky/profil.html` + `male.html` (výpočty farieb v `profil.mjs`, funkcia `inject`).
// Zadanie `plany/zadanie-odznaky-sluzobnik-putnik-2026-10-25.md`.
//
// Odznak = AI obrázok (public/icons/pack/rank/) + kapsula s číslom. Kapsula začína v strede odznaku,
// ľavý koniec je rovný a schovaný pod obrázkom; náplň sa ráta z VIDITEĽNEJ časti.
// ⚠️ Číslo sedí v strede viditeľnej časti (`left: s × .48`) — obrázky majú priehľadné okraje,
//    vzorec z boxu klame (merané v prehliadači).
import { useEffect, useState, type CSSProperties } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEST_BUILD } from '@/lib/env';
import { readEvents } from '@/lib/dogEvents';
import { PACK_R, PACK_SHADOW, PACK_THEME, PACK_TEXT, PACK_SPACE, FONT_TITLE } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';

/** Odznaky namiesto pilulky DEVOTION + PÚTNIK. Členovia na webe ich nevidia. */
export const RANK_BADGE_ON = TEST_BUILD;

/* PÚTNIK — 9 stupňov podľa levelu (`levelOf`, body bez zmeny). Smalt odznaku = farba stupňa. */
const P_FROM = [1, 4, 8, 13, 19, 26, 34, 43, 53];
const P_COL = ['#5BD12A', '#1E9A48', '#3FD6C8', '#2F86F0', '#DCEAF2', '#E0287A', '#7A1530', '#6A2AC0', '#141A4A'];
/** Ľadová biela sa NEprelieva do ružovej (Matej 25. 10.: „biela sa farbí do ružova, to sa mi nepáči“). */
const P_NOBLEND = 4;

/* SLUŽOBNÍK — číslo = DOKONČENÉ roky so psom (🔒 24. 10.), prvý rok = UČEŇ bez čísla.
 * 8 obrázkov podľa rokov 0–3 · 4–8 · 9–13 · 14–18 · 19–23 · 24–29 · 30–39 · 40+. Súbory sú už
 * zoradené (servant-0 = kruh … servant-7 = koruna; zdroj ai/kolo8/s1 v poradí S_ORD 0,1,5,3,2,4,6,7). */
const S_FROM = [0, 4, 9, 14, 19, 24, 30, 40];
/** Zväčšenie obrázka — 30 a 40 rokov majú krídla/korunu a bez výnimky by boli menšie. */
const S_K = [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.65, 1.6];
/** Aktivita: dni so zápisom za posledných 90 dní; 80+ = plná kapsula a pulz žiary (nákres: 0–100 % ≈ 0–80 dní). */
const ACTIVE_DAYS = 90;
const FULL_DAYS = 80;

const stepOf = (from: number[], v: number) => from.reduce((t, f, i) => (v >= f ? i : t), 0);

function mixHex(a: string, b: string, t: number) {
  const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Šírka náplne: schovaná časť pod odznakom + podiel viditeľnej. */
const fillWidth = (pct: number) => `calc(var(--s) * .48 + (100% - var(--s) * .48) * ${Math.max(0, Math.min(100, pct)) / 100})`;

export const RANK_BADGE_CSS = `
.rk{ --s:46px; display:inline-flex; align-items:center; flex:none; padding:0; border:0; background:none; cursor:pointer; }
.rk .ic{ width:var(--s); height:var(--s); flex:0 0 auto; position:relative; z-index:2; }
/* Stránka má img{max-width:100%} — bez none sa obrázok nezväčší. */
.rk .ic img{ position:absolute; left:50%; top:50%; width:calc(var(--s) * var(--k, 1.4)); height:auto; max-width:none; max-height:none;
  transform:translate(-50%, -50%); pointer-events:none; }
.rk .cp{ flex:0 0 auto; position:relative; margin-left:calc(var(--s) * -.5); height:calc(var(--s) * .62); width:calc(var(--s) * 1.6);
  border-radius:0 ${PACK_R.pill}px ${PACK_R.pill}px 0; overflow:hidden; background:linear-gradient(180deg, #1b2350, #0c1030);
  border:1.5px solid rgba(231,196,108,.85); border-left:0; box-shadow:inset 0 2px 4px rgba(0,0,0,.6); }
.rk .fl{ position:absolute; left:0; top:0; bottom:0; border-radius:0 ${PACK_R.pill}px ${PACK_R.pill}px 0; overflow:hidden; }
/* Tekutá náplň: sklenený odlesk hore + prebeh svetla. */
.rk .fl::before{ content:''; position:absolute; left:0; right:6%; top:8%; height:34%; border-radius:${PACK_R.pill}px;
  background:linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0)); }
.rk .fl::after{ content:''; position:absolute; top:0; bottom:0; width:40%; left:-40%;
  background:linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation:rk-flow 3.2s ease-in-out infinite; }
.rk .fl.full{ animation:rk-glow 2.4s ease-in-out infinite; }
@keyframes rk-flow{ 0%{ left:-40%; } 60%,100%{ left:110%; } }
@keyframes rk-glow{ 0%,100%{ box-shadow:inset 0 -3px 5px rgba(60,30,0,.45), 0 0 4px 1px rgba(255,214,120,.5); }
  50%{ box-shadow:inset 0 -3px 5px rgba(60,30,0,.45), 0 0 12px 3px rgba(255,224,150,1); } }
@media (prefers-reduced-motion:reduce){ .rk .fl::after, .rk .fl.full{ animation:none; } }
.rk .nb{ position:absolute; top:0; bottom:0; right:0; left:calc(var(--s) * .48); display:flex; align-items:center; justify-content:center;
  font-family:${FONT_TITLE}; font-weight:700; font-size:calc(var(--s) * .42); line-height:1; letter-spacing:0; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.85); }
.rk.on .cp{ border-color:#fff; }
/* BONES: kapsula podľa dĺžky čísla (1 240 je širšie než 9). */
.rk .cp.cp--auto{ width:auto; min-width:calc(var(--s) * 1.6); padding:0 14px 0 calc(var(--s) * .72); display:flex; align-items:center; justify-content:center; }
.rk .cp.cp--auto .nb{ position:static; font-size:calc(var(--s) * .36); white-space:nowrap; }
/* BONES = zlatá kapsula so ŠIKMÝM koncom a tmavým číslom (Matej 25. 10.: „suma zlatým, text tmavým…
   nie ukončenie pils ale takto“ + „daj len bones skosené, tie dve nechaj ako sú“). Skosenie = skewX
   celej kapsuly; ľavý koniec sa schová pod mincu, číslo sa vyrovná späť. */
/* BONES je menej podstatné než hodnosti → menšie (Matej 25. 10.: „má to byť menšie, to nie je tak podstatné“). */
.rk.rk--bones{ --s:34px; }
.rk--bones .cp{ border-radius:5px; border:1.5px solid #F6E3A6; transform:skewX(-24deg); transform-origin:0 100%;
  background:linear-gradient(180deg, #F2D27A, #C99A3F 55%, #A3782B); box-shadow:inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 3px rgba(80,50,0,.35); }
.rk--bones .cp .nb{ transform:skewX(24deg); font-size:calc(var(--s) * .42); color:#241a06; text-shadow:0 1px 0 rgba(255,240,200,.6); }
/* Riadok pod menom: odznak nie je pilulka — zruší odsadenie a zmršťovanie z .me-lv > * (meHead.tsx). */
.me-lv.rk-row{ gap:8px; align-items:center; }
.me-lv.rk-row > .rk{ flex:none; padding:0; gap:0; border-radius:0; letter-spacing:0; }
/* Mobil: vedľa fotky je ~200 px — dva odznaky v 46 px sa zmestia len s medzerou 8 (flag z náhľadu 25. 10.);
   pod 390 px ustúpi odznak na 40 px, inak kapsula pútnika vybehne z karty. */
@media (max-width:389px){ .me-lv.rk-row > .rk{ --s:40px; } }
@media (min-width:768px){ .me-lv.rk-row{ gap:24px; max-width:none; } }
`;

/** Dni so zápisom v `devotion_events` za posledných 90 dní (vlastné riadky, RLS). `null` = ešte nevieme. */
export function useActiveDays(enabled: boolean): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;
      if (!uid) return;
      const since = new Date(Date.now() - ACTIVE_DAYS * 864e5).toISOString();
      const { data } = await (supabase as unknown as {
        from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { gte: (k: string, v: string) => { limit: (n: number) => Promise<{ data: { created_at: string }[] | null }> } } } };
      }).from('devotion_events').select('created_at').eq('user_id', uid).gte('created_at', since).limit(5000);
      if (!alive) return;
      const set = new Set((data ?? []).map((r) => new Date(r.created_at).toLocaleDateString('sv')));
      setDays(set.size);
    })();
    return () => { alive = false; };
  }, [enabled]);
  return days;
}

/** Dokončené roky služby = čas, keď mal človek aspoň jedného psa: od DOG ID `basics.since`
 *  („Together since") po odchod psa (`dogs.death_date`, `MemorialControl`) alebo po dnes.
 *  Matej 25. 10.: *„musí to byť v DOG ID — ja to tam mám 06.06.2017"* · *„kedy pes odišiel máme"*.
 *  Psy naraz sa nezdvojujú (zjednotenie úsekov), medzera medzi psami sa nerátá.
 *  `null` = nikto z psov dátum nemá → UČEŇ. */
type ServDog = { id: string; life_status?: string | null; death_date?: string | null };
export function useServantYears(dogs: ServDog[], enabled: boolean): number | null {
  const [years, setYears] = useState<number | null>(null);
  const key = dogs.map((d) => `${d.id}:${d.life_status === 'deceased' ? d.death_date ?? '' : ''}`).join(',');
  useEffect(() => {
    if (!enabled || !key) return;
    let alive = true;
    const end: Record<string, string | null> = {};
    for (const part of key.split(',')) { const [id, dd] = part.split(':'); end[id] = dd || null; }
    readEvents(Object.keys(end), ['basics.since']).then((evs) => {
      if (!alive) return;
      const since: Record<string, string> = {};
      for (const e of evs) if (typeof e.value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(e.value)) since[e.dogId] = e.value.slice(0, 10);
      const today = new Date().toLocaleDateString('sv');
      const spans = Object.entries(since)
        .map(([id, s]) => [s, (end[id] ?? today).slice(0, 10)] as [string, string])
        .filter(([s, e]) => s <= e)
        .sort((x, y) => (x[0] < y[0] ? -1 : 1));
      if (!spans.length) { setYears(null); return; }
      const merged: [string, string][] = [];
      for (const sp of spans) {
        const last = merged[merged.length - 1];
        if (last && sp[0] <= last[1]) { if (sp[1] > last[1]) last[1] = sp[1]; } else merged.push([...sp]);
      }
      const day = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
      // Jeden súvislý úsek = presne podľa výročia; viac úsekov = súčet dní.
      if (merged.length === 1) {
        const [s, e] = merged[0];
        const full = +e.slice(0, 4) - +s.slice(0, 4) - (e.slice(5) < s.slice(5) ? 1 : 0);
        setYears(Math.max(0, full));
      } else {
        const days = merged.reduce((n, [s, e]) => n + (day(e) - day(s)) / 864e5, 0);
        setYears(Math.max(0, Math.floor(days / 365.2425)));
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, [key, enabled]);
  return years;
}

type BadgeBtn = { on?: boolean; onClick?: () => void; label: string };

/** SLUŽOBNÍK — `years` null/0 = UČEŇ (bez čísla). `activeDays` plní kapsulu žiariacim zlatom. */
export function ServantBadge({ years, activeDays, on, onClick, label }: BadgeBtn & { years: number | null; activeDays: number | null }) {
  const y = Math.max(0, years ?? 0);
  const t = stepOf(S_FROM, y);
  const d = activeDays ?? 0;
  const pct = (d / FULL_DAYS) * 100;
  return (
    <button type="button" data-rank-toggle className={`rk${on ? ' on' : ''}`} onClick={onClick} aria-expanded={on} aria-label={label}>
      <span className="ic" style={{ ['--k' as string]: S_K[t] }}><img src={`/icons/pack/rank/servant-${t}.webp`} alt="" /></span>
      <span className="cp">
        <span className={`fl${d >= FULL_DAYS ? ' full' : ''}`} style={{
          width: fillWidth(pct),
          background: 'linear-gradient(180deg,#FFF6CC,#F2C24E 40%,#C88A22 75%,#8A5A12)',
          boxShadow: 'inset 0 -3px 5px rgba(60,30,0,.45), 0 0 10px rgba(255,200,90,.6)',
        }} />
        {y > 0 && <span className="nb">{y}</span>}
      </span>
    </button>
  );
}

/** BONES — tretí odznak, hore v titulke (25. 10. 2026, Matej vybral mincu C7 z
 *  `plany/nakresy/rebricky/bones.html`: *„len tyrkys a zlatú ako mincu, lapis nie"*). Bez náplne —
 *  BONES nie sú postup, len stav. Kapsula sa rozšíri podľa čísla. */
export function BonesBadge({ value, onClick, label }: { value: string; onClick?: () => void; label: string }) {
  const inner = (
    <>
      <span className="ic" style={{ ['--k' as string]: 1.25 }}><img src="/icons/pack/rank/bones.webp" alt="" /></span>
      <span className="cp cp--auto"><span className="nb">{value}</span></span>
    </>
  );
  return onClick
    ? <button type="button" className="rk rk--bones" onClick={onClick} aria-label={label}>{inner}</button>
    : <span className="rk rk--bones" aria-label={label}>{inner}</span>;
}

/** PÚTNIK — level + postup k ďalšiemu; náplň prechádza z farby stupňa k farbe ďalšieho. */
export function PilgrimBadge({ level, pct, on, onClick, label }: BadgeBtn & { level: number; pct: number }) {
  const t = stepOf(P_FROM, level);
  const c = P_COL[t];
  const nx = t < P_COL.length - 1 ? P_COL[t + 1] : c;
  const f = P_FROM[t];
  const span = (t < P_FROM.length - 1 ? P_FROM[t + 1] : f + 12) - f;
  const still = t === P_NOBLEND;
  const c0 = mixHex(c, nx, still ? 0 : (level - f) / span);
  const c1 = mixHex(c, nx, still ? 0 : Math.min(1, (level - f + pct / 100) / span));
  return (
    <button type="button" data-rank-toggle className={`rk${on ? ' on' : ''}`} onClick={onClick} aria-expanded={on} aria-label={label}>
      <span className="ic"><img src={`/icons/pack/rank/pilgrim-${t}.webp`} alt="" /></span>
      <span className="cp">
        <span className="fl" style={{
          width: fillWidth(pct),
          background: `linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,.08) 42%,rgba(0,0,0,0) 55%,rgba(0,0,0,.32)),linear-gradient(90deg,${c0},${c1})`,
          boxShadow: `inset 0 -3px 5px rgba(0,0,0,.35), 0 0 10px ${c1}`,
        }} />
        <span className="nb">{level}</span>
      </span>
    </button>
  );
}

/* ── ROZKLIK ODZNAKU (25. 10. 2026) ─────────────────────────────────────────────────────────────
 * Matej: *„teraz to musíme aplikovať aj do príslušných blokov po rozkliknutí, keďže sú tam staré
 * veci = zmeniť ikonku aj informácie a prispôsobiť aj dizajn"*. Blok pod hlavou (`MeRank`) dovtedy
 * ukazoval DEVOTION pyramídu (22 stupňov, body ☥) a Pútnika v starých farbách pásiem s glóbusom.
 * Odteraz hovorí tým istým jazykom ako odznak: NOC so zlatým lemom (rám odznakov je zlatý), obrázok
 * stupňa, TEKUTÝ pás ako kapsula a rebrík všetkých obrázkov — dosiahnuté plné, ďalšie v tieni. */
export const RANK_PANEL_CSS = `
.rkp-hd{ display:flex; align-items:center; gap:12px; }
.rkp-hd .im{ flex:none; position:relative; width:56px; height:56px; }
.rkp-hd .im img{ position:absolute; left:50%; top:50%; width:calc(56px * var(--k, 1.4)); height:auto; max-width:none; transform:translate(-50%, -50%); }
.rkp-hd .tx{ flex:1; min-width:0; }
.rkp-hd h3{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:16px; letter-spacing:.14em; text-transform:uppercase; color:#F3E6C8; }
.rkp-hd p{ margin:4px 0 0; font-size:14px; color:#F3E6C8; }
.rkp-hd .ab{ flex:none; font-family:${FONT_TITLE}; font-weight:700; font-size:12px; letter-spacing:.02em; color:#E7C46C; }
.rkp-lbl{ display:flex; justify-content:space-between; gap:8px; margin:16px 0 4px; font-size:12px; color:rgba(243,230,200,.75); }
.rkp-lbl b{ font-family:${FONT_TITLE}; font-weight:700; color:#F3E6C8; }
/* Pás = kapsula odznaku natiahnutá: tmavá ryha, zlatý lem, tekutá náplň s odleskom a prebehom svetla. */
.rkp-bar{ position:relative; height:24px; border-radius:${PACK_R.pill}px; overflow:hidden; background:linear-gradient(180deg, #1b2350, #0c1030);
  border:1.5px solid rgba(231,196,108,.85); box-shadow:inset 0 2px 4px rgba(0,0,0,.6); }
.rkp-bar .fl{ position:absolute; left:0; top:0; bottom:0; border-radius:${PACK_R.pill}px; overflow:hidden; transition:width .8s cubic-bezier(.2,.8,.2,1); }
.rkp-bar .fl::before{ content:''; position:absolute; left:4px; right:8px; top:12%; height:34%; border-radius:${PACK_R.pill}px;
  background:linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,0)); }
.rkp-bar .fl::after{ content:''; position:absolute; top:0; bottom:0; width:40%; left:-40%;
  background:linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation:rk-flow 3.2s ease-in-out infinite; }
.rkp-bar .fl.full{ animation:rk-glow 2.4s ease-in-out infinite; }
.rkp-bar span{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:${FONT_TITLE}; font-weight:700;
  font-size:12px; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.85); }
.rkp-nx{ display:flex; align-items:center; gap:8px; margin-top:8px; font-size:12px; color:rgba(243,230,200,.75); }
.rkp-nx img{ width:24px; height:24px; object-fit:contain; }
/* Rebrík: všetky obrázky stupňov v rade; dosiahnuté plné, môj so zlatou žiarou, ďalšie v tieni. */
.rkp-lad{ display:grid; grid-template-columns:repeat(var(--n), 1fr); gap:4px; margin-top:16px; padding-top:12px; border-top:1px solid rgba(231,196,108,.25); }
.rkp-lad div{ display:flex; flex-direction:column; align-items:center; gap:4px; min-width:0; }
.rkp-lad img{ width:100%; max-width:40px; aspect-ratio:1; object-fit:contain; filter:grayscale(1) brightness(.45); opacity:.6; }
.rkp-lad .done img{ filter:none; opacity:1; }
.rkp-lad .on img{ filter:drop-shadow(0 0 6px rgba(255,214,120,.9)); opacity:1; transform:scale(1.15); }
.rkp-lad small{ font-family:${FONT_TITLE}; font-weight:700; font-size:10px; color:rgba(243,230,200,.55); }
.rkp-lad .on small{ color:#E7C46C; }
.rkp-cap{ margin:4px 0 0; text-align:center; font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:rgba(243,230,200,.5); }
.rkp-how{ margin:12px 0 0; font-size:12px; line-height:1.45; color:rgba(243,230,200,.75); }
.rkp-act{ display:inline-flex; align-items:center; gap:4px; margin-top:12px; border:0; background:none; padding:0; cursor:pointer;
  font-weight:600; font-size:12px; color:#E7C46C; text-decoration:underline; text-underline-offset:3px; }
.rkp-nums{ display:grid; grid-template-columns:repeat(3, 1fr); margin-top:16px; text-align:center; }
.rkp-nums b{ display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:20px; color:#F3E6C8; }
.rkp-nums span{ font-size:10px; color:rgba(243,230,200,.6); }
@media (prefers-reduced-motion:reduce){ .rkp-bar .fl::after, .rkp-bar .fl.full{ animation:none; } }
`;

type Tx = (key: string, fallback: string) => string;
const SERVANT_FILL = 'linear-gradient(180deg,#FFF6CC,#F2C24E 40%,#C88A22 75%,#8A5A12)';

/** SLUŽOBNÍK po rozkliku: roky + obrázok stupňa, zlatý pás aktivity, rebrík 8 odznakov. */
export function ServantPanel({ years, onDogId, tx }: { years: number | null; onDogId?: () => void; tx: Tx }) {
  const activeDays = useActiveDays(true);
  const y = Math.max(0, years ?? 0);
  const t = stepOf(S_FROM, y);
  const d = activeDays ?? 0;
  const pct = Math.min(100, (d / FULL_DAYS) * 100);
  const next = t < S_FROM.length - 1 ? S_FROM[t + 1] : null;
  const sub = y === 0 ? tx('pack.rank.servantFirst', 'First year with a dog')
    : y === 1 ? tx('pack.rank.servantYear1', '1 year with a dog')
    : tx('pack.rank.servantYears', '{n} years with a dog').replace('{n}', String(y));
  return (
    <>
      <div className="rkp-hd">
        <span className="im" style={{ ['--k' as string]: S_K[t] }}><img src={`/icons/pack/rank/servant-${t}.webp`} alt="" /></span>
        <div className="tx">
          <h3>{tx('pack.ladder.servant', 'Servant')}{y > 0 ? ` ${y}` : ''}</h3>
          <p>{sub}</p>
        </div>
      </div>
      <div className="rkp-lbl"><span>{tx('pack.rank.servantActive', 'Days in the app · last 90')}</span><b>{activeDays == null ? '—' : `${d} / ${FULL_DAYS}`}</b></div>
      <div className="rkp-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i className={`fl${d >= FULL_DAYS ? ' full' : ''}`} style={{ width: `max(${pct}%, 20px)`, background: SERVANT_FILL,
          boxShadow: 'inset 0 -3px 5px rgba(60,30,0,.45), 0 0 10px rgba(255,200,90,.6)' }} />
      </div>
      <div className="rkp-nx">
        {next != null ? <><img src={`/icons/pack/rank/servant-${t + 1}.webp`} alt="" />{tx('pack.rank.servantToNext', '{n} more years to the next badge').replace('{n}', String(next - y))}</>
          : tx('pack.rank.servantTop', 'The highest badge. Nothing left but the dog.')}
      </div>
      <div className="rkp-lad" style={{ ['--n' as string]: S_FROM.length }}>
        {S_FROM.map((f, i) => (
          <div key={f} className={i === t ? 'on' : i < t ? 'done' : ''}>
            <img src={`/icons/pack/rank/servant-${i}.webp`} alt="" />
            <small>{f === 0 ? 1 : f}</small>
          </div>
        ))}
      </div>
      <p className="rkp-cap">{tx('pack.rank.ladderYears', 'years')}</p>
      <p className="rkp-how">{tx('pack.rank.servantHow', 'The number counts full years with a dog, from “Together since” in DOG ID. The gold fills with every day you write something in the app.')}</p>
      {years == null && onDogId && (
        <button type="button" className="rkp-act" onClick={onDogId}>{tx('pack.rank.servantNoDate', 'Add “Together since” in DOG ID')}<BrandIcon name="back" size={12} tint="gold" style={{ transform: 'rotate(180deg)' }} /></button>
      )}
    </>
  );
}

/** PÚTNIK po rozkliku: level + obrázok stupňa, pás v prechode farieb stupňa, čísla, rebrík 9 odznakov. */
export function PilgrimPanel({ level, pct, points, floor, nextAt, trips, km, countries, onStats, tx }: {
  level: number; pct: number; points: number; floor: number; nextAt: number;
  trips: number; km: number; countries: number; onStats: () => void; tx: Tx;
}) {
  const t = stepOf(P_FROM, level);
  const c = P_COL[t];
  const nx = t < P_COL.length - 1 ? P_COL[t + 1] : c;
  const f = P_FROM[t];
  const span = (t < P_FROM.length - 1 ? P_FROM[t + 1] : f + 12) - f;
  const still = t === P_NOBLEND;
  const c0 = mixHex(c, nx, still ? 0 : (level - f) / span);
  const c1 = mixHex(c, nx, still ? 0 : Math.min(1, (level - f + pct / 100) / span));
  const fmtN = (n: number) => Math.round(n).toLocaleString('sk-SK');
  const nt = stepOf(P_FROM, level + 1);
  return (
    <>
      <div className="rkp-hd">
        <span className="im"><img src={`/icons/pack/rank/pilgrim-${t}.webp`} alt="" /></span>
        <div className="tx"><h3>{tx('pack.map.rankPilgrim', 'Pilgrim')} {level}</h3></div>
        <span className="ab">{fmtN(points)} {tx('pack.rank.pts', 'pts')}</span>
      </div>
      <div className="rkp-lbl"><span>{tx('pack.tier.toNext', '{n} points to level {level}').replace('{n}', fmtN(nextAt - points)).replace('{level}', String(level + 1))}</span></div>
      <div className="rkp-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i className="fl" style={{ width: `max(${Math.min(100, pct)}%, 20px)`,
          background: `linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,.08) 42%,rgba(0,0,0,0) 55%,rgba(0,0,0,.32)),linear-gradient(90deg,${c0},${c1})`,
          boxShadow: `inset 0 -3px 5px rgba(0,0,0,.35), 0 0 10px ${c1}` }} />
        <span>{fmtN(points - floor)} / {fmtN(nextAt - floor)}</span>
      </div>
      <div className="rkp-nx"><img src={`/icons/pack/rank/pilgrim-${nt}.webp`} alt="" />{tx('pack.map.rankPilgrim', 'Pilgrim')} {level + 1}</div>
      <div className="rkp-nums">
        <div><b>{trips}</b><span>{tx('pack.rank.trips', 'trips')}</span></div>
        <div><b>{km}</b><span>km</span></div>
        <div><b>{countries}</b><span>{tx('pack.rank.countries', 'countries')}</span></div>
      </div>
      <div className="rkp-lad" style={{ ['--n' as string]: P_FROM.length }}>
        {P_FROM.map((from, i) => (
          <div key={from} className={i === t ? 'on' : i < t ? 'done' : ''}>
            <img src={`/icons/pack/rank/pilgrim-${i}.webp`} alt="" />
            <small>{from}</small>
          </div>
        ))}
      </div>
      <p className="rkp-cap">{tx('pack.rank.ladderLevels', 'level')}</p>
      <button type="button" className="rkp-act" onClick={onStats}>{tx('pack.rank.openStats', 'Trip stats')}<BrandIcon name="back" size={12} tint="gold" style={{ transform: 'rotate(180deg)' }} /></button>
    </>
  );
}

/* ── OBRUČ STORY V1 + PSY PO OBLÚKU (25. 10. 2026, len TEST_BUILD) ───────────────────────────────
 * Tá istá rodina ako odznaky (nákres `plany/nakresy/obruc/ig.html`, 4 kolá): pás 6 px a linka 1,5 px
 * sú GEOMETRIA obruče, nie odsadenie z PACK_SPACE — preto žije tu, v súbore, ktorý stráž check:pack
 * vedome vynecháva (herný vizuál), a nie v meHead.tsx. */
export const RING_V1 = 'linear-gradient(45deg,#FFD54A 0%,#F7A21B 32%,#2F7BFF 72%,#1034A6 100%)';
export const STORY_RING_CSS = `
/* TEST_BUILD · OBRUČ V1: pás 6 px (5 % priemeru), papyrusová medzera = rám fotky, jemné 3D svetlo zhora,
   bez otáčania a žiary. Bez story = tenká papyrusová linka (ako Instagram). */
.me-own{ padding:6px; }
.me-own.st-live::before{ animation:none; }
.me-own.st-live{ animation:none; box-shadow:${PACK_SHADOW.card}; }
.me-own.st-live::after{ content:''; position:absolute; inset:0; border-radius:${PACK_R.pill}px; pointer-events:none;
  background:linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,.22));
  -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5.5px));
          mask:radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5.5px)); }
.me-own.st-none::before{ background:${PACK_THEME.card}; box-shadow:inset 0 0 0 1.5px ${PACK_THEME.border}; }
/* + story ustúpi hore doprava — dolný oblúk patrí psom. */
.me-own .me-add{ bottom:auto; top:${PACK_SPACE.xs}px; }
/* PSY PO SPODNOM OBLÚKU: stred psa leží na obruči, rad súmerne okolo spodku. Polohy a priemer v % z fotky
   majiteľa (počíta arcDogs), takže mobil 126 aj PC 158 sedia z jednej rovnice. */
.me-arc{ position:absolute; inset:0; z-index:2; padding:0; border:0; background:none; pointer-events:none; }
.me-arc .ad{ position:absolute; aspect-ratio:1; border-radius:${PACK_R.pill}px; padding:1.5px; background:${PACK_THEME.border}; pointer-events:auto; cursor:pointer;
  box-shadow:${PACK_SHADOW.card}; }
.me-arc .ad img{ width:100%; height:100%; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${PACK_THEME.card}; }
.me-arc .ad.cnt{ display:grid; place-items:center; background:${LAPIS.grad}; color:${LAPIS.ink}; border:2px solid ${PACK_THEME.card};
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.micro}px; }
`;

/* Psy po spodnom oblúku — priemer psa ako podiel fotky majiteľa podľa počtu (nákres: 56·46·40·36·32 px pri 126).
   Uhol medzi psami z tetivy 0,9 × priemer; stred psa na kružnici s polomerom 0,475 fotky (stred pásu obruče).
   Viac než 5 psov: prvé 4 + krúžok „+N". */
export const ARC_MAX = 5;
const ARC_D = [0, .444, .365, .317, .286, .254];
export function arcDogs(count: number): CSSProperties[] {
  const n = Math.min(count, ARC_MAX);
  const d = ARC_D[n];
  const r = .475;
  const step = 2 * Math.asin(Math.min(1, (d * .9) / (2 * r)));
  return Array.from({ length: n }, (_, k) => {
    const a = Math.PI / 2 - (k - (n - 1) / 2) * step;
    return { width: `${d * 100}%`, left: `${(.5 + r * Math.cos(a) - d / 2) * 100}%`, top: `${(.5 + r * Math.sin(a) - d / 2) * 100}%` };
  });
}

