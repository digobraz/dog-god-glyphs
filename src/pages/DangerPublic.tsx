import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_NEW } from '@/lib/packFlags';
import { useT, ensurePackDict } from '@/i18n/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { PageTopBar } from '@/components/PageTopBar';
import { SMALL_P3D_CSS, SP_PAPER, SmallTop } from '@/components/legal/smallPageKit';
import { Seo } from '@/components/Seo';
import NotFound from '@/pages/NotFound';
import { DANGER_ON } from '@/lib/env';
import { dangerPublic, dangerUrl, type DangerPublic as DangerRow } from '@/lib/danger';
import { sizedUrl } from '@/services/cloudinaryService';
import { FLOW_PALE_CSS } from '@/components/screens/flowPaleSkin';
import { SOS_CSS, useSosT } from '@/components/pack/sos/sosShared';
import type { SosKey } from '@/components/pack/sos/sosTexts';
import { DangerMap, posterView } from '@/components/pack/sos/danger/DangerPoster';
import { regionOf } from '@/components/pack/sos/danger/dangerForm';

/**
 * VEREJNÁ STRÁNKA NEBEZPEČENSTVA — `/danger/:slug` (20. 11. 2026). BEZ PRIHLÁSENIA, noindex. Vzor: `LostPublic.tsx`.
 * 🔴 Číta LEN `dangerPublic` (anon RPC). Týranie: obec + okruh ≥ 500 m okolo zaokrúhleného stredu, bez fotky a adresy
 *    (`posterView` to vynucuje aj keby server vrátil viac). Otrava: bod, okruh, chipy, fotka.
 */
export default function DangerPublic() {
  const { slug } = useParams<{ slug: string }>();
  if (!DANGER_ON) return <NotFound />;
  return <DangerPublicInner slug={slug ?? ''} />;
}

const CSS = `
.hf-pale.dp-flat::before,.hf-pale.dp-flat::after{display:none;}
.dp-main{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:8px 16px 48px;}
.dp-col{width:100%;max-width:640px;margin:0 auto;}
.dp-map{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:16px;border:1px solid rgba(201,154,63,.45);background:#E8D7AE;}
.dp-map > img,.dp-map > svg{position:absolute;inset:0;width:100%;height:100%;display:block;}
.dp-map > img{object-fit:cover;}
.dp-home{display:flex;align-items:center;justify-content:center;text-decoration:none;text-align:center;}
html.papyrus3d .dp-main{padding-top:16px;}
`;

function DangerPublicInner({ slug }: { slug: string }) {
  const s = useSosT();
  const t = useT();
  const nav = useNavigate();
  const [row, setRow] = useState<DangerRow | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);   // chyba siete ≠ „hlásenie neexistuje“
  const [tick, setTick] = useState(0);
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/'));

  useEffect(() => { void ensurePackDict(); }, []);
  useEffect(() => {
    let alive = true;
    setRow(undefined); setFailed(false);
    dangerPublic(slug).then((r) => alive && setRow(r)).catch(() => { if (alive) { setRow(null); setFailed(true); } });
    return () => { alive = false; };
  }, [slug, tick]);

  if (row === null && !failed) return <NotFound lead={s('pack.sos.danger.public.notFound')} />;

  const poison = row?.kind === 'poison';
  // číslo riadi krajina prípadu: polícia 158 platí v SK a CZ, inde jediné číslo, ktoré sedí všade, je 112
  const emergency = regionOf(row?.country) === 'OTHER' ? '112' : '158';
  const view = row ? posterView({ slug: row.slug, kind: row.kind, place: row.municipality ?? '', lat: row.lat, lng: row.lng, radius_m: row.radius_m, what: row.what ?? [], photo: row.photo }) : null;
  const title = row ? s(poison ? 'pack.sos.danger.public.titlePoison' : 'pack.sos.danger.public.titleAbuse') : 'DOGYPT';

  const share = async () => {
    if (!row) return;
    const url = dangerUrl(row.slug);
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast({ title: s('pack.sos.danger.public.copied') });
    } catch { /* zrušené zdieľanie alebo schránka zakázaná: odkaz ostáva v adresnom riadku */ }
  };

  return (
    <div className={`${APP_NEW ? SP_PAPER : 'hf-pale dp-flat'} min-h-screen flex flex-col`}>
      <Seo title={title} description={row?.municipality ?? ''} path={`/danger/${slug}`} noindex />
      <style>{(APP_NEW ? SMALL_P3D_CSS : FLOW_PALE_CSS) + SOS_CSS + CSS}</style>
      {APP_NEW ? <SmallTop onBack={back} backLabel={t('nav.aria.back')} /> : <div className="hf-topbar"><PageTopBar /></div>}
      <main className="dp-main">
        <div className="dp-col sos-stack">
          {row === undefined && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.loading')}</p>}
          {row === null && failed && (
            <div className="sos-card">
              <h1 className="sos-h2" style={{ textAlign: 'center' }}>{s('pack.sos.offline')}</h1>
              <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>
            </div>
          )}
          {row && view && (
            <>
              <div className={`sos-band${row.active ? '' : ' sos-band--ended'}`}>
                <b>{title}</b>
                <small>{row.municipality ? s('pack.sos.danger.public.near', { place: row.municipality }) : s('pack.sos.danger.public.near', { place: s('pack.sos.danger.poster.place') })}</small>
              </div>
              <p className="sos-small" style={{ textAlign: 'center' }}>{row.active ? s('pack.sos.danger.public.active') : s('pack.sos.danger.public.expired')}</p>
              <div className="dp-map" role="img" aria-label={row.municipality ?? ''}>
                <DangerMap lat={view.lat} lng={view.lng} radius={view.radius} />
              </div>
              <p className="sos-dogsub">{s('pack.sos.danger.public.area', { m: view.radius })}</p>
              {view.what.length > 0 && (
                <div className="sos-chips">{view.what.map((c) => <span key={c} className="sos-pill">{s(`pack.sos.danger.poster.chip.${c}` as SosKey)}</span>)}</div>
              )}
              {view.photo && <img className="sos-photo" src={sizedUrl(view.photo, 900)} alt="" />}
              <p className="sos-p">{s(poison ? 'pack.sos.danger.public.advicePoison' : emergency === '112' ? 'pack.sos.danger.public.adviceAbuse.other' : 'pack.sos.danger.public.adviceAbuse')}</p>
              {!poison && <a className="sos-cta sos-cta--red dp-home" href={`tel:${emergency}`}>{s(emergency === '112' ? 'pack.sos.danger.public.call112' : 'pack.sos.danger.public.call158')}</a>}
              <a className="sos-cta dp-home" href="/map">{s('pack.sos.danger.public.map')}</a>
              <button type="button" className="sos-cta sos-cta--ghost" onClick={() => void share()}>{s('pack.sos.danger.public.share')}</button>
              <div className="sos-card" style={{ textAlign: 'center' }}>
                <p className="sos-p">{s('pack.sos.danger.public.joinLead')}</p>
                <a className="sos-cta sos-cta--gold dp-home" href="/app">{s('pack.sos.danger.public.join')}</a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
