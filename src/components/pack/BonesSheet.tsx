// ŠUPLÍK MISIA — ťuk na BONES na profile JA (23. 10. 2026).
// Matej: *„po kliknutí na bones by sa otvoril tiež popup so stats ohľadom misie, počet ľudí,
// bones a línie ako to už máme"* → nákres `plany/nakres-editprofile-bones-2026-10-23.html`.
//
// Tvar: na mobile šuplík zdola s úchytom, od 768 px okno v strede (lock architektura-pack
// §1.1.1). 🔴 Nikoho neodnesie preč (§4.2). Zavrie ho ŠÍPKA vľavo hore (krížik v `/pack`
// neexistuje — lock pack-dizajn-system, 27. 9.), ťuk na závoj alebo Esc.
//
// Obsah = MISIA hore (verejné čísla `get-pack-stats`, tie isté ako na homepage a v upozorneniach)
// a pod ňou blok, ktorý UŽ MÁME — `PackNetwork` (BONES, línia 1. a 2. labky, kto prišiel,
// pozývací odkaz, peňaženka). Druhá kópia tých čísel nevzniká; `bare` mu len zoberie kartu.
//
// ⚠️ Podklad je ZÁVOJ (`.pk-veil--modal`, tmavosť z receptu). Prebíja sa len z-index: 65 =
//    nad spodnou lištou (50) a AINUBIS launcherom (60), ale POD panelmi `PackNetwork`
//    (peňaženka, zoznam línie, info — `z-[70]` cez portál), ktoré sa otvárajú z neho.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PackNetwork } from '@/components/pack/PackNetwork';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, BRAND_GOLD_BTN, VEIL_CSS, PROGRESS_CSS } from '@/components/pack/packTheme';
import { getPackStats } from '@/lib/sharedFetch';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';

const T = PACK_THEME;
const S = PACK_SPACE;
const GOAL = 1_000_000;

const CSS = `
.bs-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:bs-fade .3s ease both;}
.bs-sheet{position:relative;width:100%;max-height:88dvh;display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border-top:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};
  font-family:${FONT_UI};animation:bs-up .38s cubic-bezier(.2,.8,.2,1) both;}
.bs-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto 0;}
.bs-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.bs-coin{flex:none;width:40px;height:40px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;background:${BRAND_GOLD_BTN.grad};border:1px solid ${BRAND_GOLD_BTN.edge};}
.bs-head b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1;}
.bs-head small{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bs-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.bs-mis{margin:0 0 ${S.lg}px;padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.tile}px;background:${T.ink};color:${T.card};border:1.5px solid ${T.cardEdge};}
.bs-mis small{display:block;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.cardEdge};}
.bs-mis b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;}
.bs-mis b span{font-size:${PACK_TEXT.label}px;opacity:.72;}
.bs-mis .pk-progress{margin:${S.sm}px 0 ${S.xs}px;background:rgba(201,154,63,0.22);}
.bs-mis .pk-progress__fill{min-width:${S.sm}px;}
.bs-mis p{margin:0;font-size:${PACK_TEXT.label}px;opacity:.78;}
@media (min-width:768px){
  .bs-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .bs-sheet{width:640px;max-height:86dvh;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;}
  .bs-grab{display:none;}
  .bs-head{padding-top:${S.lg}px;}
  .bs-body{padding:0 ${S.xl}px ${S.xl}px;}
}
@keyframes bs-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes bs-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.bs-sheet,.bs-root.pk-veil{animation:none;}}
`;

type Stats = { dogs?: number; total?: number };

export function BonesSheet({ bones, avatarUrl, initial, onClose }: {
  bones: number;
  avatarUrl?: string | null;
  initial?: string;
  onClose: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { getPackStats<Stats>().then(setStats).catch(() => {}); }, []);
  // Stránka pod šuplíkom sa nesmie rolovať (iPhone by „ťahal" celé okno) + Esc zavrie.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const fmt = (n: number) => n.toLocaleString(intlLocale(lang));
  // Verejný počet = psy s číslom (`dogs`), nie členovia — „číslo patrí psovi" (17. 10. 2026).
  const dogs = stats?.dogs ?? stats?.total ?? 0;
  const fillW = `${Math.min(100, (dogs / GOAL) * 100)}%`;

  return createPortal(
    <div
      className="bs-root pk-veil pk-veil--modal"
      role="dialog"
      aria-modal="true"
      aria-label="BONES"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{VEIL_CSS}</style>
      <style>{PROGRESS_CSS}</style>
      <style>{CSS}</style>
      <div className="bs-sheet">
        <span className="bs-grab" aria-hidden />
        <div className="bs-head">
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <span className="bs-coin"><BrandIcon name="bone" size={22} tint="dark" /></span>
          <div>
            <b>{fmt(bones)}</b>
            <small>BONES · {tx('pack.bones.sub', 'your part of the mission')}</small>
          </div>
        </div>
        <div className="bs-body">
          <div className="bs-mis">
            <small>{tx('pack.bones.mission', 'The mission')}</small>
            <b>{stats ? fmt(dogs) : '—'} <span>/ {fmt(GOAL)} {tx('pack.notif.dogsWord', 'dogs')}</span></b>
            <div className="pk-progress"><div className="pk-progress__fill" style={{ width: fillW }} /></div>
            <p>
              {stats?.total != null && <>{fmt(stats.total)} {tx('pack.notif.peopleWord', 'people')} · </>}
              {tx('pack.bones.line', 'Every dog you bring moves this line.')}
            </p>
          </div>
          <PackNetwork avatarUrl={avatarUrl} initial={initial} bare />
        </div>
      </div>
    </div>,
    document.body,
  );
}
