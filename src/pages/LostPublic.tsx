import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_NEW } from '@/lib/packFlags';
import { useT } from '@/i18n/LanguageContext';
import { shareFile } from '@/lib/shareFile';
import { toast } from '@/hooks/use-toast';
import { PageTopBar } from '@/components/PageTopBar';
import { SMALL_P3D_CSS, SP_PAPER, SmallTop } from '@/components/legal/smallPageKit';
import { Seo } from '@/components/Seo';
import NotFound from '@/pages/NotFound';
import { SOS_PUBLIC_ON } from '@/lib/env';
import { ensurePackDict } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import { lostPublic, type LostPublic as LostRow } from '@/lib/sos';
import { FLOW_PALE_CSS } from '@/components/screens/flowPaleSkin';
import { shareLostDog } from '@/components/pack/sosKit';
import { CallPopup, SeenPopup } from '@/components/pack/sos/sosActions';
import { SosPhotoNone } from '@/components/pack/sos/sosNoPhoto';
import { SOS_CSS, colorWord, useBreedLabel, useSosCount, useSosT, useWhen } from '@/components/pack/sos/sosShared';

/**
 * VEREJNÁ STRÁNKA STRATENÉHO PSA — `/lost/:slug` (SOS, 4. 11. 2026). BEZ PRIHLÁSENIA, noindex.
 * Čo vidí nálezca: červený blok STRATIL SA (alebo zelený NAŠIEL SA), fotka, meno, ZAVOLAŤ MAJITEĽOVI (číslo až po ťuku,
 * `lostPhone`), VIDEL SOM HO (`lost-sighting`), leták ako obrázok + ZDIEĽAŤ + STIAHNUŤ. Stav `ended` = telefón, leták aj VIDEL SOM HO žijú ďalej (odkaz žije, Matej 5. 11. 2026); `found` = bez telefónu aj letáku.
 * Za `SOS_PUBLIC_ON` (6. 11. 2026 zapnuté so SOS v appke — leták má QR na túto stránku).
 * 🔴 Nesmie čítať nič, čo vyžaduje session: len `lostPublic` (anon RPC) a edge `lost-sighting`.
 */
export default function LostPublic() {
  const { slug } = useParams<{ slug: string }>();
  if (!SOS_PUBLIC_ON) return <NotFound />;
  return <LostPublicInner slug={slug ?? ''} />;
}

const CSS = `
.hf-pale.lp-flat::before,.hf-pale.lp-flat::after{display:none;}
.lp-main{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:8px 16px 48px;}
.lp-col{width:100%;max-width:640px;margin:0 auto;}
.lp-flyer{width:100%;display:block;border-radius:8px;box-shadow:0 8px 24px rgba(40,20,0,.3);background:#fff;}
.lp-link{display:inline-block;margin-top:16px;font-family:'Space Grotesk',sans-serif;font-size:12px;color:rgba(42,22,8,.6);text-align:center;text-decoration:none;}
.lp-link:hover{color:#16307A;}
.lp-home{display:flex;align-items:center;justify-content:center;text-decoration:none;text-align:center;}
html.papyrus3d .lp-main{padding-top:16px;}
html.papyrus3d .lp-lost .sos-h2{font-size:24px;line-height:1.25;}
`;

