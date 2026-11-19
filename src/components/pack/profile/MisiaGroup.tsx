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
// Čísla len živé: hore štyri (`dogs`, `people`, `supporters`, `monthly_eur` z `get-dashboard-stats`), členské = `ranks_monthly_eur`,
// dary = `gifts_by_month`, prevádzka = `pokladnica()` (sluzby.js), psy v núdzi = `treasuries.help`. Čo ešte neexistuje (LIVE pred flipom), nesie „—" / „príde", nie vymyslené číslo.
// 19. 11. 2026 (Matej): heroglyf je ZADARMO — rozpad 8·2·1, riadky starého príjmu, kruh „Pokladnica svorky" a bilancia ZRUŠENÉ.
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { ThinArrow } from '@/components/pack/ThinArrow';
import { b3Look, P3D_CARD } from '@/components/pack/profile/b3css';
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT as TX, FONT_TITLE, FONT_UI, VEIL_CSS, GOLD_BTN, PACK_SHADOW, VEIL_PAD } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { DALSI_UTULOK, VYPLATA_UTULKU } from '@/components/pack/PokladnicaSheet';
import { useT, useLang } from '@/i18n/LanguageContext';
import { IS_APP } from '@/lib/isApp';
import { EDGE_BASE, LIVE_EDGE_BASE, TEST_BUILD } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { pokladnica, type PrijemMesiac } from '@/lib/pokladnica';
import { GIFT_TIERS, GIFT_DEFAULT, GIFT_MIN, GIFT_MAX, giftFee, prevadzkaMesacne } from '@/lib/prispevok';
import { SysIcon } from '@/components/pack/SysIcon';
import { useMySeal } from '@/components/pack/profile/sealStore';
import { DogSeal, sealLabel } from '@/components/pack/profile/dogSeal';

/** Najnižšia platená hodnosť (Posol, `vstupne.ts` priceTable) — z nej sa rátajú mesačné náklady (Matej 19. 11.: „dajme ten tier 3,99“). */
const POSOL_EUR = 3.99;

/** 🔴 LIVE LEN NA MATEJOVO VÝSLOVNÉ „OK" (24. 10. 2026: *„nabudúce to takto nerob bez výslovného súhlasu a návrhu
 *  na live web"*). Kým je `false`, blok vidno len v `vite` deve a v testovacej appke (`TEST_BUILD`) — go-live inej session ho nevyvezie.
 *  Pred prepnutím: LIVE migrácia `20261103_prispevky.sql` + `deploy-edge.sh live prispevok prispevok-webhook` + `scripts/prispevok/setup.sh live`. */
export const MISIA_LIVE = false;
export const MISIA_ON = MISIA_LIVE || TEST_BUILD;

type Dash = { revenue_by_month?: PrijemMesiac[]; gifts_by_month?: Record<string, number>; treasuries?: { dev?: number; help?: number; hektor?: number }; givers?: number;
  dogs?: number; people?: number; supporters?: number; monthly_eur?: number; ranks_monthly_eur?: number };
type Thanks = { paid: boolean; amount: number; interval: 'month' | 'once'; next: string | null; manage: string | null };
type NodeKey = 'rank' | 'gift' | 'merch' | 'more' | 'run' | 'app' | 'res' | 'gear' | 'help' | 'people' | 'centers' | 'vet';
type Sec = 'in' | 'out';
type Node = { k: NodeKey; icon: string; color: string; eur: number | null };
type Sheet = { kind: 'all'; sec: Sec } | { kind: 'vision' } | { kind: 'gift' } | { kind: 'thanks'; t: Thanks } | { kind: 'manage' };

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

