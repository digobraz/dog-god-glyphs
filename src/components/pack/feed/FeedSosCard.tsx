// ── FEED: ČERVENÝ BLOK STRATENÉHO PSA (SOS, 4. 11. 2026) ─────────────────────────────────────
// Nad VŠETKÝM obsahom feedu (aj nad AINUBIS doskou), pre každé aktívne pátranie v krajine člena:
// horný červený pás „Svorka ťa potrebuje! Zdieľaj!" · celý leták · ZDIEĽAŤ · OTVORIŤ. Bez letáku fotka, meno, lokalita a čas.
// VŽDY LEN JEDEN VEĽKÝ (Matej 4. 11.: „daj C ale nie 3 letáky vedľa seba"): ostatné pátrania sú riadky pod ním,
// ťuk na riadok ho zväčší. Max 3 riadky, ďalšie za odkazom *Ďalšie*. Žije MIMO `weave()` — nie je to príspevok, nemieša sa medzi ne a neopakuje sa pri scrolle.
// Dáta: `sosKit.useSosActive()` (bez telefónu). Celé len za `SOS_ON` (volajúci).
// ZELENÁ KARTA (5. 11. 2026): keď sa pes nájde živý, na mieste červenej sa 72 hodín ukáže zelená „Svorka ho našla!“ s poďakovaním a
// číslami, ktoré naozaj meriame (dni, zdieľania, upozornené zariadenia). Tá istá krajina ako červená, bez pushu navyše;
// pri obnovení pátrania zmizne a vráti sa červená. Pri „nežije“ sa nezobrazí NIČ (výstraha ticho zmizne).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import type { SosActiveRow, SosFoundRow } from '@/lib/sos';
import { sosAgo, shareLostDog, useSosFound } from '@/components/pack/sosKit';
import { useSosCount, useSosT } from '@/components/pack/sos/sosShared';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;
const MAX = 3;

export const FEED_SOS_CSS = `
.fsos{display:flex;flex-direction:column;gap:${S.md}px;}
.fsos-card{border:1px solid ${T.sosRed};border-radius:${PACK_R.card}px;overflow:hidden;background:${T.cardGrad};box-shadow:${T.cardShadow};}
.fsos-bar{background:${T.sosRed};color:#FFFFFF;padding:${S.sm}px ${S.lg}px;text-align:center;
  font:${PACK_HEAD.section.fontWeight} ${PACK_TEXT.label}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;}
.fsos-flyer{all:unset;display:block;width:100%;aspect-ratio:210/297;cursor:pointer;background:${T.tileBg};}
.fsos-flyer img{display:block;width:100%;height:100%;object-fit:cover;}
.fsos-body{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px ${S.lg}px;}
.fsos-ph{flex:none;width:72px;height:72px;border-radius:${PACK_R.pill}px;border:3px solid ${T.sosRed};background:${T.tileBg} center/cover no-repeat;}
.fsos-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
.fsos-tx b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.2;color:${T.inkStrong};overflow-wrap:anywhere;} /* písmo: meno */
.fsos-tx span{font:500 ${PACK_TEXT.label}px/1.35 ${FONT_UI};color:${T.inkDim};}
.fsos-act{display:flex;gap:${S.sm}px;padding:0 ${S.lg}px ${S.md}px;}
.fsos-act button{flex:1;min-height:44px;border-radius:${PACK_R.field}px;cursor:pointer;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: cta */
.fsos-flyer + .fsos-act{padding-top:${S.md}px;}
.fsos-share{border:1px solid ${T.sosRedDark};background:${T.sosRed};color:#FFFFFF;}
.fsos-open{border:1px solid ${T.sosRed};background:transparent;color:${T.sosRed};}
.fsos-row{all:unset;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.md}px;border:1px solid ${T.sosRed};border-radius:${PACK_R.tile}px;background:${T.cardGrad};}
.fsos-row .fsos-ph{width:48px;height:48px;border-width:2px;}
.fsos-card--ok{border-color:${T.growGreen};}
.fsos-card--ok .fsos-bar{background:${T.growGreen};}
.fsos-card--ok .fsos-ph{border-color:${T.growGreen};}
.fsos-card--ok .fsos-open{border-color:${T.growGreen};color:${T.growGreen};}
.fsos-more{all:unset;cursor:pointer;align-self:center;font:600 ${PACK_TEXT.label}px/1 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;color:${T.sosRed};padding:${S.sm}px;}
/* ŠAT PAPYRUS 3D (hárok H6): karta s tmavým lemom, červený pás, tlačidlá ako 3D (ZDIEĽAŤ zlaté, OTVORIŤ papierové). */
html.papyrus3d .fsos-card{border:3px solid ${T.sosRed};background:var(--p3d-card);box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-ink),0 13px 16px var(--p3d-sh);}
html.papyrus3d .fsos-card--ok{border-color:${T.growGreen};}
html.papyrus3d .fsos-tx b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;color:var(--p3d-ink);} /* písmo: meno */
html.papyrus3d .fsos-act{gap:${S.md}px;padding-bottom:${S.lg}px;}
html.papyrus3d .fsos-act button{min-height:56px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);
  box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),var(--p3d-pera);} /* písmo: cta */
html.papyrus3d .fsos-act button:active{transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent);}
html.papyrus3d .fsos-share{background:linear-gradient(180deg,color-mix(in srgb,#EFD79A 72%,white),var(--p3d-gold));box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 var(--p3d-gold-ink),0 11px 14px var(--p3d-sh);}
html.papyrus3d .fsos-open,html.papyrus3d .fsos-card--ok .fsos-open{background:linear-gradient(180deg,#fff,var(--p3d-paper));color:var(--p3d-ink);}
html.papyrus3d .fsos-row{border:2.5px solid ${T.sosRed};}
`;

