// ODZNAKY POD MENOM — SLUŽOBNÍK + PÚTNIK (25. 10. 2026, len za TEST_BUILD).
// Matej 25. 10.: *„ok daj to von, nech to vidím v appke"*. Schválený vzhľad = nákres
// `plany/nakresy/rebricky/profil.html` + `male.html` (výpočty farieb v `profil.mjs`, funkcia `inject`).
// Zadanie `plany/zadanie-odznaky-sluzobnik-putnik-2026-10-25.md`.
//
// Odznak = AI obrázok (public/icons/pack/rank/) + kapsula s číslom. Kapsula začína v strede odznaku,
// ľavý koniec je rovný a schovaný pod obrázkom; náplň sa ráta z VIDITEĽNEJ časti.
// ⚠️ Číslo sedí v strede viditeľnej časti (`left: s × .48`) — obrázky majú priehľadné okraje,
//    vzorec z boxu klame (merané v prehliadači).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEST_BUILD } from '@/lib/env';
import { readEvents } from '@/lib/dogEvents';
import { PACK_R, FONT_TITLE } from '@/components/pack/packTheme';

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

/** Dokončené roky služby = od najskoršieho DOG ID `basics.since` („Together since") spomedzi psov po dnes.
 *  Matej 25. 10.: *„musí to byť v DOG ID — ja to tam mám 06.06.2017"*. Psy naraz sa nezdvojujú.
 *  ⚠️ Medzera medzi psami (jeden odišiel, ďalší prišiel o roky neskôr) sa zatiaľ NEodpočíta — dátum
 *  odchodu psa v DOG ID nie je. `null` = nikto z psov dátum nemá → UČEŇ. */
export function useServantYears(dogIds: string[], enabled: boolean): number | null {
  const [years, setYears] = useState<number | null>(null);
  const key = dogIds.join(',');
  useEffect(() => {
    if (!enabled || !key) return;
    let alive = true;
    readEvents(key.split(','), ['basics.since']).then((evs) => {
      if (!alive) return;
      const last: Record<string, string> = {};
      for (const e of evs) if (typeof e.value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(e.value)) last[e.dogId] = e.value.slice(0, 10);
      const first = Object.values(last).sort()[0];
      if (!first) { setYears(null); return; }
      const [y, m, d] = first.split('-').map(Number);
      const now = new Date();
      const full = now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
      setYears(Math.max(0, full));
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