function LostPublicInner({ slug }: { slug: string }) {
  const breedLabel = useBreedLabel();
  const when = useWhen();
  const count = useSosCount();
  const [row, setRow] = useState<LostRow | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);   // chyba siete / servera ≠ „stránka neexistuje“
  const [tick, setTick] = useState(0);
  const s = useSosT(row?.dog_gender);
  const [pop, setPop] = useState<'call' | 'seen' | null>(null);
  const nav = useNavigate();
  const t = useT();
  const home = () => { const v = t('pack.join.home'); return v === 'pack.join.home' ? 'BACK TO DOGYPT' : v; };
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/'));
  const lostLead = () => { const v = t('nf.lostLead'); return v === 'nf.lostLead' ? 'This dog is already home, or the link is wrong.' : v; };

  useEffect(() => { void ensurePackDict(); }, []);
  useEffect(() => {
    let alive = true;
    setRow(undefined); setFailed(false);
    lostPublic(slug).then((r) => alive && setRow(r)).catch(() => { if (alive) { setRow(null); setFailed(true); } });
    return () => { alive = false; };
  }, [slug, tick]);

  const download = async (url: string, name: string) => {
    try {
      const r = await fetch(url, { mode: 'cors' });
      if (!r.ok) throw new Error(String(r.status));
      const b = await r.blob();
      // web: stiahne súbor; appka: systémový hárok (Uložiť do Súborov, Tlačiť, poslať). `false` = zariadenie to nevie.
      const ok = await shareFile(b, `dogypt-sos-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pes'}.${b.type === 'image/jpeg' ? 'jpg' : 'png'}`);
      if (!ok) toast({ title: s('pack.sos.fl.noShare') });
    } catch { window.open(url, '_blank', 'noopener'); }
  };

  const closed = row?.status === 'closed';   // nežije: navonok len „ukončené“, bez dôvodu
  const title = row ? `${row.dog_name} · ${row.status === 'found' ? s('pack.sos.found') : closed ? s('pack.sos.det.endedPublic') : s('pack.sos.lost')}` : 'DOGYPT';
  const live = !!row && (row.status === 'active' || row.status === 'ended');   // telefón, videnie a leták žijú ďalej len pri active + ended

  // Zlý / neplatný odkaz (nie chyba siete): 404 hra so zajacom a vlastnou vetou nad ňou.
  if (row === null && !failed) return <NotFound lead={lostLead()} />;

  return (
    <div className={`${APP_NEW ? SP_PAPER : 'hf-pale lp-flat'} min-h-screen flex flex-col`}>
      <Seo title={title} description={row?.place_label ?? ''} path={`/lost/${slug}`} noindex ogImage={(live ? row?.flyer_url : null) ?? (row?.photo ? sizedUrl(row.photo, 1200) : undefined)} />
      <style>{(APP_NEW ? SMALL_P3D_CSS : FLOW_PALE_CSS) + SOS_CSS + CSS}</style>
      {APP_NEW ? <SmallTop onBack={back} backLabel={t('nav.aria.back')} /> : <div className="hf-topbar"><PageTopBar /></div>}
      <main className="lp-main">
        <div className="lp-col sos-stack">
          {row === undefined && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.loading')}</p>}
          {row === null && APP_NEW && (
            // Karta v šate 3D: text + cesta domov (predtým holý text na tapete bez východu).
            <div className="sos-card lp-lost">
              <h1 className="sos-h2" style={{ textAlign: 'center' }}>{failed ? s('pack.sos.offline') : s('pack.sos.notFound')}</h1>
              {failed && <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>}
              <a className="sos-cta pk-b3--lapis lp-home" href="/">{home()}</a>
            </div>
          )}
          {row === null && !APP_NEW && !failed && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.notFound')}</p>}
          {row === null && !APP_NEW && failed && (
            <>
              <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.offline')}</p>
              <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>
            </>
          )}
          {row && (
            <>
              {row.status === 'found' ? (
                <div className="sos-band sos-band--found"><b>{s('pack.sos.found')}</b><small>{s('pack.sos.pub.foundText')}</small></div>
              ) : closed ? (
                <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.closedText')}</small></div>
              ) : row.status === 'ended' ? (
                <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.endedText')}</small></div>
              ) : (
                <div className="sos-band"><b>{s('pack.sos.lost')}</b><small>{[row.place_label, when(row.last_seen_at)].filter(Boolean).join(' · ')}</small></div>
              )}
              {row.photo ? <img className="sos-photo" src={sizedUrl(row.photo, 900)} alt={row.dog_name} /> : <SosPhotoNone breed={row.breed} />}
              <h1 className="sos-dogname">{row.dog_name}</h1>
              {(row.breed || row.color) && <p className="sos-dogsub">{[breedLabel(row.breed), colorWord(row.color, s)].filter(Boolean).join(' · ')}</p>}
              {row.status === 'found' && row.search_days != null && (
                <p className="sos-dogsub">{row.shares ? s('pack.sos.pub.searched', { days: count.days(row.search_days), shares: count.shares(row.shares) }) : s('pack.sos.pub.searched0', { days: count.days(row.search_days) })}</p>
              )}

              {live && (
                <>
                  {/* „Čím viac zdieľaní…“ len pri bežiacom pátraní; ukončené (ended) už nikoho nenaháňa */}
                  {row.status === 'active' && <p className="sos-motto">{s('pack.sos.det.motto')}</p>}
                  <button type="button" className="sos-cta" onClick={() => setPop('call')}>{s('pack.sos.det.callOwner')}</button>
                  <button type="button" className="sos-cta sos-cta--ghost" onClick={() => setPop('seen')}>{s('pack.sos.det.seen')}</button>
                  <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.pub.dontChase')}</p>
                </>
              )}

              {/* leták nesie telefón v obraze ⇒ po `found` sa neukazuje (server ho vtedy ani nevracia); pri `ended` žije ďalej */}
              {live && row.flyer_url && (
                <>
                  <p className="sos-eyebrow">{s('pack.sos.pub.flyer')}</p>
                  <img className="lp-flyer" src={sizedUrl(row.flyer_url, 1000)} alt="" />
                  <div className="sos-two">
                    <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: row.slug, name: row.dog_name, flyerUrl: row.flyer_url, text: s('pack.sos.det.shareText', { name: row.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.det.share')}</button>
                    <button type="button" className="sos-cta sos-cta--ghost" onClick={() => void download(row.flyer_url!, row.dog_name)}>{s('pack.sos.pub.download')}</button>
                  </div>
                </>
              )}
              {live && !row.flyer_url && (
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