function SosCard({ r }: { r: SosActiveRow }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNavigate();
  const s = useSosT(r.dog_gender);
  const tx = (key: string, fb: string, vars?: Record<string, string | number>) => { const v = t(key, vars); return v === key ? fb.replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? '')) : v; };
  const lost = r.dog_gender === 'queen' ? s('pack.sos.feed.lost.f', { name: r.dog_name }) : tx('pack.sos.feed.lost', '{name} is lost', { name: r.dog_name });
  const share = async () => {
    await shareLostDog({
      slug: r.slug, name: r.dog_name,
      flyerUrl: r.flyer_url,
      text: s('pack.sos.det.shareText', { name: r.dog_name }),
      copiedText: tx('pack.sos.feed.copied', 'Link copied'),
    });
  };
  return (
    <div className="fsos-card">
      <div className="fsos-bar">{tx('pack.sos.feed.need', 'The pack needs you! Share!')}</div>
      {r.flyer_url ? (
        <button type="button" className="fsos-flyer" onClick={() => nav(`/pack/sos/${r.slug}`)}>
          <img src={sizedUrl(r.flyer_url, 800)} alt={lost} />
        </button>
      ) : (
        <div className="fsos-body">
          <span className="fsos-ph" style={r.photo ? { backgroundImage: `url(${sizedUrl(r.photo, 160)})` } : undefined} />
          <span className="fsos-tx">
            <b>{lost}</b>
            <span>{[r.place_label, sosAgo(r.last_seen_at, lang)].filter(Boolean).join(' · ')}</span>
          </span>
        </div>
      )}
      <div className="fsos-act">
        <button type="button" className="fsos-share" onClick={share}>{tx('pack.sos.feed.share', 'Share')}</button>
        <button type="button" className="fsos-open" onClick={() => nav(`/pack/sos/${r.slug}`)}>{tx('pack.sos.feed.open', 'Open')}</button>
      </div>
    </div>
  );
}

function FoundCard({ r }: { r: SosFoundRow }) {
  const nav = useNavigate();
  const t = useT();
  const s = useSosT(r.dog_gender);
  const count = useSosCount();
  const meta = [count.days(r.search_days), r.shares > 0 ? count.shares(r.shares) : null, r.notified_count ? count.alerted(r.notified_count) : null].filter(Boolean).join(' · ');
  return (
    <div className="fsos-card fsos-card--ok">
      <div className="fsos-bar">{s('pack.sos.feed.bar')}</div>
      <div className="fsos-body">
        <span className="fsos-ph" style={r.photo ? { backgroundImage: `url(${sizedUrl(r.photo, 160)})` } : undefined} />
        <span className="fsos-tx">
          <b>{s('pack.sos.det.thanksTitle', { name: r.dog_name })}</b>
          <span>{s('pack.sos.feed.homeSub')}</span>
          <span>{meta}</span>
        </span>
      </div>
      <div className="fsos-act">
        <button type="button" className="fsos-open" onClick={() => nav(`/pack/sos/${r.slug}`)}>{t('pack.sos.feed.open') === 'pack.sos.feed.open' ? 'Open' : t('pack.sos.feed.open')}</button>
      </div>
    </div>
  );
}

function SosRow({ r, onPick }: { r: SosActiveRow; onPick: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const lost = t(r.dog_gender === 'queen' ? 'pack.sos.feed.lost.f' : 'pack.sos.feed.lost', { name: r.dog_name });
  return (
    <button type="button" className="fsos-row" onClick={onPick}>
      <span className="fsos-ph" style={r.photo ? { backgroundImage: `url(${sizedUrl(r.photo, 96)})` } : undefined} />
      <span className="fsos-tx">
        <b>{lost.startsWith('pack.sos.') ? `${r.dog_name} is lost` : lost}</b>
        <span>{[r.place_label, sosAgo(r.last_seen_at, lang)].filter(Boolean).join(' · ')}</span>
      </span>
    </button>
  );
}

export function FeedSosBlock({ rows }: { rows: SosActiveRow[] }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const [bigId, setBigId] = useState<string | null>(null);
  const found = useSosFound();
  if (!rows.length && !found.length) return null;
  const greens = found.slice(0, MAX).map((r) => <FoundCard key={r.id} r={r} />);
  if (!rows.length) return <div className="fsos"><style>{FEED_SOS_CSS}</style>{greens}</div>;
  const big = rows.find((r) => r.id === bigId) ?? rows[0];
  const others = rows.filter((r) => r.id !== big.id);
  const shown = all ? others : others.slice(0, MAX);
  const rest = others.length - MAX;
  const more = t('pack.sos.feed.more', { n: rest });
  return (
    <div className="fsos">
      <style>{FEED_SOS_CSS}</style>
      <SosCard r={big} />
      {shown.map((r) => <SosRow key={r.id} r={r} onPick={() => setBigId(r.id)} />)}
      {greens}
      {!all && rest > 0 && (
        <button type="button" className="fsos-more" onClick={() => setAll(true)}>
          {more === 'pack.sos.feed.more' ? `More searches (${rest})` : more}
        </button>
      )}
    </div>
  );
}
