// SOS — PLÁN `/pack/sos/:slug/plan` (kôš 2). Najbližšie kontakty k miestu straty (`sosContactsNear`), skupiny
// Útulky · Polícia · Veterinári · OZ · Poľovníci. Každý: meno, mesto, „cca X km“, štítok overenia, ZAVOLAŤ + SMS (alebo web).
// Hore vždy pevné 158 a 112. Prázdna skupina = nič sa nevymýšľa.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { lostUrl, sosContactsNear, type SosContact, type SosContactType } from '@/lib/sos';
import { SosCard, SosStyles, sosPath, useBack, useSosLost, useSosT, type SosT } from './sosShared';
import type { SosKey } from './sosTexts';

const CSS = `
.sosp-item{padding:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sosp-item b{font-size:${PACK_TEXT.lead}px;font-weight:600;}
.sosp-tag{display:inline-flex;align-self:flex-start;min-height:24px;align-items:center;padding:0 ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.label}px;font-weight:600;}
.sosp-tag--ok{color:#2F6A42;background:${T.growGreenSoft};}
.sosp-tag--no{color:#8A5A10;background:rgba(201,154,63,.2);}
.sosp-tag a{color:inherit;}
.sosp-acts{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sosp-fixed{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.sm}px;}
`;

const GROUPS: Array<{ typ: SosContactType; label: SosKey }> = [
  { typ: 'shelter', label: 'pack.sos.plan.shelter' },
  { typ: 'police', label: 'pack.sos.plan.police' },
  { typ: 'vet', label: 'pack.sos.plan.vet' },
  { typ: 'oz', label: 'pack.sos.plan.oz' },
  { typ: 'hunting', label: 'pack.sos.plan.hunting' },
];

const digits = (p: string) => p.replace(/[^\d+]/g, '');
const mmYYYY = (d: string) => { const m = /^(\d{4})-(\d{2})/.exec(d); return m ? `${m[2]}/${m[1]}` : d; };

function Contact({ c, smsBody, s }: { c: SosContact; smsBody: string; s: SosT }) {
  return (
    <div className="sosp-item" style={{ ...PACK_BOX.row }}>
      <b>{c.name}</b>
      <span className="sos-small">{[c.city, c.distance_km != null ? s('pack.sos.plan.km', { km: Math.round(c.distance_km) }) : null].filter(Boolean).join(' · ')}</span>
      {c.verified_at
        ? <span className="sosp-tag sosp-tag--ok">{s('pack.sos.plan.verified', { date: mmYYYY(c.verified_at) })}</span>
        : <span className="sosp-tag sosp-tag--no">{s('pack.sos.plan.unverified')}{c.source && <>{' · '}{c.source_url ? <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.source}</a> : c.source}</>}</span>}
      {c.phone ? (
        <div className="sosp-acts">
          <a className="sos-cta sos-cta--sm" href={`tel:${digits(c.phone)}`}>{s('pack.sos.det.call')}</a>
          <a className="sos-cta sos-cta--sm sos-cta--ghost" href={`sms:${digits(c.phone)}?&body=${encodeURIComponent(smsBody)}`}>SMS</a>
        </div>
      ) : c.web ? (
        <a className="sos-cta sos-cta--sm sos-cta--ghost" href={c.web} target="_blank" rel="noopener noreferrer">{s('pack.sos.plan.web')}</a>
      ) : null}
    </div>
  );
}

export default function PackSosPlan() {
  const { slug } = useParams<{ slug: string }>();
  const s = useSosT();
  const back = useBack(sosPath.page(slug ?? ''));
  const load = useSosLost(slug);
  const [rows, setRows] = useState<SosContact[] | null>(null);
  const [fail, setFail] = useState(false);

  const pub = load.state === 'ready' ? load.pub : null;
  useEffect(() => {
    if (!pub) return;
    let alive = true;
    sosContactsNear(pub.lat, pub.lng, pub.country, 5).then((r) => alive && setRows(r)).catch(() => alive && setFail(true));
    return () => { alive = false; };
  }, [pub?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const smsBody = pub ? s('pack.sos.plan.smsText', { name: pub.dog_name, place: pub.place_label ?? '', url: lostUrl(pub.slug) }) : '';

  return (
    <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
      <SosStyles /><style>{CSS}</style>
      <div className="sos-stack">
        <SosCard>
          <h1 className="sos-h2">{s('pack.sos.plan.title')}</h1>
          <p className="sos-p">{s('pack.sos.plan.lead')}</p>
          <p className="sos-eyebrow">{s('pack.sos.plan.emergency')}</p>
          <div className="sosp-fixed">
            <a className="sos-cta sos-cta--red" href="tel:158">158 · {s('pack.sos.plan.police158')}</a>
            <a className="sos-cta sos-cta--red" href="tel:112">112 · {s('pack.sos.plan.emergency112')}</a>
          </div>
        </SosCard>

        {load.state === 'loading' && <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.loading')}</p>}
        {(load.state === 'missing' || load.state === 'error' || fail) && <p className="sos-err" style={{ textAlign: 'center' }}>{load.state === 'missing' ? s('pack.sos.notFound') : s('pack.sos.error')}</p>}

        {rows && GROUPS.map((g) => {
          const list = rows.filter((r) => r.typ === g.typ);
          return (
            <section key={g.typ} className="sos-stack" style={{ gap: PACK_SPACE.sm }}>
              <h2 className="sos-eyebrow">{s(g.label)}</h2>
              {g.typ === 'hunting' && <p className="sos-small">{s('pack.sos.plan.huntingNote')}</p>}
              {list.length === 0 ? <p className="sos-small">{s('pack.sos.plan.empty')}</p> : list.map((c, i) => <Contact key={`${c.name}-${i}`} c={c} smsBody={smsBody} s={s} />)}
            </section>
          );
        })}
      </div>
    </PackLayout>
  );
}
