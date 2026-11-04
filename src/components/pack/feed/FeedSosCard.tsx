// ── FEED: ČERVENÝ BLOK STRATENÉHO PSA (SOS, 4. 11. 2026) ─────────────────────────────────────
// Nad VŠETKÝM obsahom feedu (aj nad AINUBIS doskou), pre každé aktívne pátranie v krajine člena:
// horný červený pás „Svorka ťa potrebuje! Zdieľaj!" · fotka · Stratil sa MENO · lokalita a čas · ZDIEĽAŤ · OTVORIŤ.
// Max 3, ďalšie za odkazom *Ďalšie*. Žije MIMO `weave()` — nie je to príspevok, nemieša sa medzi ne a neopakuje sa pri scrolle.
// Dáta: `sosKit.useSosActive()` (bez telefónu). Celé len za `TEST_BUILD` (volajúci).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import type { SosActiveRow } from '@/lib/sos';
import { sosAgo, shareLostDog } from '@/components/pack/sosKit';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;
const MAX = 3;

export const FEED_SOS_CSS = `
.fsos{display:flex;flex-direction:column;gap:${S.md}px;}
.fsos-card{border:1px solid ${T.sosRed};border-radius:${PACK_R.card}px;overflow:hidden;background:${T.cardGrad};box-shadow:${T.cardShadow};}
.fsos-bar{background:${T.sosRed};color:#FFFFFF;padding:${S.sm}px ${S.lg}px;text-align:center;
  font:${PACK_HEAD.section.fontWeight} ${PACK_TEXT.label}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;}
.fsos-body{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px ${S.lg}px;}
.fsos-ph{flex:none;width:72px;height:72px;border-radius:${PACK_R.pill}px;border:3px solid ${T.sosRed};background:${T.tileBg} center/cover no-repeat;}
.fsos-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
.fsos-tx b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.2;color:${T.inkStrong};overflow-wrap:anywhere;} /* písmo: meno */
.fsos-tx span{font:500 ${PACK_TEXT.label}px/1.35 ${FONT_UI};color:${T.inkDim};}
.fsos-act{display:flex;gap:${S.sm}px;padding:0 ${S.lg}px ${S.md}px;}
.fsos-act button{flex:1;min-height:44px;border-radius:${PACK_R.field}px;cursor:pointer;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: cta */
.fsos-share{border:1px solid ${T.sosRedDark};background:${T.sosRed};color:#FFFFFF;}
.fsos-open{border:1px solid ${T.sosRed};background:transparent;color:${T.sosRed};}
.fsos-more{all:unset;cursor:pointer;align-self:center;font:600 ${PACK_TEXT.label}px/1 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;color:${T.sosRed};padding:${S.sm}px;}
`;

function SosCard({ r }: { r: SosActiveRow }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNavigate();
  const tx = (key: string, fb: string, vars?: Record<string, string | number>) => { const v = t(key, vars); return v === key ? fb.replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? '')) : v; };
  const share = async () => {
    await shareLostDog({
      slug: r.slug, name: r.dog_name,
      text: tx('pack.sos.feed.shareText', '{name} is lost. Help search.', { name: r.dog_name }),
      copiedText: tx('pack.sos.feed.copied', 'Link copied'),
    });
  };
  return (
    <div className="fsos-card">
      <div className="fsos-bar">{tx('pack.sos.feed.need', 'The pack needs you! Share!')}</div>
      <div className="fsos-body">
        <span className="fsos-ph" style={r.photo ? { backgroundImage: `url(${sizedUrl(r.photo, 160)})` } : undefined} />
        <span className="fsos-tx">
          <b>{tx('pack.sos.feed.lost', '{name} is lost', { name: r.dog_name })}</b>
          <span>{[r.place_label, sosAgo(r.last_seen_at, lang)].filter(Boolean).join(' · ')}</span>
        </span>
      </div>
      <div className="fsos-act">
        <button type="button" className="fsos-share" onClick={share}>{tx('pack.sos.feed.share', 'Share')}</button>
        <button type="button" className="fsos-open" onClick={() => nav(`/pack/sos/${r.slug}`)}>{tx('pack.sos.feed.open', 'Open')}</button>
      </div>
    </div>
  );
}

export function FeedSosBlock({ rows }: { rows: SosActiveRow[] }) {
  const t = useT();
  const [all, setAll] = useState(false);
  if (!rows.length) return null;
  const shown = all ? rows : rows.slice(0, MAX);
  const rest = rows.length - MAX;
  const more = t('pack.sos.feed.more', { n: rest });
  return (
    <div className="fsos">
      <style>{FEED_SOS_CSS}</style>
      {shown.map((r) => <SosCard key={r.id} r={r} />)}
      {!all && rest > 0 && (
        <button type="button" className="fsos-more" onClick={() => setAll(true)}>
          {more === 'pack.sos.feed.more' ? `More searches (${rest})` : more}
        </button>
      )}
    </div>
  );
}
