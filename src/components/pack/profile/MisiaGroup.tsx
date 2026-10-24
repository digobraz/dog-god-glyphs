// MISIA — skupina v úprave profilu medzi MOJOU SVORKOU a ÚČTOM (24. 10. 2026).
// Nákres `plany/nakres-profil-misia-2026-10-24.html`. Matej: *„sekcia v /profile a nový blok … vysvetlili víziu
// fungovania … musí to byť fakt easy na pochopenie … najviac sa mi páči tá rieka … na rozklik viac info"*.
// Rieka: PRÍJMY (celok + zdroje, dnešné s číslom, budúce „príde") → POKLADNICA SVORKY → VÝDAVKY.
//
// 🔴 ZADARMO = VÍZIA, NIE SĽUB (Matej 24. 10.: *„nebuďme takí priami v tom ZADARMO … mám v pláne neskôr
//    DOGYPT spoplatniť"*). Texty hovoria „snívame … ale nič nie je zadarmo", nikdy „zadarmo navždy".
// 🔴 PRÁVNE (pamäť project_dogypt_milodar_2026-10-24): obdarovaný je s.r.o. ⇒ dar NEODOMKNE nič a nikde
//    nestojí „zbierame pre útulky" (verejná zbierka smie len o.z.). Psom v núdzi DOGYPT dáva zo svojho.
// 🔴 V APPKE BEZ TLAČIDLA DAROVAŤ (Apple 3.1.1) — rieka a vysvetlenie áno.
// Čísla len živé: heroglyf = `revenue_total`, dary = `gifts_by_month`, prevádzka = `pokladnica()` (sluzby.js),
// psy v núdzi = `treasuries.help`. Čo ešte neexistuje, nesie „príde", nie vymyslené číslo.
import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT as TX, FONT_TITLE, FONT_UI, VEIL_CSS, GOLD_BTN } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { DALSI_UTULOK, VYPLATA_UTULKU } from '@/components/pack/PokladnicaSheet';
import { useT, useLang } from '@/i18n/LanguageContext';
import { IS_APP } from '@/lib/isApp';
import { EDGE_BASE } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { pokladnica, type PrijemMesiac } from '@/lib/pokladnica';
import { GIFT_TIERS, GIFT_DEFAULT, GIFT_MIN, GIFT_MAX, giftFee, prevadzkaMesacne } from '@/lib/prispevok';

/** 🔴 LIVE LEN NA MATEJOVO VÝSLOVNÉ „OK" (24. 10. 2026: *„nabudúce to takto nerob bez výslovného súhlasu a návrhu
 *  na live web"*). Kým je `false`, blok vidno len v `vite` deve — go-live inej session ho nevyvezie.
 *  Pred prepnutím: LIVE migrácia `20261103_prispevky.sql` + `deploy-edge.sh live prispevok prispevok-webhook` + `scripts/prispevok/setup.sh live`. */
export const MISIA_LIVE = false;
export const MISIA_ON = MISIA_LIVE || import.meta.env.DEV;

type Dash = { revenue_total?: number; revenue_by_month?: PrijemMesiac[]; gifts_by_month?: Record<string, number>; treasuries?: { help?: number }; givers?: number };
type Thanks = { paid: boolean; amount: number; interval: 'month' | 'once'; next: string | null; manage: string | null };
type NodeKey = 'hero' | 'gift' | 'merch' | 'more' | 'run' | 'app' | 'res' | 'gear' | 'help';
type Node = { k: NodeKey; icon: string; color: string; eur: number | null };
type Sheet = { kind: 'node'; node: Node } | { kind: 'vision' } | { kind: 'gift' } | { kind: 'thanks'; t: Thanks } | { kind: 'manage' };

async function call<R>(body: Record<string, unknown>, auth?: string): Promise<R> {
  const r = await fetch(`${EDGE_BASE}/prispevok`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? `http_${r.status}`);
  return j as R;
}

/** Token prihláseného — dar sa mu priradí k účtu. Nikdy nečaká dlhšie než 1,5 s (zaseknutý navigator.locks). */
async function sessionToken(): Promise<string | undefined> {
  try {
    const r = await Promise.race([
      supabase.auth.getSession().then((x) => x.data.session?.access_token),
      new Promise<undefined>((res) => setTimeout(() => res(undefined), 1500)),
    ]);
    return r ?? undefined;
  } catch { return undefined; }
}

