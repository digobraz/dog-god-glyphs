import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { Seo } from '@/components/Seo';
import NotFound from '@/pages/NotFound';
import { TEST_BUILD } from '@/lib/env';
import { ensurePackDict } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import { lostPublic, type LostPublic as LostRow } from '@/lib/sos';
import { FLOW_PALE_CSS } from '@/components/screens/flowPaleSkin';
import { shareLostDog } from '@/components/pack/sosKit';
import { CallPopup, SeenPopup } from '@/components/pack/sos/sosActions';
import { SOS_CSS, colorWord, useBreedLabel, useSosT, useWhen } from '@/components/pack/sos/sosShared';

/**
 * VEREJNÁ STRÁNKA STRATENÉHO PSA — `/lost/:slug` (SOS, 4. 11. 2026). BEZ PRIHLÁSENIA, noindex.
 * Čo vidí nálezca: červený blok STRATIL SA (alebo zelený NAŠIEL SA), fotka, meno, ZAVOLAŤ MAJITEĽOVI (číslo až po ťuku,
 * `lostPhone`), VIDEL SOM HO (`lost-sighting`), leták ako obrázok + ZDIEĽAŤ + STIAHNUŤ. Stav `ended` = bez telefónu.
 * Za `TEST_BUILD`: na LIVE routa vracia 404, kým Matej nepovie „ostro“.
 * 🔴 Nesmie čítať nič, čo vyžaduje session: len `lostPublic` (anon RPC) a edge `lost-sighting`.
 */
export default function LostPublic() {
  const { slug } = useParams<{ slug: string }>();
  if (!TEST_BUILD) return <NotFound />;
  return <LostPublicInner slug={slug ?? ''} />;
}

const CSS = `
.lp-main{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:8px 16px 48px;}
.lp-col{width:100%;max-width:640px;margin:0 auto;}
.lp-flyer{width:100%;display:block;border-radius:8px;box-shadow:0 8px 24px rgba(40,20,0,.3);background:#fff;}
.lp-link{display:inline-block;margin-top:16px;font-family:'Space Grotesk',sans-serif;font-size:12px;color:rgba(42,22,8,.6);text-align:center;text-decoration:none;}
.lp-link:hover{color:#16307A;}
`;

function LostPublicInner({ slug }: { slug: string }) {
  const s = useSosT();
  const breedLabel = useBreedLabel();
  const when = useWhen();
  const [row, setRow] = useState<LostRow | null | undefined>(undefined);
  const [pop, setPop] = useState<'call' | 'seen' | null>(null);

  useEffect(() => { void ensurePackDict(); }, []);
  useEffect(() => {
    let alive = true;
    setRow(undefined);
    lostPublic(slug).then((r) => alive && setRow(r)).catch(() => alive && setRow(null));
    return () => { alive = false; };
  }, [slug]);

  const download = async (url: string, name: string) => {
    try {
      const b = await (await fetch(url, { mode: 'cors' })).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = `dogypt-sos-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pes'}.${b.type === 'image/jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { window.open(url, '_blank', 'noopener'); }
  };

  const title = row ? `${row.dog_name} · ${row.status === 'found' ? s('pack.sos.found') : s('pack.sos.lost')}` : 'DOGYPT';
  const active = row?.status === 'active';

  return (
    <div className="hf-pale min-h-screen flex flex-col">
      <Seo title={title} description={row?.place_label ?? ''} path={`/lost/${slug}`} noindex ogImage={(active ? row?.flyer_url : null) ?? (row?.photo ? sizedUrl(row.photo, 1200) : undefined)} />
      <style>{FLOW_PALE_CSS + SOS_CSS + CSS}</style>
      <div className="hf-topbar"><PageTopBar /></div>
      <main className="lp-main">
        <div className="lp-col sos-stack">
          {row === undefined && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.loading')}</p>}
          {row === null && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.notFound')}</p>}
          {row && (
            <>
              {row.status === 'found' ? (
                <div className="sos-band sos-band--found"><b>{s('pack.sos.found')}</b><small>{s('pack.sos.pub.foundText')}</small></div>
              ) : row.status === 'ended' ? (
                <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.endedText')}</small></div>
              ) : (
                <div className="sos-band"><b>{s('pack.sos.lost')}</b><small>{[row.place_label, when(row.last_seen_at)].filter(Boolean).join(' · ')}</small></div>
              )}
              {row.photo ? <img className="sos-photo" src={sizedUrl(row.photo, 900)} alt={row.dog_name} /> : <div className="sos-photo sos-photo--none" />}
              <h1 className="sos-dogname">{row.dog_name}</h1>
              {(row.breed || row.color) && <p className="sos-dogsub">{[breedLabel(row.breed), colorWord(row.color, s)].filter(Boolean).join(' · ')}</p>}

              {active && (
                <>
                  <p className="sos-motto">{s('pack.sos.det.motto')}</p>
                  <button type="button" className="sos-cta" onClick={() => setPop('call')}>{s('pack.sos.det.callOwner')}</button>
                  <button type="button" className="sos-cta sos-cta--ghost" onClick={() => setPop('seen')}>{s('pack.sos.det.seen')}</button>
                  <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.pub.dontChase')}</p>
                </>
              )}

              {/* leták nesie telefón v obraze ⇒ po `found`/`ended` sa neukazuje */}
              {active && row.flyer_url && (
                <>
                  <p className="sos-eyebrow">{s('pack.sos.pub.flyer')}</p>
                  <img className="lp-flyer" src={sizedUrl(row.flyer_url, 1000)} alt="" />
                  <div className="sos-two">
                    <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: row.slug, name: row.dog_name, flyerUrl: row.flyer_url, text: s('pack.sos.det.shareText', { name: row.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.det.share')}</button>
                    <button type="button" className="sos-cta sos-cta--ghost" onClick={() => void download(row.flyer_url!, row.dog_name)}>{s('pack.sos.pub.download')}</button>
                  </div>
                </>
              )}
              {active && !row.flyer_url && (
                <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: row.slug, name: row.dog_name, flyerUrl: null, text: s('pack.sos.det.shareText', { name: row.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.det.share')}</button>
              )}
            </>
          )}
          <a className="lp-link" href="/" style={{ alignSelf: 'center' }}>{s('pack.sos.pub.help')}</a>
        </div>
      </main>
      {row && pop === 'call' && <CallPopup slug={row.slug} name={row.dog_name} s={s} onClose={() => setPop(null)} />}
      {row && pop === 'seen' && <SeenPopup slug={row.slug} s={s} onClose={() => setPop(null)} />}
    </div>
  );
}