const CSS = `${VEIL_CSS}
.mi-lead{margin:0 0 ${S.lg}px;text-align:center;font-family:${FONT_UI};font-size:${TX.body}px;line-height:1.5;color:${T.inkStrong};}
.mi-lead b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.02em;}
.mi-fixed,.mi-mine{max-width:832px;margin-left:auto !important;margin-right:auto !important;}
/* DVA KROKY (príjem · výdaj; pokladnica uprostred zrušená 19. 11. 2026) (Matej 24. 10.: *„na PC to bolo lepšie horizontálne … animácie sú chudobné, v DOGYPTLANDe to vyzerá
   lepšie … budú len 3, čokoľvek stlačíš, otvorí jeden popup, kde bude všetko“*). PC = rad, mobil = stĺpec.
   Čiary sa kreslia z polohy riadkov (meria sa po vykreslení — tok nemá geometriu, ktorú by bolo treba ladiť). */
.mi-flow3{display:grid;grid-template-columns:1fr;gap:${S.xl}px;max-width:832px;margin:0 auto;font-family:${FONT_UI};}
.mi-card{display:flex;flex-direction:column;gap:${S.sm}px;width:100%;padding:${S.md}px;border-radius:${PACK_R.card}px;border:1px solid ${T.cardEdge};background:${T.tileBg};box-shadow:${PACK_SHADOW.card};cursor:pointer;text-align:left;color:${T.inkStrong};font-family:${FONT_UI};transition:transform .15s ease, box-shadow .15s ease;}
.mi-card:hover{transform:translateY(-2px);box-shadow:${PACK_SHADOW.lift};}
.mi-card > small{font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${T.inkWarm};text-align:center;}
.mi-card > b{font-family:${FONT_UI};font-weight:600;font-size:${TX.h2}px;letter-spacing:.02em;text-align:center;}
.mi-li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.tile}px;background:color-mix(in srgb, var(--c) 8%, transparent);border:1px solid color-mix(in srgb, var(--c) 40%, transparent);}
.mi-li .ic{display:grid;place-items:center;width:28px;height:28px;border-radius:${PACK_R.pill}px;border:1px solid var(--c);background:color-mix(in srgb, var(--c) 14%, transparent);}
.mi-li b{font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;}
.mi-li i{font-style:normal;font-weight:600;font-size:${TX.label}px;white-space:nowrap;}
.mi-li.soon{background:none;border-style:dashed;}
.mi-li:not([data-on="1"]) i{font-weight:400;font-size:${TX.micro}px;color:${T.inkDim};}
.mi-li.soon .ic,.mi-li.soon b{opacity:.55;} .mi-li.soon i{font-weight:400;font-size:${TX.micro}px;color:${T.inkDim};}
.mi-more{text-align:center;font-size:${TX.micro}px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${LAPIS.edge};}
@media (min-width:721px){
  .mi-flow3{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;}
}
/* HORNÝ RIAD ŠTYROCH ČÍSEL — psy · ľudia · podporovatelia · € / mesiac. Štítok bez rozstreleného písma: na 390 px je stĺpec ~85 px. */
.mi-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${S.xs}px;max-width:832px;margin:0 auto ${S.xl}px;padding:${S.sm}px ${S.xs}px;border-radius:${PACK_R.card}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};}
.mi-stats > span{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;min-width:0;text-align:center;}
.mi-stats b{font-family:${FONT_UI};font-weight:600;font-size:${TX.lead}px;letter-spacing:.02em;color:${T.inkStrong};}
.mi-stats small{font-size:${TX.micro}px;letter-spacing:.02em;color:${T.inkWarm};}
/* AKTUÁLNE MESAČNÉ NÁKLADY — mriežka labiek (53 × 5 €), rozpis služieb na rozklik (Matej 24. 10.: „schovaj a urob mriežku paciek“). */
.mi-paws{display:flex;flex-wrap:wrap;justify-content:center;gap:${S.xs}px;max-width:560px;margin:0 auto;}
.mi-paws span{display:grid;place-items:center;width:20px;height:20px;animation:mi-paw 3.6s ease-in-out infinite;}
.mi-paws span.on{animation:none;}
@keyframes mi-paw{0%,100%{opacity:.55}50%{opacity:1}}
.mi-fixd{margin-top:${S.md}px;text-align:left;}
.mi-fixd summary{cursor:pointer;text-align:center;list-style:none;font-size:${TX.micro}px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${LAPIS.edge};}
.mi-fixd summary::-webkit-details-marker{display:none;}
.mi-fixd[open] summary{margin-bottom:${S.sm}px;}
.mi-fixed{margin-top:${S.xl}px;padding:${S.md}px;border-radius:${PACK_R.card}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};text-align:center;}
.mi-fixed > small{display:block;font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${T.inkWarm};}
.mi-fixed > b{display:block;margin-top:${S.xs}px;font-family:${FONT_UI};font-weight:600;font-size:${TX.h2}px;color:${T.inkStrong};}
.mi-fixed > p{margin:${S.xs}px 0 ${S.md}px;font-size:${TX.label}px;color:${T.inkWarm};}
.mi-fixgrid{color:${T.inkStrong};display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${S.xs}px ${S.md}px;text-align:left;font-size:${TX.label}px;}
.mi-fixgrid span{display:flex;justify-content:space-between;gap:${S.sm}px;padding:${S.xs}px 0;border-bottom:1px dashed color-mix(in srgb, ${T.cardEdge} 50%, transparent);}
.mi-fixgrid span b{font-weight:600;white-space:nowrap;}
@media (min-width:721px){.mi-fixgrid{grid-template-columns:repeat(3,minmax(0,1fr));}}
/* POPUP „VŠETKO“ — tri sekcie, položka = ikonka · názov + vysvetlenie · suma. */
.mi-sec{margin:0 0 ${S.xl}px;scroll-margin-top:${S.md}px;}
.mi-sec > h3{display:flex;align-items:baseline;justify-content:space-between;gap:${S.sm}px;margin:0 0 ${S.sm}px;padding-bottom:${S.xs}px;border-bottom:1px solid ${T.cardEdge};font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.14em;text-transform:uppercase;}
.mi-sec > h3 b{font-family:${FONT_UI};font-size:${TX.label}px;letter-spacing:.02em;color:${T.inkWarm};}
.mi-sec > h4{margin:${S.md}px 0 ${S.xs}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.mi-it{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:${S.xs}px ${S.sm}px;align-items:start;padding:${S.sm}px;margin:0 0 ${S.xs}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};}
.mi-it .ic{display:grid;place-items:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:1px solid var(--c);background:color-mix(in srgb, var(--c) 14%, transparent);}
.mi-it > div b{display:block;font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.mi-it > div p{margin:${S.xs}px 0 0 !important;font-size:${TX.label}px !important;line-height:1.45;color:${T.inkWarm};}
.mi-it > i{font-style:normal;font-weight:600;font-size:${TX.label}px;white-space:nowrap;}
.mi-it.soon{border-style:dashed;background:none;} .mi-it.soon > i{font-weight:400;font-size:${TX.micro}px;color:${T.inkDim};}
.mi-it .mi-kv{grid-column:1 / -1;margin:${S.xs}px 0 0;}
/* OBRÁZOK POMOCI — útulok dnes / DOGYPT centrum (vstupy/WEB/BEFORE|AFTER shelters.png), posúvač. */
.mi-shel{margin:0 0 ${S.md}px;}
.mi-shel figure{position:relative;margin:0;aspect-ratio:16/10;width:100%;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${T.cardEdge};box-shadow:${T.panelShadow};touch-action:pan-y;}
.mi-shel img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;}
.mi-shel .after{clip-path:inset(0 0 0 var(--x));}
.mi-shel .knob{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#FBF5E6;box-shadow:${PACK_SHADOW.lift};pointer-events:none;}
.mi-shel .knob::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};border:1.5px solid ${GOLD_BTN.edge};}
.mi-shel .kn-ar{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1;display:flex;align-items:center;width:40px;justify-content:center;}
.mi-shel .kn-ar svg{margin:0 -3px;}
.mi-shel input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;}
.mi-shel .tag{position:absolute;bottom:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(0,0,0,.55);color:#FBF5E6;font-size:${TX.micro}px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;pointer-events:none;}
.mi-shel .tag.b{left:${S.sm}px;} .mi-shel .tag.a{right:${S.sm}px;}
.mi-shel figcaption{margin-top:${S.sm}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
@media (prefers-reduced-motion:reduce){.mi-paws span{animation:none;}}
.mi-mine{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;margin-top:${S.lg}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};}
.mi-mine span{display:block;font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.mi-mine p{margin:${S.xs}px 0 0;font-size:${TX.label}px;color:${T.inkStrong};}
.mi-cta{flex:none;display:inline-flex;align-items:center;justify-content:center;padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.field}px;cursor:pointer;
  border:1.5px solid ${GOLD_BTN.edge};background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;}
.mi-cta:hover{background:${LAPIS.gradHover};}
.mi-cta:disabled{opacity:.6;cursor:default;}
.mi-cta.wide{display:flex;width:100%;}
/* PRILOŽÍM LABKU (26. 10. 2026) — výzva nad tlačidlami, po ťuku len potvrdenie. */
.mi-paw{display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;margin-top:${S.lg}px;padding:${S.lg}px ${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};text-align:center;}
.mi-paw > b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.mi-paw > p{margin:0;font-size:${TX.label}px;line-height:1.5;color:${T.ink};}
.mi-paw .mi-badge{width:96px;height:96px;object-fit:contain;}
.mi-paw .mi-eye{font-weight:500;font-size:${TX.micro}px;letter-spacing:.26em;text-transform:uppercase;color:${T.inkWarm};}
.mi-paw .mi-price{font-family:${FONT_UI};font-weight:600;font-size:${TX.body}px;letter-spacing:.02em;color:${T.inkWarm};}
.mi-paw .mi-quiet{font-size:${TX.micro}px;color:${T.inkDim};}
.mi-paw-b{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:${S.md}px;margin-top:${S.xs}px;}
.mi-paw .ok{font-weight:600;font-size:${TX.body}px;color:${T.inkStrong};}
.mi-links{display:flex;justify-content:center;flex-wrap:wrap;gap:${S.lg}px;margin-top:${S.md}px;}
.mi-link{padding:0;border:0;background:none;cursor:pointer;font-family:${FONT_UI};font-size:${TX.label}px;color:${LAPIS.edge};text-decoration:underline;text-underline-offset:3px;}
/* POPUP — papyrus UPROSTRED okna (Matej 24. 10.: *„vadí mi, že je celý tak dolu“*), nie šuplík zdola. */
.mi-root.pk-veil{z-index:65;align-items:center;padding:${VEIL_PAD};}
.mi-sheet{position:relative;width:100%;max-width:520px;margin:0 auto;max-height:min(80dvh,720px);display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;box-shadow:${T.panelShadow};font-family:${FONT_UI};animation:mi-up .24s cubic-bezier(.2,.8,.2,1) both;}
@keyframes mi-up{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}
.mi-sheet .mi-rows{display:flex;flex-direction:column;gap:${S.xs}px;margin:0 0 ${S.md}px;}
.mi-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:${S.sm}px;width:100%;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.cardEdge};background:${T.tileBg};cursor:pointer;text-align:left;font-family:${FONT_UI};color:${T.inkStrong};}
.mi-row .ic{display:grid;place-items:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;background:color-mix(in srgb, var(--c) 14%, transparent);border:1px solid var(--c);}
.mi-row b{font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;}
.mi-row i{font-style:normal;font-size:${TX.label}px;font-weight:600;white-space:nowrap;}
.mi-row.soon{border-style:dashed;background:none;}
.mi-row.soon .ic,.mi-row.soon b{opacity:.6;}
.mi-row.soon i{font-weight:400;font-size:${TX.micro}px;color:${T.inkDim};}
.mi-later > p{margin:0 0 ${S.xs}px !important;font-size:${TX.micro}px !important;text-align:center;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
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
.mi-tier b{font-family:${FONT_UI};font-weight:600;font-size:${TX.h2}px;}
.mi-own{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;margin:0 0 ${S.md}px;font-size:${TX.label}px;color:${T.inkWarm};}
.mi-own input{width:96px;padding:${S.sm}px;border-radius:${PACK_R.field}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};font-size:${TX.lead}px;text-align:right;color:${T.inkStrong};}
.mi-input{width:100%;padding:${S.md}px;margin:0 0 ${S.md}px;border-radius:${PACK_R.field}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-family:${FONT_UI};font-size:${TX.lead}px;color:${T.inkStrong};}
.mi-fee{margin:0 0 ${S.md}px !important;text-align:center;font-size:${TX.label}px !important;color:${T.inkDim};}
.mi-hint{margin:${S.sm}px 0 0 !important;text-align:center;font-size:${TX.micro}px !important;letter-spacing:.14em;text-transform:uppercase;color:${T.inkDim};}
.mi-err{text-align:center;color:${PICK_INK.red};}
/* ŠAT PAPYRUS 3D (9. 11. 2026) — obsah sa nemení, len vzhľad: karty = papyrus s tmavým obrysom a zlatou perou, tlačidlá 3D, šípky tenké.
   Len pod html.papyrus3d (APP_NEW). */
html.papyrus3d .mi-lead,html.papyrus3d .mi-lead b{color:var(--p3d-ink);}
html.papyrus3d .mi-lead b{font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;font-size:${TX.lead}px;} /* písmo: nadpis */
html.papyrus3d .mi-card,html.papyrus3d .mi-stats,html.papyrus3d .mi-fixed,html.papyrus3d .mi-mine,html.papyrus3d .mi-paw{${P3D_CARD}}
html.papyrus3d .mi-card:hover{transform:none;box-shadow:var(--p3d-lift);}
html.papyrus3d .mi-card:active{transform:translateY(3px);box-shadow:none;}
html.papyrus3d .mi-card,html.papyrus3d .mi-fixed > b,html.papyrus3d .mi-paw > b,html.papyrus3d .mi-mine p,html.papyrus3d .mi-stats b{color:var(--p3d-ink);}
html.papyrus3d .mi-card > small,html.papyrus3d .mi-fixed > small,html.papyrus3d .mi-mine span,html.papyrus3d .mi-stats small,html.papyrus3d .mi-fixed > p{color:var(--p3d-gold-ink);}
html.papyrus3d .mi-paw > b{font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;} /* písmo: nadpis */
html.papyrus3d .mi-paw > p,html.papyrus3d .mi-paw .ok{color:var(--p3d-ink);}
html.papyrus3d .mi-li{border:2px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
html.papyrus3d .mi-li.soon{border-style:dashed;}
html.papyrus3d .mi-more{display:inline-flex;align-items:center;justify-content:center;gap:${S.xs}px;color:var(--p3d-ink);}
html.papyrus3d .mi-fixgrid{color:var(--p3d-ink);}
html.papyrus3d .mi-fixd summary,html.papyrus3d .mi-link{color:${LAPIS.edge};}
html.papyrus3d .mi-shel figure{border:2.5px solid var(--p3d-ink);box-shadow:var(--p3d-lift);}
html.papyrus3d .mi-shel .knob::after{border-color:${LAPIS.ink};}
${b3Look('.mi-cta', 'lapis', 'font-size:' + TX.lead + 'px;')}
html.papyrus3d .mi-cta.wide{display:flex;width:100%;}
html.papyrus3d .mi-cta:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
/* Okno Misie (popup v portáli): papyrus doska so zlatým rámom a ink obrysom, riadky ako karty 3D. */
html.papyrus3d .mi-sheet{border:3px solid var(--p3d-gold);background:var(--p3d-card);box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-gold-ink),0 13px 16px var(--p3d-sh);color:var(--p3d-ink);}
html.papyrus3d .mi-sh-head h2{font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;text-transform:none;font-size:${TX.h1}px;} /* písmo: nadpis */
html.papyrus3d .mi-it,html.papyrus3d .mi-row,html.papyrus3d .mi-kv{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-lift);color:var(--p3d-ink);}
html.papyrus3d .mi-it.soon,html.papyrus3d .mi-row.soon{border-style:dashed;box-shadow:none;}
html.papyrus3d .mi-sec > h3{border-bottom:3px solid var(--p3d-gold);color:var(--p3d-ink);}
html.papyrus3d .mi-it > div p,html.papyrus3d .mi-sec > h4,html.papyrus3d .mi-sec > h3 b,html.papyrus3d .mi-own,html.papyrus3d .mi-sign{color:var(--p3d-gold-ink);}
html.papyrus3d .mi-sh-body p{color:var(--p3d-ink);}
html.papyrus3d .mi-tog{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .mi-tog button{border-radius:${PACK_R.frame}px;color:var(--p3d-ink);}
html.papyrus3d .mi-tier,html.papyrus3d .mi-input,html.papyrus3d .mi-own input{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
html.papyrus3d .mi-tier span{color:var(--p3d-gold-ink);}
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
  // PRILOŽÍM LABKU → mail D1 s možnosťami pomoci a odkazom na dar (edge `misia-labka`). NESKÔR len skryje výzvu
  // v tomto prehliadači — pripomienky (D0/D2) sa riadia mailom, nie týmto.
  const [paw, setPaw] = useState<'idle' | 'busy' | 'sent' | 'already' | 'fail'>('idle');
  // Platiaci člen (aktívna hodnosť z DB `seal_of_user`) tlačidlo nevidí, vidí poďakovanie. Kým LIVE hodnosť nepozná = neplatiaci.
  const seal = useMySeal('veriaci');
  const payingRank = seal === 'akolyta' || seal === 'knaz' || seal === 'vezir' || seal === 'farao';
  const founder = seal === 'zakladatel';
  const lendPaw = async () => {
    setPaw('busy');
    try {
      const tok = await sessionToken();
      const r = await fetch(`${EDGE_BASE}/misia-labka`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({ lang: gl, cost: Math.round(prevadzkaMesacne().spolu), givers: dash?.givers ?? 0 }),
      });
      const j = await r.json().catch(() => ({})) as { ok?: boolean; already?: boolean };
      setPaw(r.ok && j.ok ? (j.already ? 'already' : 'sent') : 'fail');
    } catch { setPaw('fail'); }
  };

  useEffect(() => {
    // Čísla VŽDY z ostrej pokladnice (Matej 24. 10.: *„použime reálne a live dáta“*) — aj v deve; verejný GET, nič nezapisuje.
    fetch(`${LIVE_EDGE_BASE}/get-dashboard-stats`).then((r) => r.json()).then(setDash).catch(() => {});
    const sid = params.get('dakujeme');
    if (sid && !IS_APP) call<Thanks>({ action: 'session', session_id: sid }).then((th) => setSheet({ kind: 'thanks', t: th })).catch(() => {});
    if (params.has('odkaz') && !IS_APP) setSheet({ kind: 'manage' });
    // Odkaz z mailu D1 (`misia-labka`): rovno formulár daru — len na webe, v appke sa nedaruje (Apple 3.1.1).
    if (params.has('dar') && !IS_APP) setSheet({ kind: 'gift' });
  }, [params]);

  const ledger = useMemo(() => (dash?.revenue_by_month ? pokladnica(dash.revenue_by_month) : null), [dash]);
  const gifts = dash ? Object.values(dash.gifts_by_month ?? {}).reduce((a, b) => a + b, 0) : null;
  const run = ledger?.naklady ?? null;
  // `treasuries.help` je 2 €/heroglyf zo zrušeného delenia €11 (Matej 19. 11.: „ani starý príjem nenechajme“) — kým nie je skutočná pomoc, „príde“.
  const help: number | null = null;
  // Členské = aktívne mesačné hodnosti; kým to LIVE nevie (pred flipom), `null` = „príde“, nie 0.
  const ranksEur = dash?.ranks_monthly_eur ?? null;
  // V appke riadok Dary vôbec nie je (Apple 3.1.1 — pôsobil by ako výzva platiť mimo appky).
  const ins: Node[] = [
    { k: 'rank', icon: 'star', color: T.cardEdge, eur: ranksEur },
    ...(IS_APP ? [] : [{ k: 'gift', icon: 'heartpaw', color: T.partHek, eur: gifts } as Node]),
    { k: 'merch', icon: 'badge', color: T.inkDim, eur: null },
    { k: 'more', icon: 'plus', color: T.inkDim, eur: null },
  ];
  // Dva výdavkové koše (Matej 24. 10.: *„schovajme to všetko … do rozvoja po rozkliku … a do pomoci dajme toho
  // viac"*). Na ploche je len súčet, položky v šuplíku koša. Bez čísla = „keď nás bude viac", nič vymyslené.
  // 🔴 Pomoc je to, čo DOGYPT dáva ZO SVOJHO — nikde „zbierame pre útulky" (verejná zbierka smie len o.z.).
  // Farby košov sa nesmú zliať (Matej 24. 10.: *„hnedá a zlatá splývajú“*): príjem zlato/lapis, rozvoj tyrkys, pomoc červená.
  const rozvoj: Node[] = [
    { k: 'run', icon: 'cycle', color: T.partMkt, eur: run },
    { k: 'app', icon: 'idea', color: T.partMkt, eur: null },
    { k: 'res', icon: 'chemical', color: T.partMkt, eur: null },
    { k: 'gear', icon: 'locate', color: T.partMkt, eur: null },
  ];
  const pomoc: Node[] = [
    { k: 'help', icon: 'house-heart', color: T.partHelp, eur: help },
    { k: 'people', icon: 'graduate', color: T.partHelp, eur: null },
    { k: 'centers', icon: 'hut', color: T.partHelp, eur: null },
    { k: 'vet', icon: 'vet', color: T.partHelp, eur: null },
  ];
  const run1 = prevadzkaMesacne();
  // Koľko členov na najnižšej hodnosti (Posol 3,99 € mesačne, čisté po poplatku Stripe) zaplatí paušálne výdaje; dnes = platiaci členovia.
  const goalN = Math.ceil(run1.spolu / (POSOL_EUR - giftFee(POSOL_EUR, true)));
  const givers = Math.min(dash?.supporters ?? 0, goalN);

  // V appke bez cenníka (Apple 3.1.1, Matej 25. 10. 2026) — riadok bez sumy ukáže „—“.
  const NODE_TXT: Record<NodeKey, [string, string]> = {
    rank: [tx('pack.misia.rank', 'Membership (ranks)'), '—'],
    gift: [tx('pack.misia.gift', 'Gifts'), '—'],
    merch: [tx('pack.misia.merch', 'Merch'), tx('pack.misia.soon', 'coming')],
    more: [tx('pack.misia.more', 'More sources'), tx('pack.misia.soon', 'coming')],
    run: [tx('pack.misia.run', 'Running'), tx('pack.misia.run.s', 'servers, AI, mail')],
    app: [tx('pack.misia.app', 'App'), tx('pack.misia.app.s', 'development, people')],
    res: [tx('pack.misia.res', 'Research'), tx('pack.misia.res.s', 'health, longevity')],
    gear: [tx('pack.misia.gear', 'Gear'), tx('pack.misia.gear.s', 'GPS collar…')],
    help: [tx('pack.misia.help', 'Shelters'), tx('pack.misia.help.s', 'direct help')],
    people: [tx('pack.misia.people', 'People'), tx('pack.misia.people.s', 'trainers, behaviourists')],
    centers: [tx('pack.misia.centers', 'Centres'), tx('pack.misia.centers.s', 'training, adoption')],
    vet: [tx('pack.misia.vet', 'Vet care'), tx('pack.misia.vet.s', 'dogs in need')],
  };
  const sub = (n: Node) => (n.eur != null && n.eur > 0 ? eur(n.eur) : NODE_TXT[n.k][1]);
  const soon = (n: Node) => n.eur == null;
  const open = (sec: Sec) => setSheet({ kind: 'all', sec });

  // Riadok v karte na ploche — nie je samostatné tlačidlo, klikne sa celá karta (Matej: „budú len 3“).
  const Li = ({ n, label, eurV, icon, color }: { n?: Node; label?: string; eurV?: number | null; icon?: string; color?: string }) => {
    const v = n ? n.eur : eurV ?? null;
    return (
      <span className={`mi-li${v == null ? ' soon' : ''}`} data-flow={n?.k ?? label} data-on={v && v > 0 ? '1' : ''} style={{ '--c': n?.color ?? color } as CSSProperties}>
        <span className="ic"><BrandIcon name={n?.icon ?? icon ?? 'paw'} size={14} tint="dim" /></span>
        <b>{n ? NODE_TXT[n.k][0] : label}</b><i>{n ? sub(n) : v != null && v > 0 ? eur(v) : '—'}</i>
      </span>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <p className="mi-lead">
        <b>{tx('pack.misia.lead1', 'We dream of a DOGYPT for every dog person.')}</b>
        {tx('pack.misia.lead2', 'It only works if the pack carries it.')}
      </p>

      {/* HORNÝ RIAD ŠTYROCH ČÍSEL (19. 11. 2026) — živé z `get-dashboard-stats`; kým ho LIVE nevie, pomlčka. */}
      <div className="mi-stats">
        {([
          ['svorka', dash?.dogs, tx('pack.misia.st.dogs', 'Dogs'), false],
          ['ja-muz', dash?.people, tx('pack.misia.st.people', 'People'), false],
          ['trofej', dash?.supporters, tx('pack.misia.st.supporters', 'Members'), false],
          ['peniaze', dash?.monthly_eur, tx('pack.misia.st.month', '€ / month'), true],
        ] as [string, number | undefined, string, boolean][]).map(([icon, v, label, isEur]) => (
          <span key={icon}>
            <SysIcon name={icon} size={28} />
            <b>{v == null ? '—' : isEur ? `${v.toLocaleString(loc, { maximumFractionDigits: 2 })} €` : v.toLocaleString(loc)}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>

      <div className="mi-flow3">
        <button type="button" className="mi-card in" onClick={() => open('in')}>
          <small>{tx('pack.misia.in', 'Income')}</small>
          {ins.slice(0, 3).map((n) => <Li key={n.k} n={n} />)}
          <span className="mi-more">{tx('pack.misia.more.cta', 'more')} <ThinArrow dir="right" size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'currentColor' }} /></span>
        </button>
        <button type="button" className="mi-card out" onClick={() => open('out')}>
          <small>{tx('pack.misia.out', 'Spending')}</small>
          <Li label={tx('pack.misia.rozvoj', 'Growth')} eurV={run} icon="idea" color={T.partMkt} />
          <Li label={tx('pack.misia.pomoc', 'Help')} eurV={help} icon="house-heart" color={T.partHelp} />
          <span className="mi-more">{tx('pack.misia.more.cta', 'more')} <ThinArrow dir="right" size={16} style={{ display: 'inline-block', verticalAlign: 'middle', color: 'currentColor' }} /></span>
        </button>
      </div>

      <div className="mi-fixed">
        <small>{tx('pack.misia.fixed', 'Current monthly costs')}</small>
        <b>{eur(run1.spolu)}</b>
        <p>{tx('pack.misia.fixed.p', '{n} members at €3.99 a month cover them. Today there are {g}.').replace('{n}', String(goalN)).replace('{g}', String(givers))}</p>
        <div className="mi-paws" aria-hidden>
          {Array.from({ length: goalN }, (_, i) => <span key={i} className={i < givers ? 'on' : ''} style={{ animationDelay: `${(i % 11) * 0.12}s` }}><SysIcon name={i < givers ? 'hodnotenie-packa' : 'hodnotenie-packa-prazdna'} size={20} /></span>)}
        </div>
        <details className="mi-fixd">
          <summary>{tx('pack.misia.fixed.list', 'What we pay')}</summary>
          <div className="mi-fixgrid">
            {run1.mesacne.filter((q) => q.eur >= 1).map((q) => <span key={q.id}>{q.nazov}<b>{eur(q.eur)}</b></span>)}
            {run1.rocne >= 1 && <span>{tx('pack.misia.run.year', 'Yearly fees (monthly share)')}<b>{eur(run1.rocne)}</b></span>}
          </div>
        </details>
      </div>

      {notice && <p className="mi-hint">{notice}</p>}
      {/* JEDEN BLOK POMOCI (19. 11. 2026, Matej: „tie dva posledné bloky nemôžu byť … kvôli aplu … jedno tlačidlo že chcem pomôcť … my sa ozveme mailom“).
          Tlačidlo spustí mail s inštrukciami (`misia-labka`). Platiaci člen ho nevidí, vidí poďakovanie bez ceny. Na webe pribudne vedľa neho Darovať;
          v appke žiadna suma ani odkaz na platbu (Apple 3.1.1). */}
      <div className="mi-paw">
        {payingRank ? (
          <>
            <img className="mi-badge" src={`/web-app/odznaky/dogyptan-${{ akolyta: 1, knaz: 2, vezir: 3, farao: 4 }[seal as 'akolyta' | 'knaz' | 'vezir' | 'farao']}.webp`} alt="" />
            {/* Matej 19. 11.: hore malým „členstvo“, potom hodnosť a suma; text „podieľaš sa na prevádzke“. Suma len na webe:
                v appke by cena členstva kúpeného mimo Apple pôsobila ako odkaz na platbu (3.1.1) — vráti sa s IAP po flipe. */}
            <small className="mi-eye">{tx('pack.misia.member.eye', 'Membership')}</small>
            <b>{sealLabel(seal, tx)}</b>
            {!IS_APP && <span className="mi-price">{seal === 'farao' ? tx('pack.misia.member.once', 'one-off') : tx('pack.misia.member.price', '{p} a month').replace('{p}', { akolyta: '3,99 €', knaz: '7,99 €', vezir: '11,99 €' }[seal as 'akolyta' | 'knaz' | 'vezir'])}</span>}
            <p>{tx('pack.misia.member.p', 'You help run DOGYPT! Your membership keeps the servers, AINUBIS and the app in your hand running. Thank you.')}</p>
          </>
        ) : (
          <>
            {founder ? (
              <>
                <DogSeal tier="zakladatel" size={96} label={sealLabel('zakladatel', tx)} style={{ marginLeft: 0, verticalAlign: 'baseline' }} />
                <b>{tx('pack.misia.founder.lead', 'You are a Founder.')}</b>
                <p>{tx('pack.misia.founder.p', 'You came among the first, when nobody knew DOGYPT yet. This badge stays with you and your dog forever, and it will come with benefits.')}</p>
                {paw !== 'sent' && paw !== 'already' && <p className="mi-quiet">{IS_APP ? tx('pack.misia.founder.app', "If you want to keep carrying the pack, we'll e-mail you.") : tx('pack.misia.founder.web', 'You can also support the pack regularly.')}</p>}
              </>
            ) : <b>{tx('pack.misia.paw.lead', 'Lend a paw.')}</b>}
            {/* Po ťuku sa zmení samo tlačidlo, nie veta pod ním (Matej 19. 11.: „po kliknutí by som na tlačidle napísal poslali sme ti mail“). */}
            <div className="mi-paw-b">
              <button type="button" className="mi-cta" disabled={paw === 'busy' || paw === 'sent' || paw === 'already'} onClick={lendPaw}>
                {paw === 'sent' ? tx('pack.misia.paw.sent', 'Check your inbox ✓') : paw === 'already' ? tx('pack.misia.paw.already', 'The e-mail is already in your inbox ✓') : tx('pack.misia.paw.cta', 'I want to help')}
              </button>
              {!IS_APP && paw !== 'sent' && paw !== 'already' && <button type="button" className="mi-cta" onClick={() => { setNotice(null); setSheet({ kind: 'gift' }); }}>{tx('pack.misia.give', 'Give')}</button>}
            </div>
            {paw === 'fail' && <p>{tx('pack.misia.paw.fail', 'It did not go through. Try again in a moment.')}</p>}
          </>
        )}
      </div>
      <div className="mi-links">
        <button type="button" className="mi-link" onClick={() => setSheet({ kind: 'vision' })}>{tx('pack.misia.vision', 'Our idea')}</button>
      </div>

      {sheet && (
        <MiSheet wide={sheet.kind === 'all'} onClose={() => setSheet(null)} title={
          sheet.kind === 'all' ? (sheet.sec === 'in' ? tx('pack.misia.in', 'Income') : tx('pack.misia.out', 'Spending'))
            : sheet.kind === 'vision' ? tx('pack.misia.vision', 'Our idea')
              : sheet.kind === 'thanks' ? tx('carry.thanks.h', 'Thank you')
                : sheet.kind === 'manage' ? tx('carry.thanks.manage', 'Change or cancel')
                  : tx('pack.misia.giftTitle', 'Gift')
        } icon={sheet.kind === 'all' ? 'money' : sheet.kind === 'vision' ? 'ankh' : 'heartpaw'}>
          {sheet.kind === 'all' && (
            <AllBody sec={sheet.sec} tx={tx} eur={eur} ins={ins} rozvoj={rozvoj} pomoc={pomoc} NODE_TXT={NODE_TXT}
              onGive={IS_APP ? undefined : () => setSheet({ kind: 'gift' })} />
          )}
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

/** Útulok dnes → DOGYPT centrum. Posúvač je natívny range (klávesnica, dotyk) cez celý obrázok. */
function Shelter({ tx }: { tx: Tx }) {
  const [x, setX] = useState(50);
  return (
    <div className="mi-shel">
      <figure style={{ '--x': `${x}%` } as CSSProperties}>
        <img src="/images/mission/shelter-before.webp" alt={tx('pack.misia.shel.b', 'Shelter today')} loading="lazy" />
        <img className="after" src="/images/mission/shelter-after.webp" alt={tx('pack.misia.shel.a', 'A DOGYPT centre')} loading="lazy" />
        <span className="tag b">{tx('pack.misia.shel.b', 'Shelter today')}</span>
        <span className="tag a">{tx('pack.misia.shel.a', 'A DOGYPT centre')}</span>
        <span className="knob" aria-hidden><span className="kn-ar"><ThinArrow dir="left" size={16} style={{ color: LAPIS.ink }} /><ThinArrow dir="right" size={16} style={{ color: LAPIS.ink }} /></span></span>
        <input type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label={tx('pack.misia.shel.cap', 'Where help goes when there are more of us')} />
      </figure>
      <figcaption>{tx('pack.misia.shel.cap', 'Where help goes when there are more of us')}</figcaption>
    </div>
  );
}

function MiSheet({ title, icon, onClose, children, wide }: { title: string; icon: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
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
      <div className="mi-sheet" style={wide ? { maxWidth: 720 } : undefined}>
        <div className="mi-sh-head" style={{ paddingTop: S.md }}>
          <BackButton tone="pale" onClick={onClose} label={title} />
          <h2><BrandIcon name={icon} size={20} tint="dim" />{title}</h2>
        </div>
        <div className="mi-sh-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** JEDEN POPUP SO VŠETKÝM (Matej 24. 10.): PRÍJEM · POKLADNICA · VÝDAJ, každá položka s vysvetlením; otvorí sa na
 *  sekcii, ktorú človek stlačil. Obrázok útulku žije vo VÝDAJI pri POMOCI. */
function AllBody({ sec, tx, eur, ins, rozvoj, pomoc, NODE_TXT, onGive }: {
  sec: Sec; tx: Tx; eur: (n: number) => string; ins: Node[]; rozvoj: Node[]; pomoc: Node[]; NODE_TXT: Record<NodeKey, [string, string]>;
  onGive?: () => void;
}) {
  const refs = { in: useRef<HTMLElement>(null), out: useRef<HTMLElement>(null) };
  useEffect(() => { if (sec !== 'in') refs[sec].current?.scrollIntoView({ block: 'start' }); }, [sec]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = prevadzkaMesacne();
  const P: Record<NodeKey, string> = {
    rank: IS_APP ? '' : tx('pack.misia.rank.p', 'Voluntary membership: Believer, Messenger, Builder, Vizier, Pharaoh. A Believer is free, higher ranks carry the pack monthly.'),
    gift: IS_APP ? '' : tx('pack.misia.gift.p', 'A voluntary gift, monthly or once. It unlocks nothing — that is why it is a gift, not a membership. After the Stripe fee all of it goes to growing DOGYPT.'),
    merch: tx('pack.misia.merch.p', 'Shirts, patches and things for dogs. What they earn goes to the treasury.'),
    more: tx('pack.misia.more.p', 'We will only add sources that need no ads and no investors.'),
    run: tx('pack.misia.run.p', 'So that DOGYPT runs at all: servers, AI, mail, app licences. This is paid first.'),
    app: tx('pack.misia.app.p', 'Building the app: software, hardware, people and services. Today Matej builds it alone and unpaid.'),
    res: tx('pack.misia.res.p', 'How to live longer and healthier with your dog: the longevity protocol, the AI vet, supplements that make sense.'),
    gear: tx('pack.misia.gear.p', 'Our own gear for dogs and their people, for example a GPS collar.'),
    people: tx('pack.misia.people.p', 'Paying the people who help dogs: trainers, behaviourists, people working in shelters.'),
    centers: tx('pack.misia.centers.p', 'Building places for dogs: training, adoption and rehabilitation centres.'),
    vet: tx('pack.misia.vet.p', 'Treatment and operations for dogs nobody else would pay for.'),
    help: IS_APP ? '' : tx('pack.misia.help.p', 'What DOGYPT gives to dogs in need. Every {n} goes out to the next shelter, now {shelter}.')
      .replace('{n}', eur(VYPLATA_UTULKU)).replace('{shelter}', `${DALSI_UTULOK.meno}, ${DALSI_UTULOK.mesto}`),
  };
  const It = ({ n }: { n: Node }) => (
    <div className={`mi-it${n.eur == null ? ' soon' : ''}`} style={{ '--c': n.color } as CSSProperties}>
      <span className="ic"><BrandIcon name={n.icon} size={16} tint="dim" /></span>
      <div><b>{NODE_TXT[n.k][0]}</b>{P[n.k] && <p>{P[n.k]}</p>}</div>
      <i>{n.eur != null && n.eur > 0 ? eur(n.eur) : n.eur == null ? tx('pack.misia.later', 'When there are more of us') : '0 €'}</i>
      {n.k === 'run' && (
        <div className="mi-kv">
          <span>{tx('pack.misia.perMonth', 'Per month')}</span><b>{eur(run.spolu)}</b>
          {run.mesacne.filter((q) => q.eur >= 1).map((q) => <Fragment key={q.id}><span>{q.nazov}</span><b>{eur(q.eur)}</b></Fragment>)}
          {run.rocne >= 1 && <><span>{tx('pack.misia.run.year', 'Yearly fees (monthly share)')}</span><b>{eur(run.rocne)}</b></>}
        </div>
      )}
    </div>
  );
  const sum = (ns: Node[]) => ns.reduce((a, n) => a + (n.eur ?? 0), 0);
  return (
    <>
      <section className="mi-sec" ref={refs.in}>
        <h3>{tx('pack.misia.in', 'Income')}</h3>
        <p>{tx('pack.misia.in.p', 'Where the money in the treasury comes from.')}</p>
        {ins.map((n) => <It key={n.k} n={n} />)}
        {onGive && <button type="button" className="mi-cta wide" onClick={onGive}>{tx('pack.misia.give', 'Give')}</button>}
      </section>
      <section className="mi-sec" ref={refs.out}>
        <h3>{tx('pack.misia.out', 'Spending')}</h3>
        <h4>{tx('pack.misia.rozvoj', 'Growth')} · {eur(sum(rozvoj))}</h4>
        <p>{tx('pack.misia.rozvoj.p', 'So that DOGYPT runs and grows. Running costs are paid first.')}</p>
        {rozvoj.map((n) => <It key={n.k} n={n} />)}
        <h4>{tx('pack.misia.pomoc', 'Help')} · {eur(sum(pomoc))}</h4>
        <p>{tx('pack.misia.pomoc.p', 'What DOGYPT gives from its own to dogs in need — and what it wants to give when there are more of us.')}</p>
        <Shelter tx={tx} />
        {pomoc.map((n) => <It key={n.k} n={n} />)}
      </section>
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