const GEAR = '#7A5A2A';   // T.inkWarm — fialová je LEN výlety (brand lock), gear nesie zemitú
const CSS = `${VEIL_CSS}
.mi-lead{margin:0 0 ${S.lg}px;text-align:center;font-family:${FONT_UI};font-size:${TX.body}px;line-height:1.5;color:${T.inkStrong};}
.mi-lead b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.02em;}
.mi-pipe{display:flex;flex-direction:column;}
.mi-hd{display:flex;justify-content:center;align-items:baseline;gap:${S.sm}px;margin:0 0 ${S.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${T.inkWarm};}
.mi-hd b{font-weight:600;letter-spacing:.02em;font-size:${TX.label}px;color:${T.inkStrong};text-transform:none;}
.mi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${S.sm}px;}
.mi-grid.out{grid-template-columns:repeat(3,minmax(0,1fr));}
.mi-node{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;min-width:0;padding:${S.sm}px ${S.xs}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${T.cardEdge};background:${T.tileBg};cursor:pointer;text-align:center;font-family:${FONT_UI};color:${T.inkStrong};transition:transform .15s ease;}
.mi-node:hover{transform:translateY(-2px);}
.mi-node .ic{display:grid;place-items:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;background:color-mix(in srgb, var(--c) 14%, transparent);border:1px solid var(--c);}
.mi-node > span:last-child{display:flex;flex-direction:column;align-items:inherit;gap:2px;min-width:0;}
.mi-node b{font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;}
.mi-node i{font-style:normal;font-size:${TX.micro}px;color:${T.inkDim};}
.mi-node.soon{border-style:dashed;background:none;}
.mi-node.soon .ic,.mi-node.soon b{opacity:.6;}
.mi-flow{display:block;width:100%;height:40px;}
.mi-kasa{padding:${S.md}px;border-radius:${PACK_R.tile}px;background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};text-align:center;color:${LAPIS.ink};font-family:${FONT_UI};}
.mi-kasa small{display:block;font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;}
.mi-kasa b{display:block;margin-top:${S.xs}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.02em;color:#FBF5E6;}
.mi-kasa span{display:block;margin-top:${S.xs}px;font-size:${TX.label}px;opacity:.9;}
.mi-kasa em{display:block;margin-top:${S.sm}px;font-style:normal;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;opacity:.6;}
.mi-sub{margin:${S.md}px 0 ${S.xs}px;text-align:center;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.mi-sub:first-of-type{margin-top:0;}
.mi-goal{margin-top:${S.lg}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};text-align:center;font-family:${FONT_UI};}
.mi-goal > b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.02em;color:${T.inkStrong};}
.mi-goal p{margin:${S.xs}px 0 ${S.md}px;font-size:${TX.label}px;color:${T.inkWarm};}
.mi-paws{display:flex;flex-wrap:wrap;justify-content:center;gap:${S.xs}px;}
.mi-paws span{display:grid;place-items:center;width:20px;height:20px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};}
.mi-paws span.on{background:${LAPIS.grad};border-color:${LAPIS.edge};}
.mi-split{display:flex;gap:2px;height:24px;margin:0 0 ${S.sm}px;border-radius:${PACK_R.pill}px;overflow:hidden;}
.mi-split span{display:grid;place-items:center;min-width:0;overflow:hidden;white-space:nowrap;font-size:${TX.micro}px;font-weight:600;color:#FBF5E6;}
.mi-mine{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;margin-top:${S.lg}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};}
.mi-mine span{display:block;font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.mi-mine p{margin:${S.xs}px 0 0;font-size:${TX.label}px;color:${T.inkStrong};}
.mi-cta{flex:none;display:inline-flex;align-items:center;justify-content:center;padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.field}px;cursor:pointer;
  border:1.5px solid ${GOLD_BTN.edge};background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;}
.mi-cta:hover{background:${LAPIS.gradHover};}
.mi-cta:disabled{opacity:.6;cursor:default;}
.mi-cta.wide{display:flex;width:100%;}
.mi-links{display:flex;justify-content:center;flex-wrap:wrap;gap:${S.lg}px;margin-top:${S.md}px;}
.mi-link{padding:0;border:0;background:none;cursor:pointer;font-family:${FONT_UI};font-size:${TX.label}px;color:${LAPIS.edge};text-decoration:underline;text-underline-offset:3px;}
@media (min-width:721px){
  .mi-pipe{display:grid;grid-template-columns:minmax(0,1fr) 48px 168px 48px minmax(0,1.5fr);align-items:center;}
  .mi-grid{grid-template-columns:1fr;}
  .mi-grid.now{grid-template-columns:repeat(2,minmax(0,1fr));}
  .mi-grid.out{grid-template-columns:repeat(3,minmax(0,1fr));}
  .mi-grid.out .mi-node{flex-direction:column;justify-content:center;text-align:center;}
  .mi-grid.out .mi-node > span:last-child{align-items:center;}
  .mi-node{flex-direction:row;justify-content:flex-start;gap:${S.sm}px;padding:${S.sm}px;text-align:left;}
  .mi-node > span:last-child{align-items:flex-start;}
  .mi-flow.v{display:none;}
  .mi-flow.h{display:block;height:200px;}
}
@media (max-width:720px){ .mi-flow.h{display:none;} }
/* ŠUPLÍK — papyrus zdola (ten istý tvar ako DevotionSheet, len svetlý). */
.mi-root.pk-veil{z-index:65;align-items:flex-end;padding:0;}
.mi-sheet{position:relative;width:100%;max-width:640px;margin:0 auto;max-height:88dvh;display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border-top:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};font-family:${FONT_UI};animation:mi-up .32s cubic-bezier(.2,.8,.2,1) both;}
@keyframes mi-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.mi-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.border};margin:${S.sm}px auto 0;}
.mi-sh-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.mi-sh-head h2{margin:0;display:flex;align-items:center;gap:${S.sm}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.mi-sh-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.mi-sh-body p{margin:0 0 ${S.md}px;font-size:${TX.body}px;line-height:1.55;}
.mi-kv{display:grid;grid-template-columns:1fr auto;gap:${S.sm}px ${S.md}px;margin:0 0 ${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-size:${TX.label}px;}
.mi-kv b{font-weight:600;text-align:right;}
.mi-note{font-size:${TX.micro}px !important;color:${T.inkDim};}
.mi-sign{text-align:right;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;color:${T.inkWarm};}
.mi-tog{display:grid;grid-template-columns:1fr 1fr;gap:${S.xs}px;padding:${S.xs}px;margin:0 0 ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};}
.mi-tog button{padding:${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid transparent;background:none;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.mi-tog button.on,.mi-tier.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.mi-tiers{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${S.sm}px;margin:0 0 ${S.md}px;}
.mi-tier{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;padding:${S.sm}px ${S.xs}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:none;cursor:pointer;font-family:${FONT_UI};color:${T.inkStrong};}
.mi-tier span{font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.mi-tier b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;}
.mi-own{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;margin:0 0 ${S.md}px;font-size:${TX.label}px;color:${T.inkWarm};}
.mi-own input{width:96px;padding:${S.sm}px;border-radius:${PACK_R.field}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};font-size:${TX.lead}px;text-align:right;color:${T.inkStrong};}
.mi-input{width:100%;padding:${S.md}px;margin:0 0 ${S.md}px;border-radius:${PACK_R.field}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};font-size:${TX.lead}px;color:${T.inkStrong};}
.mi-fee{margin:0 0 ${S.md}px !important;text-align:center;font-size:${TX.label}px !important;color:${T.inkDim};}
.mi-hint{margin:${S.sm}px 0 0 !important;text-align:center;font-size:${TX.micro}px !important;letter-spacing:.14em;text-transform:uppercase;color:${T.inkDim};}
.mi-err{text-align:center;color:${PICK_INK.red};}
`;

export function MisiaBody() {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const { lang } = useLang();
  const gl = lang === 'sk' || lang === 'cs' ? lang : 'en';
  const loc = gl === 'sk' ? 'sk-SK' : gl === 'cs' ? 'cs-CZ' : 'en-IE';
  const eur = (n: number) => `${Math.round(n).toLocaleString(loc)} €`;

  const params = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), []);
  const [dash, setDash] = useState<Dash | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [notice, setNotice] = useState<string | null>(params.get('zrusene') ? tx('carry.canceled', 'Payment cancelled. Nothing was charged.') : null);

  useEffect(() => {
    fetch(`${EDGE_BASE}/get-dashboard-stats`).then((r) => r.json()).then(setDash).catch(() => {});
    const sid = params.get('dakujeme');
    if (sid) call<Thanks>({ action: 'session', session_id: sid }).then((th) => setSheet({ kind: 'thanks', t: th })).catch(() => {});
    if (params.has('odkaz')) setSheet({ kind: 'manage' });
  }, [params]);

  const ledger = useMemo(() => (dash?.revenue_by_month ? pokladnica(dash.revenue_by_month) : null), [dash]);
  const hero = dash?.revenue_total ?? null;
  const gifts = dash ? Object.values(dash.gifts_by_month ?? {}).reduce((a, b) => a + b, 0) : null;
  const run = ledger?.naklady ?? null;
  const help = dash?.treasuries?.help ?? null;
  const inTotal = (hero ?? 0) + (gifts ?? 0);
  const outTotal = (run ?? 0) + (help ?? 0);

  const ins: Node[] = [
    { k: 'hero', icon: 'ankh', color: T.cardEdge, eur: hero },
    { k: 'gift', icon: 'heartpaw', color: LAPIS.edge, eur: gifts },
    { k: 'merch', icon: 'badge', color: GEAR, eur: null },
    { k: 'more', icon: 'plus', color: GEAR, eur: null },
  ];
  // VÝDAVKY v dvoch radoch: DNES (už sa platí, má číslo) · KEĎ NÁS BUDE VIAC (čiarkované, bez čísla) — šesť
  // rovnakých dlaždíc tvrdilo, že appka či výskum už peniaze dostávajú. „Ďalej?“ zaniklo: patrí do Našej predstavy.
  const outsNow: Node[] = [
    { k: 'run', icon: 'cycle', color: T.partDev, eur: run },
    { k: 'help', icon: 'house-heart', color: T.partHelp, eur: help },
  ];
  const outsLater: Node[] = [
    { k: 'app', icon: 'idea', color: T.partHek, eur: null },
    { k: 'res', icon: 'chemical', color: T.partMkt, eur: null },
    { k: 'gear', icon: 'locate', color: GEAR, eur: null },
  ];
  // CIEĽ: koľko ľudí po 5 € mesačne zaplatí prevádzku (čisté po poplatku Stripe) — „veľa ľudí, málo peňazí“.
  const goalN = Math.ceil(prevadzkaMesacne().spolu / (GIFT_DEFAULT - giftFee(GIFT_DEFAULT, true)));
  const givers = Math.min(dash?.givers ?? 0, goalN);
  const balance = inTotal - outTotal;
  // Hrúbka prúdu = podiel na celku; prúd bez peňazí je tenký a čiarkovaný (príde).
  const w = (n: number | null, total: number) => (n && total ? Math.max(2, Math.round((n / total) * 14)) : 2);
  const dash2 = (n: number | null) => (n ? undefined : '4 4');

  const NODE_TXT: Record<NodeKey, [string, string]> = {
    hero: [tx('pack.misia.hero', 'Heroglyph'), tx('pack.misia.hero.s', '€11 per dog, once')],
    gift: [tx('pack.misia.gift', 'Gifts'), tx('pack.misia.gift.s', 'voluntary, from €3')],
    merch: [tx('pack.misia.merch', 'Merch'), tx('pack.misia.soon', 'coming')],
    more: [tx('pack.misia.more', 'More sources'), tx('pack.misia.soon', 'coming')],
    run: [tx('pack.misia.run', 'Running'), tx('pack.misia.run.s', 'servers, AI, mail')],
    app: [tx('pack.misia.app', 'App'), tx('pack.misia.app.s', 'development, people')],
    res: [tx('pack.misia.res', 'Research'), tx('pack.misia.res.s', 'health, longevity')],
    gear: [tx('pack.misia.gear', 'Gear'), tx('pack.misia.gear.s', 'GPS collar…')],
    help: [tx('pack.misia.help', 'Dogs in need'), tx('pack.misia.help.s', 'shelters')],
  };
  const sub = (n: Node) => (n.eur != null && n.eur > 0 ? eur(n.eur) : NODE_TXT[n.k][1]);
  const soon = (n: Node) => n.eur == null;

  const NodeBtn = ({ n }: { n: Node }) => (
    <button type="button" className={`mi-node${soon(n) ? ' soon' : ''}`} style={{ '--c': n.color } as CSSProperties} onClick={() => setSheet({ kind: 'node', node: n })}>
      <span className="ic"><BrandIcon name={n.icon} size={16} tint="dim" /></span>
      <span><b>{NODE_TXT[n.k][0]}</b><i>{sub(n)}</i></span>
    </button>
  );

  return (
    <>
      <style>{CSS}</style>
      <p className="mi-lead">
        <b>{tx('pack.misia.lead1', 'We dream of a DOGYPT for every dog person.')}</b>
        {tx('pack.misia.lead2', 'It only works if the pack carries it.')}
      </p>

      <div className="mi-pipe">
        <div>
          <p className="mi-hd">{tx('pack.misia.in', 'Income')}{dash && <b>{eur(inTotal)}</b>}</p>
          <div className="mi-grid">{ins.map((n) => <NodeBtn key={n.k} n={n} />)}</div>
        </div>
        <svg className="mi-flow v" viewBox="0 0 340 40" preserveAspectRatio="none" aria-hidden>
          <path d="M85 0 C85 26 170 14 170 40" stroke={T.cardEdge} strokeWidth={w(hero, inTotal)} strokeDasharray={dash2(hero)} fill="none" opacity=".8" />
          <path d="M255 0 C255 26 170 14 170 40" stroke={LAPIS.edge} strokeWidth={w(gifts, inTotal)} strokeDasharray={dash2(gifts)} fill="none" opacity=".75" />
        </svg>
        <svg className="mi-flow h" viewBox="0 0 48 200" preserveAspectRatio="none" aria-hidden>
          <path d="M0 25 C30 25 20 100 48 100" stroke={T.cardEdge} strokeWidth={w(hero, inTotal)} strokeDasharray={dash2(hero)} fill="none" opacity=".8" />
          <path d="M0 75 C30 75 20 100 48 100" stroke={LAPIS.edge} strokeWidth={w(gifts, inTotal)} strokeDasharray={dash2(gifts)} fill="none" opacity=".75" />
          <path d="M0 125 C30 125 20 100 48 100" stroke={GEAR} strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity=".5" />
          <path d="M0 175 C30 175 20 100 48 100" stroke={GEAR} strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity=".5" />
        </svg>
        {/* Bilancia = príjmy − výdavky. Záporná sa NESKRÝVA (Matej: „úprimne“) — povie, kto rozdiel nesie. */}
        <div className="mi-kasa">
          <small>{tx('pack.misia.kasa', "The pack's treasury")}</small>
          <b>{dash ? `${balance < 0 ? '−' : '+'}${eur(Math.abs(balance))}` : '…'}</b>
          <span>{balance < 0 ? tx('pack.misia.kasa.minus', 'Matej covers the gap for now') : tx('pack.misia.kasa.plus', 'left for the next step')}</span>
          <em>{tx('pack.misia.kasa.open', 'every member sees it')}</em>
        </div>
        <svg className="mi-flow v" viewBox="0 0 340 40" preserveAspectRatio="none" aria-hidden>
          <path d="M170 0 C170 26 85 14 85 40" stroke={T.partDev} strokeWidth={w(run, outTotal)} strokeDasharray={dash2(run)} fill="none" opacity=".8" />
          <path d="M170 0 C170 26 255 14 255 40" stroke={T.partHelp} strokeWidth={w(help, outTotal)} strokeDasharray={dash2(help)} fill="none" opacity=".8" />
        </svg>
        <svg className="mi-flow h" viewBox="0 0 48 200" preserveAspectRatio="none" aria-hidden>
          <path d="M0 100 C28 100 20 62 48 62" stroke={T.partDev} strokeWidth={w(run, outTotal)} strokeDasharray={dash2(run)} fill="none" opacity=".8" />
          <path d="M0 100 C28 100 20 70 48 70" stroke={T.partHelp} strokeWidth={w(help, outTotal)} strokeDasharray={dash2(help)} fill="none" opacity=".8" />
          <path d="M0 100 C28 100 20 160 48 160" stroke={T.cardEdge} strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity=".55" />
        </svg>
        <div>
          <p className="mi-hd">{tx('pack.misia.out', 'Spending')}{dash && <b>{eur(outTotal)}</b>}</p>
          <p className="mi-sub">{tx('pack.misia.now', 'Today')}</p>
          <div className="mi-grid now">{outsNow.map((n) => <NodeBtn key={n.k} n={n} />)}</div>
          <p className="mi-sub">{tx('pack.misia.later', 'When there are more of us')}</p>
          <div className="mi-grid out">{outsLater.map((n) => <NodeBtn key={n.k} n={n} />)}</div>
        </div>
      </div>

      <div className="mi-goal">
        <b>{tx('pack.misia.goal.h', '{n} people at €5 a month').replace('{n}', String(goalN))}</b>
        <p>{tx('pack.misia.goal.p', "and DOGYPT's running costs are paid. Today there are {g}.").replace('{g}', String(givers))}</p>
        <div className="mi-paws" aria-hidden>
          {Array.from({ length: goalN }, (_, i) => <span key={i} className={i < givers ? 'on' : ''}><BrandIcon name="paw" size={12} tint={i < givers ? 'white' : 'dim'} /></span>)}
        </div>
      </div>

      {notice && <p className="mi-hint">{notice}</p>}
      <div className="mi-mine">
        <div>
          <span>{tx('pack.misia.mine', 'My gift')}</span>
          <p>{IS_APP ? tx('pack.misia.mine.app', 'Gifts are made on dogypt.com') : tx('pack.misia.mine.s', 'Monthly or once, from €3')}</p>
        </div>
        {!IS_APP && <button type="button" className="mi-cta" onClick={() => { setNotice(null); setSheet({ kind: 'gift' }); }}>{tx('pack.misia.give', 'Give')}</button>}
      </div>
      <div className="mi-links">
        <button type="button" className="mi-link" onClick={() => setSheet({ kind: 'vision' })}>{tx('pack.misia.vision', 'Our idea')}</button>
      </div>

      {sheet && (
        <MiSheet onClose={() => setSheet(null)} title={
          sheet.kind === 'node' ? NODE_TXT[sheet.node.k][0]
            : sheet.kind === 'vision' ? tx('pack.misia.vision', 'Our idea')
              : sheet.kind === 'thanks' ? tx('carry.thanks.h', 'Thank you')
                : sheet.kind === 'manage' ? tx('carry.thanks.manage', 'Change or cancel')
                  : tx('pack.misia.giftTitle', 'Gift')
        } icon={sheet.kind === 'node' ? sheet.node.icon : sheet.kind === 'vision' ? 'ankh' : 'heartpaw'}>
          {sheet.kind === 'node' && <NodeDetail n={sheet.node} tx={tx} eur={eur} />}
          {sheet.kind === 'vision' && <Vision tx={tx} />}
          {sheet.kind === 'gift' && <GiftForm tx={tx} gl={gl} loc={loc} onManage={() => setSheet({ kind: 'manage' })} />}
          {sheet.kind === 'thanks' && <ThanksBody t={sheet.t} tx={tx} loc={loc} />}
          {sheet.kind === 'manage' && <ManageForm tx={tx} gl={gl} bad={params.has('odkaz')} />}
        </MiSheet>
      )}
    </>
  );
}

type Tx = (k: string, fb: string) => string;

function MiSheet({ title, icon, onClose, children }: { title: string; icon: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return createPortal(
    <div className="mi-root pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      <div className="mi-sheet">
        <span className="mi-grab" aria-hidden />
        <div className="mi-sh-head">
          <BackButton tone="pale" onClick={onClose} label={title} />
          <h2><BrandIcon name={icon} size={20} tint="dim" />{title}</h2>
        </div>
        <div className="mi-sh-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function NodeDetail({ n, tx, eur }: { n: Node; tx: Tx; eur: (n: number) => string }) {
  const run = prevadzkaMesacne();
  const P: Record<NodeKey, string> = {
    hero: tx('pack.misia.hero.p', 'Each €11 heroglyph is split: €8 to growing the community, €2 to dogs in need, €1 to Hekthor\'s bowl. It makes you a Dogyptian.'),
    gift: tx('pack.misia.gift.p', 'A voluntary gift, monthly or once. It unlocks nothing — that is why it is a gift, not a membership. After the Stripe fee all of it goes to growing DOGYPT.'),
    merch: tx('pack.misia.merch.p', 'Shirts, patches and things for dogs. What they earn goes to the treasury.'),
    more: tx('pack.misia.more.p', 'We will only add sources that need no ads and no investors.'),
    run: tx('pack.misia.run.p', 'So that DOGYPT runs at all: servers, AI, mail, app licences. This is paid first.'),
    app: tx('pack.misia.app.p', 'Building the app: software, hardware, people and services. Today Matej builds it alone and unpaid.'),
    res: tx('pack.misia.res.p', 'How to live longer and healthier with your dog: the longevity protocol, the AI vet, supplements that make sense.'),
    gear: tx('pack.misia.gear.p', 'Our own gear for dogs and their people, for example a GPS collar.'),
    help: tx('pack.misia.help.p', '€2 of every heroglyph goes to dogs in need. Every {n} goes out to the next shelter — now {shelter}.')
      .replace('{n}', eur(VYPLATA_UTULKU)).replace('{shelter}', `${DALSI_UTULOK.meno}, ${DALSI_UTULOK.mesto}`),
  };
  return (
    <>
      <p>{P[n.k]}</p>
      <div className="mi-kv">
        <span>{tx('pack.misia.sofar', 'So far')}</span>
        <b>{n.eur != null && n.eur > 0 ? eur(n.eur) : tx('pack.misia.soon', 'coming')}</b>
        {n.k === 'run' && <><span>{tx('pack.misia.perMonth', 'Per month')}</span><b>{eur(run.spolu)}</b></>}
      </div>
      {/* Heroglyf: rozpad €11 na tri diely (lib/transparency.ts — 8 · 2 · 1). */}
      {n.k === 'hero' && (
        <div className="mi-split" aria-hidden>
          <span style={{ flex: 8, background: T.cardEdge }}>8 € · {tx('pack.misia.hero.dev', 'Growing the community')}</span>
          <span style={{ flex: 2, background: T.partHelp }}>2 €</span>
          <span style={{ flex: 1, background: T.inkWarm }}>1 €</span>
        </div>
      )}
      {n.k === 'hero' && <p className="mi-note">2 € · {tx('pack.misia.help', 'Dogs in need')} · 1 € · {tx('pack.misia.hero.bowl', "Hekthor's bowl")}</p>}
      {/* Prevádzka: čo konkrétne platíme každý mesiac — z tej istej pokladnica.json ako celá pokladnica. */}
      {n.k === 'run' && (
        <div className="mi-kv">
          <span style={{ gridColumn: '1 / -1', fontWeight: 600 }}>{tx('pack.misia.run.list', 'What we pay each month')}</span>
          {run.mesacne.filter((q) => q.eur >= 1).map((q) => <Fragment key={q.id}><span>{q.nazov}</span><b>{eur(q.eur)}</b></Fragment>)}
          {run.rocne >= 1 && <><span>{tx('pack.misia.run.year', 'Yearly fees (monthly share)')}</span><b>{eur(run.rocne)}</b></>}
        </div>
      )}
      <p className="mi-note">{tx('pack.misia.live', 'The numbers come live from the treasury, nothing is typed by hand.')}</p>
    </>
  );
}

function Vision({ tx }: { tx: Tx }) {
  const bold = (s: string) => s.split('*').map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
  return (
    <>
      {['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].map((k, i) => (
        <p key={k}>{bold(tx(`pack.misia.${k}`, [
          '*Our vision is a DOGYPT every dog person can use.* Everything about dogs and your dog\'s whole life in one place.',
          'We don\'t want to go the business way. Ads, campaigns and investors sooner or later kill the spirit of the idea.',
          '*But nothing is free.* Servers, building the app, people and services cost money every month. The more of it the pack\'s *voluntary gifts* carry, the more open DOGYPT can stay.',
          'A little is enough. When there are more of us, we pay for running and building, and the rest goes to dogs: those in need, health research and new gear.',
          'The treasury is open. You see what came in and where it went, and where it goes next we decide together.',
          '*A safe place for us and our dogs.*',
        ][i]))}</p>
      ))}
      <p className="mi-sign">— Matej &amp; Hekthor</p>
    </>
  );
}

function GiftForm({ tx, gl, loc, onManage }: { tx: Tx; gl: string; loc: string; onManage: () => void }) {
  const [monthly, setMonthly] = useState(true);
  const [amount, setAmount] = useState<number>(GIFT_DEFAULT);
  const [own, setOwn] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const e2 = (n: number) => `${n.toLocaleString(loc, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;
  const ownNum = own ? Math.round(Number(own.replace(',', '.'))) : NaN;
  const value = own ? ownNum : amount;
  const valid = Number.isFinite(value) && value >= GIFT_MIN && value <= GIFT_MAX;
  const fee = valid ? giftFee(value, monthly) : 0;
  const give = async () => {
    if (!valid || busy) return;
    setBusy(true); setErr(null);
    try {
      const { url } = await call<{ url: string }>({ action: 'checkout', amount: value, interval: monthly ? 'month' : 'once', lang: gl }, await sessionToken());
      window.location.href = url;
    } catch { setErr(tx('carry.err', 'Something went wrong. Try again in a moment.')); setBusy(false); }
  };
  return (
    <>
      <div className="mi-tog" role="tablist">
        <button type="button" className={monthly ? 'on' : ''} onClick={() => setMonthly(true)}>{tx('carry.monthly', 'Monthly')}</button>
        <button type="button" className={monthly ? '' : 'on'} onClick={() => setMonthly(false)}>{tx('carry.once', 'Once')}</button>
      </div>
      <div className="mi-tiers">
        {GIFT_TIERS.map((g) => (
          <button key={g.eur} type="button" className={`mi-tier${!own && amount === g.eur ? ' on' : ''}`} onClick={() => { setAmount(g.eur); setOwn(''); }}>
            <span>{tx(`carry.tier.${g.key}`, g.key)}</span><b>{g.eur}</b>
          </button>
        ))}
      </div>
      <label className="mi-own">{tx('carry.own', 'Your amount')}
        <input inputMode="numeric" value={own} placeholder="20" onChange={(e) => setOwn(e.target.value.replace(/[^\d.,]/g, ''))} aria-label={tx('carry.own', 'Your amount')} />
      </label>
      <p className="mi-fee">{valid
        ? tx('carry.fee', 'Of {a}, {f} goes to Stripe, the rest to DOGYPT').replace('{a}', e2(value)).replace('{f}', e2(fee))
        : tx('carry.min', 'From {min} € to {max} €').replace('{min}', String(GIFT_MIN)).replace('{max}', String(GIFT_MAX))}</p>
      <button type="button" className="mi-cta wide" disabled={!valid || busy} onClick={give}>
        {(monthly ? tx('carry.cta.month', 'Give {a} a month') : tx('carry.cta.once', 'Give {a}')).replace('{a}', valid ? e2(value) : '')}
      </button>
      <p className="mi-hint">{tx('carry.hint', 'nothing in return · cancel any time · not a membership')}</p>
      {err && <p className="mi-err">{err}</p>}
      {/* Zmena / zrušenie mesačného daru — patrí k daru, nie na hlavnú plochu (tam ho nepotrebuje 99 % ľudí). */}
      <button type="button" className="mi-link" style={{ display: 'block', margin: `${S.lg}px auto 0` }} onClick={onManage}>{tx('carry.manage.q', 'Already giving monthly? Change or cancel')}</button>
      <p className="mi-note" style={{ marginTop: S.lg, textAlign: 'center' }}>{tx('carry.legal', 'Recipient: DOGYPT s. r. o., ID 54444594. A gift with nothing in return.')}</p>
    </>
  );
}

function ThanksBody({ t: th, tx, loc }: { t: Thanks; tx: Tx; loc: string }) {
  const next = th.next ? new Date(th.next).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';
  return (
    <>
      <p style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{tx('carry.thanks.p', 'From today you carry the pack.')}</p>
      <div className="mi-kv">
        <span>{th.interval === 'month' ? tx('carry.monthly', 'Monthly') : tx('carry.once', 'Once')}</span><b>{th.amount} €</b>
        {next && <><span>{tx('carry.thanks.next', 'Next payment')}</span><b>{next}</b></>}
        <span>{tx('carry.thanks.receipt', 'Receipt')}</span><b>{tx('carry.thanks.inMail', 'in your e-mail')}</b>
      </div>
      {th.manage && <a className="mi-link" href={th.manage} style={{ display: 'block', textAlign: 'center' }}>{tx('carry.thanks.manage', 'Change or cancel')}</a>}
    </>
  );
}

function ManageForm({ tx, gl, bad }: { tx: Tx; gl: string; bad: boolean }) {
  const [mail, setMail] = useState('');
  const [sent, setSent] = useState(false);
  const send = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) return;
    try { await call({ action: 'manage', email: mail.trim(), lang: gl }); } catch { /* odpoveď je rovnaká vždy */ }
    setSent(true);
  };
  if (sent) return <p>{tx('carry.manage.sent', 'If this e-mail has a monthly gift, the link is on its way.')}</p>;
  return (
    <>
      {bad && <p>{tx('carry.badlink', 'That link has expired. Enter your e-mail and we will send a new one.')}</p>}
      <input className="mi-input" type="email" value={mail} onChange={(e) => setMail(e.target.value)} placeholder={tx('carry.manage.ph', 'your e-mail')} aria-label={tx('carry.manage.ph', 'your e-mail')} />
      <button type="button" className="mi-cta wide" onClick={send}>{tx('carry.manage.send', 'Send the link')}</button>
    </>
  );
}
